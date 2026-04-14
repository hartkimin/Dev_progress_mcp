'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bot, ClipboardCheck, Moon, Server } from 'lucide-react';

/**
 * Orchestra Overview — 4 카드:
 *   - Daemon: version / uptime / vault / observers / gbrain.reachable
 *   - Dreams: 최근 1 개 로그의 title/candidates/successful
 *   - Ralph:  최근 1 개 보고의 stale_count / audit_count
 *   - Agents: 최근 agent runs 카운트 (limit=50 으로 요청해서 .count)
 */

type Health = {
    version: string;
    uptime_s: number;
    vault: string;
    observers: string[];
    gbrain: { reachable: boolean; server_name?: string; server_version?: string; error?: string };
};

type DreamEntry = { index: number; target: string; backend: string };
type Dream = {
    path: string;
    title: string;
    created: string;
    candidates: number;
    successful: number;
    errors: number;
    entries: DreamEntry[];
};
type Ralph = {
    path: string;
    title: string;
    created: string;
    stale_count: number;
    audit_count: number;
};

async function fetchJSON<T>(path: string): Promise<T | { error: string }> {
    try {
        const resp = await fetch(`/api/orchestra${path}`, { cache: 'no-store' });
        return (await resp.json()) as T;
    } catch (e) {
        return { error: e instanceof Error ? e.message : String(e) };
    }
}

export default function OrchestraOverviewPage() {
    const [health, setHealth] = useState<Health | null>(null);
    const [dreamCount, setDreamCount] = useState<number | null>(null);
    const [latestDream, setLatestDream] = useState<Dream | null>(null);
    const [ralphCount, setRalphCount] = useState<number | null>(null);
    const [latestRalph, setLatestRalph] = useState<Ralph | null>(null);
    const [agentCount, setAgentCount] = useState<number | null>(null);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        let alive = true;
        (async () => {
            const h = await fetchJSON<Health>('/health');
            if (!alive) return;
            if ('error' in h) {
                setErr(h.error);
                return;
            }
            setHealth(h);

            const d = await fetchJSON<{ count: number; dreams: Dream[] }>('/dreams/recent?n=1');
            if (alive && !('error' in d)) {
                setDreamCount(d.count);
                setLatestDream(d.dreams[0] || null);
            }

            const r = await fetchJSON<{ count: number; reports: Ralph[] }>('/ralph/recent?n=1');
            if (alive && !('error' in r)) {
                setRalphCount(r.count);
                setLatestRalph(r.reports[0] || null);
            }

            const a = await fetchJSON<{ count: number }>('/agents/runs?limit=50');
            if (alive && !('error' in a)) setAgentCount(a.count);
        })();
        return () => {
            alive = false;
        };
    }, []);

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Orchestra Overview</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    claude-orchestra daemon 상태 + 최근 cycle 결과.
                </p>
            </div>

            {err && (
                <div className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                    API 호출 실패: {err}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card
                    icon={<Server size={20} />}
                    title="Daemon"
                    href="/orchestra/timeline"
                    lines={
                        health
                            ? [
                                  `v${health.version} · ${Math.round(health.uptime_s)}s`,
                                  `vault: ${health.vault}`,
                                  `observers: ${health.observers.join(', ') || '—'}`,
                                  `gbrain: ${health.gbrain.reachable ? `✓ ${health.gbrain.server_name || ''} v${health.gbrain.server_version || ''}` : '✗ unreachable'}`,
                              ]
                            : ['loading…']
                    }
                    accent="emerald"
                />
                <Card
                    icon={<Moon size={20} />}
                    title="Dreams"
                    href="/orchestra/dreams"
                    lines={
                        latestDream
                            ? [
                                  latestDream.title,
                                  `후보: ${latestDream.candidates} / 성공: ${latestDream.successful}`,
                                  latestDream.created || '',
                                  `총 ${dreamCount ?? '?'} 로그`,
                              ]
                            : [dreamCount === null ? 'loading…' : `${dreamCount}개 로그 (최근 없음)`]
                    }
                    accent="indigo"
                />
                <Card
                    icon={<ClipboardCheck size={20} />}
                    title="Ralph"
                    href="/orchestra/ralph"
                    lines={
                        latestRalph
                            ? [
                                  latestRalph.title,
                                  `stale: ${latestRalph.stale_count} / audit: ${latestRalph.audit_count}`,
                                  latestRalph.created || '',
                                  `총 ${ralphCount ?? '?'} 리포트`,
                              ]
                            : [ralphCount === null ? 'loading…' : `${ralphCount}개 리포트 (최근 없음)`]
                    }
                    accent="amber"
                />
                <Card
                    icon={<Bot size={20} />}
                    title="Agent Runs"
                    href="/orchestra/agents"
                    lines={
                        agentCount === null
                            ? ['loading…']
                            : [`${agentCount} 최근 실행 (limit 50)`, '', '', '']
                    }
                    accent="sky"
                />
            </div>

            <p className="text-xs text-slate-400 dark:text-slate-500">
                각 카드 클릭 시 상세 페이지로 이동. 백엔드 재시작 후 5~10초 대기 후 새로고침.
            </p>
        </div>
    );
}

function Card({
    icon,
    title,
    href,
    lines,
    accent,
}: {
    icon: React.ReactNode;
    title: string;
    href: string;
    lines: string[];
    accent: 'emerald' | 'indigo' | 'amber' | 'sky';
}) {
    const accents: Record<typeof accent, string> = {
        emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10',
        indigo: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10',
        amber: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10',
        sky: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10',
    };
    return (
        <Link
            href={href}
            className="block rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm hover:shadow-md transition-shadow"
        >
            <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-lg ${accents[accent]}`}>
                {icon}
                <span className="text-sm font-semibold">{title}</span>
            </div>
            <ul className="mt-3 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                {lines.map((line, i) => (
                    <li key={i} className="truncate" title={line}>
                        {line || '\u00a0'}
                    </li>
                ))}
            </ul>
        </Link>
    );
}
