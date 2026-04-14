'use client';

// Option B (Client Component) — AIContextView is 'use client', so async Server
// Components cannot be rendered as JSX children from it. Using useEffect fetch to
// match the YCQuestionsCard pattern from T11.

import { useEffect, useState } from 'react';
import { listPlanReviews, getPlanReview, getPlanReviewMarkdown } from '@/app/actions/planReviewActions';
import type { PlanReview } from '@/lib/db';

type View = 'md' | 'json';

interface Props {
    projectId: string;
    kindFilter?: 'ceo' | 'eng' | 'design' | 'devex';
}

interface Row {
    id: string;
    kind: string;
    score?: number | null;
    decision?: string | null;
    created_at: string;
    spec_path?: string | null;
}

export default function PlanReviewHistory({ projectId, kindFilter }: Props) {
    const [rows, setRows] = useState<Row[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [openId, setOpenId] = useState<string | null>(null);
    const [details, setDetails] = useState<Record<string, PlanReview>>({});
    const [markdowns, setMarkdowns] = useState<Record<string, string>>({});
    const [view, setView] = useState<Record<string, View>>({});
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [errorId, setErrorId] = useState<string | null>(null);

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

    const visibleRows = kindFilter ? rows.filter((r) => r.kind === kindFilter) : rows;

    if (!loaded || !visibleRows.length) return null;

    async function toggleRow(id: string) {
        if (openId === id) {
            setOpenId(null);
            return;
        }
        setOpenId(id);
        setErrorId(null);
        if (!details[id] || markdowns[id] === undefined) {
            setLoadingId(id);
            try {
                const [data, md] = await Promise.all([
                    details[id] ? Promise.resolve(details[id]) : getPlanReview(id),
                    markdowns[id] !== undefined ? Promise.resolve(markdowns[id]) : getPlanReviewMarkdown(id).catch(() => ''),
                ]);
                if (data) setDetails((prev) => ({ ...prev, [id]: data as PlanReview }));
                else setErrorId(id);
                setMarkdowns((prev) => ({ ...prev, [id]: md ?? '' }));
                setView((prev) => ({ ...prev, [id]: prev[id] ?? 'md' }));
            } catch {
                setErrorId(id);
            } finally {
                setLoadingId(null);
            }
        }
    }

    return (
        <details className="rounded-lg border p-3" open>
            <summary className="cursor-pointer text-sm font-semibold">
                Plan Review History ({visibleRows.length})
            </summary>
            <ul className="mt-2 space-y-1 text-xs">
                {visibleRows.map((r) => {
                    const isOpen = openId === r.id;
                    const detail = details[r.id];
                    return (
                        <li key={r.id} className="rounded border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                            <button
                                type="button"
                                onClick={() => toggleRow(r.id)}
                                className="flex w-full items-center gap-2 px-2 py-1 text-left"
                                aria-expanded={isOpen}
                            >
                                <span className="font-mono opacity-70">{(r.created_at ?? '').slice(0, 10)}</span>
                                <span className="font-semibold uppercase">{r.kind}</span>
                                <span>{r.score != null ? `${r.score}/10` : '-'}</span>
                                <span className="opacity-70">{r.decision ?? '-'}</span>
                                <span className="truncate opacity-60">{r.spec_path ?? ''}</span>
                                <span className="ml-auto opacity-60">{isOpen ? '▾' : '▸'}</span>
                            </button>
                            {isOpen && (
                                <div className="mt-1 space-y-2 rounded-md bg-slate-50 p-3 dark:bg-slate-900">
                                    {loadingId === r.id && <p className="opacity-60">Loading…</p>}
                                    {errorId === r.id && <p className="text-red-600">Failed to load review.</p>}
                                    {detail && (
                                        <>
                                            <div className="flex flex-wrap gap-x-4 gap-y-1">
                                                <span><strong>Reviewer:</strong> {detail.reviewer || '-'}</span>
                                                <span><strong>Score:</strong> {detail.score ?? '-'}/10</span>
                                                <span><strong>Decision:</strong> {detail.decision ?? '-'}</span>
                                            </div>
                                            {detail.spec_path && (
                                                <div className="break-all"><strong>Spec:</strong> {detail.spec_path}</div>
                                            )}
                                            {detail.md_path && (
                                                <div className="break-all"><strong>MD:</strong> {detail.md_path}</div>
                                            )}
                                            <div className="flex gap-1">
                                                {(['md', 'json'] as View[]).map((v) => (
                                                    <button
                                                        key={v}
                                                        type="button"
                                                        onClick={() => setView((prev) => ({ ...prev, [r.id]: v }))}
                                                        className={`rounded px-2 py-0.5 text-[11px] font-medium ${
                                                            (view[r.id] ?? 'md') === v
                                                                ? 'bg-indigo-600 text-white'
                                                                : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                                                        }`}
                                                    >
                                                        {v === 'md' ? 'Markdown' : 'JSON payload'}
                                                    </button>
                                                ))}
                                            </div>
                                            <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded bg-white p-2 text-[11px] leading-relaxed dark:bg-slate-950">
{(view[r.id] ?? 'md') === 'md'
    ? (markdowns[r.id] || '(MD 파일을 찾을 수 없습니다)')
    : JSON.stringify(detail.payload, null, 2)}
                                            </pre>
                                        </>
                                    )}
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>
        </details>
    );
}
