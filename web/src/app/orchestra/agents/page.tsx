'use client';

import { useEffect, useState } from 'react';

type Run = {
    path: string;
    title: string;
    agent_role: string;
    agent_model: string;
    task_ref: string;
    outcome: string;
    status: string;
    token_cost: number;
    duration_s: number;
    created: string;
    author: string;
};

const OUTCOME_COLORS: Record<string, string> = {
    success: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
    error: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300',
    abort: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
    partial: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300',
};

export default function AgentsPage() {
    const [runs, setRuns] = useState<Run[] | null>(null);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const resp = await fetch('/api/orchestra/agents/runs?limit=100', { cache: 'no-store' });
                const body = await resp.json();
                if (!resp.ok) throw new Error(body?.error || `HTTP ${resp.status}`);
                setRuns(body.runs || []);
            } catch (e) {
                setErr(e instanceof Error ? e.message : String(e));
            }
        })();
    }, []);

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Agent Runs</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    <code>~/brain/30_Agents/runs/YYYY-MM-DD/*.md</code> — AgentSpawner 가 기록한 모든 에이전트 실행.
                </p>
            </div>

            {err && (
                <div className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                    {err}
                </div>
            )}

            {runs === null && !err && <p className="text-sm text-slate-400">loading…</p>}

            {runs && runs.length === 0 && (
                <p className="text-sm text-slate-500 dark:text-slate-400">Agent runs 가 없습니다.</p>
            )}

            {runs && runs.length > 0 && (
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="text-left px-4 py-2 font-medium">Role</th>
                                <th className="text-left px-4 py-2 font-medium">Model</th>
                                <th className="text-left px-4 py-2 font-medium">Task</th>
                                <th className="text-left px-4 py-2 font-medium">Outcome</th>
                                <th className="text-right px-4 py-2 font-medium">Tokens</th>
                                <th className="text-right px-4 py-2 font-medium">Duration</th>
                                <th className="text-left px-4 py-2 font-medium">Created</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {runs.map(r => (
                                <tr key={r.path} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                    <td className="px-4 py-2 font-medium text-slate-900 dark:text-slate-100">{r.agent_role || '—'}</td>
                                    <td className="px-4 py-2 text-slate-600 dark:text-slate-400 font-mono text-xs">{r.agent_model || '—'}</td>
                                    <td className="px-4 py-2 text-slate-600 dark:text-slate-400 font-mono text-xs truncate max-w-[200px]" title={r.task_ref}>{r.task_ref || '—'}</td>
                                    <td className="px-4 py-2">
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${OUTCOME_COLORS[r.outcome] || 'bg-slate-100 text-slate-600'}`}>
                                            {r.outcome || '—'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 text-right text-slate-600 dark:text-slate-400 font-mono text-xs">
                                        {r.token_cost.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-2 text-right text-slate-600 dark:text-slate-400 font-mono text-xs">
                                        {r.duration_s.toFixed(1)}s
                                    </td>
                                    <td className="px-4 py-2 text-slate-500 dark:text-slate-400 text-xs">{r.created || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
