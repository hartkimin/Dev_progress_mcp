'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Blocks, Users, Key } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export default function AdminSubNav() {
    const pathname = usePathname();
    const { t } = useTranslation();

    const tabs = [
        { href: '/admin/integrations', label: t('integrations'), icon: Blocks },
        { href: '/admin/users',        label: t('users'),        icon: Users },
        { href: '/admin/api-keys',     label: t('apiKeys'),      icon: Key },
    ];

    return (
        <div className="border-b border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-950/60 backdrop-blur-sm px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto flex items-center gap-1 overflow-x-auto">
                {tabs.map(({ href, label, icon: Icon }) => {
                    const active = pathname === href || pathname.startsWith(href + '/');
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                                active
                                    ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400'
                            }`}
                        >
                            <Icon size={16} />
                            {label}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
