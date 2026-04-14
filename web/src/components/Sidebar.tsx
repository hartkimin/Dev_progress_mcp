'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
    LayoutDashboard,
    PanelLeftClose,
    PanelLeftOpen,
    Settings,
    ChevronDown,
    ChevronRight,
    FolderKanban,
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

type SidebarProject = { id: string; name: string };

export default function Sidebar({ projects = [] }: { projects?: SidebarProject[] }) {
    const pathname = usePathname();
    const { t } = useTranslation();
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Auto-expand the projects list when the user is already on a project page.
    const onProjectPage = pathname.startsWith('/project/');
    const [projectsExpanded, setProjectsExpanded] = useState(onProjectPage);

    const isDashboardActive = pathname === '/' || onProjectPage;
    const isSettingsActive = pathname.startsWith('/admin/');

    const activeProjectId = onProjectPage
        ? pathname.match(/^\/project\/([^\/]+)/)?.[1] ?? null
        : null;

    return (
        <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 flex flex-col hidden md:flex h-full shadow-sm z-20 transition-all duration-300`}>
            {/* Header */}
            <div className="h-20 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
                {!isCollapsed && (
                    <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-cyan-500 bg-clip-text text-transparent transform hover:scale-105 transition-transform cursor-default whitespace-nowrap overflow-hidden px-2">
                        VibePlanner <span className="text-sm font-medium text-indigo-400">Pro</span>
                    </h1>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors mx-auto"
                    title={isCollapsed ? t('expandSidebar') : t('collapseSidebar')}
                >
                    {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
                </button>
            </div>

            <nav className="px-3 py-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                {/* Workspace Group — Dashboard with expandable project sub-list */}
                <div className="space-y-1">
                    {!isCollapsed && (
                        <p className="px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                            {t('workspace')}
                        </p>
                    )}

                    <div className="flex items-center">
                        <Link
                            href="/"
                            title={isCollapsed ? t('dashboard') : undefined}
                            className={`flex-1 flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                                isDashboardActive
                                    ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-[inset_3px_0_0_0_#6366f1] dark:shadow-[inset_3px_0_0_0_#818cf8]'
                                    : 'hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-indigo-500 dark:hover:text-white'
                            } ${isCollapsed ? 'justify-center' : ''}`}
                        >
                            <span className={`transition-transform duration-200 ${isDashboardActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                                <LayoutDashboard size={22} strokeWidth={isDashboardActive ? 2.5 : 2} />
                            </span>
                            {!isCollapsed && <span className="font-medium whitespace-nowrap">{t('dashboard')}</span>}
                        </Link>
                        {!isCollapsed && projects.length > 0 && (
                            <button
                                onClick={() => setProjectsExpanded(e => !e)}
                                className="ml-1 p-1.5 rounded-md text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                aria-label={projectsExpanded ? 'Collapse projects' : 'Expand projects'}
                            >
                                {projectsExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </button>
                        )}
                    </div>

                    {!isCollapsed && projectsExpanded && projects.length > 0 && (
                        <ul className="ml-4 mt-1 space-y-0.5 border-l border-slate-200 dark:border-slate-800 pl-2">
                            {projects.map(p => {
                                const active = p.id === activeProjectId;
                                return (
                                    <li key={p.id}>
                                        <Link
                                            href={`/project/${p.id}`}
                                            title={p.name}
                                            className={`flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors ${
                                                active
                                                    ? 'bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-medium'
                                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-indigo-500 dark:hover:text-indigo-400'
                                            }`}
                                        >
                                            <FolderKanban size={14} strokeWidth={active ? 2.5 : 2} className="shrink-0" />
                                            <span className="truncate">{p.name}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                {/* Settings — single consolidated entry */}
                <div className="space-y-1">
                    {!isCollapsed && (
                        <p className="px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                            {t('settings')}
                        </p>
                    )}
                    <Link
                        href="/admin/integrations"
                        title={isCollapsed ? t('settings') : undefined}
                        className={`flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                            isSettingsActive
                                ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-[inset_3px_0_0_0_#f59e0b] dark:shadow-[inset_3px_0_0_0_#fbbf24]'
                                : 'hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-amber-500 dark:hover:text-amber-400'
                        } ${isCollapsed ? 'justify-center' : ''}`}
                    >
                        <span className={`transition-transform duration-200 ${isSettingsActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                            <Settings size={22} strokeWidth={isSettingsActive ? 2.5 : 2} />
                        </span>
                        {!isCollapsed && <span className="font-medium whitespace-nowrap">{t('settings')}</span>}
                    </Link>
                </div>
            </nav>
        </aside>
    );
}
