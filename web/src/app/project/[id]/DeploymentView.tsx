'use client';

import React, { useState } from 'react';
import { fetchProjectDocument } from '@/app/actions/documentActions';
import { useTranslation } from '@/lib/i18n';
import { Rocket, CheckCircle2, XCircle, Clock, AlertTriangle, ArrowDownCircle, RotateCcw, GitBranch } from 'lucide-react';
import EmptyStatePrompt from '@/components/EmptyStatePrompt';

type PipelineStatus = 'success' | 'failed' | 'running' | 'pending';

interface Deployment {
    id: string; version: string; env: string; status: PipelineStatus; branch: string;
    commitMsg: string; author: string; startedAt: string; duration: string; rollback?: string;
}

// Dummy data removed, now fetched from DB

function normalizeDeployment(d: any): Deployment {
    const rawStatus = (d.status || 'pending').toString().toLowerCase();
    const status: PipelineStatus = ['success', 'failed', 'running', 'pending'].includes(rawStatus) ? rawStatus as PipelineStatus : 'pending';
    return {
        id: d.id || Math.random().toString(36).substr(2, 9),
        version: d.version || 'unknown',
        env: d.env || 'Unknown',
        status,
        branch: d.branch || d.trigger || 'main',
        commitMsg: d.commitMsg || d.commit_msg || d.message || 'No commit message',
        author: d.author || d.trigger || 'System',
        startedAt: d.startedAt || d.started_at || d.timestamp || new Date().toISOString(),
        duration: d.duration || '—',
        rollback: d.rollback,
    };
}

