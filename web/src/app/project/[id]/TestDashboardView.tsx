'use client';

import React, { useState } from 'react';
import { fetchProjectDocument } from '@/app/actions/documentActions';
import { useTranslation } from '@/lib/i18n';
import { CheckCircle2, XCircle, AlertTriangle, Bot, BarChart3, Layers, Zap, TestTube2 } from 'lucide-react';
import EmptyStatePrompt from '@/components/EmptyStatePrompt';

interface TestSuite { name: string; total: number; passed: number; failed: number; skipped: number; type: 'unit' | 'integration' | 'e2e'; }
interface FailedTest { name: string; suite: string; error: string; aiGenerated: boolean; reviewRequired: boolean; }

// Dummy data removed, now fetched from DB

export default function TestDashboardView({ projectId }: { projectId: string }) {
    const { t } = useTranslation();

    const [data, setData] = useState<{ suites: TestSuite[], failed: FailedTest[] }>({ suites: [], failed: [] });
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const doc = await fetchProjectDocument(projectId, 'TEST');
                if (doc && doc.content) {
                    const parsed = JSON.parse(doc.content);
                    setData({
                        suites: Array.isArray(parsed.suites) ? parsed.suites : [],
                        failed: Array.isArray(parsed.failed) ? parsed.failed : []
                    });
                } else {
                    setData({ suites: [], failed: [] });
                }
            } catch (err) {
                console.error("Failed to parse TEST document", err);
                setData({ suites: [], failed: [] });
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [projectId]);

    const { suites: SUITES, failed: FAILED } = data;

    const totals = SUITES.reduce((a, s) => ({ t: a.t + s.total, p: a.p + s.passed, f: a.f + s.failed, sk: a.sk + s.skipped }), { t: 0, p: 0, f: 0, sk: 0 });
    const coverage = totals.t > 0 ? Math.round((totals.p / totals.t) * 100) : 0;
    const byType = { unit: SUITES.filter(s => s.type === 'unit'), integration: SUITES.filter(s => s.type === 'integration'), e2e: SUITES.filter(s => s.type === 'e2e') };
    const typeRate = (arr: TestSuite[]) => { const t = arr.reduce((a, s) => a + s.total, 0); const p = arr.reduce((a, s) => a + s.passed, 0); return t ? Math.round((p / t) * 100) : 100; };

    if (loading) {
        return (
            <div className="w-full flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    const handleCreateFailedTest = async () => {
        const testName = prompt(t('test.namePrompt'));
        if (!testName) return;

        try {
            const { appendProjectDocumentAction } = await import('@/app/actions');
            await appendProjectDocumentAction(projectId, 'TEST', {
                name: testName,
                suite: 'Frontend Manual Test',
                error: 'Assertion failed: expected true but got false',
                duration: '0.0s',
                aiGenerated: false,
                reviewRequired: true
            });
            // Reload
            const doc = await fetchProjectDocument(projectId, 'TEST');
            if (doc && doc.content) {
                const parsed = JSON.parse(doc.content);
                setData({
                    suites: Array.isArray(parsed.suites) ? parsed.suites : [],
                    failed: Array.isArray(parsed.failed) ? parsed.failed : []
                });
            }
        } catch (e) {
            console.error(e);
            alert('Failed to log test');
        }
    };

    return (
        <div className="w-full flex flex-col gap-6">
            {/* Header with Create Button */}
            <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
                <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-200">
                        {t('test.title')}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                        {t('test.subtitle')}
                    </p>
                </div>
                <button
                    onClick={handleCreateFailedTest}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                    {t('test.log')}
                </button>
            </div>

            {/* Content or Empty State */}
            {SUITES.length === 0 ? (
                <div className="mt-2">
                    <EmptyStatePrompt
                        title={t('test.empty.title')}
                        description={t('test.empty.desc')}
                        suggestedPrompt={t('test.empty.prompt')}
                    />
                </div>
            ) : (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center justify-between mb-2"><BarChart3 className="w-5 h-5 text-indigo-500" /></div>
                            <div className="text-3xl font-bold text-slate-800 dark:text-white">{coverage}%</div>
                            <div className="text-sm text-slate-500 mt-1">{t('test.overallPassRate')}</div>
                            <div className="mt-3 w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all" style={{ width: `${coverage}%` }} />
                            </div>
                        </div>
                        {([['unit', t('test.unit'), 'text-blue-600 dark:text-blue-400', Layers], ['integration', t('test.integration'), 'text-amber-600 dark:text-amber-400', Zap], ['e2e', t('test.e2e'), 'text-violet-600 dark:text-violet-400', TestTube2]] as const).map(([type, label, color, Icon]) => (
                            <div key={type} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                                <div className="flex items-center justify-between mb-2"><Icon className={`w-5 h-5 ${color}`} /></div>
                                <div className={`text-3xl font-bold ${color}`}>{typeRate(byType[type])}%</div>
                                <div className="text-sm text-slate-500 mt-1">{label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Test Suites */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                            <h3 className="font-semibold text-slate-800 dark:text-slate-200">{t('test.suites')}</h3>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {SUITES.map((s, i) => {
                                const rate = s.total ? Math.round((s.passed / s.total) * 100) : 100;
                                return (
                                    <div key={i} className="p-4 flex items-center gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium text-slate-800 dark:text-slate-200">{s.name}</span>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${s.type === 'unit' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600' : s.type === 'integration' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600' : 'bg-violet-100 dark:bg-violet-500/20 text-violet-600'}`}>{s.type.toUpperCase()}</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full transition-all ${rate === 100 ? 'bg-emerald-500' : rate >= 80 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${rate}%` }} />
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0 text-sm">
                                            <span className="text-emerald-600">{s.passed}</span>
                                            {s.failed > 0 && <span className="text-red-500 ml-2">{s.failed} ✗</span>}
                                            {s.skipped > 0 && <span className="text-slate-400 ml-2">{s.skipped} ⊘</span>}
                                            <span className="text-slate-400 ml-2">/ {s.total}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Failed Tests */}
                    {FAILED.length > 0 && (
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-red-200 dark:border-red-900/50 shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/20">
                                <h3 className="font-semibold text-red-700 dark:text-red-400 flex items-center gap-2">
                                    <XCircle className="w-5 h-5" /> {t('test.failedTests')} ({FAILED.length})
                                </h3>
                            </div>
                            <div className="divide-y divide-red-100 dark:divide-red-900/20">
                                {FAILED.map((f, i) => (
                                    <div key={i} className="p-4">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <span className="font-medium text-slate-800 dark:text-slate-200 text-sm">{f.name}</span>
                                            <span className="text-xs text-slate-400">{f.suite}</span>
                                            {f.aiGenerated && <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-400"><Bot className="w-3 h-3" /> AI</span>}
                                            {f.reviewRequired && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400">⚠️ {t('reviewRequiredShort')}</span>}
                                        </div>
                                        <code className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-2 py-1 rounded">{f.error}</code>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-xs text-slate-500">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                {t('mcpLiveData')}
            </div>
        </div>
    );
}
