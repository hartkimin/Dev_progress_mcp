import type { PhaseProgress } from '@/lib/db';

const PHASE_LABELS: Record<string, string> = {
    'Ideation & Requirements': '💡',
    'Architecture & Design':   '🏗️',
    'Implementation':          '🔨',
    'Testing & QA':            '🧪',
    'Deployment & Review':     '🚀',
};

export default function PhaseProgressStrip({ phases }: { phases?: PhaseProgress[] }) {
    const active = (phases ?? []).filter(p => p.total > 0);
    if (active.length === 0) return null;
    return (
        <div className="flex items-stretch gap-1 h-5" aria-label="Phase progress">
            {active.map((p) => {
                const pct = Math.round((p.done / p.total) * 100);
                return (
                    <div
                        key={p.phase}
                        title={`${PHASE_LABELS[p.phase] ?? ''} ${p.phase}: ${p.done}/${p.total}`}
                        className="flex-1 rounded bg-slate-100 dark:bg-slate-800 overflow-hidden"
                    >
                        <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all"
                            style={{ width: `${pct}%` }}
                        />
                    </div>
                );
            })}
        </div>
    );
}
