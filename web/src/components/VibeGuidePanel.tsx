'use client';

import React from 'react';
import { Task } from '@/lib/db';
import { MessageSquarePlus, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

const PHASES = [
    { id: 'Phase 1', label: 'Ideation', fullName: 'Ideation & Requirements' },
    { id: 'Phase 2', label: 'Architecture', fullName: 'Architecture & Design' },
    { id: 'Phase 3', label: 'Implementation', fullName: 'Implementation' },
    { id: 'Phase 4', label: 'Testing', fullName: 'Testing & QA' },
    { id: 'Phase 5', label: 'Deployment', fullName: 'Deployment & Review' },
];

export default function VibeGuidePanel({ tasks }: { tasks: Task[] }) {
    // Determine the current phase and what to do next
    let currentPhaseIndex = 0;
    const phaseTasks = PHASES.map(p => tasks.filter(t => t.phase === p.fullName));

    let recommendation = {
        title: "Welcome to your new project!",
        description: "Let's start by defining the core idea and requirements.",
        action: "Define Requirements",
        phase: PHASES[0],
    };

    for (let i = 0; i < PHASES.length; i++) {
        const tasksInPhase = phaseTasks[i];
        if (tasksInPhase.length > 0) {
            const allDone = tasksInPhase.every(t => t.status === 'DONE');
            const inProgress = tasksInPhase.some(t => t.status === 'IN_PROGRESS' || t.status === 'REVIEW');

            if (allDone) {
                // If all done, but we are at the last phase
                if (i === PHASES.length - 1) {
                    recommendation = {
                        title: "Project Completed!",
                        description: "All phases are done. Great job!",
                        action: "Review Completed Tasks",
                        phase: PHASES[i],
                    };
                    currentPhaseIndex = i;
                } else {
                    // Move to next phase if there are no tasks yet in the next phase
                    const nextPhaseTasks = phaseTasks[i + 1];
                    if (nextPhaseTasks.length === 0) {
                        recommendation = {
                            title: `Start ${PHASES[i + 1].label}`,
                            description: `You have completed ${PHASES[i].label}. It's time to plan tasks for the next phase.`,
                            action: `Plan ${PHASES[i + 1].label}`,
                            phase: PHASES[i + 1],
                        };
                        currentPhaseIndex = i + 1;
                        break;
                    }
                }
            } else if (inProgress) {
                recommendation = {
                    title: `Continue ${PHASES[i].label}`,
                    description: `You have tasks in progress for ${PHASES[i].label}. Keep up the good work!`,
                    action: "Focus on Active Tasks",
                    phase: PHASES[i],
                };
                currentPhaseIndex = i;
                break;
            } else {
                recommendation = {
                    title: `Begin ${PHASES[i].label} Work`,
                    description: `You have planned tasks for ${PHASES[i].label}. Pick one and start working on it.`,
                    action: "Start a Task",
                    phase: PHASES[i],
                };
                currentPhaseIndex = i;
                break;
            }
        }
    }

    if (tasks.length === 0) {
        recommendation = {
            title: "Let's Vibe Code!",
            description: "To get started, create your first task in the Ideation phase. What are we building?",
            action: "Create First Task",
            phase: PHASES[0],
        };
    }

    return (
        <div className="w-full bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 p-6 shadow-sm mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 text-indigo-500/10 dark:text-indigo-400/10">
                <Sparkles size={120} />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                            What&apos;s Next?
                        </span>
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            Current: {recommendation.phase.fullName}
                        </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                        {recommendation.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300">
                        {recommendation.description}
                    </p>
                </div>

                <div className="flex-shrink-0">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm shadow-indigo-600/20 transition-all active:scale-95 font-medium whitespace-nowrap">
                        {recommendation.action === "Review Completed Tasks" ? (
                            <CheckCircle2 size={18} />
                        ) : recommendation.action === "Focus on Active Tasks" ? (
                            <ArrowRight size={18} />
                        ) : (
                            <MessageSquarePlus size={18} />
                        )}
                        {recommendation.action}
                    </button>
                </div>
            </div>
        </div>
    );
}