const STATUS: Record<PipelineStatus, { icon: React.ReactNode; cls: string; label: string; ko: string }> = {
    success: { icon: <CheckCircle2 className="w-4 h-4" />, cls: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/20', label: 'Success', ko: '성공' },
    failed: { icon: <XCircle className="w-4 h-4" />, cls: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-500/20', label: 'Failed', ko: '실패' },
    running: { icon: <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />, cls: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/20', label: 'Running', ko: '실행 중' },
    pending: { icon: <Clock className="w-4 h-4" />, cls: 'text-slate-500 bg-slate-100 dark:bg-slate-700/50', label: 'Pending', ko: '대기 중' },
};

export default function DeploymentView({ projectId }: { projectId: string }) {
    const { language } = useTranslation();
    const ko = language === 'ko';

    const [data, setData] = useState<{ deployments: Deployment[], checklist: { ko: string, en: string, checked: boolean }[] }>({ deployments: [], checklist: [] });
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const doc = await fetchProjectDocument(projectId, 'DEPLOY');
                if (doc && doc.content) {
                    const parsed = JSON.parse(doc.content);
                    const rawDeploys = Array.isArray(parsed.deployments) ? parsed.deployments : [];
                    setData({
                        deployments: rawDeploys.map(normalizeDeployment),
                        checklist: Array.isArray(parsed.checklist) ? parsed.checklist : []
                    });
                } else {
                    setData({ deployments: [], checklist: [] });
                }
            } catch (err) {
                console.error("Failed to parse DEPLOY document", err);
                setData({ deployments: [], checklist: [] });
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [projectId]);

    const { deployments: MOCK, checklist: CHECKLIST } = data;

    if (loading) {
        return (
            <div className="w-full flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    const handleCreateDeploy = async () => {
        const version = prompt(ko ? '새로운 배포 버전을 입력하세요 (예: v1.0.3):' : 'Enter new deploy version (e.g., v1.0.3):');
        if (!version) return;

        try {
            const { appendProjectDocumentAction } = await import('@/app/actions');
            await appendProjectDocumentAction(projectId, 'DEPLOY', {
                version: version,
                env: 'Production',
                status: 'running',
                branch: 'main',
                commitMsg: 'Manual deploy triggered via Dashboard',
                author: 'Frontend User',
                startedAt: new Date().toISOString(),
                duration: '0s'
            });

            // Reload
            const doc = await fetchProjectDocument(projectId, 'DEPLOY');
            if (doc && doc.content) {
                const parsed = JSON.parse(doc.content);
                const rawDeploys = Array.isArray(parsed.deployments) ? parsed.deployments : [];
                setData({
                    deployments: rawDeploys.map(normalizeDeployment),
                    checklist: Array.isArray(parsed.checklist) ? parsed.checklist : []
                });
            }
        } catch (e) {
            console.error(e);
            alert('Failed to trigger deploy');
        }
    };

    return (
        <div className="w-full flex flex-col gap-6">
            {/* Header with Create Button */}
            <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
                <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-200">
                        {ko ? '배포 현황 관리' : 'Deployment Management'}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                        {ko ? '프로젝트의 배포 내역 및 진행 상태를 확인합니다.' : 'Track project deployments and statuses.'}
                    </p>
                </div>
                <button
                    onClick={handleCreateDeploy}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5"
                >
                    <Rocket className="w-4 h-4" /> {ko ? '새 배포 시작' : 'Trigger Deploy'}
                </button>
            </div>

            {/* Content or Empty State */}
            {MOCK.length === 0 && CHECKLIST.length === 0 ? (
                <div className="mt-2">
                    <EmptyStatePrompt
                        title={ko ? "배포 이력이 없습니다" : "No Deployments Found"}
                        description={ko ? "아직 이 프로젝트에 기록된 배포 파이프라인 데이터가 없습니다. AI에게 가상의 배포 내역 생성을 요청해보세요." : "There is no deployment pipeline data recorded for this project yet. Ask AI to generate virtual deployment history."}
                        suggestedPrompt={ko ? "프로덕션 환경과 스테이징 환경을 포함한 최근 3건의 가상의 배포 파이프라인 데이터를 배포 탭에 생성해줘." : "Create data for the last 3 virtual deployment pipelines (including production and staging environments) and add them to the Deploy tab."}
                    />
                </div>
            ) : (
                <>
                    {/* Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { v: MOCK.length, l: ko ? '전체 배포' : 'Total Deploys', c: 'text-indigo-600 dark:text-indigo-400', i: <Rocket className="w-5 h-5" /> },
                            { v: MOCK.filter(d => d.status === 'success').length, l: ko ? '성공' : 'Success', c: 'text-emerald-600 dark:text-emerald-400', i: <CheckCircle2 className="w-5 h-5" /> },
                            { v: MOCK.filter(d => d.status === 'failed').length, l: ko ? '실패' : 'Failed', c: 'text-red-600 dark:text-red-400', i: <XCircle className="w-5 h-5" /> },
                            { v: MOCK.filter(d => d.rollback).length, l: ko ? '롤백' : 'Rollbacks', c: 'text-amber-600 dark:text-amber-400', i: <RotateCcw className="w-5 h-5" /> },
                        ].map((card, i) => (
                            <div key={i} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                                <div className={`${card.c} mb-2`}>{card.i}</div>
                                <div className={`text-2xl font-bold ${card.c}`}>{card.v}</div>
                                <div className="text-sm text-slate-500 mt-1">{card.l}</div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        {/* Deployment Timeline */}
                        <div className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                <h3 className="font-semibold text-slate-800 dark:text-slate-200">{ko ? '배포 이력' : 'Deployment History'}</h3>
                            </div>
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {MOCK.map(d => {
                                    const s = STATUS[d.status];
                                    return (
                                        <div key={d.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <div className={`shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold ${s.cls}`}>
                                                {s.icon} {ko ? s.ko : s.label}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-mono font-bold text-sm text-indigo-600 dark:text-indigo-400">{d.version}</span>
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${d.env === 'Production' ? 'bg-red-100 dark:bg-red-500/20 text-red-600' : 'bg-blue-100 dark:bg-blue-500/20 text-blue-600'}`}>{d.env}</span>
                                                    {d.rollback && <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-600"><RotateCcw className="w-3 h-3" /> → {d.rollback}</span>}
                                                </div>
                                                <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                                                    <span className="flex items-center gap-1"><GitBranch className="w-3 h-3" />{d.branch}</span>
                                                    <span className="truncate">{d.commitMsg}</span>
                                                    <span>{d.author}</span>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0 text-xs text-slate-400">
                                                <div>{new Date(d.startedAt).toLocaleDateString(ko ? 'ko-KR' : 'en-US')}</div>
                                                <div className="flex items-center gap-1 justify-end"><Clock className="w-3 h-3" />{d.duration}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Pre-deploy Checklist */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden h-fit">
                            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                <h3 className="font-semibold text-slate-800 dark:text-slate-200">{ko ? '배포 체크리스트' : 'Deploy Checklist'}</h3>
                            </div>
                            <div className="p-4 flex flex-col gap-3">
                                {CHECKLIST.map((item, i) => (
                                    <label key={i} className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${item.checked ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-slate-600 group-hover:border-indigo-400'}`}>
                                            {item.checked && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                                        </div>
                                        <span className={`text-sm ${item.checked ? 'text-slate-500 line-through' : 'text-slate-700 dark:text-slate-300'}`}>{ko ? item.ko : item.en}</span>
                                    </label>
                                ))}
                                <div className="mt-2 text-xs text-slate-400">{CHECKLIST.filter(c => c.checked).length}/{CHECKLIST.length} {ko ? '완료' : 'done'}</div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-xs text-slate-500">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                {ko ? 'MCP를 통해 수집된 실제 데이터가 표시됩니다.' : 'Showing live data tracked via MCP.'}
            </div>
        </div>
    );
}
