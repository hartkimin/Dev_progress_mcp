'use client';

import { useEffect, useState } from 'react';

type DreamEntry = { index: number; target: string; backend: string };
type Dream = {
    path: string;
    title: string;
    created: string;
    candidates: number;
    successful: number;
    errors: number;
    status: string;
    entries: DreamEntry[];
};

export default function DreamsPage() {
    const [dreams, setDreams] = useState<Dream[] | null>(null);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const resp = await fetch('/api/orchestra/dreams/recent?n=20', { cache: 'no-store' });
                const body = await resp.json();
                if (!resp.ok) throw new Error(body?.error || `HTTP ${resp.status}`);
                setDreams(body.dreams || []);
            } catch (e) {
                setErr(e instanceof Error ? e.message : String(e));
            }
        })();
    }, []);

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Dream Cycle</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    최근 야간 Compiled Truth 재합성 제안 로그. 각 항목은 <code>~/brain/60_Dreams/</code> 에 저장됨.
                </p>
            </div>

            {err && (
                <div className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                    {err}
                </div>
            )}

            {dreams === null && !err && <p className="text-sm text-slate-400">loading…</p>}

            {dreams && dreams.length === 0 && (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Dream 로그가 없습니다. <code>orchestra dream</code> 수동 실행 또는 야간 cron 대기.
                </p>
            )}

            <div className="space-y-3">
                {dreams?.map(d => (
                    <details
                        key={d.path}
                        className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
                    >
                        <summary className="cursor-pointer px-4 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <div className="min-w-0">
                                <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">{d.title}</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                    {d.path} · {d.created}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 text-xs">
                                <Badge label={`후보 ${d.candidates}`} color="slate" />
                                <Badge label={`성공 ${d.successful}`} color="emerald" />
                                {d.errors > 0 && <Badge label={`오류 ${d.errors}`} color="red" />}
                                {d.status && <Badge label={d.status} color="amber" />}
                            </div>
                        </summary>
                        {d.entries.length > 0 && (
                            <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 px-4 py-3">
                                <table className="w-full text-xs">
                                    <thead className="text-slate-400">
                                        <tr>
                                            <th className="text-left font-normal pb-1">#</th>
                                            <th className="text-left font-normal pb-1">Target</th>
                                            <th className="text-left font-normal pb-1">Backend</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {d.entries.map(e => (
                                            <tr key={e.index} className="border-t border-slate-200 dark:border-slate-800">
                                                <td className="py-1.5 text-slate-500">{e.index}</td>
                                                <td className="py-1.5 font-mono text-slate-700 dark:text-slate-300">{e.target}</td>
                                                <td className="py-1.5 text-slate-600 dark:text-slate-400">{e.backend || '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </details>
                ))}
            </div>
        </div>
    );
}

function Badge({ label, color }: { label: string; color: 'slate' | 'emerald' | 'red' | 'amber' }) {
    const colors: Record<typeof color, string> = {
        slate: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
        emerald: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
        red: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300',
        amber: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300',
    };
    return <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${colors[color]}`}>{label}</span>;
}
