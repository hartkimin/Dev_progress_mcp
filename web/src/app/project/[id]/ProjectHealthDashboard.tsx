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

    // SDLC Pipeline Phases Calculation
    const phases = [
        { id: 'requirements', label: 'Requirements', ko: '요구사항', color: 'bg-indigo-500', progress: 100 },
        { id: 'design', label: 'Design', ko: '설계', color: 'bg-emerald-500', progress: categoryStats['design'] ? Math.round((categoryStats['design'].done / categoryStats['design'].total) * 100) : 80 },
        { id: 'dev', label: 'Development', ko: '개발', color: 'bg-amber-500', progress: completionRate },
        { id: 'review', label: 'Review & QA', ko: '오류 검수', color: 'bg-violet-500', progress: reviewTasks > 0 ? 50 : (doneTasks > 0 ? 90 : 0) },
        { id: 'deploy', label: 'Deploy', ko: '배포', color: 'bg-blue-500', progress: 0 } // Mock 0 until deployed
    ];

    // Mock Sprint Velocity Data (Last 5 Sprints)
    const sprintVelocity = [
        { sprint: 'Sprint 1', points: 24, completed: 24 },
        { sprint: 'Sprint 2', points: 30, completed: 28 },
        { sprint: 'Sprint 3', points: 35, completed: 35 },
        { sprint: 'Sprint 4', points: 40, completed: 32 },
        { sprint: 'Current', points: 45, completed: doneTasks * 3 } // Mock points
    ];
    const maxVelocity = 50;

    return (
        <div className="w-full space-y-6">
            {/* Top KPI Cards (Project Overview) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Sprint Progress */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Sprint</span>
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                            <Activity className="w-4 h-4 text-indigo-500" />
                        </div>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{completionRate}%</span>
                        <span className="text-sm text-slate-500 mb-1">({doneTasks}/{totalTasks} Tasks)</span>
                    </div>
                </div>

                {/* Velocity */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Sprint Velocity</span>
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                        </div>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-extrabold text-slate-900 dark:text-white">~31</span>
                        <span className="text-sm text-slate-500 mb-1">pts / sprint</span>
                    </div>
                </div>

                {/* Blockers */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Blockers</span>
                        <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
                            <AlertCircle className="w-4 h-4 text-red-500" />
                        </div>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-extrabold text-red-600 dark:text-red-400">0</span>
                        <span className="text-sm text-slate-500 mb-1">active issues</span>
                    </div>
                </div>

                {/* Lead Time */}
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

            {/* SDLC Pipeline Full Width */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-indigo-500" />
                    Project SDLC Pipeline
                </h3>
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    {phases.map((phase, i) => (
                        <div key={phase.id} className="w-full flex-1 flex flex-col relative group">
                            {i < phases.length - 1 && (
                                <div className="hidden md:block absolute top-[11px] left-[50%] w-full h-1 bg-slate-100 dark:bg-slate-800 z-0">
                                    <div className={`h-full ${phase.progress === 100 ? phase.color : 'bg-transparent'} transition-all`} style={{ width: phase.progress === 100 ? '100%' : '0%' }} />
                                </div>
                            )}
                            <div className="relative z-10 flex flex-col items-center gap-3">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center border-[3px] bg-white dark:bg-slate-900 
                                ${phase.progress === 100 ? `border-transparent ${phase.color} shadow-[0_0_0_2px] shadow-emerald-500/20 text-white` :
                                        phase.progress > 0 ? `border-transparent ${phase.color} shadow-[0_0_0_2px] shadow-indigo-500/20 text-white animate-pulse` :
                                            'border-slate-200 dark:border-slate-700 text-transparent'}`}>
                                    {phase.progress === 100 && <CheckCircle2 className="w-3.5 h-3.5" />}
                                    {phase.progress > 0 && phase.progress < 100 && <div className="w-2 h-2 rounded-full bg-white"></div>}
                                </div>
                                <div className="text-center">
                                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{phase.label}</div>
                                    <div className="text-[10px] text-slate-500">{phase.ko}</div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                                        <div className={`h-full ${phase.color}`} style={{ width: `${phase.progress}%` }} />
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-bold mt-1">{phase.progress}%</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sprint Velocity View */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-5 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-emerald-500" />
                        Sprint Velocity
                    </h3>
                    <div className="h-48 flex items-end gap-4 px-2">
                        {sprintVelocity.map((sv, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                <div className="w-full flex items-end justify-center rounded-t-sm relative h-full">
                                    <div className="absolute w-8 lg:w-12 bg-slate-100 dark:bg-slate-800 rounded-t-sm opacity-50" style={{ height: `${(sv.points / maxVelocity) * 100}%` }} title="Committed Points"></div>
                                    <div className="absolute w-8 lg:w-12 bg-emerald-500 dark:bg-emerald-600 rounded-t-sm z-10" style={{ height: `${(sv.completed / maxVelocity) * 100}%` }} title="Completed Points"></div>

                                    {/* Tooltip */}
                                    <div className="absolute -top-8 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none whitespace-nowrap">
                                        {sv.completed} / {sv.points} pts
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold text-slate-500">{sv.sprint}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Activity Feed */}
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
                        <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
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
                                                <span className="text-[11px] text-slate-500">Task marked as</span>
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${cfg.bgColor} ${cfg.color}`}>
                                                    {cfg.label}
                                                </span>
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
