'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun, Monitor, Users } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import LiveSyncIndicator from '@/app/components/LiveSyncIndicator';
import UserProfileMenu from '@/components/UserProfileMenu';
import NotificationBell from '@/components/NotificationBell';

const languages = [
    { code: 'ko' as const, flag: '🇰🇷', abbr: 'KR', label: '한국어' },
    { code: 'en' as const, flag: '🇺🇸', abbr: 'EN', label: 'English' },
];

export default function TopNav() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);
    const { t, toggleLanguage, language } = useTranslation();
    const [langOpen, setLangOpen] = React.useState(false);
    const langRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        setMounted(true);
    }, []);

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

                {/* Language Toggle Button */}
                <button
                    onClick={toggleLanguage}
                    title={language === 'ko' ? t('languageToggle') || 'Switch to English' : t('languageToggle') || '한국어로 전환'}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-full transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300 text-sm font-medium"
                >
                    <span className="text-base leading-none">{currentLang.flag}</span>
                    <span className="text-xs font-bold tracking-wider">{currentLang.abbr}</span>
                </button>

                <NotificationBell />

                <div className="w-px h-5 bg-slate-200 dark:bg-slate-700/80 mx-1"></div>

                <LiveSyncIndicator />
                <UserProfileMenu />
            </div>
        </div>
    );
}
