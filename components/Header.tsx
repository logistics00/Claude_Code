import Link from 'next/link';
import { LogoutButton } from './LogoutButton';

type HeaderProps = {
    user: { name: string; email: string };
};

export function Header({ user }: HeaderProps) {
    return (
        <header className='border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'>
            <div className='mx-auto flex h-16 max-w-4xl items-center justify-between px-4'>
                <Link
                    href='/dashboard'
                    className='text-xl font-bold text-gray-900 dark:text-white'
                >
                    NextNotes
                </Link>
                <div className='flex items-center gap-4'>
                    <span className='text-sm text-gray-600 dark:text-gray-300'>
                        {user.name}
                    </span>
                    <LogoutButton />
                </div>
            </div>
        </header>
    );
}
