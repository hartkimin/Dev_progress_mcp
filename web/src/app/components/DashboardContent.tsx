'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransition, useState } from 'react';
import ProjectActions from './ProjectActions';
import { useTranslation } from '@/lib/i18n';
import type { ProjectSummary, StrategyReadiness } from '@/lib/db';
import StrategyReadinessSection from './StrategyReadiness';
import PhaseProgressStrip from './PhaseProgressStrip';
import { createProjectAction } from '@/app/actions';
import { AlertTriangle, TrendingUp, Clock } from 'lucide-react';

function CreateProjectModal({ onClose, onCreate }: { onClose: () => void; onCreate: (name: string, desc: string, mode: 'newbie' | 'import') => void }) {
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [mode, setMode] = useState<'newbie' | 'import'>('newbie');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        onCreate(name.trim(), desc.trim(), mode);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md mx-4 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6"
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">새 프로젝트 생성</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">프로젝트 정보를 입력하세요.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            프로젝트 이름 <span className="text-red-500">*</span>
                        </label>
                        <input
                            autoFocus
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="예: SafeTrip Mobile App"
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            설명 <span className="text-slate-400 font-normal">(선택)</span>
                        </label>
                        <textarea
                            value={desc}
                            onChange={e => setDesc(e.target.value)}
                            placeholder="프로젝트에 대한 간단한 설명..."
                            rows={2}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            시작 모드
                        </label>
                        <div className="space-y-2">
                            <label className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${mode === 'newbie' ? 'bg-indigo-50/50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                                <div className="flex h-5 items-center">
                                    <input type="radio" checked={mode === 'newbie'} onChange={() => setMode('newbie')} className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-600" />
                                </div>
                                <div className="ml-3">
                                    <span className="block text-sm font-medium text-slate-900 dark:text-white">초보자 가이드 모드 (Complete Newbie)</span>
                                    <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">Vibe Coding 5단계 템플릿 태스크가 자동으로 생성됩니다.</span>
                                </div>
                            </label>

                            <label className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${mode === 'import' ? 'bg-indigo-50/50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                                <div className="flex h-5 items-center">
                                    <input type="radio" checked={mode === 'import'} onChange={() => setMode('import')} className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-600" />
                                </div>
                                <div className="ml-3">
                                    <span className="block text-sm font-medium text-slate-900 dark:text-white">기존 문서 연동 모드 (Import Data)</span>
                                    <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">비어있는 상태로 생성하며, MCP를 통해 AI가 기존 문서를 동기화합니다.</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={!name.trim()}
                            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
                        >
                            생성
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function CreateProjectButton() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [showModal, setShowModal] = useState(false);

    const handleCreate = (name: string, desc: string, mode: 'newbie' | 'import') => {
        setShowModal(false);
        startTransition(async () => {
            const result = await createProjectAction(name, desc, mode);
            if (result.success) {
                router.push(`/project/${result.id}`);
            }
        });
    };

    return (
        <>
            {showModal && (
                <CreateProjectModal
                    onClose={() => setShowModal(false)}
                    onCreate={handleCreate}
                />
            )}
            <button
                onClick={() => setShowModal(true)}
                disabled={isPending}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2"
            >
                {isPending ? (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                )}
                Create Project
            </button>
        </>
    );
}

function timeAgo(dateStr: string | null): string {
    if (!dateStr) return '-';
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    if (diffMin < 1) return '방금 전';
    if (diffMin < 60) return `${diffMin}분 전`;
    if (diffHour < 24) return `${diffHour}시간 전`;
    if (diffDay < 7) return `${diffDay}일 전`;
    return date.toLocaleDateString('ko-KR');
}

function StatusDot({ count, color, label }: { count: number; color: string; label: string }) {
    if (count === 0) return null;
    return (
        <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            <span className={`w-2 h-2 rounded-full ${color}`}></span>
            {count}
        </span>
    );
}

function VibeAlertPanel({ projects }: { projects: ProjectSummary[] }) {
    // Generate AI-driven alerts based on heuristics
    const alerts = projects.map(p => {
        const now = new Date().getTime();
        const lastAct = p.task_summary.last_activity ? new Date(p.task_summary.last_activity).getTime() : now;
        const daysStalled = (now - lastAct) / (1000 * 3600 * 24);

        if (daysStalled > 3 && p.task_summary.in_progress > 0) {
            return { type: 'stalled', project: p, msg: `구현 단계에 진입했으나 3일간 업데이트가 없습니다. 진행 상황을 점검하세요.` };
        }
        if (p.task_summary.todo > 30 && p.task_summary.completion_rate < 10) {
            return { type: 'scope_creep', project: p, msg: `기획 대비 태스크 추가 속도가 너무 빠릅니다 (Scope Creep 위험).` };
        }
        return null;
    }).filter(Boolean);

    if (alerts.length === 0) return null;

    return (
        <div className="mb-12 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="text-rose-500" size={20} />
                <h3 className="text-lg font-bold text-rose-900 dark:text-rose-100">Vibe Alerts (Risk Radar)</h3>
                <span className="ml-auto text-xs font-semibold px-2 py-1 bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300 rounded-full">
                    {alerts.length} Issues Detected
                </span>
            </div>
            <div className="space-y-3">
                {alerts.map((alert, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-rose-100 dark:border-rose-900/30">
                        {alert?.type === 'stalled' ? <Clock className="text-amber-500 mt-0.5" size={18} /> : <TrendingUp className="text-rose-500 mt-0.5" size={18} />}
                        <div>
                            <Link href={`/project/${alert?.project.id}`} className="font-semibold text-slate-800 dark:text-slate-200 hover:text-indigo-600 transition-colors">
                                {alert?.project.name}
                            </Link>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{alert?.msg}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ProjectCard({ project }: { project: ProjectSummary }) {
    const s = project.task_summary;
    const hasPhase = s.dominant_phase && s.dominant_phase.length > 0;

    return (
        <div className="relative group">
            <ProjectActions project={{ id: project.id, name: project.name, description: project.description || '' }} />

            <Link
                href={`/project/${project.id}`}
                className="block h-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-200/60 dark:border-slate-800/60 hover:border-indigo-400/50 dark:hover:border-indigo-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1.5 overflow-hidden relative"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-transparent dark:from-indigo-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>

                <div className="relative z-10 p-6 flex flex-col h-full">
                    {/* Header */}
                    <div className="mb-4">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-cyan-600 dark:group-hover:from-indigo-400 dark:group-hover:to-cyan-400 transition-all duration-300 leading-tight">
                            {project.name}
                        </h3>
                        {project.description && (
                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                {project.description}
                            </p>
                        )}
                    </div>

                    {/* Progress Bar & Completion */}
                    {s.total > 0 && (
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                    {s.completion_rate}%
                                </span>
                                <span className="text-xs font-medium text-slate-400">
                                    {s.done}/{s.total} tasks
                                </span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ${s.completion_rate === 100
                                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                                        : 'bg-gradient-to-r from-indigo-500 to-cyan-500'
                                        }`}
                                    style={{ width: `${s.completion_rate}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Status Breakdown */}
                    {s.total > 0 && (
                        <div className="flex items-center gap-3 mb-4">
                            <StatusDot count={s.todo} color="bg-slate-400" label="TODO" />
                            <StatusDot count={s.in_progress} color="bg-blue-500" label="Progress" />
                            <StatusDot count={s.review} color="bg-amber-500" label="Review" />
                            <StatusDot count={s.done} color="bg-emerald-500" label="Done" />
                        </div>
                    )}

                    {project.phase_progress && project.phase_progress.length > 0 && (
                        <div className="mb-4">
                            <PhaseProgressStrip phases={project.phase_progress} />
                        </div>
                    )}

                    {/* Footer: Phase & Activity */}
                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 group-hover:border-indigo-200 dark:group-hover:border-indigo-500/20 transition-colors">
                        <div className="flex flex-col gap-1 min-w-0">
                            {hasPhase && (
                                <span className="text-[10px] font-bold uppercase tracking-wide text-indigo-500 dark:text-indigo-400 truncate">
                                    🎯 {s.dominant_phase}
                                </span>
                            )}
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                {timeAgo(s.last_activity)}
                            </span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/10 flex items-center justify-center transition-colors shrink-0">
                            <svg className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
}

export default function DashboardContent({ projectSummaries, strategyReadiness }: { projectSummaries: ProjectSummary[]; strategyReadiness?: StrategyReadiness | null }) {
    const { t } = useTranslation();

    return (
        <div className="relative w-full px-4 sm:px-6 lg:px-10 xl:px-16 py-12">
            <header className="relative z-50 mb-12 border-b border-slate-200/60 dark:border-slate-800/60 pb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4 backdrop-blur-sm">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-500 dark:from-indigo-400 dark:to-cyan-400">
                        {t('developerConsole') || "Developer Console"}
                    </h1>
                    <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
                        {t('developerConsoleSubtitle') || "Real-time synchronization with MCP local context. Track your coding progress effortlessly."}
                    </p>
                </div>
            </header>

            <section>
                <VibeAlertPanel projects={projectSummaries} />

                <StrategyReadinessSection data={strategyReadiness ?? null} />

                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                        <span className="w-2.5 h-8 bg-gradient-to-b from-indigo-500 to-cyan-500 rounded-full shadow-lg shadow-indigo-500/20 inline-block"></span>
                        {t('activeProjects') || "Active Projects"}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3">
                        <CreateProjectButton />
                        <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                            {projectSummaries.length} {projectSummaries.length === 1 ? (t('project') || "Project") : (t('projects') || "Projects")}
                        </div>
                    </div>
                </div>

                {projectSummaries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 px-4 bg-white dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 shadow-sm dark:shadow-none">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300">{t('noProjectsFound') || "No Projects Found"}</h3>
                        <p className="text-slate-500 mt-2 max-w-sm text-center">
                            {t('getStartedByCreatingProject') || "Get started by creating a project via the MCP tool from your AI assistant."}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projectSummaries.map((project) => (
                            <ProjectCard key={project.id} project={project} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
