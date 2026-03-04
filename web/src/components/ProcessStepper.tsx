'use client';

import React from 'react';
import { Task } from '@/lib/db';
import { Lightbulb, LayoutTemplate, Code2, ShieldCheck, Rocket } from 'lucide-react';

const PHASES = [
    { id: 'Phase 1', label: 'Ideation', fullName: 'Ideation & Requirements', icon: Lightbulb },
    { id: 'Phase 2', label: 'Architecture', fullName: 'Architecture & Design', icon: LayoutTemplate },
    { id: 'Phase 3', label: 'Implementation', fullName: 'Implementation', icon: Code2 },
    { id: 'Phase 4', label: 'Testing', fullName: 'Testing & QA', icon: ShieldCheck },
    { id: 'Phase 5', label: 'Deployment', fullName: 'Deployment & Review', icon: Rocket },
];

export default function ProcessStepper({ tasks }: { tasks: Task[] }) {
    // Determine the active phase
    // 1. Find the highest phase that has any 'DONE' tasks
    // 2. Find the lowest phase that has 'TODO' or 'IN_PROGRESS' or 'REVIEW' tasks
    // For simplicity, let's just find the max phase that has tasks, and if all tasks in it are DONE, move to next.

    let currentPhaseIndex = 0;

    // Group tasks by phase
    const phaseTasks = PHASES.map(p => tasks.filter(t => t.phase === p.fullName));

    for (let i = 0; i < PHASES.length; i++) {
        const tasksInPhase = phaseTasks[i];
        if (tasksInPhase.length > 0) {
            const allDone = tasksInPhase.every(t => t.status === 'DONE');
            if (allDone) {
                currentPhaseIndex = Math.min(i + 1, PHASES.length - 1);
            } else {
                currentPhaseIndex = i;
                break;
            }
        } else if (i > 0 && phaseTasks[i - 1].length > 0 && phaseTasks[i - 1].every(t => t.status === 'DONE')) {
            currentPhaseIndex = i;
            break;
        }
    }

    return (
        <div className="w-full bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-transparent bg-clip-text">Vibe Coding</span>
                        Process Pipeline
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Track your current development phase and know what to do next.
                    </p>
                </div>
            </div>

            <div className="relative flex justify-between w-full">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800 -translate-y-1/2 rounded-full z-0"></div>

                {/* Active Line Progress */}
                <div
                    className="absolute top-1/2 left-0 h-1 bg-indigo-500 -translate-y-1/2 rounded-full z-0 transition-all duration-500 ease-in-out"
                    style={{ width: `${(currentPhaseIndex / (PHASES.length - 1)) * 100}%` }}
                ></div>

                {PHASES.map((phase, index) => {
                    const isCompleted = index < currentPhaseIndex;
                    const isActive = index === currentPhaseIndex;
                    const isPending = index > currentPhaseIndex;

                    const Icon = phase.icon;

                    return (
                        <div key={phase.id} className="relative z-10 flex flex-col items-center gap-3">
                            <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-sm
                                    ${isCompleted ? 'bg-indigo-500 border-indigo-500 text-white' : ''}
                                    ${isActive ? 'bg-white dark:bg-slate-900 border-indigo-500 text-indigo-500 ring-4 ring-indigo-500/20' : ''}
                                    ${isPending ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500' : ''}
                                `}
                            >
                                <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col items-center">
                                <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}>
                                    {phase.id}
                                </span>
                                <span className={`text-sm font-medium mt-0.5 whitespace-nowrap hidden md:block
                                    ${isActive || isCompleted ? 'text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}
                                `}>
                                    {phase.label}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
