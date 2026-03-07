'use client';

import React, { useEffect, useState } from 'react';
import { Task, getPhaseBreakdown, getBurndownData, getVelocityHistory, getCategoryDistribution } from '@/lib/db';
import type { PhaseBreakdownItem, BurndownPoint, VelocityPoint, CategoryDistItem } from '@/lib/db';
import { CheckCircle2, Clock, Activity, TrendingUp, BarChart3, AlertCircle, Zap, Layers, ArrowDown } from 'lucide-react';

interface ProjectHealthDashboardProps {
    tasks: Task[];
    categoryStats: Record<string, { total: number; done: number }>;
    projectId: string;
    projectName: string;
}

export default function ProjectHealthDashboard({ tasks, categoryStats, projectId, projectName }: ProjectHealthDashboardProps) {
    const totalTasks = tasks.length;
    const doneTasks = tasks.filter(t => t.status === 'DONE').length;
    const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS').length;
    const reviewTasks = tasks.filter(t => t.status === 'REVIEW').length;
    const todoTasks = tasks.filter(t => t.status === 'TODO').length;
    const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    // Average completion time
    const completedTasksWithTime = tasks.filter(t => t.status === 'DONE' && t.completed_at && t.created_at);
    const avgCompletionDays = completedTasksWithTime.length > 0
        ? Math.round(completedTasksWithTime.reduce((sum, t) => {
            const created = new Date(t.created_at).getTime();
            const completed = new Date(t.completed_at!).getTime();
            return sum + (completed - created) / (1000 * 60 * 60 * 24);
        }, 0) / completedTasksWithTime.length * 10) / 10
        : null;

    // Recent activity
    const recentTasks = [...tasks]
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 8);

    // ─── Real data from API ──────────────────────────────────────
    const [phases, setPhases] = useState<PhaseBreakdownItem[]>([]);
    const [burndown, setBurndown] = useState<BurndownPoint[]>([]);
    const [velocity, setVelocity] = useState<VelocityPoint[]>([]);
    const [avgVelocity, setAvgVelocity] = useState(0);
    const [catDist, setCatDist] = useState<CategoryDistItem[]>([]);

    useEffect(() => {
        Promise.allSettled([
            getPhaseBreakdown(projectId).then(d => setPhases(d?.phases || [])),
            getBurndownData(projectId, 30).then(d => setBurndown(d?.data_points || [])),
            getVelocityHistory(projectId, 8).then(d => {
                setVelocity(d?.velocity_data || []);
                setAvgVelocity(d?.avg_velocity || 0);
            }),
            getCategoryDistribution(projectId).then(d => setCatDist(d?.distribution || [])),
        ]);
    }, [projectId]);

    // Status config
    const statusConfig: Record<string, { label: string; color: string; bgColor: string; barColor: string }> = {
        TODO: { label: 'To Do', color: 'text-slate-600', bgColor: 'bg-slate-100 dark:bg-slate-800', barColor: 'bg-slate-400' },
        IN_PROGRESS: { label: 'In Progress', color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-900/20', barColor: 'bg-blue-500' },
        REVIEW: { label: 'Review', color: 'text-amber-600', bgColor: 'bg-amber-50 dark:bg-amber-900/20', barColor: 'bg-amber-500' },
        DONE: { label: 'Completed', color: 'text-emerald-600', bgColor: 'bg-emerald-50 dark:bg-emerald-900/20', barColor: 'bg-emerald-500' },
    };

    // Blockers: count review tasks as potential blockers 
    const blockerCount = reviewTasks;

    // Burndown chart SVG
    const burndownMax = burndown.length > 0 ? Math.max(...burndown.map(b => b.remaining), 1) : 1;

    return (
        <div className="w-full space-y-6">
            {/* ── Top KPI Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Progress</span>
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                            <Activity className="w-4 h-4 text-indigo-500" />
                        </div>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{completionRate}%</span>
                        <span className="text-sm text-slate-500 mb-1">({doneTasks}/{totalTasks})</span>
                    </div>
                    <div className="mt-3 w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${completionRate === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${completionRate}%` }} />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Avg Velocity</span>
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                        </div>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{avgVelocity}</span>
                        <span className="text-sm text-slate-500 mb-1">tasks / week</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">In Review</span>
                        <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                            <AlertCircle className="w-4 h-4 text-amber-500" />
                        </div>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className={`text-3xl font-extrabold ${blockerCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>{blockerCount}</span>
                        <span className="text-sm text-slate-500 mb-1">pending tasks</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Avg Lead Time</span>
                        <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
                            <Clock className="w-4 h-4 text-purple-500" />
                        </div>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                            {avgCompletionDays !== null ? `${avgCompletionDays}` : '-'}
                        </span>
                        <span className="text-sm text-slate-500 mb-1">days</span>
                    </div>
                </div>
            </div>

            {/* ── Vibe Coding Phase Pipeline ── */}
            {phases.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-indigo-500" />
                        Vibe Coding Phase Pipeline
                    </h3>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        {phases.filter(p => p.name !== 'Unassigned').map((phase, i, arr) => {
                            const isComplete = phase.completion_rate === 100;
                            const isActive = phase.in_progress > 0 || phase.review > 0;
                            const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-violet-500', 'bg-blue-500'];
                            const color = colors[i % colors.length];
                            return (
                                <div key={phase.name} className="w-full flex-1 flex flex-col relative group">
                                    {i < arr.length - 1 && (
                                        <div className="hidden md:block absolute top-[11px] left-[50%] w-full h-1 bg-slate-100 dark:bg-slate-800 z-0">
                                            <div className={`h-full ${isComplete ? color : 'bg-transparent'} transition-all`} style={{ width: isComplete ? '100%' : '0%' }} />
                                        </div>
                                    )}
                                    <div className="relative z-10 flex flex-col items-center gap-3">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border-[3px] bg-white dark:bg-slate-900 
                                        ${isComplete ? `border-transparent ${color} shadow-[0_0_0_2px] shadow-emerald-500/20 text-white` :
                                                isActive ? `border-transparent ${color} shadow-[0_0_0_2px] shadow-indigo-500/20 text-white animate-pulse` :
                                                    'border-slate-200 dark:border-slate-700 text-transparent'}`}>
                                            {isComplete && <CheckCircle2 className="w-3.5 h-3.5" />}
                                            {isActive && !isComplete && <div className="w-2 h-2 rounded-full bg-white"></div>}
                                        </div>
                                        <div className="text-center">
                                            <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{phase.name.split(' ').slice(0, 2).join(' ')}</div>
                                            <div className="text-[10px] text-slate-500 mt-0.5">{phase.done}/{phase.total} tasks</div>
                                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                                                <div className={`h-full ${color}`} style={{ width: `${phase.completion_rate}%` }} />
                                            </div>
                                            <div className="text-[10px] text-slate-400 font-bold mt-1">{phase.completion_rate}%</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ── Burndown Chart ── */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-5 flex items-center gap-2">
                        <ArrowDown className="w-4 h-4 text-indigo-500" />
                        Burndown (30 days)
                    </h3>
                    {burndown.length > 0 ? (
                        <div className="h-48 relative">
                            <svg viewBox={`0 0 ${burndown.length * 10} 100`} className="w-full h-full" preserveAspectRatio="none">
                                {/* Grid lines */}
                                {[0, 25, 50, 75, 100].map(y => (
                                    <line key={y} x1="0" y1={y} x2={burndown.length * 10} y2={y} stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="0.5" />
                                ))}
                                {/* Remaining line */}
                                <polyline
                                    fill="none"
                                    stroke="url(#burnGrad)"
                                    strokeWidth="2"
                                    strokeLinejoin="round"
                                    points={burndown.map((b, i) => `${i * 10},${100 - (b.remaining / burndownMax) * 90}`).join(' ')}
                                />
                                {/* Area fill */}
                                <polygon
                                    fill="url(#burnAreaGrad)"
                                    points={`0,100 ${burndown.map((b, i) => `${i * 10},${100 - (b.remaining / burndownMax) * 90}`).join(' ')} ${(burndown.length - 1) * 10},100`}
                                />
                                <defs>
                                    <linearGradient id="burnGrad" x1="0" x2="1">
                                        <stop offset="0%" stopColor="#6366f1" />
                                        <stop offset="100%" stopColor="#06b6d4" />
                                    </linearGradient>
                                    <linearGradient id="burnAreaGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.15" />
                                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[9px] text-slate-400 px-1">
                                <span>{burndown[0]?.date.slice(5)}</span>
                                <span>{burndown[Math.floor(burndown.length / 2)]?.date.slice(5)}</span>
                                <span>{burndown[burndown.length - 1]?.date.slice(5)}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="h-48 flex items-center justify-center text-sm text-slate-400">데이터 로딩 중...</div>
                    )}
                </div>

                {/* ── Velocity Chart (REAL DATA) ── */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-5 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-emerald-500" />
                        Weekly Velocity
                    </h3>
                    {velocity.length > 0 ? (() => {
                        const maxVel = Math.max(...velocity.map(v => v.completed), 1);
                        return (
                            <div className="h-48 flex items-end gap-2 px-1">
                                {velocity.map((v, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                                        <div className="relative w-full flex items-end justify-center h-full">
                                            <div
                                                className="w-full max-w-10 bg-emerald-500 dark:bg-emerald-600 rounded-t-sm transition-all duration-500"
                                                style={{ height: `${(v.completed / maxVel) * 100}%`, minHeight: v.completed > 0 ? '4px' : '0' }}
                                            />
                                            <div className="absolute -top-7 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none whitespace-nowrap">
                                                {v.completed} tasks
                                            </div>
                                        </div>
                                        <span className="text-[9px] font-bold text-slate-500 whitespace-nowrap">{v.week_label}</span>
                                    </div>
                                ))}
                            </div>
                        );
                    })() : (
                        <div className="h-48 flex items-center justify-center text-sm text-slate-400">데이터 로딩 중...</div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ── Category Distribution ── */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-5 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-violet-500" />
                        Category Distribution
                    </h3>
                    {catDist.length > 0 ? (
                        <div className="space-y-3">
                            {catDist.map((cat, i) => {
                                const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-violet-500', 'bg-blue-500', 'bg-pink-500'];
                                return (
                                    <div key={cat.name} className="flex items-center gap-3">
                                        <span className={`w-2.5 h-2.5 rounded-full ${colors[i % colors.length]} shrink-0`}></span>
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 min-w-[120px] truncate">{cat.name}</span>
                                        <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div className={`h-full ${colors[i % colors.length]} rounded-full`} style={{ width: `${cat.completion_rate}%` }} />
                                        </div>
                                        <span className="text-[11px] font-bold text-slate-500 w-14 text-right">{cat.done}/{cat.total}</span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="h-32 flex items-center justify-center text-sm text-slate-400">데이터 로딩 중...</div>
                    )}
                </div>

                {/* ── Activity Feed ── */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col h-auto">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-5 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        Activity Feed
                    </h3>
                    {recentTasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center flex-1 text-slate-400">
                            <AlertCircle className="w-8 h-8 mb-2 opacity-40" />
                            <p className="text-sm">No recent activity</p>
                        </div>
                    ) : (
                        <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-64">
                            {recentTasks.map(task => {
                                const cfg = statusConfig[task.status] || statusConfig.TODO;
                                const updatedAgo = getTimeAgo(task.updated_at);
                                return (
                                    <div key={task.id} className="flex items-start gap-4 group">
                                        <div className="flex flex-col items-center">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${cfg.bgColor}`}>
                                                <span className={`w-2.5 h-2.5 rounded-full ${cfg.barColor}`}></span>
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0 pt-1">
                                            <div className="flex items-baseline justify-between gap-2">
                                                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{task.title}</p>
                                                <span className="text-[10px] text-slate-400 whitespace-nowrap">{updatedAgo}</span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${cfg.bgColor} ${cfg.color}`}>
                                                    {cfg.label}
                                                </span>
                                                {task.phase && <span className="text-[10px] text-indigo-500 font-medium">{task.phase}</span>}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function getTimeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    return date.toLocaleDateString('ko-KR');
}
