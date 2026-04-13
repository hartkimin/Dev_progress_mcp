'use client';

import React from 'react';
import { Task } from '@/lib/db';
import { MessageSquarePlus, Sparkles, ArrowRight, CheckCircle2, Code2, FileText } from 'lucide-react';

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

    // Intelligence: Check specific task types
    const docTasks = tasks.filter(t => t.task_type === 'Docs');
    const codingTasks = tasks.filter(t => t.task_type === 'Coding');
    const promptTasks = tasks.filter(t => t.task_type === 'Prompting');

    let recommendation = {
        title: "Welcome to VibePlanner!",
        description: "멋진 아이디어가 있나요? 기획 단계부터 AI와 함께 시작해보세요.",
        action: "기획 시작하기",
        phase: PHASES[0],
        icon: <MessageSquarePlus size={18} />
    };

    // Rule-based Recommendation Engine
    for (let i = 0; i < PHASES.length; i++) {
        const tasksInPhase = phaseTasks[i];
        if (tasksInPhase.length > 0) {
            const allDone = tasksInPhase.every(t => t.status === 'DONE');
            const inProgress = tasksInPhase.some(t => t.status === 'IN_PROGRESS' || t.status === 'REVIEW');

            if (allDone) {
                if (i === PHASES.length - 1) {
                    recommendation = {
                        title: "Project Completed!",
                        description: "모든 단계가 완료되었습니다. 최종 결과물을 검토하고 배포를 축하하세요!",
                        action: "프로젝트 리뷰",
                        phase: PHASES[i],
                        icon: <CheckCircle2 size={18} />
                    };
                    currentPhaseIndex = i;
                } else {
                    const nextPhase = PHASES[i + 1];
                    const nextPhaseTasks = phaseTasks[i + 1];

                    if (nextPhaseTasks.length === 0) {
                        // Intelligent transition
                        if (i === 1 && docTasks.length > 0) { // After Architecture/Docs
                            recommendation = {
                                title: "Ready for Implementation!",
                                description: "설계가 완료되었습니다. 이제 코딩 단계로 넘어가 보일러플레이트를 생성할 시간입니다.",
                                action: "구현 단계 시작",
                                phase: nextPhase,
                                icon: <Code2 size={18} />
                            };
                        } else {
                            recommendation = {
                                title: `${nextPhase.label} 단계 진입`,
                                description: `${PHASES[i].label} 단계가 성공적으로 마무리되었습니다. 다음 여정을 시작하세요.`,
                                action: `Plan ${nextPhase.label}`,
                                phase: nextPhase,
                                icon: <ArrowRight size={18} />
                            };
                        }
                        currentPhaseIndex = i + 1;
                        break;
                    }
                }
            } else if (inProgress) {
                recommendation = {
                    title: `${PHASES[i].label} 진행 중`,
                    description: "현재 단계의 태스크들이 활발히 진행되고 있습니다. AI 사이드바를 활용해 막히는 부분을 해결해보세요.",
                    action: "활성 태스크 집중",
                    phase: PHASES[i],
                    icon: <ArrowRight size={18} />
                };
                currentPhaseIndex = i;
                break;
            } else {
                recommendation = {
                    title: `${PHASES[i].label} 시작 준비 완료`,
                    description: "기획된 태스크들이 대기 중입니다. 가장 먼저 처리할 작업을 선택해 시작하세요.",
                    action: "태스크 시작",
                    phase: PHASES[i],
                    icon: <FileText size={18} />
                };
                currentPhaseIndex = i;
                break;
            }
        }
    }

    if (tasks.length === 0) {
        recommendation = {
            title: "Let's Vibe!",
            description: "새로운 프로젝트가 생성되었습니다. 첫 번째 기획 태스크를 만들어 아이디어를 구체화해보세요.",
            action: "첫 태스크 생성",
            phase: PHASES[0],
            icon: <Sparkles size={18} />
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
                            Vibe Guide
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
                        {recommendation.icon}
                        {recommendation.action}
                    </button>
                </div>
            </div>
        </div>
    );
}
