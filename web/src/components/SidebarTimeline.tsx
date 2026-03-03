'use client';

import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { getProjectTasks } from '@/app/actions';
import type { Task } from '@/lib/db';

export default function SidebarTimeline({ projectId, isCollapsed }: { projectId: string, isCollapsed: boolean }) {
    const [tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const data = await getProjectTasks(projectId);
                setTasks(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchTasks();
        const interval = setInterval(fetchTasks, 3000);
        return () => clearInterval(interval);
    }, [projectId]);

    if (isCollapsed) return null;

    const sortedTasks = [...tasks].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    return (
        <div className="w-full">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-300 flex items-center gap-2 mb-4 px-2">
                <Clock className="w-4 h-4 text-indigo-500" />
                Recent Activity
            </h3>

            <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 space-y-5 pb-2">
                {sortedTasks.map((task) => {
                    const isDone = task.status === 'DONE';
                    const isNew = task.status === 'TODO';

                    return (
                        <div key={task.id} className="relative pl-5">
                            {/* Timeline node */}
                            <div className={`absolute -left-[7px] top-1 w-3 h-3 rounded-full ring-4 ring-slate-50 dark:ring-slate-900 shadow-sm
                                ${isDone ? 'bg-emerald-500' : isNew ? 'bg-slate-300 dark:bg-slate-600' : 'bg-blue-500'}
                            `} />

                            <div className="flex flex-col gap-1">
                                <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                                    {task.title}
                                </h4>
                                <div className="flex items-center flex-wrap gap-1.5 mt-0.5">
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase
                                        ${isDone ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                            : task.status === 'IN_PROGRESS' ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400'
                                                : task.status === 'REVIEW' ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400'
                                                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}
                                    `}>
                                        {task.status.replace('_', ' ')}
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                        {new Date(task.updated_at).toLocaleString('ko-KR', {
                                            month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Seoul'
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {sortedTasks.length === 0 && (
                    <div className="pl-5 text-xs text-slate-500">No activity yet.</div>
                )}
            </div>
        </div>
    );
}
