'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
    LayoutDashboard,
    Key,
    Blocks,
    Users,
    PanelLeftClose,
    PanelLeftOpen,
    UserCircle2,
    BarChart3
} from 'lucide-react';
import SidebarTimeline from './SidebarTimeline';

export default function Sidebar() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const userItems = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    ];

    const adminItems = [
        { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
        { name: 'API Keys', href: '/admin/api-keys', icon: Key },
        { name: 'Integrations', href: '/admin/integrations', icon: Blocks },
        { name: 'Users', href: '/admin/users', icon: Users },
    ];

    const projectIdMatch = pathname.match(/^\/project\/([^\/]+)/);
    const projectId = projectIdMatch ? projectIdMatch[1] : null;

    return (
        <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 flex flex-col hidden md:flex h-full shadow-sm z-20 transition-all duration-300`}>
            {/* Header */}
            <div className="h-20 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
                {!isCollapsed && (
                    <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-cyan-500 bg-clip-text text-transparent transform hover:scale-105 transition-transform cursor-default whitespace-nowrap overflow-hidden px-2">
                        DevProgress <span className="text-sm font-medium text-indigo-400">Pro</span>
                    </h1>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors mx-auto"
                    title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
                </button>
            </div>

            {/* Navigation */}
            <nav className={`px-3 py-6 space-y-2 overflow-y-auto custom-scrollbar ${projectId ? 'shrink-0 max-h-[50%]' : 'flex-1'}`}>
                {userItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href) && !item.href.includes('admin'));
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={isCollapsed ? item.name : undefined}
                            className={`flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${isActive
                                ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-[inset_3px_0_0_0_#6366f1] dark:shadow-[inset_3px_0_0_0_#818cf8]'
                                : 'hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-indigo-500 dark:hover:text-white'
                                } ${isCollapsed ? 'justify-center' : ''}`}
                        >
                            <span className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                            </span>
                            {!isCollapsed && <span className="font-medium whitespace-nowrap">{item.name}</span>}
                        </Link>
                    );
                })}

                {adminItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={isCollapsed ? item.name : undefined}
                            className={`flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${isActive
                                ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-[inset_3px_0_0_0_#f59e0b] dark:shadow-[inset_3px_0_0_0_#fbbf24]'
                                : 'hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-amber-500 dark:hover:text-amber-400'
                                } ${isCollapsed ? 'justify-center' : ''}`}
                        >
                            <span className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                            </span>
                            {!isCollapsed && <span className="font-medium whitespace-nowrap">{item.name}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Timeline for Projects */}
            {projectId && (
                <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-4 border-t border-slate-200 dark:border-slate-800 shrink-0 min-h-[50%]">
                    <SidebarTimeline projectId={projectId} isCollapsed={isCollapsed} />
                </div>
            )}

            {/* Profile Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-900">
                <div className={`flex items-center space-x-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm transition-colors hover:border-indigo-300 dark:hover:border-indigo-500/50 cursor-pointer ${isCollapsed ? 'justify-center p-2' : 'px-4 py-3'}`}>
                    {isCollapsed ? (
                        <div className="text-indigo-500" title="Admin Developer">
                            <UserCircle2 size={32} strokeWidth={1.5} />
                        </div>
                    ) : (
                        <>
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0">
                                AD
                            </div>
                            <div className="flex-1 overflow-hidden min-w-0">
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">Admin Developer</p>
                                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 truncate">Pro Tier Active</p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </aside>
    );
}
