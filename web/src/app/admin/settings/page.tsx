'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import { User, Mail, Shield, KeyRound, Bell, CheckSquare, Smartphone, Laptop, AlertTriangle } from 'lucide-react';

type TabType = 'general' | 'security' | 'notifications';

function SettingsContent() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<TabType>('general');
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab === 'security' || tab === 'notifications' || tab === 'general') {
            setActiveTab(tab as TabType);
        }
    }, [searchParams]);

    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
        // Optional: update URL without hard reload
        // router.push(`?tab=${tab}`, { scroll: false }); 
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Navigation / Tabs */}
            <div className="md:col-span-1 space-y-2">
                <button
                    onClick={() => handleTabChange('general')}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer text-left ${activeTab === 'general' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 shadow-sm border border-indigo-100 dark:border-indigo-500/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'}`}
                >
                    <User size={18} />
                    {t('generalSettings') || 'General'}
                </button>
                <button
                    onClick={() => handleTabChange('security')}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer text-left ${activeTab === 'security' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 shadow-sm border border-indigo-100 dark:border-indigo-500/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'}`}
                >
                    <Shield size={18} />
                    {t('security') || 'Security'}
                </button>
                <button
                    onClick={() => handleTabChange('notifications')}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer text-left ${activeTab === 'notifications' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 shadow-sm border border-indigo-100 dark:border-indigo-500/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'}`}
                >
                    <Bell size={18} />
                    {t('notifications') || 'Notifications'}
                </button>
            </div>

            {/* Main Content Area */}
            <div className="md:col-span-3 space-y-6">
                {activeTab === 'general' && (
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <User className="text-indigo-500" size={20} />
                            {t('profileInfo') || 'Profile Information'}
                        </h2>

                        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-100 dark:border-slate-700/80">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold text-2xl shadow-md shrink-0 ring-4 ring-indigo-50 dark:ring-indigo-900/30">
                                AD
                            </div>
                            <div>
                                <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-slate-700 dark:text-slate-200 text-sm font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                    Change Avatar
                                </button>
                                <p className="text-xs text-slate-500 mt-2">JPG, GIF or PNG. 1MB max.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('profileName')}</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <User size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        defaultValue="Admin Developer"
                                        className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors sm:text-sm shadow-inner"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('profileEmail')}</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <Mail size={16} />
                                    </div>
                                    <input
                                        type="email"
                                        defaultValue="admin@vibeplanner.local"
                                        className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors sm:text-sm shadow-inner"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700/80 flex justify-end">
                            <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                                {t('saveChanges')}
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                <Shield className="text-emerald-500" size={20} />
                                {t('securitySettings') || 'Security Settings'}
                            </h2>

                            <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-700/80 mb-6">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <KeyRound size={18} className="text-slate-700 dark:text-slate-300" />
                                        <span className="font-bold text-slate-800 dark:text-slate-100">{t('password') || 'Password'}</span>
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Set a unique password to protect your account.</p>
                                </div>
                                <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-slate-700 dark:text-slate-200 text-sm font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                    Update
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="pr-4">
                                    <div className="flex items-center gap-2">
                                        <Smartphone size={18} className="text-slate-700 dark:text-slate-300" />
                                        <span className="font-bold text-slate-800 dark:text-slate-100">{t('twoFactorAuth') || 'Two-Factor Authentication (2FA)'}</span>
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Add an extra layer of security to your account. We recommend using an authenticator app.</p>
                                </div>
                                <button className="whitespace-nowrap px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-sm font-bold rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors border border-indigo-100 dark:border-indigo-500/20">
                                    {t('enable') || 'Enable'}
                                </button>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Active Sessions</h3>
                            <div className="space-y-4">
                                <div className="flex items-start justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                    <div className="flex gap-4">
                                        <div className="mt-1 bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                                            <Laptop size={20} className="text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Windows 11 • Chrome 118</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">Current Session</span>
                                                <span className="text-xs text-slate-500 dark:text-slate-400">Seoul, South Korea</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'notifications' && (
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <Bell className="text-amber-500" size={20} />
                            {t('notificationPreferences') || 'Notification Preferences'}
                        </h2>

                        <div className="space-y-6">
                            <div className="flex items-start justify-between pb-6 border-b border-slate-100 dark:border-slate-700/80">
                                <div className="pr-4">
                                    <span className="font-bold text-slate-800 dark:text-slate-100">{t('emailAlerts') || 'Email Alerts'}</span>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Receive notifications via email for important system events, project updates, and billing invoices.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                    <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>

                            <div className="flex items-start justify-between pb-6 border-b border-slate-100 dark:border-slate-700/80">
                                <div className="pr-4">
                                    <span className="font-bold text-slate-800 dark:text-slate-100">{t('appAlerts') || 'In-App Notifications'}</span>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Show a badge on the notification bell when there are new system events or updates in VibePlanner.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                    <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>

                            <div className="flex items-start justify-between">
                                <div className="pr-4">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle size={16} className="text-rose-500" />
                                        <span className="font-bold text-slate-800 dark:text-slate-100">{t('criticalAlerts') || 'Critical Security Alerts'}</span>
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Notifications about suspicious logins or password resets. <span className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">Always On</span></p>
                                </div>
                                <label className="relative inline-flex items-center cursor-not-allowed shrink-0 opacity-50">
                                    <input type="checkbox" value="" className="sr-only peer" defaultChecked disabled />
                                    <div className="w-11 h-6 bg-indigo-600 rounded-full peer dark:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:translate-x-full dark:border-slate-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function SettingsPage() {
    const { t } = useTranslation();

    return (
        <main className="max-w-4xl py-12 px-6 sm:px-8">
            <div className="mb-8 border-b border-slate-200 dark:border-slate-800 pb-6">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('profileSettings')}</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2">{t('profileSettingsSubtitle')}</p>
            </div>

            <Suspense fallback={<div className="animate-pulse bg-slate-100 dark:bg-slate-800 h-96 rounded-2xl w-full"></div>}>
                <SettingsContent />
            </Suspense>
        </main>
    );
}
