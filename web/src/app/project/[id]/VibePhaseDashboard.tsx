'use client';

import React, { useEffect, useState } from 'react';
import { getPhaseBreakdown } from '@/lib/db';
import type { PhaseBreakdownItem } from '@/lib/db';
import { CheckCircle2, Clock, Loader2, Lightbulb, PenTool, Code2, TestTube2, Rocket } from 'lucide-react';

const PHASE_CONFIG: { name: string; icon: React.ReactNode; color: string; gradient: string; emoji: string }[] = [
    { name: 'Ideation & Requirements', icon: <Lightbulb className="w-5 h-5" />, color: 'bg-indigo-500', gradient: 'from-indigo-500 to-indigo-600', emoji: '💡' },
    { name: 'Architecture & Design', icon: <PenTool className="w-5 h-5" />, color: 'bg-emerald-500', gradient: 'from-emerald-500 to-emerald-600', emoji: '🏗️' },
    { name: 'Implementation', icon: <Code2 className="w-5 h-5" />, color: 'bg-amber-500', gradient: 'from-amber-500 to-amber-600', emoji: '⚡' },
    { name: 'Testing & QA', icon: <TestTube2 className="w-5 h-5" />, color: 'bg-violet-500', gradient: 'from-violet-500 to-violet-600', emoji: '🧪' },
    { name: 'Deployment & Review', icon: <Rocket className="w-5 h-5" />, color: 'bg-blue-500', gradient: 'from-blue-500 to-blue-600', emoji: '🚀' },
];

export default function VibePhaseDashboard({ projectId }: { projectId: string }) {
    const [phases, setPhases] = useState<PhaseBreakdownItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getPhaseBreakdown(projectId)
            .then(d => setPhases(d?.phases || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [projectId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin" />
            </div>
        );
    }

    // Find current active phase
    const activePhaseIdx = phases.findIndex(p =>
        PHASE_CONFIG.some(c => c.name === p.name) && p.in_progress > 0
    );
    const activePhaseName = activePhaseIdx >= 0 ? phases[activePhaseIdx]?.name : null;

    // Overall progress across all phases
    const totalAll = phases.reduce((s, p) => s + p.total, 0);
    const doneAll = phases.reduce((s, p) => s + p.done, 0);
    const overallRate = totalAll > 0 ? Math.round((doneAll / totalAll) * 100) : 0;

    return (
        <div className="w-full space-y-6">
            {/* Overall Progress */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        🎯 Vibe Coding Progress
                    </h3>
                    <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-500">
                        {overallRate}%
                    </span>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 via-emerald-500 to-cyan-500 rounded-full transition-all duration-1000" style={{ width: `${overallRate}%` }} />
                </div>
                <div className="mt-2 flex justify-between text-[11px] text-slate-400">
                    <span>{doneAll} completed</span>
                    <span>{totalAll - doneAll} remaining</span>
                </div>
            </div>

            {/* Phase Cards */}
            <div className="space-y-4">
                {PHASE_CONFIG.map((config, idx) => {
                    const phase = phases.find(p => p.name === config.name);
                    if (!phase) return null;

                    const isActive = activePhaseName === config.name;
                    const isComplete = phase.completion_rate === 100 && phase.total > 0;
                    const isPending = phase.total === 0 || (phase.todo === phase.total && !isActive);

                    return (
                        <div
                            key={config.name}
                            className={`bg-white dark:bg-slate-900 rounded-2xl border shadow-sm overflow-hidden transition-all duration-300 ${isActive
                                ? 'border-indigo-300 dark:border-indigo-600 ring-2 ring-indigo-500/20'
                                : isComplete
                                    ? 'border-emerald-200 dark:border-emerald-800'
                                    : 'border-slate-200 dark:border-slate-800'
                                }`}
                        >
                            <div className="p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white shadow-sm ${isActive ? 'animate-pulse' : ''}`}>
                                            {config.icon}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phase {idx + 1}</span>
                                                {isComplete && <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded">✅ Complete</span>}
                                                {isActive && <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.5 rounded animate-pulse">🔄 Active</span>}
                                                {isPending && phase.total > 0 && <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">⏳ Pending</span>}
                                            </div>
                                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">{config.name}</h4>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{phase.completion_rate}%</div>
                                        <div className="text-[11px] text-slate-400">{phase.done}/{phase.total} tasks</div>
                                    </div>
                                </div>

                                {/* Progress bar */}
                                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-3">
                                    <div className={`h-full bg-gradient-to-r ${config.gradient} rounded-full transition-all duration-700`} style={{ width: `${phase.completion_rate}%` }} />
                                </div>

                                {/* Status breakdown */}
                                <div className="flex items-center gap-4 text-[11px]">
                                    {phase.todo > 0 && (
                                        <span className="flex items-center gap-1 text-slate-500">
                                            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                                            TODO: {phase.todo}
                                        </span>
                                    )}
                                    {phase.in_progress > 0 && (
                                        <span className="flex items-center gap-1 text-blue-500">
                                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                            In Progress: {phase.in_progress}
                                        </span>
                                    )}
                                    {phase.review > 0 && (
                                        <span className="flex items-center gap-1 text-amber-500">
                                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                            Review: {phase.review}
                                        </span>
                                    )}
                                    {phase.done > 0 && (
                                        <span className="flex items-center gap-1 text-emerald-500">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                            Done: {phase.done}
                                        </span>
                                    )}
                                    {phase.avg_lead_time_days !== null && (
                                        <span className="flex items-center gap-1 text-purple-500 ml-auto">
                                            <Clock className="w-3 h-3" />
                                            Avg: {phase.avg_lead_time_days}d
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Unassigned tasks */}
                {phases.filter(p => p.name === 'Unassigned' && p.total > 0).map(phase => (
                    <div key="unassigned" className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                    <span className="text-lg">📦</span>
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unassigned</div>
                                    <h4 className="text-sm font-bold text-slate-600 dark:text-slate-400">Phase 미지정 태스크</h4>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xl font-bold text-slate-500">{phase.total}</div>
                                <div className="text-[11px] text-slate-400">tasks</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
