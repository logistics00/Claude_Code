'use client';
import { useRouter } from 'next/navigation';
import { signOut } from '@/lib/auth-client';

export function LogoutButton() {
    const router = useRouter();

    async function handleLogout() {
        await signOut();
        router.push('/');
    }

    return (
        <button
            onClick={handleLogout}
            className='text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
        >
            Log out
        </button>
    );
}
