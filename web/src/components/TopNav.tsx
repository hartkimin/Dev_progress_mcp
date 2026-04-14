'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun, Monitor, Users } from 'lucide-react';
import { useTranslation, type Language } from '@/lib/i18n';
import LiveSyncIndicator from '@/app/components/LiveSyncIndicator';
import UserProfileMenu from '@/components/UserProfileMenu';
import NotificationBell from '@/components/NotificationBell';

const languages: { code: Language; flag: string; abbr: string; label: string }[] = [
    { code: 'ko', flag: '🇰🇷', abbr: 'KR', label: '한국어' },
    { code: 'en', flag: '🇺🇸', abbr: 'EN', label: 'English' },
    { code: 'zh', flag: '🇨🇳', abbr: 'ZH', label: '中文' },
    { code: 'ja', flag: '🇯🇵', abbr: 'JA', label: '日本語' },
];

export default function TopNav() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);
    const { t, setLanguage, language } = useTranslation();
    const [langOpen, setLangOpen] = React.useState(false);
    const langRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    React.useEffect(() => {
        if (!langOpen) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (langRef.current && !langRef.current.contains(e.target as Node)) {
                setLangOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [langOpen]);

    const cycleTheme = () => {
        if (theme === 'system') setTheme('light');
        else if (theme === 'light') setTheme('dark');
        else setTheme('system');
    };

    const getThemeIcon = () => {
        if (theme === 'light') return <Sun size={20} strokeWidth={2} />;
        if (theme === 'dark') return <Moon size={20} strokeWidth={2} />;
        return <Monitor size={20} strokeWidth={2} />;
    };

    const currentLang = languages.find(l => l.code === language) || languages[0];

    return (
        <div className="absolute top-6 right-8 z-[100]">
            <div className="relative flex items-center gap-2 px-3 py-2">
                {/* Background layer detached from parent to prevent backdrop-blur rendering bugs on absolute dropdowns */}
                <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-full border border-slate-200/50 dark:border-slate-800/50 shadow-sm pointer-events-none -z-10"></div>



                <button
                    onClick={cycleTheme}
                    title={t('changeTheme')}
                    className="flex justify-center items-center p-2 rounded-full transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-indigo-500 dark:hover:text-indigo-400 text-slate-600 dark:text-slate-300"
                >
                    {mounted ? (
                        getThemeIcon()
                    ) : (
                        <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
                    )}
                </button>

                <div className="w-px h-5 bg-slate-200 dark:bg-slate-700/80 mx-1"></div>

                {/* Language Picker */}
                <div ref={langRef} className="relative">
                    <button
                        onClick={() => setLangOpen(o => !o)}
                        title={t('languageToggle')}
                        aria-haspopup="listbox"
                        aria-expanded={langOpen}
                        className="flex items-center gap-1.5 px-2 py-1.5 rounded-full transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300 text-sm font-medium"
                    >
                        <span className="text-base leading-none">{currentLang.flag}</span>
                        <span className="text-xs font-bold tracking-wider">{currentLang.abbr}</span>
                    </button>
                    {langOpen && (
                        <div
                            role="listbox"
                            className="absolute right-0 top-full mt-2 w-40 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg overflow-hidden z-50"
                        >
                            <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
                                {t('chooseLanguage')}
                            </div>
                            {languages.map(l => (
                                <button
                                    key={l.code}
                                    role="option"
                                    aria-selected={l.code === language}
                                    onClick={() => { setLanguage(l.code); setLangOpen(false); }}
                                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${l.code === language ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'}`}
                                >
                                    <span className="text-base leading-none">{l.flag}</span>
                                    <span className="flex-1">{l.label}</span>
                                    {l.code === language && <span className="text-xs">✓</span>}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <NotificationBell />

                <div className="w-px h-5 bg-slate-200 dark:bg-slate-700/80 mx-1"></div>

                <LiveSyncIndicator />
                <UserProfileMenu />
            </div>
        </div>
    );
}
