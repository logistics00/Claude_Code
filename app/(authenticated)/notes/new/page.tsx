import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createNote, validateContentJson } from '@/lib/notes';
import { z } from 'zod';
import { NoteForm } from '@/components/NoteForm';

const MAX_CONTENT_SIZE = 500 * 1024; // 500KB

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

async function createNoteAction(formData: FormData) {
    'use server';

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect('/authenticate');
    }

    const title = formData.get('title') as string;
    const contentJson = formData.get('contentJson') as string;

    const result = noteSchema.safeParse({ title, contentJson });
    if (!result.success) {
        return { error: result.error.issues[0].message };
    }

    const noteId = createNote(session.user.id, title, contentJson);
    redirect(`/notes/${noteId}`);
}

export default function NewNotePage() {
    return (
        <div className='mx-auto max-w-4xl px-4 py-8'>
            <h1 className='mb-6 text-2xl font-bold text-gray-900 dark:text-white'>
                Create New Note
            </h1>
            <NoteForm
                action={createNoteAction}
                submitLabel='Create Note'
                pendingLabel='Creating...'
            />
        </div>
    );
}
