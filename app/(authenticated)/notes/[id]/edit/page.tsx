import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { getNoteById, updateNote, validateContentJson } from '@/lib/notes';
import { NoteForm } from '@/components/NoteForm';
import { z } from 'zod';

const MAX_CONTENT_SIZE = 500 * 1024;

const noteSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200),
    contentJson: z
        .string()
        .max(
            MAX_CONTENT_SIZE,
            `Content exceeds maximum size of ${MAX_CONTENT_SIZE / 1024}KB`,
        )
        .refine(
            (val) => {
                const result = validateContentJson(val);
                return result.valid;
            },
            { message: 'Content must be valid JSON' },
        ),
});

export default async function EditNotePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user?.id) {
        notFound();
    }

    const note = getNoteById(id, session.user.id);

    if (!note) {
        notFound();
    }

    async function updateNoteAction(formData: FormData) {
        'use server';

        const currentSession = await auth.api.getSession({
            headers: await headers(),
        });

        if (!currentSession) {
            redirect('/authenticate');
        }

        const title = formData.get('title') as string;
        const contentJson = formData.get('contentJson') as string;

        const result = noteSchema.safeParse({ title, contentJson });
        if (!result.success) {
            return { error: result.error.issues[0].message };
        }

        const updated = updateNote(id, currentSession.user.id, title, contentJson);
        if (!updated) {
            return { error: 'Failed to update note' };
        }

        redirect(`/notes/${id}`);
    }

    return (
        <div className='mx-auto max-w-4xl px-4 py-8'>
            <div className='mb-6'>
                <Link
                    href={`/notes/${id}`}
                    className='text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
                >
                    &larr; Back to Note
                </Link>
            </div>
            <h1 className='mb-6 text-2xl font-bold text-gray-900 dark:text-white'>
                Edit Note
            </h1>
            <NoteForm
                action={updateNoteAction}
                initialTitle={note.title}
                initialContent={note.content_json}
                submitLabel='Save Changes'
                pendingLabel='Saving...'
            />
        </div>
    );
}
