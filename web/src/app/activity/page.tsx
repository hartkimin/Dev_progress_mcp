'use client';

import React, { useEffect, useState } from 'react';
import { Clock, Activity, ArrowRight, FolderKanban } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import Link from 'next/link';
import { getRecentGlobalTasksAction } from '@/app/actions';
import type { Task } from '@/lib/db';

export default function ActivityPage() {
    const { t } = useTranslation();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                // Fetch using our server action
                const data = await getRecentGlobalTasksAction(50); // limit 50
                setTasks(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, []);

    const sortedTasks = [...tasks].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    return (
        <div className="flex-1 w-full h-full flex flex-col pt-8 sm:pt-14 pb-16 px-4 sm:px-12 xl:px-24 mx-auto max-w-5xl relative z-10">
            {/* Header */}
            <div className="flex flex-col gap-2 mb-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-md">
                        <Activity size={20} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                        {t('recentActivity')}
                    </h1>
                </div>
                <p className="text-slate-500 dark:text-slate-400 max-w-2xl pl-13">
                    {t('activitySubtitle') || 'Track recent progress, updates, and events across all your workspaces.'}
                </p>
            </div>

            {/* Content */}
            <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-xl overflow-hidden min-h-[500px] p-6 sm:p-10">
                {loading ? (
                    <div className="flex flex-col space-y-8 animate-pulse">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex gap-4 items-start">
                                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
                                <div className="space-y-3 flex-1">
                                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
                                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : sortedTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400 dark:text-slate-500">
                        <Clock size={48} strokeWidth={1} className="mb-4 opacity-50" />
                        <p>{t('noActivityYet')}</p>
                    </div>
                ) : (
                    <div className="relative border-l-2 border-slate-200/80 dark:border-slate-800 ml-6 space-y-10 pb-6">
                        {sortedTasks.map((task) => {
                            const isDone = task.status === 'DONE';
                            const isNew = task.status === 'TODO';

                            return (
                                <div key={task.id} className="relative pl-8 group">
                                    {/* Timeline node */}
                                    <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full ring-4 ring-white dark:ring-slate-900 shadow-sm transition-transform duration-300 group-hover:scale-125
                                        ${isDone ? 'bg-emerald-500' : isNew ? 'bg-slate-300 dark:bg-slate-600' : 'bg-blue-500'}
                                    `} />

                                    <div className="flex flex-col gap-2 bg-slate-50/50 dark:bg-slate-800/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex flex-col gap-1.5">
                                                <h4 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                                                    {task.title}
                                                </h4>
                                                {task.description && (
                                                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                                                        {task.description}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className={`px-2 py-1 rounded-md text-[10px] sm:text-xs font-bold tracking-wider uppercase shadow-sm
                                                    ${isDone ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50'
                                                        : task.status === 'IN_PROGRESS' ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50'
                                                            : task.status === 'REVIEW' ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/50'
                                                                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300/50 dark:border-slate-700'}
                                                `}>
                                                    {task.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mt-2 pt-3 border-t border-slate-200/50 dark:border-slate-800/50">
                                            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                                                <Clock size={14} />
                                                {new Date(task.updated_at).toLocaleString(
                                                    // Fallback to en/ko depending on lang
                                                    undefined,
                                                    { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
                                                )}
                                            </span>

                                            <Link
                                                href={`/project/${task.project_id}`}
                                                className="text-xs font-medium text-indigo-500 dark:text-indigo-400 flex items-center gap-1.5 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
                                            >
                                                <FolderKanban size={14} />
                                                {/* In a real app we might fetch the project name too, but for now we link to it */}
                                                {t('viewProject') || 'View Project'}
                                                <ArrowRight size={14} className="opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                                            </Link>
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
