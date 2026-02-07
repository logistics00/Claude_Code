'use client';
import { useRef, useState } from 'react';

type DeleteNoteButtonProps = {
    deleteAction: () => Promise<{ error: string } | void>;
};

export function DeleteNoteButton({ deleteAction }: DeleteNoteButtonProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function openDialog() {
        dialogRef.current?.showModal();
    }

    function closeDialog() {
        dialogRef.current?.close();
        setError(null);
    }

    async function handleDelete() {
        setIsPending(true);
        setError(null);
        const result = await deleteAction();
        if (result?.error) {
            setError(result.error);
            setIsPending(false);
        }
    }

    return (
        <>
            <button
                type='button'
                onClick={openDialog}
                className='rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700'
            >
                Delete
            </button>
            <dialog
                ref={dialogRef}
                className='fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 m-0 rounded-lg p-0 backdrop:bg-black/50 bg-white dark:bg-gray-800'
            >
                <div className='p-6 max-w-sm'>
                    <h2 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
                        Delete Note
                    </h2>
                    <p className='text-sm text-gray-600 dark:text-gray-300 mb-4'>
                        Are you sure you want to delete this note? This action cannot be
                        undone.
                    </p>
                    {error && (
                        <div className='mb-4 rounded-md bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-400'>
                            {error}
                        </div>
                    )}
                    <div className='flex justify-end gap-3'>
                        <button
                            type='button'
                            onClick={closeDialog}
                            disabled={isPending}
                            className='rounded-md px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                        >
                            Cancel
                        </button>
                        <button
                            type='button'
                            onClick={handleDelete}
                            disabled={isPending}
                            className='rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50'
                        >
                            {isPending ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                </div>
            </dialog>
        </>
    );
}
