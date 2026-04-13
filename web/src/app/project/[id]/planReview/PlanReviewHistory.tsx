'use client';

// Option B (Client Component) — AIContextView is 'use client', so async Server
// Components cannot be rendered as JSX children from it. Using useEffect fetch to
// match the YCQuestionsCard pattern from T11.

import { useEffect, useState } from 'react';
import { listPlanReviews } from '@/app/actions/planReviewActions';

interface Props { projectId: string; }

interface Row {
    id: string;
    kind: string;
    score?: number | null;
    decision?: string | null;
    created_at: string;
    spec_path?: string | null;
}

export default function PlanReviewHistory({ projectId }: Props) {
    const [rows, setRows] = useState<Row[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const data = ((await listPlanReviews(projectId)) ?? []) as Row[];
                if (!cancelled) setRows(data);
            } catch {
                // silently ignore — renders nothing
            } finally {
                if (!cancelled) setLoaded(true);
            }
        })();
        return () => { cancelled = true; };
    }, [projectId]);

    if (!loaded || !rows.length) return null;

    return (
        <details className="rounded-lg border p-3">
            <summary className="cursor-pointer text-sm font-semibold">
                Plan Review History ({rows.length})
            </summary>
            <ul className="mt-2 space-y-1 text-xs">
                {rows.map((r) => (
                    <li key={r.id} className="flex gap-2">
                        <span className="font-mono opacity-70">{(r.created_at ?? '').slice(0, 10)}</span>
                        <span className="font-semibold">{r.kind}</span>
                        <span>{r.score != null ? `${r.score}/10` : '-'}</span>
                        <span className="opacity-70">{r.decision ?? '-'}</span>
                        <span className="opacity-60 truncate">{r.spec_path ?? ''}</span>
                    </li>
                ))}
            </ul>
        </details>
    );
}
