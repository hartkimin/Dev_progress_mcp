'use client';

import React, { useEffect, useState } from 'react';
import { Task } from '@/lib/db';
import { Clock, CheckCircle2, Edit3, Plus, ArrowRight, FolderKanban } from 'lucide-react';
import { getRecentGlobalTasksAction } from '@/app/actions';

export default function ProjectActivityView({
    projectId,
    projectName,
    tasks: initialTasks
}: {
    projectId: string;
    projectName: string;
    tasks: Task[];
}) {
    const sortedTasks = [...initialTasks].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'TODO': return { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400', dot: 'bg-slate-400', label: 'To Do' };
            case 'IN_PROGRESS': return { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', dot: 'bg-blue-500', label: 'In Progress' };
            case 'REVIEW': return { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500', label: 'Review' };
            case 'DONE': return { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500', label: 'Done' };
            default: return { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400', label: status };
        }
    };

    const timeAgo = (dateStr: string) => {
        const now = new Date();
        const date = new Date(dateStr);
        const diffMs = now.getTime() - date.getTime();
        const diffMin = Math.floor(diffMs / 60000);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);

        if (diffMin < 1) return '방금 전';
        if (diffMin < 60) return `${diffMin}분 전`;
        if (diffHour < 24) return `${diffHour}시간 전`;
        return `${diffDay}일 전`;
    };

    return (
        <div className="w-full">
            <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-indigo-500" />
                        최근 활동 ({sortedTasks.length})
                    </h2>
                </div>

                {sortedTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400 dark:text-slate-500 p-8">
                        <Clock size={48} strokeWidth={1} className="mb-4 opacity-50" />
                        <p>아직 활동 내역이 없습니다.</p>
                    </div>
                ) : (
                    <div className="relative border-l-2 border-slate-200/80 dark:border-slate-800 ml-8 space-y-0 py-4">
                        {sortedTasks.map((task) => {
                            const style = getStatusStyle(task.status);
                            return (
                                <div key={task.id} className="relative pl-8 group py-3">
                                    {/* Timeline node */}
                                    <div className={`absolute -left-[9px] top-5 w-4 h-4 rounded-full ring-4 ring-white dark:ring-slate-900 shadow-sm transition-transform duration-300 group-hover:scale-125 ${style.dot}`} />

                                    <div className={`flex flex-col gap-1.5 ${style.bg} p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-colors mr-4`}>
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex flex-col gap-1 flex-1 min-w-0">
                                                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-tight truncate">
                                                    {task.title}
                                                </h4>
                                                {task.description && (
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                                                        {task.description}
                                                    </p>
                                                )}
                                            </div>

                                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase shadow-sm ${style.bg} ${style.text} border border-slate-200/50 dark:border-slate-700/50 shrink-0`}>
                                                {style.label}
                                            </span>
                                        </div>

                                        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1 pt-2 border-t border-slate-200/30 dark:border-slate-700/30">
                                            <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                                                <Clock size={12} />
                                                {timeAgo(task.updated_at)}
                                            </span>
                                            {task.category && (
                                                <span className="text-[10px] font-bold text-indigo-500 uppercase">{task.category}</span>
                                            )}
                                            {task.task_type && (
                                                <span className="text-[10px] font-medium text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded">{task.task_type}</span>
                                            )}
                                            <span className="text-[10px] font-mono text-slate-400">#{task.id.slice(0, 6)}</span>
                                            {task.updated_by && (
                                                <span className="text-[10px] text-slate-400">by {task.updated_by}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
