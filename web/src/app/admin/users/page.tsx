import React from 'react';
import { listUsers } from '@/lib/db';
import UserClient from './UserClient';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
    const users = await listUsers();

    return (
        <main className="h-full p-8 text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950 font-sans">
            <div className="max-w-5xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Admin Users</h1>
                    <p className="mt-2 text-slate-600 dark:text-slate-400">Manage the active members in this MCP server deployment.</p>
                </header>

                <UserClient initialUsers={users} />
            </div>
        </main>
    );
}
