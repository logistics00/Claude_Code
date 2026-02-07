'use client';
import { useState } from 'react';
import { TipTapEditor } from '@/components/TipTapEditor';

type NoteFormProps = {
    action: (formData: FormData) => Promise<{ error: string } | void>;
    initialTitle?: string;
    initialContent?: string;
    submitLabel: string;
    pendingLabel: string;
};

export function NoteForm({
    action,
    initialTitle = '',
    initialContent,
    submitLabel,
    pendingLabel,
}: NoteFormProps) {
    const [contentJson, setContentJson] = useState(
        initialContent ?? JSON.stringify({ type: 'doc', content: [] }),
    );
    const [error, setError] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsPending(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        formData.set('contentJson', contentJson);

        const result = await action(formData);
        if (result?.error) {
            setError(result.error);
            setIsPending(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className='space-y-6'>
            {error && (
                <div className='rounded-md bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-700 dark:text-red-400'>
                    {error}
                </div>
            )}
            <div>
                <label
                    htmlFor='title'
                    className='block text-sm font-medium text-gray-700 dark:text-gray-300'
                >
                    Title
                </label>
                <input
                    type='text'
                    id='title'
                    name='title'
                    required
                    defaultValue={initialTitle}
                    className='mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500'
                    placeholder='Enter note title'
                />
            </div>
            <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    Content
                </label>
                <TipTapEditor content={contentJson} onUpdate={setContentJson} />
            </div>
            <div className='flex justify-end'>
                <button
                    type='submit'
                    disabled={isPending}
                    className='inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50'
                >
                    {isPending ? pendingLabel : submitLabel}
                </button>
            </div>
        </form>
    );
}
