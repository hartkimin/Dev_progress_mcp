'use client';

import { useState } from 'react';
import PlanReviewHistory from './PlanReviewHistory';

type Kind = 'all' | 'ceo' | 'eng' | 'design' | 'devex';

const KIND_BUTTONS: { key: Kind; label: string }[] = [
    { key: 'all',    label: 'All' },
    { key: 'ceo',    label: 'CEO' },
    { key: 'eng',    label: 'Eng' },
    { key: 'design', label: 'Design' },
    { key: 'devex',  label: 'DevEx' },
];

export default function PlanReviewHub({ projectId }: { projectId: string }) {
    const [kind, setKind] = useState<Kind>('all');
    return (
        <div className="w-full space-y-4">
            <div className="flex flex-wrap items-center gap-2">
                {KIND_BUTTONS.map((b) => (
                    <button
                        key={b.key}
                        onClick={() => setKind(b.key)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                            kind === b.key
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                        {b.label}
                    </button>
                ))}
            </div>
            <PlanReviewHistory
                projectId={projectId}
                kindFilter={kind === 'all' ? undefined : kind}
            />
        </div>
    );
}
