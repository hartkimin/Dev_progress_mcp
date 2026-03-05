'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '@/lib/i18n';
import { Bell, CheckSquare, Plus, Edit3, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getRecentGlobalTasksAction } from '@/app/actions';
import type { Task } from '@/lib/db';

export default function NotificationBell() {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [notifications, setNotifications] = useState<Task[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const tasks = await getRecentGlobalTasksAction(10);
            setNotifications(tasks);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const markAllAsRead = () => {
        setNotifications([]);
    };

    const handleOpen = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            fetchNotifications();
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'TODO': return <Plus size={12} className="text-slate-500" />;
            case 'IN_PROGRESS': return <Edit3 size={12} className="text-blue-500" />;
            case 'REVIEW': return <ArrowRight size={12} className="text-amber-500" />;
            case 'DONE': return <CheckSquare size={12} className="text-emerald-500" />;
            default: return <Edit3 size={12} className="text-slate-500" />;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'TODO': return t('notifNewTask');
            case 'IN_PROGRESS': return t('notifStarted');
            case 'REVIEW': return t('notifReview');
            case 'DONE': return t('notifDone');
            default: return t('notifUpdate');
        }
    };

    const timeAgo = (dateStr: string) => {
        const now = new Date();
        const date = new Date(dateStr);
        const diffMs = now.getTime() - date.getTime();
        const diffMin = Math.floor(diffMs / 60000);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);

        if (diffMin < 1) return t('timeJustNow');
        if (diffMin < 60) return `${diffMin}${t('timeMinAgo')}`;
        if (diffHour < 24) return `${diffHour}${t('timeHourAgo')}`;
        return `${diffDay}${t('timeDayAgo')}`;
    };

    return (
        <div className="relative z-50 flex items-center" ref={dropdownRef}>
            <button
                onClick={handleOpen}
                title={t('notifications')}
                className="relative flex justify-center items-center p-2 rounded-full transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-indigo-500 dark:hover:text-indigo-400 text-slate-600 dark:text-slate-300"
            >
                <Bell size={18} strokeWidth={2} />
                {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 shadow-xl rounded-xl overflow-hidden origin-top-right animate-in fade-in zoom-in duration-200">
                    <div className="p-3 border-b border-slate-100 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{t('notifications')}</span>
                        {notifications.length > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-1 cursor-pointer"
                            >
                                <CheckSquare size={12} />
                                {t('markAllAsRead')}
                            </button>
                        )}
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {loading && notifications.length === 0 ? (
                            <div className="p-6 text-center text-sm text-slate-400">
                                <div className="w-4 h-4 border-2 border-slate-300 border-t-indigo-500 rounded-full animate-spin mx-auto mb-2"></div>
                                {t('loading')}
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-6 text-center text-sm text-slate-400">
                                {t('noNotifications')}
                            </div>
                        ) : (
                            notifications.map((task) => (
                                <Link
                                    key={task.id}
                                    href={`/project/${task.project_id}`}
                                    onClick={() => setIsOpen(false)}
                                    className="block p-3 border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700/50 shrink-0">
                                            {getStatusIcon(task.status)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="text-[10px] font-bold text-indigo-500 uppercase">{getStatusLabel(task.status)}</span>
                                                {task.task_type && (
                                                    <span className="text-[9px] font-medium text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded">{task.task_type}</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-800 dark:text-slate-200 font-medium truncate">{task.title}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                {task.category && (
                                                    <span className="text-[10px] text-indigo-500 font-semibold">{task.category}</span>
                                                )}
                                                <span className="text-[10px] text-slate-400">{timeAgo(task.updated_at)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
