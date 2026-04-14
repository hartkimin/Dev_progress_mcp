'use client';

import { useEffect, useState } from 'react';

type Event = { timestamp: string; document: string; header: string };

const DIR_OPTIONS = [
    { label: '전체', value: '' },
    { label: '10_Wiki', value: '10_Wiki' },
    { label: '20_Tasks', value: '20_Tasks' },
    { label: '30_Agents/runs', value: '30_Agents/runs' },
    { label: '40_Knowledge', value: '40_Knowledge' },
    { label: '50_Reflections', value: '50_Reflections' },
];

export default function TimelinePage() {
    const [events, setEvents] = useState<Event[] | null>(null);
    const [err, setErr] = useState<string | null>(null);
    const [dir, setDir] = useState<string>('');

    useEffect(() => {
        let alive = true;
        setEvents(null);
        setErr(null);
        (async () => {
            try {
                const qs = new URLSearchParams({ limit: '100' });
                if (dir) qs.set('dir', dir);
                const resp = await fetch(`/api/orchestra/timeline/events?${qs}`, { cache: 'no-store' });
                const body = await resp.json();
                if (!alive) return;
                if (!resp.ok) throw new Error(body?.error || `HTTP ${resp.status}`);
                setEvents(body.events || []);
            } catch (e) {
                if (alive) setErr(e instanceof Error ? e.message : String(e));
            }
        })();
        return () => {
            alive = false;
        };
    }, [dir]);

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Timeline</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Vault 내 모든 문서의 Timeline append-only 엔트리 — 최신 순. append-only 규약 위반은
                    <a href="/orchestra/ralph" className="text-emerald-600 dark:text-emerald-400 hover:underline ml-1">Ralph</a> 에서 감지.
                </p>
            </div>

            <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500">디렉토리 필터:</span>
                {DIR_OPTIONS.map(opt => (
                    <button
                        key={opt.value}
                        onClick={() => setDir(opt.value)}
                        className={`px-3 py-1 rounded-md text-xs transition ${
                            dir === opt.value
                                ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-medium'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            {err && (
                <div className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                    {err}
                </div>
            )}

            {events === null && !err && <p className="text-sm text-slate-400">loading…</p>}

            {events && events.length === 0 && (
                <p className="text-sm text-slate-500 dark:text-slate-400">이벤트가 없습니다.</p>
            )}

            {events && events.length > 0 && (
                <ol className="relative border-l border-slate-200 dark:border-slate-800 ml-2 space-y-4">
                    {events.map((e, i) => (
                        <li key={i} className="pl-6 relative">
                            <span className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-950" />
                            <div className="text-xs font-mono text-slate-500 dark:text-slate-400">{e.timestamp}</div>
                            <div className="text-sm text-slate-700 dark:text-slate-300 mt-0.5">{e.header.replace(/^###\s+/, '').replace(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z\s*—\s*/, '')}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5 truncate" title={e.document}>
                                {e.document}
                            </div>
                        </li>
                    ))}
                </ol>
            )}
        </div>
    );
}
