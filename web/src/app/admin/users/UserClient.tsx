'use client';

import { useState } from 'react';
import { User } from '@/lib/db';
import { createUser, deleteUser } from './actions';
import { useTranslation } from '@/lib/i18n';

export default function UserClient({ initialUsers }: { initialUsers: User[] }) {
    const { t } = useTranslation();
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newRole, setNewRole] = useState('MEMBER');
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [confirmingId, setConfirmingId] = useState<string | null>(null);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim() || !newEmail.trim()) return;

        setIsCreating(true);
        try {
            const result = await createUser(newName, newEmail);
            if (result.ok) {
                setNewName('');
                setNewEmail('');
                setNewRole('MEMBER');
            } else {
                alert(result.error);
            }
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (id === 'mock-user-1') return;

        setDeletingId(id);
        try {
            await deleteUser(id);
            setConfirmingId(null);
        } catch (error) {
            console.error(t('failedToDeleteUser'), error);
        } finally {
            setDeletingId(null);
        }
    };

    const roles = [
        { value: 'ADMIN', label: 'Admin (Full Access & AI Settings)' },
        { value: 'MEMBER', label: 'Member (Can Edit Tasks)' },
        { value: 'VIEWER', label: 'Viewer (Read Only)' }
    ];

    return (
        <div className="space-y-8">
            <header className="mb-14 border-b border-slate-200/60 dark:border-slate-800/60 pb-8 relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 dark:bg-amber-600/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-400 dark:to-orange-400 mb-4">
                        {t('adminUsers')}
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
                        {t('adminUsersSubtitle')}
                    </p>
                </div>
            </header>

            {/* Create User Form */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">{t('addUser')}</h2>
                <form onSubmit={handleCreate} className="flex flex-col lg:flex-row gap-4 items-end">
                    <div className="flex-1 w-full max-w-sm">
                        <label htmlFor="userName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            {t('userName')}
                        </label>
                        <input
                            type="text"
                            id="userName"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder={t('userNamePlaceholder')}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900 dark:text-white"
                            required
                        />
                    </div>
                    <div className="flex-1 w-full max-w-sm">
                        <label htmlFor="userEmail" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            {t('userEmail')}
                        </label>
                        <input
                            type="email"
                            id="userEmail"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            placeholder={t('userEmailPlaceholder')}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900 dark:text-white"
                            required
                        />
                    </div>
                    <div className="flex-1 w-full max-w-sm">
                        <label htmlFor="userRole" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            {t('userRole')}
                        </label>
                        <select
                            id="userRole"
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900 dark:text-white appearance-none"
                        >
                            {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                    </div>
                    <button
                        type="submit"
                        disabled={isCreating || !newName.trim() || !newEmail.trim()}
                        className="px-6 py-2.5 w-full lg:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        {isCreating ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        )}
                        {t('addUserButton')}
                    </button>
                </form>
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-400">
                                <th className="px-6 py-4">{t('userId')}</th>
                                <th className="px-6 py-4">{t('userName')}</th>
                                <th className="px-6 py-4">{t('userEmail')}</th>
                                <th className="px-6 py-4">{t('userRole')}</th>
                                <th className="px-6 py-4 text-right">{t('userActions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {initialUsers.map((user, idx) => {
                                const isOwner = user.id === 'mock-user-1';
                                // Mock roles for visualization based on index
                                const mockRole = isOwner ? 'OWNER' : (idx % 2 === 0 ? 'MEMBER' : 'VIEWER');
                                
                                return (
                                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-mono text-slate-500">
                                            {user.id.length > 15 ? user.id.slice(0, 15) + '...' : user.id}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-800 dark:text-slate-200">{user.name}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{user.email}</td>
                                        <td className="px-6 py-4">
                                            {!isOwner ? (
                                                <select 
                                                    defaultValue={mockRole}
                                                    className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                >
                                                    <option value="ADMIN">Admin</option>
                                                    <option value="MEMBER">Member</option>
                                                    <option value="VIEWER">Viewer</option>
                                                </select>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                                                    OWNER
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {!isOwner && (
                                                confirmingId === user.id ? (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <span className="text-xs text-red-500 font-medium mr-1">{t('removeUser')}?</span>
                                                        <button
                                                            onClick={() => handleDelete(user.id)}
                                                            disabled={deletingId === user.id}
                                                            className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50"
                                                            title="Confirm"
                                                        >
                                                            {deletingId === user.id ? (
                                                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block"></span>
                                                            ) : (
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => setConfirmingId(null)}
                                                            className="p-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-lg transition-colors"
                                                            title="Cancel"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setConfirmingId(user.id)}
                                                        className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
                                                        title={t('removeUser')}
                                                    >
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                )
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
