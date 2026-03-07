'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import { Bug, AlertTriangle, CheckCircle2, Search, Filter, Clock, ArrowRight, Bot, CircleDot } from 'lucide-react';
import EmptyStatePrompt from '@/components/EmptyStatePrompt';

type IssueSeverity = 'P0' | 'P1' | 'P2' | 'P3';
type IssueStatus = 'reported' | 'analyzing' | 'fixing' | 'verifying' | 'closed';
type IssueType = 'bug' | 'feature' | 'improvement';

interface Issue {
    id: string;
    title: string;
    type: IssueType;
    severity: IssueSeverity;
    status: IssueStatus;
    assignee: string;
    reporter: string;
    createdAt: string;
    updatedAt: string;
    aiGenerated: boolean;
    reviewRequired: boolean;
    relatedPR?: string;
    description: string;
}

import { fetchProjectDocument } from '@/app/actions/documentActions';

const SEVERITY_CONFIG: Record<IssueSeverity, { label: string; color: string; bg: string }> = {
    P0: { label: 'P0 Critical', color: 'text-red-700 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-500/20' },
    P1: { label: 'P1 High', color: 'text-orange-700 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-500/20' },
    P2: { label: 'P2 Medium', color: 'text-yellow-700 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-500/20' },
    P3: { label: 'P3 Low', color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-700/50' },
};

const STATUS_CONFIG: Record<IssueStatus, { label: string; ko: string; color: string; bg: string }> = {
    reported: { label: 'Reported', ko: '발견', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10' },
    analyzing: { label: 'Analyzing', ko: '분석 중', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
    fixing: { label: 'Fixing', ko: '수정 중', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
    verifying: { label: 'Verifying', ko: '검증 중', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-500/10' },
    closed: { label: 'Closed', ko: '종료', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
};

const TYPE_ICONS: Record<IssueType, React.ReactNode> = {
    bug: <Bug className="w-4 h-4 text-red-500" />,
    feature: <CircleDot className="w-4 h-4 text-indigo-500" />,
    improvement: <ArrowRight className="w-4 h-4 text-emerald-500" />,
};

export default function IssueTrackerView({ projectId }: { projectId: string }) {
    const { t, language } = useTranslation();
    const [filterStatus, setFilterStatus] = useState<IssueStatus | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const [issues, setIssues] = useState<Issue[]>([]);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const doc = await fetchProjectDocument(projectId, 'ISSUE_TRACKER');
                if (doc && doc.content) {
                    const parsed = JSON.parse(doc.content);
                    setIssues(Array.isArray(parsed) ? parsed : []);
                } else {
                    setIssues([]);
                }
            } catch (err) {
                console.error("Failed to parse ISSUE_TRACKER document", err);
                setIssues([]);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [projectId]);

    const filtered = issues.filter(issue => {
        if (filterStatus !== 'all' && issue.status !== filterStatus) return false;
        if (searchQuery && !issue.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const statusCounts = Object.keys(STATUS_CONFIG).reduce((acc, key) => {
        acc[key as IssueStatus] = issues.filter(i => i.status === key).length;
        return acc;
    }, {} as Record<IssueStatus, number>);

    if (loading) {
        return (
            <div className="w-full flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    const handleCreateIssue = async () => {
        const title = prompt(language === 'ko' ? '새로운 이슈 제목을 입력하세요:' : 'Enter new issue title:');
        if (!title) return;

        const newIssue = {
            title,
            type: 'bug',
            severity: 'P2',
            status: 'reported',
            assignee: '',
            reporter: 'Frontend User',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            aiGenerated: false,
            reviewRequired: false,
            description: 'Manually created via Dashboard'
        };

        try {
            const { appendProjectDocumentAction } = await import('@/app/actions');
            await appendProjectDocumentAction(projectId, 'ISSUE_TRACKER', newIssue);
            // Reload
            const doc = await fetchProjectDocument(projectId, 'ISSUE_TRACKER');
            if (doc && doc.content) {
                setIssues(JSON.parse(doc.content));
            }
        } catch (e) {
            console.error(e);
            alert('Failed to create issue');
        }
    };

    return (
        <div className="w-full flex flex-col gap-6">
            {/* Header with Create Button */}
            <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
                <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-200">
                        {language === 'ko' ? '이슈 트래커 현황' : 'Issue Tracker Status'}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                        {language === 'ko' ? '프로젝트에서 발생한 이슈 및 버그 리포트를 추적합니다.' : 'Track issues and bug reports for this project.'}
                    </p>
                </div>
                <button
                    onClick={handleCreateIssue}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                    {language === 'ko' ? '+ 새로운 이슈' : '+ New Issue'}
                </button>
            </div>

            {/* Lifecycle Pipeline */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
                {(Object.entries(STATUS_CONFIG) as [IssueStatus, typeof STATUS_CONFIG[IssueStatus]][]).map(([key, cfg], idx, arr) => (
                    <React.Fragment key={key}>
                        <button
                            onClick={() => setFilterStatus(filterStatus === key ? 'all' : key)}
                            className={`flex-1 min-w-[140px] p-4 rounded-xl border transition-all duration-200 cursor-pointer ${filterStatus === key
                                ? `${cfg.bg} border-current ${cfg.color} shadow-sm ring-2 ring-current/20`
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-sm'
                                }`}
                        >
                            <div className={`text-2xl font-bold ${cfg.color}`}>{statusCounts[key]}</div>
                            <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">
                                {language === 'ko' ? cfg.ko : cfg.label}
                            </div>
                        </button>
                        {idx < arr.length - 1 && (
                            <ArrowRight className="w-5 h-5 text-slate-300 dark:text-slate-600 shrink-0" />
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Search & Filter Bar */}
            <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder={language === 'ko' ? '이슈 검색...' : 'Search issues...'}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                    />
                </div>
                {filterStatus !== 'all' && (
                    <button
                        onClick={() => setFilterStatus('all')}
                        className="px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        {language === 'ko' ? '필터 초기화' : 'Clear Filter'}
                    </button>
                )}
            </div>

            {/* Issue Table or Empty State */}
            {issues.length === 0 ? (
                <div className="mt-2">
                    <EmptyStatePrompt
                        title={language === 'ko' ? "등록된 이슈가 없습니다" : "No Issues Found"}
                        description={language === 'ko' ? "현재 프로젝트에 등록된 버그나 기능 요청 이슈가 없습니다. AI에게 초기 이슈를 스캐폴딩 하도록 요청해보세요." : "There are no bugs or feature requests for this project. Ask AI to scaffold initial issues."}
                        suggestedPrompt={language === 'ko' ? "현재 프로젝트의 성격에 어울리는 백엔드/프론트엔드 필수 태스크 기반으로 핵심 이슈 5가지를 생성해서 이슈 트래커에 넣어줘." : "Create 5 essential backend/frontend core issues suitable for the current project and add them to the Issue Tracker."}
                    />
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400 w-16">ID</th>
                                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">{language === 'ko' ? '제목' : 'Title'}</th>
                                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400 w-28">{language === 'ko' ? '심각도' : 'Severity'}</th>
                                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400 w-28">{language === 'ko' ? '상태' : 'Status'}</th>
                                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400 w-28">{language === 'ko' ? '담당자' : 'Assignee'}</th>
                                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400 w-32">{language === 'ko' ? '업데이트' : 'Updated'}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((issue) => {
                                    const sev = SEVERITY_CONFIG[issue.severity];
                                    const status = STATUS_CONFIG[issue.status];
                                    return (
                                        <tr key={issue.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-4 py-3 text-slate-500 font-mono text-xs">{issue.id}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    {TYPE_ICONS[issue.type]}
                                                    <span className="font-medium text-slate-800 dark:text-slate-200">{issue.title}</span>
                                                    {issue.aiGenerated && (
                                                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-400">
                                                            <Bot className="w-3 h-3" /> AI
                                                        </span>
                                                    )}
                                                    {issue.reviewRequired && (
                                                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400">
                                                            <AlertTriangle className="w-3 h-3" /> {language === 'ko' ? '검토 필요' : 'Review'}
                                                        </span>
                                                    )}
                                                    {issue.relatedPR && (
                                                        <span className="text-xs text-indigo-500 dark:text-indigo-400 font-medium">{issue.relatedPR}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-block px-2 py-1 rounded-md text-xs font-bold ${sev.color} ${sev.bg}`}>
                                                    {sev.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${status.color} ${status.bg}`}>
                                                    {language === 'ko' ? status.ko : status.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                                                {issue.assignee || <span className="text-slate-400 italic">{language === 'ko' ? '미배정' : 'Unassigned'}</span>}
                                            </td>
                                            <td className="px-4 py-3 text-slate-500 text-xs">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(issue.updatedAt).toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US')}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                                            {language === 'ko' ? '해당 조건의 이슈가 없습니다.' : 'No issues match your filter.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Data Source Notice */}
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-xs text-slate-500">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                {language === 'ko'
                    ? 'MCP를 통해 수집된 실제 데이터가 표시됩니다.'
                    : 'Showing live data tracked via MCP.'}
            </div>
        </div>
    );
}
