'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun, Monitor, Globe } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export default function TopNav() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);
    const { t, toggleLanguage, language } = useTranslation();

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

    const getThemeLabel = () => {
        if (theme === 'light') return t('lightMode') || 'Light Mode';
        if (theme === 'dark') return t('darkMode') || 'Dark Mode';
        return t('systemTheme') || 'System Theme';
    };

    return (
        <div className="absolute top-6 right-8 flex items-center z-50">
            <div className="flex items-center gap-2 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-full border border-slate-200/50 dark:border-slate-800/50 px-3 py-2 shadow-sm">

                {/* Theme Toggle */}
                <button
                    onClick={cycleTheme}
                    title={t('changeTheme')}
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-full transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-indigo-500 dark:hover:text-indigo-400 text-slate-600 dark:text-slate-300 font-medium text-sm"
                >
                    {mounted ? (
                        <>
                            <span>{getThemeIcon()}</span>
                            <span>{getThemeLabel()}</span>
                        </>
                    ) : (
                        <div className="flex items-center space-x-2 animate-pulse">
                            <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                            <div className="w-20 h-4 rounded bg-slate-200 dark:bg-slate-700"></div>
                        </div>
                    )}
                </button>

                <div className="w-px h-5 bg-slate-200 dark:bg-slate-700/80 mx-1"></div>

                {/* Language Toggle */}
                <button
                    onClick={toggleLanguage}
                    title={t('languageToggle')}
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-full transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-indigo-500 dark:hover:text-indigo-400 text-slate-600 dark:text-slate-300 font-medium text-sm"
                >
                    <Globe size={18} strokeWidth={2} />
                    <span>{language === 'ko' ? 'EN' : '한글'}</span>
                </button>
            </div>
        </div>
    );
}
