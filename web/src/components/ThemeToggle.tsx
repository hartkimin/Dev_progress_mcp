'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun, Monitor } from 'lucide-react';

export function ThemeToggle({ isCollapsed }: { isCollapsed?: boolean }) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className={`flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 text-slate-500 bg-transparent ${isCollapsed ? 'justify-center' : ''} h-[46px] animate-pulse`}>
                <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                {!isCollapsed && <div className="w-20 h-4 rounded bg-slate-200 dark:bg-slate-700"></div>}
            </div>
        );
    }

    const cycleTheme = () => {
        if (theme === 'system') setTheme('light');
        else if (theme === 'light') setTheme('dark');
        else setTheme('system');
    };

    const getIcon = () => {
        if (theme === 'light') return <Sun size={20} strokeWidth={2} />;
        if (theme === 'dark') return <Moon size={20} strokeWidth={2} />;
        return <Monitor size={20} strokeWidth={2} />;
    };

    const getLabel = () => {
        if (theme === 'light') return 'Light Mode';
        if (theme === 'dark') return 'Dark Mode';
        return 'System Theme';
    };

    return (
        <button
            onClick={cycleTheme}
            title={isCollapsed ? getLabel() : undefined}
            className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 group relative hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-indigo-500 dark:hover:text-indigo-400 text-slate-500 dark:text-slate-400 ${isCollapsed ? 'justify-center' : ''}`}
        >
            <span className="transition-transform duration-200 group-hover:scale-110">
                {getIcon()}
            </span>
            {!isCollapsed && <span className="font-medium whitespace-nowrap">{getLabel()}</span>}
        </button>
    );
}
