'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '@/lib/i18n';
import { Bell, CheckSquare, MessageSquare, UserPlus, Info, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { io } from 'socket.io-client';
import { useSession } from 'next-auth/react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  created_at: string;
}

export default function NotificationBell() {
    const { t } = useTranslation();
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = async () => {
        if (!session) return;
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3333/api/v1'}/notifications`, {
                headers: {
                    'Authorization': `Bearer ${(session as any).accessToken}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session) {
            fetchNotifications();

            const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3333';
            const socket = io(SOCKET_URL, { transports: ['websocket'] });

            socket.on('connect', () => {
                if ((session as any).dbUser?.id) {
                    socket.emit('joinUserNotifications', { userId: (session as any).dbUser.id });
                }
            });

            socket.on('notification', (newNotif: Notification) => {
                setNotifications(prev => [newNotif, ...prev]);
                // Play sound or show toast
            });

            return () => { socket.disconnect(); };
        }
    }, [session]);

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

    const markAsRead = async (id: string) => {
        if (!session) return;
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3333/api/v1'}/notifications/${id}/read`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${(session as any).accessToken}` }
            });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (e) {
            console.error(e);
        }
    };

    const markAllAsRead = async () => {
        if (!session) return;
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3333/api/v1'}/notifications/read-all`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${(session as any).accessToken}` }
            });
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (e) {
            console.error(e);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'TASK_ASSIGNED': return <UserPlus size={16} className="text-blue-500" />;
            case 'COMMENT_ADDED': return <MessageSquare size={16} className="text-indigo-500" />;
            default: return <Info size={16} className="text-slate-500" />;
        }
    };

    const timeAgo = (dateStr: string) => {
        const now = new Date();
        const date = new Date(dateStr);
        const diffMs = now.getTime() - date.getTime();
        const diffMin = Math.floor(diffMs / 60000);
        if (diffMin < 1) return 'Just now';
        if (diffMin < 60) return `${diffMin}m ago`;
        const diffHour = Math.floor(diffMin / 60);
        if (diffHour < 24) return `${diffHour}h ago`;
        return `${Math.floor(diffHour / 24)}d ago`;
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="relative z-50 flex items-center" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative flex justify-center items-center p-2 rounded-full transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300"
            >
                <Bell size={18} strokeWidth={2} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white border-2 border-white dark:border-slate-900">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl rounded-xl overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Notifications</span>
                        {unreadCount > 0 && (
                            <button onClick={markAllAsRead} className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {loading && notifications.length === 0 ? (
                            <div className="p-8 text-center text-sm text-slate-400 animate-pulse">Loading...</div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center text-sm text-slate-400 italic">No notifications yet</div>
                        ) : (
                            notifications.map((n) => (
                                <div
                                    key={n.id}
                                    className={`p-4 border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${!n.read ? 'bg-indigo-50/30 dark:bg-indigo-500/5' : ''}`}
                                    onClick={() => !n.read && markAsRead(n.id)}
                                >
                                    <div className="flex gap-3">
                                        <div className="mt-1 p-2 rounded-full bg-white dark:bg-slate-700 shadow-sm shrink-0 h-fit">
                                            {getIcon(n.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">{n.title}</p>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-2">{n.message}</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] text-slate-400 font-medium">{timeAgo(n.created_at)}</span>
                                                {n.link && (
                                                    <Link 
                                                        href={n.link} 
                                                        className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5 hover:underline"
                                                        onClick={() => setIsOpen(false)}
                                                    >
                                                        View <ExternalLink size={10} />
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
