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
    BarChart3,
    Activity,
    Globe
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export default function Sidebar() {
    const pathname = usePathname();
    const { t, toggleLanguage, language } = useTranslation();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const workspaceItems = [
        { name: t('dashboard'), href: '/', icon: LayoutDashboard },
        { name: t('recentActivity'), href: '/activity', icon: Activity },
    ];

    const settingsItems = [
        { name: t('integrations'), href: '/admin/integrations', icon: Blocks },
        { name: t('users'), href: '/admin/users', icon: Users },
        { name: t('apiKeys'), href: '/admin/api-keys', icon: Key },
        { name: t('analytics'), href: '/admin/analytics', icon: BarChart3 },
    ];

    const projectIdMatch = pathname.match(/^\/project\/([^\/]+)/);
    const projectId = projectIdMatch ? projectIdMatch[1] : null;

    // Helper to render groups
    const renderLinks = (items: { name: string, href: string, icon: any }[], colorConfig: { activeBg: string, hoverBg: string }) => {
        return items.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href) && !item.href.includes('admin') && item.href !== '/activity');
            const Icon = item.icon;
            return (
                <Link
                    key={item.href}
                    href={item.href}
                    title={isCollapsed ? item.name : undefined}
                    className={`flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${isActive
                        ? colorConfig.activeBg
                        : colorConfig.hoverBg
                        } ${isCollapsed ? 'justify-center' : ''}`}
                >
                    <span className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                        <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                    </span>
                    {!isCollapsed && <span className="font-medium whitespace-nowrap">{item.name}</span>}
                </Link>
            );
        });
    };

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

            {/* Navigation */}
            <nav className={`px-3 py-6 space-y-6 overflow-y-auto custom-scrollbar flex-1`}>

                {/* Workspace Group */}
                <div className="space-y-1">
                    {!isCollapsed && <p className="px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">{t('workspace')}</p>}
                    {renderLinks(workspaceItems, {
                        activeBg: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-[inset_3px_0_0_0_#6366f1] dark:shadow-[inset_3px_0_0_0_#818cf8]',
                        hoverBg: 'hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-indigo-500 dark:hover:text-white'
                    })}
                </div>



                {/* Settings & Admin Group */}
                <div className="space-y-1">
                    {!isCollapsed && <p className="px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">{t('settings')}</p>}
                    {renderLinks(settingsItems, {
                        activeBg: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-[inset_3px_0_0_0_#f59e0b] dark:shadow-[inset_3px_0_0_0_#fbbf24]',
                        hoverBg: 'hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-amber-500 dark:hover:text-amber-400'
                    })}
                </div>

            </nav>

            {/* Profile Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-900 flex flex-col gap-3">
                <div className={`flex items-center space-x-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm transition-colors hover:border-indigo-300 dark:hover:border-indigo-500/50 cursor-pointer ${isCollapsed ? 'justify-center p-2' : 'px-4 py-3'}`}>
                    {isCollapsed ? (
                        <div className="flex flex-col items-center">
                            <div className="text-indigo-500 mb-1" title={t('adminDeveloper')}>
                                <UserCircle2 size={28} strokeWidth={1.5} />
                            </div>
                            <span className="text-[9px] font-mono text-slate-400 font-bold">v0.1</span>
                        </div>
                    ) : (
                        <>
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0">
                                AD
                            </div>
                            <div className="flex-1 overflow-hidden min-w-0 flex flex-col">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{t('adminDeveloper')}</p>
                                    <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">v0.1</span>
                                </div>
                                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 truncate">{t('proTierActive')}</p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </aside>
    );
}
