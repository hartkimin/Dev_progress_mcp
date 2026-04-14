'use client';

import { useEffect, useState } from 'react';

type StaleTask = { path: string; days: number; status: string };
type AuditIssue = { path: string; recorded: number; actual: number };
type Report = {
    path: string;
    title: string;
    created: string;
    stale_count: number;
    audit_count: number;
    stale_tasks: StaleTask[];
    audit_issues: AuditIssue[];
};

export default function RalphPage() {
    const [reports, setReports] = useState<Report[] | null>(null);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const resp = await fetch('/api/orchestra/ralph/recent?n=10', { cache: 'no-store' });
                const body = await resp.json();
                if (!resp.ok) throw new Error(body?.error || `HTTP ${resp.status}`);
                setReports(body.reports || []);
            } catch (e) {
                setErr(e instanceof Error ? e.message : String(e));
            }
        })();
    }, []);

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Ralph Loop</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    정체 태스크 flag + Timeline append-only 감사 — <code>~/brain/50_Reflections/*ralph*.md</code>
                </p>
            </div>

            {err && (
                <div className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                    {err}
                </div>
            )}

            {reports === null && !err && <p className="text-sm text-slate-400">loading…</p>}

            {reports && reports.length === 0 && (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Ralph 리포트가 없습니다. <code>orchestra ralph</code> 실행 후 확인.
                </p>
            )}

            <div className="space-y-6">
                {reports?.map(r => (
                    <section key={r.path} className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                        <header className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <div className="min-w-0">
                                <h2 className="font-semibold">{r.title}</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{r.path} · {r.created}</p>
                            </div>
                            <div className="flex gap-2 text-xs shrink-0">
                                <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300">
                                    stale {r.stale_count}
                                </span>
                                <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300">
                                    audit {r.audit_count}
                                </span>
                            </div>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800">
                            <div className="p-4">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">🕰 정체 태스크 (7일+ 미갱신)</h3>
                                {r.stale_tasks.length === 0 ? (
                                    <p className="text-xs text-slate-400">없음</p>
                                ) : (
                                    <ul className="space-y-1 text-xs">
                                        {r.stale_tasks.map(s => (
                                            <li key={s.path} className="flex items-center gap-2">
                                                <span className="font-mono text-slate-700 dark:text-slate-300 truncate flex-1">{s.path}</span>
                                                <span className="text-slate-500">{s.days}일</span>
                                                <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px]">{s.status || '—'}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div className="p-4">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">⚠️ Timeline 감사 위반</h3>
                                {r.audit_issues.length === 0 ? (
                                    <p className="text-xs text-slate-400">없음</p>
                                ) : (
                                    <ul className="space-y-1 text-xs">
                                        {r.audit_issues.map(a => (
                                            <li key={a.path} className="flex items-center gap-2">
                                                <span className="font-mono text-slate-700 dark:text-slate-300 truncate flex-1">{a.path}</span>
                                                <span className="text-slate-500">
                                                    rec {a.recorded} → act {a.actual}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
}
