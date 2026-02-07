import Link from 'next/link';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { getNotesByUserId } from '@/lib/notes';

export default async function Dashboard() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const notes = session?.user?.id ? getNotesByUserId(session.user.id) : [];

    return (
        <div className='mx-auto max-w-4xl px-4 py-8'>
            <div className='flex items-center justify-between'>
                <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
                    My Notes
                </h1>
                <Link
                    href='/notes/new'
                    className='inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700'
                >
                    New Note
                </Link>
            </div>
            <div className='mt-8'>
                {notes.length === 0 ? (
                    <p className='text-gray-500 dark:text-gray-400'>
                        No notes yet. Create your first note!
                    </p>
                ) : (
                    <ul className='space-y-3'>
                        {notes.map((note) => (
                            <li key={note.id}>
                                <Link
                                    href={`/notes/${note.id}`}
                                    className='block rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-blue-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-600 dark:hover:bg-gray-700'
                                >
                                    <h2 className='font-medium text-gray-900 dark:text-white'>
                                        {note.title || 'Untitled'}
                                    </h2>
                                    <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
                                        Updated{' '}
                                        {new Date(note.updated_at).toLocaleDateString(
                                            'en-US',
                                            {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            },
                                        )}
                                    </p>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
