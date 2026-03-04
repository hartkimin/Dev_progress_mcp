'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Task } from '@/lib/db';
import { X, Calendar, Tag, Hash, Activity, Clock, Loader2, Edit2, Save, MessageSquare, CheckCircle2, Sparkles, AlertCircle, Info, ChevronDown, ChevronUp, Map, Target, BookOpen, Copy, Check } from 'lucide-react';
import { setTaskStatus, saveTaskDetails, syncTaskFromDb, setTaskPhaseAndStatus, createTaskAction } from './actions';
import { TaskComments } from './TaskComments';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Phase {
    id: string;
    title: string;
    description: string;
    criteria: string;
    color: string;
    borderColor: string;
    textColor: string;
    bgBadge: string;
}

function EmptyStateGuide({ phases, projectName, projectId }: { phases: Phase[], projectName: string, projectId: string }) {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleCopy = async (text: string, index: number) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const mcpCommands = [
        `"${projectName}" 프로젝트(ID: ${projectId})의 기획(Ideation) 가이드라인을 제안해줘`,
        `"${projectName}" 프로젝트(ID: ${projectId})의 아키텍처 가이드라인을 제안해줘`,
        `"${projectName}" 프로젝트(ID: ${projectId})의 기능 구현 가이드라인을 제안해줘`,
        `"${projectName}" 프로젝트(ID: ${projectId})의 테스트 검증 가이드라인을 제안해줘`,
        `"${projectName}" 프로젝트(ID: ${projectId})의 배포 가이드라인을 제안해줘`
    ];

    return (
        <div className="w-full flex flex-col items-center justify-center py-10 px-4 animate-in fade-in duration-500">
            <div className="max-w-4xl w-full flex flex-col items-center text-center mb-10">
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center mb-6 shadow-sm ring-4 ring-indigo-50 dark:ring-indigo-900/20">
                    <Sparkles className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">프로젝트 시작하기 (Vibe Coding)</h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl font-medium leading-relaxed">
                    현재 등록된 태스크가 없습니다. Vibe Coding 방법론을 따라 앱 개발을 빠르고 체계적으로 시작해 보세요.<br />
                    아래의 <b>단계별 AI 프롬프트</b>를 복사하여 에이전트(AI)에게 전달하면 기획부터 완성까지 구체적인 가이드를 받을 수 있습니다.
                </p>
            </div>

            <div className="w-full max-w-5xl flex flex-col gap-6">
                {phases.map((phase, idx) => {
                    const isCopied = copiedIndex === idx;
                    return (
                        <div key={phase.id} className={`group relative bg-white dark:bg-slate-900/80 rounded-3xl border ${phase.borderColor} shadow-sm transition-all hover:shadow-md overflow-hidden flex flex-col md:flex-row`}>
                            {/* Phase Info (Left side) */}
                            <div className={`p-6 md:p-8 md:w-5/12 lg:w-1/3 flex flex-col gap-3 bg-gradient-to-br ${phase.color} border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800`}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`text-[11px] font-black uppercase tracking-widest ${phase.textColor} ${phase.bgBadge} px-3 py-1 rounded-full shadow-sm ring-1 ring-white/50 dark:ring-black/20`}>
                                        Phase {idx + 1}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-tight">
                                    {phase.id.replace(/^\d+\.\s*/, '')}
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium mt-1">
                                    {phase.description}
                                </p>
                                <div className="mt-auto pt-5 flex flex-col gap-1.5 border-t border-white/50 dark:border-slate-800/50">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Goal</span>
                                    <div className="flex items-start gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        <Target className="w-3.5 h-3.5 mt-0.5 text-indigo-500 shrink-0" />
                                        <span className="leading-snug">{phase.criteria}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Prompt section (Right side) */}
                            <div className="p-6 md:p-8 flex-1 flex flex-col justify-center bg-slate-50/30 dark:bg-slate-900/30">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                    <h4 className="flex items-center gap-2 text-sm font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-900/20 px-3 py-1.5 rounded-lg w-fit border border-indigo-100/50 dark:border-indigo-800/50 shadow-sm">
                                        <MessageSquare className="w-4 h-4" />
                                        <span>자동화된 MCP 프롬프트 명령어</span>
                                    </h4>

                                    <div className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shadow-sm">
                                        <Info className="w-4 h-4" /> <span>채팅창에 입력하여 실행하세요</span>
                                    </div>
                                </div>
                                <div className="relative group/prompt mt-2">
                                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-300 dark:bg-indigo-600 rounded-l-xl transition-colors group-hover/prompt:bg-indigo-400 dark:group-hover/prompt:bg-indigo-500"></div>
                                    <div className="bg-white dark:bg-slate-950 p-5 pl-7 rounded-2xl border border-slate-200 dark:border-slate-800 font-mono text-[16px] leading-relaxed text-indigo-600 dark:text-indigo-400 shadow-sm cursor-text selection:bg-indigo-100 dark:selection:bg-indigo-900/40 hover:border-indigo-200 dark:hover:border-slate-700 transition-colors font-semibold">
                                        {mcpCommands[idx]}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-12 max-w-2xl text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium flex items-center justify-center gap-2">
                    <Info className="w-4 h-4" />
                    첫 번째 태스크를 등록하면 이 가이드는 자동으로 닫히고 칸반 보드가 표시됩니다.
                </p>
            </div>
        </div>
    );
}



export default function KanbanBoardClient({
    tasks: initialTasks,
    categoryStats,
    projectId,
    projectName
}: {
    tasks: Task[],
    categoryStats: Record<string, { total: number, done: number }>,
    projectId: string,
    projectName: string
}) {
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedTaskDetails, setSelectedTaskDetails] = useState<Task | null>(null);
    const [isEditingDetails, setIsEditingDetails] = useState(false);
    const [editForm, setEditForm] = useState({ description: '', beforeWork: '', afterWork: '', phase: '', taskType: '', scale: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncResult, setSyncResult] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);
    const [viewMode, setViewMode] = useState<'status' | 'phase'>('status');

    const [showVibeGuide, setShowVibeGuide] = useState(false);

    const VIBE_PHASES = [
        {
            id: '1. Ideation',
            title: '1. 아이디어 기획 (Ideation)',
            description: '프로젝트의 핵심 목표, 주 사용자, 주요 기능(Feature)을 정의하고 기초적인 기획을 정리합니다.',
            criteria: '모든 요구사항과 코어 기능 목록이 확정되었을 때',
            color: 'from-amber-500/10 to-transparent',
            borderColor: 'border-amber-200 dark:border-amber-800/50',
            textColor: 'text-amber-700 dark:text-amber-400',
            bgBadge: 'bg-amber-100 dark:bg-amber-900/40'
        },
        {
            id: '2. Architecture',
            title: '2. 아키텍처 설계 (Architecture)',
            description: '기술 스택(Tech Stack)을 선정하고 데이터베이스 스키마 및 UI/UX 와이어프레임을 설계합니다.',
            criteria: 'DB 구조와 메인 레이아웃 설계가 확정되었을 때',
            color: 'from-blue-500/10 to-transparent',
            borderColor: 'border-blue-200 dark:border-blue-800/50',
            textColor: 'text-blue-700 dark:text-blue-400',
            bgBadge: 'bg-blue-100 dark:bg-blue-900/40'
        },
        {
            id: '3. Implementation',
            title: '3. 핵심기능 구현 (Implementation)',
            description: '본격적으로 실제 코드를 작성합니다. UI 컴포넌트를 만들고 데이터베이스 로직을 연결합니다.',
            criteria: '기획한 주요 기능의 코딩 및 연결이 모두 끝났을 때',
            color: 'from-indigo-500/10 to-transparent',
            borderColor: 'border-indigo-200 dark:border-indigo-800/50',
            textColor: 'text-indigo-700 dark:text-indigo-400',
            bgBadge: 'bg-indigo-100 dark:bg-indigo-900/40'
        },
        {
            id: '4. Testing',
            title: '4. 테스트 및 디버깅 (Testing)',
            description: '구현된 기능들이 정상으로 동작하는지 직접 확인하고 발견된 에러나 버그를 수정합니다.',
            criteria: '앱 작동 시 발견된 치명적인 버그가 모두 해결되었을 때',
            color: 'from-rose-500/10 to-transparent',
            borderColor: 'border-rose-200 dark:border-rose-800/50',
            textColor: 'text-rose-700 dark:text-rose-400',
            bgBadge: 'bg-rose-100 dark:bg-rose-900/40'
        },
        {
            id: '5. Deployment',
            title: '5. 배포 및 완성 (Deployment)',
            description: '작업한 코드를 서버에 올리고, 프로젝트 README나 사용자 가이드라인을 최종적으로 작성합니다.',
            criteria: '실제 서비스 가능한 상태가 완료되었을 때',
            color: 'from-emerald-500/10 to-transparent',
            borderColor: 'border-emerald-200 dark:border-emerald-800/50',
            textColor: 'text-emerald-700 dark:text-emerald-400',
            bgBadge: 'bg-emerald-100 dark:bg-emerald-900/40'
        }
    ];

    const PHASES = VIBE_PHASES.map(p => p.id);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        setTasks(initialTasks);
    }, [initialTasks]);

    const onDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        if (viewMode === 'phase') {
            const [destPhase, destStatus] = destination.droppableId.split('::');
            const newStatus = destStatus as 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
            const newPhase = destPhase === 'Unassigned' ? '' : destPhase;

            // Optimistic UI update
            setTasks(prev => prev.map(t => t.id === draggableId ? { ...t, status: newStatus, phase: newPhase } : t));

            // Server Action
            startTransition(() => {
                setTaskPhaseAndStatus(draggableId, newPhase, newStatus, projectId);
            });
        } else {
            const newStatus = destination.droppableId as 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';

            // Optimistic UI update
            setTasks(prev => prev.map(t => t.id === draggableId ? { ...t, status: newStatus } : t));

            // Server Action
            startTransition(() => {
                setTaskStatus(projectId, draggableId, newStatus);
            });
        }
    };

    const columns = [
        { id: 'TODO', label: 'To Do', color: 'bg-slate-500', text: 'text-slate-700 dark:text-slate-200' },
        { id: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-500', text: 'text-blue-700 dark:text-blue-100' },
        { id: 'REVIEW', label: 'In Review', color: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-100' },
        { id: 'DONE', label: 'Completed', color: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-100' },
    ];

    const filteredTasks = selectedCategory
        ? tasks.filter(t => (t.category || 'Uncategorized') === selectedCategory)
        : tasks;

    const renderTaskCard = (task: Task, index: number) => {
        const isPulse = task.status === 'IN_PROGRESS';
        return (
            <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        onClick={(e) => {
                            // Prevent clicking if just dragging
                            if (!snapshot.isDragging) {
                                setSelectedTaskDetails(task);
                                setEditForm({
                                    description: task.description || '',
                                    beforeWork: task.before_work || '',
                                    afterWork: task.after_work || '',
                                    phase: task.phase || '',
                                    taskType: task.task_type || '',
                                    scale: task.scale || ''
                                });
                                setIsEditingDetails(false);
                            }
                        }}
                        className={`bg-white dark:bg-slate-800/90 border cursor-pointer ${isPulse && !snapshot.isDragging ? 'border-blue-400 dark:border-blue-500/70 ring-2 ring-blue-400/30 dark:ring-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.3)] dark:shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]' : 'border-slate-200 dark:border-slate-700/80 hover:border-slate-300 shadow-sm dark:shadow-none hover:shadow-md'} p - 4 rounded - xl transition - all group duration - 200 ${snapshot.isDragging ? 'rotate-2 scale-105 shadow-xl ring-2 ring-indigo-500/50 z-[100]' : ''} `}
                        style={provided.draggableProps.style}
                    >
                        {(task.category || task.is_ai_processing) && (
                            <div className="mb-2 flex items-center gap-2">
                                {task.category && (
                                    <span className="inline-block px-2 py-0.5 bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 rounded text-[10px] font-bold uppercase tracking-wider">
                                        {task.category}
                                    </span>
                                )}
                                {task.is_ai_processing && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-full text-[10px] font-black tracking-widest animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)] border border-white/20">
                                        <Sparkles className="w-3 h-3" />
                                        AI AGENT WORKING
                                    </span>
                                )}
                            </div>
                        )}
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white mb-2 leading-snug">
                            {task.title}
                        </h3>
                        {task.description && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed mb-3">
                                {task.description}
                            </p>
                        )}
                        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700/80 pt-3 mt-1">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono font-medium text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-slate-900/80 px-2 py-1 rounded cursor-text">
                                    #{task.id.slice(0, 6)}
                                </span>
                                {task.comment_count ? (
                                    <span className="flex items-center gap-1 text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                                        <MessageSquare className="w-3 h-3" /> {task.comment_count}
                                    </span>
                                ) : null}
                            </div>
                            <span className="text-[11px] text-slate-500 font-medium">
                                {new Date(task.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', timeZone: 'Asia/Seoul' })}
                            </span>
                        </div>
                    </div>
                )}
            </Draggable>
        );
    };

    return (
        <>
            <div className="flex flex-col gap-6 w-full">

                {tasks.length === 0 ? (
                    <EmptyStateGuide phases={VIBE_PHASES} projectName={projectName} projectId={projectId} />
                ) : (
                    <>
                        {/* Vibe Coding Guide Banner */}
                        <div className="bg-gradient-to-r from-indigo-50 dark:from-indigo-900/20 to-purple-50 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-800/30 rounded-2xl overflow-hidden shadow-sm transition-all duration-300">
                            <button
                                onClick={() => setShowVibeGuide(!showVibeGuide)}
                                className="w-full flex items-center justify-between px-6 py-4 outline-none hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
                                        <Sparkles className="w-5 h-5" />
                                    </div>
                                    <div className="text-left flex flex-col">
                                        <h2 className="text-[15px] font-bold text-slate-800 dark:text-slate-100">
                                            초보자를 위한 바이브 코딩(Vibe Coding) 가이드
                                        </h2>
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                            AI와 함께 앱을 완성하기 위한 5단계 로드맵을 확인하세요
                                        </p>
                                    </div>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm text-slate-500 border border-slate-200 dark:border-slate-700 transition-transform duration-300">
                                    {showVibeGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </div>
                            </button>

                            {showVibeGuide && (
                                <div className="px-6 pb-6 pt-2 animate-in slide-in-from-top-4 fade-in duration-300">
                                    <div className="bg-white dark:bg-slate-900/50 rounded-xl p-5 border border-slate-200/60 dark:border-slate-800/60 shadow-inner">
                                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-5 leading-relaxed font-medium">
                                            바이브 코딩은 AI를 활용해 큰 그림부터 세부 코드까지 <b>순차적으로</b> 작업하는 개발 방법론입니다. 아래의 5가지 단계를 순서대로 진행하며, 한 단계의 태스크가 모두 <b>완료(Completed)</b> 되었을 때 다음 페이즈로 넘어가는 것을 권장합니다.
                                        </p>

                                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                                            {VIBE_PHASES.map((phase, idx) => (
                                                <div key={idx} className={`relative flex flex-col gap-2 p-4 rounded-xl border bg-gradient-to-b ${phase.color} ${phase.borderColor} `}>
                                                    <span className={`text-[11px] font-black uppercase tracking-wider ${phase.textColor} ${phase.bgBadge} w - fit px - 2 py - 0.5 rounded`}>
                                                        Phase {idx + 1}
                                                    </span>
                                                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 leading-tight">
                                                        {phase.id.replace(/^\d+\.\s*/, '')}
                                                    </h4>
                                                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                                                        {phase.description}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Category Progress Overview */}
                        {Object.keys(categoryStats).length > 0 && (
                            <div className="sticky top-0 z-40 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-md pt-4 pb-4 -mt-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 mb-6 border-b border-slate-200 dark:border-slate-800 shadow-sm transition-all">
                                <div className="flex items-center justify-between mb-3">
                                    <h2 className="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                                        <svg className="w-4 h-4 text-indigo-500 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                        </svg>
                                        Filter by Category
                                    </h2>
                                    {selectedCategory && (
                                        <button
                                            onClick={() => setSelectedCategory(null)}
                                            className="text-xs font-medium px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                        >
                                            Clear Filter ✕
                                        </button>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {Object.entries(categoryStats).map(([cat, stats]) => {
                                        const percent = stats.total === 0 ? 0 : Math.round((stats.done / stats.total) * 100);
                                        const isSelected = selectedCategory === cat;
                                        return (
                                            <button
                                                key={cat}
                                                onClick={() => setSelectedCategory(isSelected ? null : cat)}
                                                className={`relative flex items-center gap-3 px-4 py-2 rounded-full border text-sm transition-all duration-200 shadow-sm
                                        ${isSelected
                                                        ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-400 dark:border-indigo-500 ring-1 ring-indigo-400 dark:ring-indigo-500 text-indigo-700 dark:text-indigo-300'
                                                        : 'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                                                    } `}
                                            >
                                                <span className="font-semibold">{cat}</span>
                                                <div className="flex items-center gap-1.5 border-l border-slate-200 dark:border-slate-700 pl-3">
                                                    {/* Minimal Progress Ring */}
                                                    <div className="relative w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                                                        <div
                                                            className={`absolute bottom-0 left-0 right-0 transition-all duration-500 ${isSelected ? 'bg-indigo-500' : 'bg-emerald-500 dark:bg-emerald-600'} `}
                                                            style={{ height: `${percent}% ` }}
                                                        />
                                                    </div>
                                                    <span className={`text-xs font-medium ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'} `}>
                                                        {stats.done}/{stats.total}
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Sub-Header: Actions & View Mode Toggle */}
                        <div className="flex items-center justify-between px-4 sm:px-0 mb-2 w-full">
                            <button
                                onClick={() => {
                                    const title = window.prompt("Enter task title:", "New Task");
                                    if (title) {
                                        startTransition(() => {
                                            createTaskAction(projectId, title);
                                        });
                                    }
                                }}
                                disabled={isPending}
                                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Task
                            </button>

                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">View By:</span>
                                <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex inline-flex shadow-inner">
                                    <button
                                        onClick={() => setViewMode('status')}
                                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'status' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'} `}
                                    >
                                        Status
                                    </button>
                                    <button
                                        onClick={() => setViewMode('phase')}
                                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1 ${viewMode === 'phase' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'} `}
                                    >
                                        <Activity className="w-3.5 h-3.5" />
                                        Phase Swimlanes
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Board */}
                        {!isMounted ? null : (
                            <DragDropContext onDragEnd={onDragEnd}>
                                <div className="relative w-full">
                                    {isPending && (
                                        <div className="absolute inset-0 z-50 bg-white/10 dark:bg-slate-900/10 pointer-events-none rounded-2xl backdrop-blur-[1px]" />
                                    )}

                                    {viewMode === 'status' ? (
                                        /* STATUS VIEW (Original) */
                                        <div className="flex gap-6 overflow-x-auto pb-4 snap-x custom-scrollbar min-h-[500px] w-full">
                                            {columns.map(column => {
                                                const columnTasks = filteredTasks.filter(t => t.status === column.id);

                                                return (
                                                    <section key={column.id} className="snap-center shrink-0 flex flex-col w-80 md:w-[340px]">
                                                        <div className="sticky top-0 z-10 p-4 border border-slate-200 dark:border-slate-800/50 bg-slate-100/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-t-2xl flex items-center justify-between shadow-sm">
                                                            <div className="flex items-center gap-2">
                                                                <span className={`w-2.5 h-2.5 rounded-full ${column.color} shadow - sm dark: shadow - [0_0_8px_rgba(0, 0, 0, 0.5)]`}></span>
                                                                <h2 className={`font-bold tracking-wide text-sm ${column.text} `}>{column.label}</h2>
                                                            </div>
                                                            <span className="text-xs font-semibold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full shadow-sm">
                                                                {columnTasks.length}
                                                            </span>
                                                        </div>

                                                        <Droppable droppableId={column.id}>
                                                            {(provided, snapshot) => (
                                                                <div
                                                                    {...provided.droppableProps}
                                                                    ref={provided.innerRef}
                                                                    className={`flex flex-col pt-3 bg-slate-50/50 dark:bg-slate-900/20 px-3 pb-3 rounded-b-2xl border-x border-b border-slate-200 dark:border-slate-800/50 h-full min-h-[120px] transition-colors ${snapshot.isDraggingOver ? 'bg-slate-100/80 dark:bg-slate-800/40' : ''} `}
                                                                >
                                                                    {columnTasks.length === 0 && !snapshot.isDraggingOver ? (
                                                                        <div className="h-24 flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-800/80 rounded-xl bg-white/50 dark:bg-slate-800/20">
                                                                            <span className="text-sm text-slate-500 dark:text-slate-600 font-medium tracking-wide">Empty list</span>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex flex-col space-y-3">
                                                                            {columnTasks.map((task, index) => renderTaskCard(task, index))}
                                                                        </div>
                                                                    )}
                                                                    {provided.placeholder}
                                                                </div>
                                                            )}
                                                        </Droppable>
                                                    </section>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        /* PHASE SWIMLANES VIEW */
                                        <div className="flex flex-col gap-10 pb-10 min-w-max md:min-w-0">
                                            {[...VIBE_PHASES, { id: 'Unassigned', title: '분류되지 않음 (Unassigned)', description: '', criteria: '', borderColor: 'border-slate-200 dark:border-slate-800', textColor: 'text-slate-500', bgBadge: 'bg-slate-100 dark:bg-slate-800', color: '' }].map((phaseMeta) => {
                                                const phaseKey = phaseMeta.id;

                                                // Include tasks matching this phase. Treat empty or unlisted phrase as 'Unassigned'.
                                                const phaseTasks = filteredTasks.filter(t => {
                                                    if (phaseKey === 'Unassigned') {
                                                        return !t.phase || !PHASES.includes(t.phase);
                                                    }
                                                    return t.phase === phaseKey;
                                                });

                                                // Only show 'Unassigned' if there are tasks in it
                                                if (phaseKey === 'Unassigned' && phaseTasks.length === 0) return null;

                                                const doneCount = phaseTasks.filter(t => t.status === 'DONE').length;
                                                const totalCount = phaseTasks.length;
                                                const isPhaseComplete = totalCount > 0 && doneCount === totalCount;
                                                const percentComplete = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);

                                                return (
                                                    <div key={phaseKey} className={`bg-slate-50/30 dark:bg-slate-900/30 rounded-2xl border ${phaseMeta.borderColor} overflow - hidden shadow - sm relative transition - all duration - 300 ${isPhaseComplete ? 'ring-2 ring-emerald-400 dark:ring-emerald-500/50 shadow-emerald-500/10' : ''} `}>

                                                        {/* Swimlane Header */}
                                                        <div className={`bg-gradient-to-r ${phaseKey !== 'Unassigned' ? 'from-white dark:from-slate-900/90 to-slate-50 dark:to-slate-800/50' : 'bg-slate-100/80 dark:bg-slate-800/50'} px - 6 py - 5 border - b border - slate - 200 dark: border - slate - 800 / 60 flex flex - col md: flex - row md: items - center justify - between gap - 4`}>

                                                            <div className="flex-1 flex flex-col gap-2 relative z-10">
                                                                <div className="flex items-center gap-3">
                                                                    <h3 className={`text-lg font-extrabold ${phaseKey !== 'Unassigned' ? phaseMeta.textColor : 'text-slate-800 dark:text-slate-200'} flex items - center gap - 2 tracking - tight`}>
                                                                        {phaseKey !== 'Unassigned' ? <Map className="w-5 h-5 opacity-80" /> : <Activity className="w-5 h-5 opacity-50" />}
                                                                        {phaseMeta.title}
                                                                    </h3>
                                                                    <span className="text-xs font-semibold bg-white dark:bg-slate-950 text-slate-500 px-2.5 py-1 rounded-full shadow-sm border border-slate-200 dark:border-slate-800">
                                                                        총 {totalCount} 태스크
                                                                    </span>
                                                                    {isPhaseComplete && phaseKey !== 'Unassigned' && (
                                                                        <span className="flex items-center gap-1 text-[11px] font-bold text-white bg-emerald-500 px-2.5 py-1 rounded-full shadow-md animate-in zoom-in slide-in-from-left-4 duration-500">
                                                                            <CheckCircle2 className="w-3.5 h-3.5" /> 다음 단계로 이동 가능!
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {phaseKey !== 'Unassigned' && (
                                                                    <div className="flex flex-col gap-1 mt-1">
                                                                        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                                                                            <b className="font-semibold text-slate-700 dark:text-slate-300">목표: </b>{phaseMeta.description}
                                                                        </p>
                                                                        <p className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 font-medium mt-1 bg-indigo-50 dark:bg-indigo-900/20 w-fit px-2 py-1 rounded-md border border-indigo-100 dark:border-indigo-800">
                                                                            <Target className="w-3.5 h-3.5" /> <b>완료 조건:</b> {phaseMeta.criteria}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Progress Indicator */}
                                                            {phaseKey !== 'Unassigned' && totalCount > 0 && (
                                                                <div className="w-full md:w-56 shrink-0 flex flex-col gap-2">
                                                                    <div className="flex items-end justify-between text-sm">
                                                                        <span className="font-bold text-slate-700 dark:text-slate-300">Phase 진척도</span>
                                                                        <span className={`font-mono font-bold ${isPhaseComplete ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'} `}>{percentComplete}%</span>
                                                                    </div>
                                                                    <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                                                        <div
                                                                            className={`h-full rounded-full transition-all duration-1000 ease-out ${isPhaseComplete ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-gradient-to-r ' + phaseMeta.color.split(' ')[0] + ' to-' + phaseMeta.color.split(' ')[0].replace('10', '40')} bg - opacity - 100`}
                                                                            style={{ width: `${percentComplete}% ` }}
                                                                        />
                                                                    </div>
                                                                    <span className="text-[10px] text-right text-slate-400 font-medium tracking-wide">
                                                                        {doneCount} / {totalCount} 완료됨
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Swimlane Columns */}
                                                        <div className="flex gap-4 p-4 overflow-x-auto min-h-[160px]">
                                                            {columns.map(column => {
                                                                const columnTasks = phaseTasks.filter(t => t.status === column.id);
                                                                const droppableId = `${phaseKey}::${column.id} `;

                                                                return (
                                                                    <div key={column.id} className="flex-1 shrink-0 min-w-[280px] max-w-sm flex flex-col">
                                                                        <div className="flex items-center justify-between mb-2 px-1">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className={`w-2 h-2 rounded-full ${column.color} `}></span>
                                                                                <span className={`text-xs font-semibold ${column.text} `}>{column.label}</span>
                                                                            </div>
                                                                            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{columnTasks.length}</span>
                                                                        </div>

                                                                        <Droppable droppableId={droppableId}>
                                                                            {(provided, snapshot) => (
                                                                                <div
                                                                                    {...provided.droppableProps}
                                                                                    ref={provided.innerRef}
                                                                                    className={`flex-1 flex flex-col rounded-xl border border-transparent transition-colors p-2 space-y-3
                                                                                ${snapshot.isDraggingOver ? 'bg-indigo-50/50 border-indigo-200/50 dark:bg-indigo-900/10 dark:border-indigo-500/30' : 'bg-slate-100/30 dark:bg-slate-800/20'} `}
                                                                                >
                                                                                    {columnTasks.length === 0 && !snapshot.isDraggingOver && (
                                                                                        <div className="h-full min-h-[80px] flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                                                                                            <span className="text-xs text-slate-400">Empty</span>
                                                                                        </div>
                                                                                    )}

                                                                                    {columnTasks.map((task, index) => renderTaskCard(task, index))}
                                                                                    {provided.placeholder}
                                                                                </div>
                                                                            )}
                                                                        </Droppable>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </DragDropContext>
                        )}
                    </>
                )}
            </div>

            {/* Task Details Modal */}
            {selectedTaskDetails && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md transition-opacity">
                    <div
                        className="absolute inset-0"
                        onClick={() => setSelectedTaskDetails(null)}
                    ></div>

                    <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-200 dark:border-slate-800 flex flex-col h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                        {/* Header - Simple and Clean */}
                        <div className="flex items-start justify-between p-6 md:p-8 border-b border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900/80 backdrop-blur-sm z-10 shrink-0">
                            <div className="pr-8 flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="flex items-center gap-2 font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">
                                        <Hash className="w-3.5 h-3.5 text-indigo-400" />
                                        {selectedTaskDetails.id.slice(0, 8)}
                                    </div>
                                    {selectedTaskDetails.category && (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 rounded text-[11px] font-bold uppercase tracking-wide border border-indigo-200 dark:border-indigo-500/20">
                                            {selectedTaskDetails.category}
                                        </span>
                                    )}
                                    {selectedTaskDetails.is_ai_processing && (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded text-[11px] font-bold shadow-md animate-pulse">
                                            <Sparkles className="w-3.5 h-3.5" />
                                            ✨ AI가 작업을 처리하고 있습니다...
                                        </span>
                                    )}
                                </div>
                                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                                    {selectedTaskDetails.title}
                                </h2>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setIsEditingDetails(!isEditingDetails)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${isEditingDetails ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'} shadow - sm`}
                                >
                                    {isEditingDetails ? <><CheckCircle2 className="w-4 h-4" /> Editing</> : <><Edit2 className="w-4 h-4" /> Edit Content</>}
                                </button>
                                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>
                                <button
                                    onClick={() => setSelectedTaskDetails(null)}
                                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Two Column Body */}
                        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                            {/* Main Content (Left) */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 bg-white dark:bg-slate-900">
                                <div className="flex flex-col gap-6 max-w-3xl pb-10">

                                    {isEditingDetails ? (
                                        // --- EDIT MODE ---
                                        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            {/* Work Context (Edit) */}
                                            <div className="flex flex-col gap-3">
                                                <label className="text-sm font-bold text-amber-700 dark:text-amber-500 flex items-center gap-2">
                                                    <Activity className="w-4 h-4" />
                                                    Work Context
                                                </label>
                                                <textarea
                                                    value={editForm.description}
                                                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                                    className="w-full min-h-[200px] p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-900/10 text-slate-700 dark:text-slate-200 focus:bg-amber-50 dark:focus:bg-amber-900/20 focus:ring-2 focus:ring-amber-500/50 outline-none text-[15px] leading-relaxed transition-all placeholder:text-amber-700/30 dark:placeholder:text-amber-500/30 font-sans"
                                                    placeholder="Task instructions, context, current state, or code references..."
                                                />
                                            </div>

                                            {/* Resolution (Edit) */}
                                            <div className="flex flex-col gap-3">
                                                <label className="text-sm font-bold text-emerald-700 dark:text-emerald-500 flex items-center gap-2">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    Resolution
                                                </label>
                                                <textarea
                                                    value={editForm.afterWork}
                                                    onChange={(e) => setEditForm(prev => ({ ...prev, afterWork: e.target.value }))}
                                                    className="w-full min-h-[200px] p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-900/10 text-slate-700 dark:text-slate-200 focus:bg-emerald-50 dark:focus:bg-emerald-900/20 focus:ring-2 focus:ring-emerald-500/50 outline-none text-[15px] leading-relaxed transition-all placeholder:text-emerald-700/30 dark:placeholder:text-emerald-500/30 font-sans"
                                                    placeholder="How the task instructions were carried out, implemented changes, PR links, or resolution notes..."
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        // --- VIEW MODE (TICKET TIMELINE) ---
                                        <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 flex flex-col gap-10 font-sans mt-2 animate-in fade-in duration-300">
                                            {/* Work Context Entry */}
                                            <div className="relative">
                                                <div className="absolute -left-[33px] top-1 w-4 h-4 rounded-full bg-amber-100 dark:bg-amber-900/50 ring-4 ring-white dark:ring-slate-900 flex items-center justify-center">
                                                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                                </div>
                                                <div className="flex flex-col gap-3 group">
                                                    <h3 className="text-sm font-bold text-amber-700 dark:text-amber-500 tracking-wider">Work Context</h3>
                                                    {editForm.description ? (
                                                        <details className="bg-amber-50/50 dark:bg-amber-900/10 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/30 group/details open:bg-amber-50 dark:open:bg-amber-900/20 transition-colors shadow-sm" open>
                                                            <summary className="text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer list-none flex items-center justify-between outline-none">
                                                                <span className="flex items-center gap-2">Click to expand context <span className="text-xs font-normal text-slate-500">({editForm.description.length} characters)</span></span>
                                                                <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center group-open/details:rotate-180 transition-transform">
                                                                    <svg className="w-4 h-4 text-amber-700 dark:text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                                                </div>
                                                            </summary>
                                                            <div className="mt-4 pt-4 border-t border-amber-200/50 dark:border-amber-800/50 prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed font-sans overflow-auto max-h-[500px] custom-scrollbar">
                                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{editForm.description}</ReactMarkdown>
                                                            </div>
                                                        </details>
                                                    ) : (
                                                        <p className="text-sm text-slate-400 italic">No work context provided. Click <button onClick={() => setIsEditingDetails(true)} className="text-indigo-500 hover:underline">Edit Content</button> to add instructions and context.</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Resolution Entry */}
                                            <div className="relative">
                                                <div className="absolute -left-[33px] top-1 w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900/50 ring-4 ring-white dark:ring-slate-900 flex items-center justify-center">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                                </div>
                                                <div className="flex flex-col gap-3 group">
                                                    <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-500 tracking-wider">Resolution</h3>
                                                    {editForm.afterWork ? (
                                                        <details className="bg-emerald-50/50 dark:bg-emerald-900/10 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 group/details open:bg-emerald-50 dark:open:bg-emerald-900/20 transition-colors shadow-sm" open>
                                                            <summary className="text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer list-none flex items-center justify-between outline-none">
                                                                <span className="flex items-center gap-2">Click to expand resolution <span className="text-xs font-normal text-slate-500">({editForm.afterWork.length} characters)</span></span>
                                                                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center group-open/details:rotate-180 transition-transform">
                                                                    <svg className="w-4 h-4 text-emerald-700 dark:text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                                                </div>
                                                            </summary>
                                                            <div className="mt-4 pt-4 border-t border-emerald-200/50 dark:border-emerald-800/50 prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed font-sans overflow-auto max-h-[500px] custom-scrollbar">
                                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{editForm.afterWork}</ReactMarkdown>
                                                            </div>
                                                        </details>
                                                    ) : (
                                                        <p className="text-sm text-slate-400 italic">No resolution provided.</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Comments Section */}
                                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                                        <TaskComments taskId={selectedTaskDetails.id} />
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar / Metadata (Right) */}
                            <div className="w-full md:w-72 lg:w-80 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 bg-slate-50 flex flex-col items-stretch 
  dark:bg-[color-mix(in_oklab,currentColor_10%,transparent)] shrink-0 overflow-y-auto custom-scrollbar">
                                <div className="p-6 flex flex-col gap-8 h-full">

                                    {/* Action Buttons */}
                                    <div className="flex flex-col gap-3">
                                        <button
                                            className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 group"
                                            onClick={async () => {
                                                setIsSaving(true);
                                                await saveTaskDetails(projectId, selectedTaskDetails.id, editForm.description, editForm.beforeWork, editForm.afterWork, editForm.phase, editForm.taskType, editForm.scale);
                                                setSelectedTaskDetails({
                                                    ...selectedTaskDetails,
                                                    description: editForm.description,
                                                    before_work: editForm.beforeWork,
                                                    after_work: editForm.afterWork,
                                                    phase: editForm.phase,
                                                    task_type: editForm.taskType,
                                                    scale: editForm.scale
                                                });
                                                setTasks(prev => prev.map(t => t.id === selectedTaskDetails.id ? {
                                                    ...t,
                                                    description: editForm.description,
                                                    before_work: editForm.beforeWork,
                                                    after_work: editForm.afterWork,
                                                    phase: editForm.phase,
                                                    task_type: editForm.taskType,
                                                    scale: editForm.scale
                                                } : t));
                                                setIsSaving(false);
                                            }}
                                            disabled={isSaving}
                                        >
                                            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                                            Save Changes
                                        </button>

                                        {/* MCP Sync Button */}
                                        <button
                                            className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed group relative overflow-hidden"
                                            onClick={async () => {
                                                if (isSyncing) return;
                                                setIsSyncing(true);
                                                setSyncResult(null);

                                                try {
                                                    const freshTask = await syncTaskFromDb(selectedTaskDetails.id);
                                                    if (freshTask) {
                                                        setEditForm({
                                                            description: freshTask.description || '',
                                                            beforeWork: freshTask.before_work || '',
                                                            afterWork: freshTask.after_work || '',
                                                            phase: freshTask.phase || '',
                                                            taskType: freshTask.task_type || '',
                                                            scale: freshTask.scale || ''
                                                        });
                                                        setSelectedTaskDetails({
                                                            ...freshTask,
                                                            status: freshTask.status // Make sure dropdown aligns
                                                        });
                                                        setTasks(prev => prev.map(t => t.id === freshTask.id ? freshTask : t));
                                                        setSyncResult({ type: 'success', message: '데이터 동기화 완료!' });
                                                    } else {
                                                        setSyncResult({ type: 'error', message: '동기화 오류: 해당 태스크가 없습니다.' });
                                                    }
                                                } catch (err: any) {
                                                    setSyncResult({ type: 'error', message: '동기화 중 오류가 발생했습니다.' });
                                                    console.error('Sync error', err);
                                                } finally {
                                                    setIsSyncing(false);
                                                }
                                            }}
                                            disabled={isSyncing}
                                        >
                                            {isSyncing ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    <span>Syncing...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                    <span>Sync from DB</span>
                                                </>
                                            )}
                                            {isSyncing && (
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_1.5s_infinite] pointer-events-none" />
                                            )}
                                        </button>

                                        {/* Sync Result Toast */}
                                        {syncResult && (
                                            <div className={`flex items-start gap-2 p-3 rounded-xl text-xs font-medium animate -in fade -in slide -in -from-top-2 duration-300 ${syncResult.type === 'success'
                                                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                                : syncResult.type === 'error'
                                                    ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                                                    : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                                                } `}>
                                                {syncResult.type === 'success' ? (
                                                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                                                ) : syncResult.type === 'error' ? (
                                                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                                ) : (
                                                    <Activity className="w-4 h-4 shrink-0 mt-0.5 animate-pulse" />
                                                )}
                                                <span className="leading-relaxed">{syncResult.message}</span>
                                            </div>
                                        )}

                                        <p className="text-xs text-center text-slate-500 dark:text-slate-400 font-medium">
                                            Auto-saved when modified via MCP
                                        </p>
                                    </div>

                                    {/* Status Change */}
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Status</h4>
                                        <div className="relative group/status flex">
                                            <select
                                                value={selectedTaskDetails.status}
                                                onChange={(e) => {
                                                    const newStatus = e.target.value as 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
                                                    startTransition(() => {
                                                        setTaskStatus(projectId, selectedTaskDetails.id, newStatus);
                                                        setTasks(prev => prev.map(t => t.id === selectedTaskDetails.id ? { ...t, status: newStatus } : t));
                                                        setSelectedTaskDetails({ ...selectedTaskDetails, status: newStatus });
                                                    });
                                                }}
                                                className={`w-full appearance-none flex items-center gap-2 pl-3 pr-8 py-2.5 rounded-xl text-sm font-bold border-2 cursor-pointer shadow-sm focus: outline-none focus: ring-2 focus: ring-indigo-500 transition-colors 
                                                    ${selectedTaskDetails.status === 'TODO' ? 'bg-slate-100 border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200' :
                                                        selectedTaskDetails.status === 'IN_PROGRESS' ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300' :
                                                            selectedTaskDetails.status === 'REVIEW' ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-300' :
                                                                'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-300'
                                                    }
`}
                                            >
                                                {columns.map(c => (
                                                    <option key={c.id} value={c.id}>{c.label}</option>
                                                ))}
                                            </select>
                                            <Activity className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>


                                    {/* Metadata Timeline */}
                                    <div className="flex-1">
                                        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Timeline</h4>
                                        <div className="relative pl-3 border-l-2 border-slate-200 dark:border-slate-700 flex flex-col gap-6">

                                            {/* Created */}
                                            <div className="relative">
                                                <div className="absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600 ring-4 ring-slate-50 dark:ring-slate-900" />
                                                <div className="flex flex-col gap-1 text-sm">
                                                    <span className="font-semibold text-slate-700 dark:text-slate-300">Created</span>
                                                    <span className="text-slate-500 dark:text-slate-400 text-xs">
                                                        {new Date(selectedTaskDetails.created_at).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Seoul' })}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Started */}
                                            <div className={`relative ${!selectedTaskDetails.started_at ? 'opacity-40 grayscale' : ''} `}>
                                                <div className={`absolute-left-[17px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-slate-50 dark:ring-slate-900 ${selectedTaskDetails.started_at ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'} `} />
                                                <div className="flex flex-col gap-1 text-sm">
                                                    <span className={`font-semibold ${selectedTaskDetails.started_at ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'} `}>Started</span>
                                                    <span className="text-slate-500 dark:text-slate-400 text-xs text-balance">
                                                        {selectedTaskDetails.started_at
                                                            ? new Date(selectedTaskDetails.started_at).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Seoul' })
                                                            : 'Not started yet'
                                                        }
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Completed */}
                                            <div className={`relative ${!selectedTaskDetails.completed_at ? 'opacity-40 grayscale' : ''} `}>
                                                <div className={`absolute-left-[17px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-slate-50 dark:ring-slate-900 ${selectedTaskDetails.completed_at ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'} `} />
                                                <div className="flex flex-col gap-1 text-sm">
                                                    <span className={`font-semibold ${selectedTaskDetails.completed_at ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'} `}>Completed</span>
                                                    <span className="text-slate-500 dark:text-slate-400 text-xs text-balance">
                                                        {selectedTaskDetails.completed_at
                                                            ? new Date(selectedTaskDetails.completed_at).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Seoul' })
                                                            : 'Not completed yet'
                                                        }
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Updated By */}
                                            {selectedTaskDetails.updated_by && (
                                                <div className="relative">
                                                    <div className="absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-slate-50 dark:ring-slate-900 bg-indigo-500" />
                                                    <div className="flex flex-col gap-1 text-sm">
                                                        <span className="font-semibold text-indigo-700 dark:text-indigo-400">Last Updated By</span>
                                                        <span className="text-slate-500 dark:text-slate-400 text-xs text-balance">
                                                            {selectedTaskDetails.updated_by}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
