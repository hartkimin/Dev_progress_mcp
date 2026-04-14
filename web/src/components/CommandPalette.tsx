'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Folder, Settings, Users, KeyRound, BarChart3, Plug, LayoutDashboard } from 'lucide-react';

type CommandItem = {
    id: string;
    label: string;
    hint?: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    keywords: string;
    action: () => void;
};

type SidebarProject = { id: string; name: string };

export default function CommandPalette({ projects = [] }: { projects?: SidebarProject[] }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [activeIdx, setActiveIdx] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    // Global Cmd/Ctrl+K listener
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            const isMod = e.metaKey || e.ctrlKey;
            if (isMod && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setOpen(v => !v);
            } else if (e.key === 'Escape' && open) {
                setOpen(false);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open]);

    useEffect(() => {
        if (open) {
            setQuery('');
            setActiveIdx(0);
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    }, [open]);

    const navigate = (href: string) => {
        setOpen(false);
        router.push(href);
    };

    const baseCommands: CommandItem[] = useMemo(() => [
        { id: 'nav-dashboard', label: '대시보드로 이동', hint: '/', icon: LayoutDashboard, keywords: 'dashboard home 대시보드 홈', action: () => navigate('/') },
        { id: 'nav-integrations', label: 'MCP 연동 설정', hint: '/admin/integrations', icon: Plug, keywords: 'integrations mcp 연동 settings', action: () => navigate('/admin/integrations') },
        { id: 'nav-users', label: '사용자 관리', hint: '/admin/users', icon: Users, keywords: 'users admin 사용자', action: () => navigate('/admin/users') },
        { id: 'nav-api-keys', label: 'API 키 관리', hint: '/admin/api-keys', icon: KeyRound, keywords: 'api keys tokens 키', action: () => navigate('/admin/api-keys') },
        { id: 'nav-analytics', label: '시스템 통계', hint: '/admin/analytics', icon: BarChart3, keywords: 'analytics stats 통계', action: () => navigate('/admin/analytics') },
        { id: 'nav-settings', label: '설정', hint: '/admin/settings', icon: Settings, keywords: 'settings 설정 preferences', action: () => navigate('/admin/settings') },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ], []);

    const projectCommands: CommandItem[] = useMemo(
        () => projects.map(p => ({
            id: `proj-${p.id}`,
            label: p.name,
            hint: `프로젝트 /project/${p.id}`,
            icon: Folder,
            keywords: `project 프로젝트 ${p.name.toLowerCase()}`,
            action: () => navigate(`/project/${p.id}`),
        })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
        [projects]
    );

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        const items = [...projectCommands, ...baseCommands];
        if (!q) return items;
        return items.filter(i =>
            i.label.toLowerCase().includes(q) || i.keywords.includes(q)
        );
    }, [query, baseCommands, projectCommands]);

    useEffect(() => { setActiveIdx(0); }, [query]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setActiveIdx(i => Math.min(i + 1, filtered.length - 1));
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setActiveIdx(i => Math.max(i - 1, 0));
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    filtered[activeIdx]?.action();
                }
            }}
        >
            <div
                className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                    <Search size={18} className="text-slate-400" />
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="프로젝트, 설정, 페이지 검색... (Esc 닫기)"
                        className="flex-1 bg-transparent outline-none text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                    />
                    <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">Esc</kbd>
                </div>
                <ul className="max-h-80 overflow-y-auto custom-scrollbar py-2">
                    {filtered.length === 0 ? (
                        <li className="px-4 py-6 text-center text-sm text-slate-400 italic">결과 없음</li>
                    ) : filtered.map((item, idx) => {
                        const Icon = item.icon;
                        const active = idx === activeIdx;
                        return (
                            <li key={item.id}>
                                <button
                                    onMouseEnter={() => setActiveIdx(idx)}
                                    onClick={item.action}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${active ? 'bg-indigo-50 dark:bg-indigo-500/10' : ''}`}
                                >
                                    <Icon size={16} className={active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'} />
                                    <span className={`flex-1 text-sm ${active ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-700 dark:text-slate-300'}`}>{item.label}</span>
                                    {item.hint && <span className="text-xs text-slate-400">{item.hint}</span>}
                                </button>
                            </li>
                        );
                    })}
                </ul>
                <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center gap-4">
                    <span><kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">↑↓</kbd> 이동</span>
                    <span><kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">↵</kbd> 선택</span>
                    <span className="ml-auto"><kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">⌘K</kbd> 토글</span>
                </div>
            </div>
        </div>
    );
}
