import React from 'react';
import { listUsers } from '@/lib/db';
import UserClient from './UserClient';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
    const users = await listUsers();

    return (
        <main className="max-w-6xl mx-auto py-12 px-6 sm:px-8 font-sans">
            <UserClient initialUsers={users} />
        </main>
    );
}
