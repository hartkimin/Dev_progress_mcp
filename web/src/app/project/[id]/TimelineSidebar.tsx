'use client';

import React from 'react';
import { Task } from '@/lib/db';
import { Clock } from 'lucide-react';

export default function TimelineSidebar({ tasks }: { tasks: Task[] }) {
    // Sort tasks by updated_at descending
    const sortedTasks = [...tasks].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    return (
        <div className="w-full xl:w-80 shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <h3 className="text-lg font-extrabold text-slate-800 dark:text-white flex items-center gap-2 mb-6">
                <Clock className="w-5 h-5 text-indigo-500" />
                Recent Activity
            </h3>

            <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-3 space-y-6 pb-2">
                {sortedTasks.map((task, idx) => {
                    const isDone = task.status === 'DONE';
                    const isNew = task.status === 'TODO';

                    return (
                        <div key={task.id} className="relative pl-6">
                            {/* Timeline node */}
                            <div className={`absolute -left-[7px] top-1.5 w-3 h-3 rounded-full ring-4 ring-white dark:ring-slate-900 shadow-sm
                                ${isDone ? 'bg-emerald-500' : isNew ? 'bg-slate-300 dark:bg-slate-600' : 'bg-blue-500'}
                            `} />

                            <div className="flex flex-col gap-1.5">
                                <div className="text-xs font-mono text-slate-500 dark:text-slate-500">
                                    #{task.id.slice(0, 6)}
                                </div>
                                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                                    {task.title}
                                </h4>
                                <div className="flex items-center flex-wrap gap-2 text-[11px] font-medium mt-1">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase
                                        ${isDone ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                            : task.status === 'IN_PROGRESS' ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400'
                                                : task.status === 'REVIEW' ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}
                                    `}>
                                        {task.status.replace('_', ' ')}
                                    </span>
                                    <span className="text-slate-400 flex items-center gap-1">
                                        {new Date(task.updated_at).toLocaleString('ko-KR', {
                                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Seoul'
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {sortedTasks.length === 0 && (
                    <div className="pl-6 text-sm text-slate-500">No activity yet.</div>
                )}
            </div>
        </div>
    );
}
