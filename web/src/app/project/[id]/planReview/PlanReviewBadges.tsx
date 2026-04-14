'use client';

// Option B (Client Component) — VibePhaseDashboard is 'use client', so async Server
// Components cannot be rendered as JSX children from it. Using useEffect fetch to
// match the YCQuestionsCard pattern from T11.

import { useEffect, useState } from 'react';
import { listPlanReviews } from '@/app/actions/planReviewActions';

type Kind = 'ceo' | 'eng' | 'design' | 'devex';
const KINDS: Kind[] = ['ceo', 'eng', 'design', 'devex'];

interface Props {
    projectId: string;
    kinds?: Array<'ceo' | 'eng' | 'design' | 'devex'>;
}

interface Row {
    kind: Kind;
    score?: number | null;
    created_at: string;
}

export default function PlanReviewBadges({ projectId, kinds }: Props) {
    const [latestByKind, setLatestByKind] = useState<Map<Kind, Row>>(new Map());

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const all = ((await listPlanReviews(projectId)) ?? []) as Row[];
                if (cancelled) return;
                const map = new Map<Kind, Row>();
                for (const r of all) {
                    if (!map.has(r.kind)) map.set(r.kind, r);
                }
                setLatestByKind(map);
            } catch {
                // API unreachable or unauthorized — render empty badges row
            }
        })();
        return () => { cancelled = true; };
    }, [projectId]);

    const activeKinds = kinds ?? KINDS;

    if (activeKinds.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2 text-xs">
            {activeKinds.map((k) => {
                const r = latestByKind.get(k);
                const label = `${k.toUpperCase()}${r?.score != null ? `: ${r.score}/10` : ''}`;
                const cls = r
                    ? (r.score ?? 0) >= 8
                        ? 'bg-green-600 text-white'
                        : (r.score ?? 0) >= 5
                            ? 'bg-yellow-600 text-white'
                            : 'bg-red-600 text-white'
                    : 'bg-gray-400 text-white';
                return (
                    <span key={k} className={`rounded px-2 py-0.5 ${cls}`}>
                        {label}
                    </span>
                );
            })}
        </div>
    );
}
