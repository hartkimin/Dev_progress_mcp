'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import { GitPullRequest, ShieldCheck, CheckCircle2, XCircle, Clock, Bot, AlertTriangle, Package, ChevronDown, ChevronUp, Eye, MessageSquare } from 'lucide-react';
import EmptyStatePrompt from '@/components/EmptyStatePrompt';

type PRStatus = 'open' | 'approved' | 'changes_requested' | 'merged';

interface SecurityCheck { name: string; passed: boolean; severity: string; }
interface DepChange { name: string; from: string; to: string; type: 'added' | 'updated' | 'removed'; }
interface PR {
    id: string; number: number; title: string; author: string; status: PRStatus;
    reviewers: string[]; updatedAt: string; aiGenerated: boolean; reviewRequired: boolean;
    additions: number; deletions: number; comments: number;
    securityChecks: SecurityCheck[]; depChanges: DepChange[];
}

import { fetchProjectDocument } from '@/app/actions/documentActions';

const STY: Record<PRStatus, { labelKey: string; cls: string }> = {
    open:              { labelKey: 'pr.status.open',               cls: 'text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/20' },
    approved:          { labelKey: 'pr.status.approved',           cls: 'text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/20' },
    changes_requested: { labelKey: 'pr.status.changes_requested',  cls: 'text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/20' },
    merged:            { labelKey: 'pr.status.merged',             cls: 'text-violet-700 dark:text-violet-400 bg-violet-100 dark:bg-violet-500/20' },
};

export default function CodeReviewView({ projectId }: { projectId: string }) {
    const { t } = useTranslation();
    const [expanded, setExpanded] = useState<string | null>(null);

    const [prs, setPrs] = useState<PR[]>([]);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const doc = await fetchProjectDocument(projectId, 'CODE_REVIEW');
                if (doc && doc.content) {
                    const parsed = JSON.parse(doc.content);
                    setPrs(Array.isArray(parsed) ? parsed : []);
                } else {
                    setPrs([]);
                }
            } catch (err) {
                console.error("Failed to parse CODE_REVIEW document", err);
                setPrs([]);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [projectId]);

    const allChecks = prs.flatMap(p => p.securityChecks || []);
    const passRate = allChecks.length ? Math.round((allChecks.filter(c => c.passed).length / allChecks.length) * 100) : 100;

    if (loading) {
        return (
            <div className="w-full flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    const handleCreatePR = async () => {
        const prLink = prompt(t('pr.prompt'));
        if (!prLink) return;

        const newPR = {
            id: Math.random().toString(36).substr(2, 9),
            number: Math.floor(Math.random() * 1000) + 1,
            title: prLink,
            prLink: prLink, // Required by backend schema validation
            author: 'Frontend User',
            status: 'open',
            reviewers: ['unassigned'],
            updatedAt: new Date().toISOString(),
            aiGenerated: false,
            reviewRequired: true,
            additions: 0,
            deletions: 0,
            comments: 0,
            securityChecks: [],
            depChanges: []
        };

        try {
            const { appendProjectDocumentAction } = await import('@/app/actions');
            await appendProjectDocumentAction(projectId, 'CODE_REVIEW', newPR);
            // Reload
            const doc = await fetchProjectDocument(projectId, 'CODE_REVIEW');
            if (doc && doc.content) {
                setPrs(JSON.parse(doc.content));
            }
        } catch (e) {
            console.error(e);
            alert('Failed to register PR');
        }
    };

    return (
        <div className="w-full flex flex-col gap-6">
            {/* Header with Create Button */}
            <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
                <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-200">
                        {t('pr.title')}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                        {t('pr.subtitle')}
                    </p>
                </div>
                <button
                    onClick={handleCreatePR}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                    {t('pr.add')}
                </button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { v: prs.filter(p => p.status === 'open').length, l: t('pr.open'), c: 'text-emerald-600 dark:text-emerald-400' },
                    { v: prs.filter(p => p.reviewRequired).length, l: t('pr.reviewNeeded'), c: 'text-amber-600 dark:text-amber-400' },
                    { v: prs.filter(p => p.aiGenerated).length, l: t('pr.aiGenerated'), c: 'text-violet-600 dark:text-violet-400' },
                    { v: `${passRate}%`, l: t('pr.securityPass'), c: passRate === 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400' },
                ].map((card, i) => (
                    <div key={i} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className={`text-2xl font-bold ${card.c}`}>{card.v}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">{card.l}</div>
                    </div>
                ))}
            </div>

            {/* PR List or Empty State */}
            {prs.length === 0 ? (
                <div className="mt-2">
                    <EmptyStatePrompt
                        title={t('pr.empty.title')}
                        description={t('pr.empty.desc')}
                        suggestedPrompt={t('pr.empty.prompt')}
                    />
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {prs.map(pr => {
                        const s = STY[pr.status];
                        const isExp = expanded === pr.id;
                        const failed = pr.securityChecks.filter(c => !c.passed);
                        return (
                            <div key={pr.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                                <button onClick={() => setExpanded(isExp ? null : pr.id)} className="w-full p-4 text-left flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${s.cls}`}>#{pr.number}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{pr.title}</span>
                                            {pr.aiGenerated && <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-400"><Bot className="w-3 h-3" /> AI</span>}
                                            {pr.reviewRequired && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400">⚠️ {t('pr.shortReview')}</span>}
                                            {failed.length > 0 && <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400"><ShieldCheck className="w-3 h-3" /> {failed.length}</span>}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                                            <span>{pr.author}</span>
                                            <span className="text-emerald-600">+{pr.additions}</span>
                                            <span className="text-red-500">-{pr.deletions}</span>
                                            <span className="flex items-center gap-0.5"><MessageSquare className="w-3 h-3" />{pr.comments}</span>
                                        </div>
                                    </div>
                                    {isExp ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                                </button>
                                {isExp && (
                                    <div className="border-t border-slate-200 dark:border-slate-700 p-4 flex flex-col md:flex-row gap-6 bg-slate-50/50 dark:bg-slate-800/20">
                                        <div className="flex-1">
                                            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-indigo-500" />{t('pr.securityChecklist')}</h4>
                                            {pr.securityChecks.map((c, i) => (
                                                <div key={i} className="flex items-center gap-2 text-sm mb-1.5">
                                                    {c.passed ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                                                    <span className={c.passed ? 'text-slate-600 dark:text-slate-400' : 'text-red-700 dark:text-red-400 font-medium'}>{c.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                        {pr.depChanges.length > 0 && (
                                            <div className="flex-1">
                                                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5"><Package className="w-4 h-4 text-amber-500" />{t('pr.depChanges')}</h4>
                                                {pr.depChanges.map((d, i) => (
                                                    <div key={i} className="flex items-center gap-2 text-sm mb-1.5">
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${d.type === 'added' ? 'bg-emerald-100 text-emerald-600' : d.type === 'removed' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>{d.type === 'added' ? '+' : d.type === 'removed' ? '-' : '↑'}</span>
                                                        <span className="font-mono text-slate-700 dark:text-slate-300">{d.name}</span>
                                                        {d.from && <span className="text-xs text-slate-400">{d.from}→</span>}
                                                        {d.to && <span className="text-xs text-emerald-600">{d.to}</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <div className="min-w-[150px]">
                                            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5"><Eye className="w-4 h-4 text-blue-500" />{t('pr.reviewers')}</h4>
                                            {pr.reviewers.map((r, i) => <div key={i} className="text-sm text-slate-600 dark:text-slate-400 mb-1">{r}</div>)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-xs text-slate-500">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                {t('mcpLiveData')}
            </div>
        </div>
    );
}
