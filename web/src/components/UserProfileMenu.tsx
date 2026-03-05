'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '@/lib/i18n';
import { Settings, CreditCard, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function UserProfileMenu() {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

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

    return (
        <div className="relative z-50 flex items-center ml-1" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xs shadow-sm hover:shadow-md transition-all hover:scale-105"
                title={t('adminDeveloper')}
            >
                AD
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-60 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 shadow-xl rounded-xl overflow-hidden origin-top-right animate-in fade-in zoom-in duration-200">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
                                AD
                            </div>
                            <div className="flex-1 overflow-hidden min-w-0">
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{t('adminDeveloper')}</p>
                                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-0.5">{t('proTierActive')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-2 space-y-1">
                        <Link href="/admin/settings" onClick={() => setIsOpen(false)} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg transition-colors cursor-pointer text-left">
                            <Settings size={16} />
                            <span>{t('profileSettings') || 'Profile Settings'}</span>
                        </Link>
                        <Link href="/admin/billing" onClick={() => setIsOpen(false)} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg transition-colors cursor-pointer text-left">
                            <CreditCard size={16} />
                            <span>{t('billing') || 'Billing & Plan'}</span>
                            <span className="ml-auto text-[10px] uppercase font-bold tracking-wider text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.5 rounded">Pro</span>
                        </Link>
                    </div>

                    <div className="p-2 border-t border-slate-100 dark:border-slate-700/80">
                        <button
                            onClick={() => {
                                alert(t('signedOutMsg') || 'You have been signed out successfully.');
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer text-left"
                        >
                            <LogOut size={16} />
                            <span>{t('signOut') || 'Sign Out'}</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
