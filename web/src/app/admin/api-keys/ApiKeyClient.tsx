'use client';

import { useState } from 'react';
import { generateKey, revokeKey } from './actions';
import { ApiKey } from '@/lib/db';
import { useTranslation } from '@/lib/i18n';

export default function ApiKeyClient({ initialKeys }: { initialKeys: ApiKey[] }) {
    const { t } = useTranslation();
    const [isGenerating, setIsGenerating] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [revealedKey, setRevealedKey] = useState<string | null>(null);
    const [revokingId, setRevokingId] = useState<string | null>(null);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newKeyName.trim()) return;

        setIsGenerating(true);
        try {
            const rawKey = await generateKey(newKeyName);
            setRevealedKey(rawKey);
            setNewKeyName('');
        } catch (error) {
            console.error(t('failedToGenerateKey'), error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleRevoke = async (id: string) => {
        if (!confirm(t('confirmRevokeKey'))) {
            return;
        }

        setRevokingId(id);
        try {
            await revokeKey(id);
            if (revealedKey && initialKeys.find(k => k.id === id)) {
                // Not perfectly rigorous, but clears screen if we just revoked what we generated
                setRevealedKey(null);
            }
        } catch (error) {
            console.error(t('failedToRevokeKey'), error);
        } finally {
            setRevokingId(null);
        }
    };

    return (
        <div className="space-y-8">
            <header className="mb-14 border-b border-slate-200/60 dark:border-slate-800/60 pb-8 relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-400/10 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-500 dark:from-indigo-400 dark:to-cyan-400 mb-4">
                        {t('apiKeys')}
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
                        {t('apiKeysSubtitle')}
                    </p>
                </div>
            </header>

            {/* Create Key Form */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">{t('createSecretKey')}</h2>
                <form onSubmit={handleGenerate} className="flex gap-4 items-end">
                    <div className="flex-1 max-w-sm">
                        <label htmlFor="keyName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            {t('keyName')}
                        </label>
                        <input
                            type="text"
                            id="keyName"
                            value={newKeyName}
                            onChange={(e) => setNewKeyName(e.target.value)}
                            placeholder={t('keyNamePlaceholder')}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isGenerating || !newKeyName.trim()}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                    >
                        {isGenerating ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        )}
                        {t('createSecretKeyButton')}
                    </button>
                </form>

                {/* Reveal New Key Banner */}
                {revealedKey && (
                    <div className="mt-6 p-5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-emerald-100 rounded-full shrink-0">
                                <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-lg mb-1">{t('saveSecretKey')}</h3>
                                <p className="text-emerald-800 text-sm mb-4" dangerouslySetInnerHTML={{ __html: t('saveSecretKeyDesc') }} />
                                <div className="flex items-center gap-3">
                                    <code className="flex-1 bg-white px-4 py-3 rounded-lg border border-emerald-300 font-mono text-emerald-950 font-medium break-all selection:bg-emerald-200">
                                        {revealedKey}
                                    </code>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(revealedKey)}
                                        className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors shrink-0"
                                    >
                                        {t('copy')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Keys Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                            <tr>
                                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">{t('keyName')}</th>
                                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">{t('secretKey')}</th>
                                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">{t('created')}</th>
                                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">{t('lastUsed')}</th>
                                <th className="px-6 py-4 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {initialKeys.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        {t('noApiKeysGeneratedYet')}
                                    </td>
                                </tr>
                            ) : (
                                initialKeys.map((key) => (
                                    <tr key={key.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                            {key.name}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-400">
                                            {key.key_value.substring(0, 12)}...
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {new Date(key.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : t('never')}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleRevoke(key.id)}
                                                disabled={revokingId === key.id}
                                                className="p-2 text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
                                                title={t('revokeKey')}
                                            >
                                                {revokingId === key.id ? (
                                                    <span className="w-5 h-5 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin inline-block"></span>
                                                ) : (
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
