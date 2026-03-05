'use client';

import React from 'react';
import { Task } from '@/lib/db';
import { CheckCircle2, Clock, Activity, TrendingUp, BarChart3, AlertCircle, Zap } from 'lucide-react';

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

    // Average completion time (for tasks that have both created_at and completed_at)
    const completedTasksWithTime = tasks.filter(t => t.status === 'DONE' && t.completed_at && t.created_at);
    const avgCompletionDays = completedTasksWithTime.length > 0
        ? Math.round(completedTasksWithTime.reduce((sum, t) => {
            const created = new Date(t.created_at).getTime();
            const completed = new Date(t.completed_at!).getTime();
            return sum + (completed - created) / (1000 * 60 * 60 * 24);
        }, 0) / completedTasksWithTime.length * 10) / 10
        : null;

    // Recent activity (last 5 updated tasks)
    const recentTasks = [...tasks]
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 8);

    // Status color mapping
    const statusConfig: Record<string, { label: string; color: string; bgColor: string; barColor: string }> = {
        TODO: { label: 'To Do', color: 'text-slate-600', bgColor: 'bg-slate-100 dark:bg-slate-800', barColor: 'bg-slate-400' },
        IN_PROGRESS: { label: 'In Progress', color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-900/20', barColor: 'bg-blue-500' },
        REVIEW: { label: 'Review', color: 'text-amber-600', bgColor: 'bg-amber-50 dark:bg-amber-900/20', barColor: 'bg-amber-500' },
        DONE: { label: 'Completed', color: 'text-emerald-600', bgColor: 'bg-emerald-50 dark:bg-emerald-900/20', barColor: 'bg-emerald-500' },
    };

    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (completionRate / 100) * circumference;

    return (
        <div className="w-full space-y-6">
            {/* Top KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Completion Rate */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">완료율</span>
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        </div>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{completionRate}%</span>
                        <span className="text-sm text-slate-500 mb-1">{doneTasks}/{totalTasks}</span>
                    </div>
                    <div className="mt-3 w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-1000"
                            style={{ width: `${completionRate}%` }}
                        />
                    </div>
                </div>

                {/* Total Tasks */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">전체 태스크</span>
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                            <BarChart3 className="w-4 h-4 text-indigo-500" />
                        </div>
                    </div>
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{totalTasks}</span>
                    <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span>진행 {inProgressTasks}</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span>검토 {reviewTasks}</span>
                    </div>
                </div>

                {/* Active (In Progress + Review) */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">진행 중</span>
                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                            <Activity className="w-4 h-4 text-blue-500" />
                        </div>
                    </div>
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{inProgressTasks + reviewTasks}</span>
                    <div className="mt-2 text-xs text-slate-500">
                        대기 중: {todoTasks}개 태스크
                    </div>
                </div>

                {/* Avg Completion Time */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">평균 소요시간</span>
                        <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
                            <Clock className="w-4 h-4 text-purple-500" />
                        </div>
                    </div>
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                        {avgCompletionDays !== null ? `${avgCompletionDays}일` : '-'}
                    </span>
                    <div className="mt-2 text-xs text-slate-500">
                        완료된 {completedTasksWithTime.length}개 기준
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Donut Chart + Status Distribution */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-5 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-indigo-500" />
                        상태별 분포
                    </h3>
                    <div className="flex items-center justify-center mb-6">
                        <div className="relative w-32 h-32">
                            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="10"
                                    className="text-slate-100 dark:text-slate-800" />
                                <circle cx="50" cy="50" r="45" fill="none" strokeWidth="10"
                                    className="text-emerald-500"
                                    stroke="currentColor"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="round"
                                    style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{completionRate}%</span>
                                <span className="text-[10px] font-medium text-slate-400">완료율</span>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'] as const).map(status => {
                            const count = tasks.filter(t => t.status === status).length;
                            const pct = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
                            const cfg = statusConfig[status];
                            return (
                                <div key={status} className="flex items-center gap-3">
                                    <span className={`w-2.5 h-2.5 rounded-full ${cfg.barColor} shrink-0`}></span>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex-1">{cfg.label}</span>
                                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200 tabular-nums">{count}</span>
                                    <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className={`h-full ${cfg.barColor} rounded-full`} style={{ width: `${pct}%` }} />
                                    </div>
                                    <span className="text-xs text-slate-400 tabular-nums w-8 text-right">{pct}%</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Category Progress */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-5 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-500" />
                        카테고리별 진행 현황
                    </h3>
                    {Object.keys(categoryStats).length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                            <AlertCircle className="w-8 h-8 mb-2 opacity-40" />
                            <p className="text-sm">카테고리가 없습니다</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {Object.entries(categoryStats)
                                .sort(([, a], [, b]) => b.total - a.total)
                                .map(([cat, stats]) => {
                                    const pct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
                                    return (
                                        <div key={cat}>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[180px]">{cat}</span>
                                                <span className="text-xs font-mono font-bold text-slate-500">{stats.done}/{stats.total}</span>
                                            </div>
                                            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-700 ${pct === 100
                                                        ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                                                        : 'bg-gradient-to-r from-indigo-400 to-indigo-500'
                                                        }`}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                            <div className="text-right mt-1">
                                                <span className={`text-[11px] font-bold ${pct === 100 ? 'text-emerald-500' : 'text-slate-400'}`}>
                                                    {pct}%
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    )}
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-5 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        최근 활동
                    </h3>
                    {recentTasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                            <AlertCircle className="w-8 h-8 mb-2 opacity-40" />
                            <p className="text-sm">활동 내역이 없습니다</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentTasks.map(task => {
                                const cfg = statusConfig[task.status] || statusConfig.TODO;
                                const updatedAgo = getTimeAgo(task.updated_at);
                                return (
                                    <div key={task.id} className="flex items-start gap-3 group">
                                        <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${cfg.barColor}`}></span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{task.title}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${cfg.bgColor} ${cfg.color}`}>
                                                    {cfg.label}
                                                </span>
                                                <span className="text-[10px] text-slate-400">{updatedAgo}</span>
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
