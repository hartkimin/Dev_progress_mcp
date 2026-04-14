'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Task } from '@/lib/db';
import { X, Calendar, Tag, Hash, Activity, Clock, Loader2, Edit2, Save, MessageSquare, CheckCircle2, Sparkles, AlertCircle, Info, ChevronDown, ChevronUp, Target, BookOpen, Copy, Check, Trash2 } from 'lucide-react';
import { setTaskStatus, saveTaskDetails, syncTaskFromDb, createTaskAction, deleteTaskAction, getTaskHistoryAction, saveTaskWorkByStatus } from './actions';
import { TaskComments } from './TaskComments';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { TaskStatusHistoryEntry } from '@/lib/db';
import {
    TASK_DESCRIPTION_TEMPLATE,
    TASK_AFTER_WORK_TEMPLATE,
    WORK_TEMPLATES,
    isTemplateEmpty,
    formatDuration,
    diffMs,
} from '@/lib/taskTemplates';

type WorkStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';

const WORK_STATUSES: WorkStatus[] = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];

const STATUS_TAB_META: Record<WorkStatus, { label: string; accent: string; bg: string; text: string; ring: string }> = {
    TODO:        { label: 'TODO',        accent: 'bg-slate-500',   bg: 'bg-slate-50 dark:bg-slate-900/40',       text: 'text-slate-700 dark:text-slate-200',     ring: 'ring-slate-400/40' },
    IN_PROGRESS: { label: 'IN_PROGRESS', accent: 'bg-blue-500',    bg: 'bg-blue-50/60 dark:bg-blue-900/20',      text: 'text-blue-700 dark:text-blue-300',       ring: 'ring-blue-400/40' },
    REVIEW:      { label: 'REVIEW',      accent: 'bg-amber-500',   bg: 'bg-amber-50/60 dark:bg-amber-900/20',    text: 'text-amber-700 dark:text-amber-300',     ring: 'ring-amber-400/40' },
    DONE:        { label: 'DONE',        accent: 'bg-emerald-500', bg: 'bg-emerald-50/60 dark:bg-emerald-900/20',text: 'text-emerald-700 dark:text-emerald-300', ring: 'ring-emerald-400/40' },
};

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
    const [editForm, setEditForm] = useState({ description: '', beforeWork: '', afterWork: '', phase: '', taskType: '', scale: '', workTodo: '', workInProgress: '', workReview: '', workDone: '' });
    const [activeWorkTab, setActiveWorkTab] = useState<WorkStatus>('TODO');
    const [statusHistory, setStatusHistory] = useState<TaskStatusHistoryEntry[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncResult, setSyncResult] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);
    const [showAddTask, setShowAddTask] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');


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

        const newStatus = destination.droppableId as 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
        const prevStatus = source.droppableId as 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';

        // Optimistic UI update
        setTasks(prev => prev.map(t => t.id === draggableId ? { ...t, status: newStatus } : t));

        // Server Action — 실패 시 롤백 + 토스트
        startTransition(async () => {
            try {
                await setTaskStatus(projectId, draggableId, newStatus);
                if (selectedTaskDetails?.id === draggableId) {
                    getTaskHistoryAction(draggableId).then(h => setStatusHistory(h || [])).catch(() => {});
                    setSelectedTaskDetails(prev => prev ? { ...prev, status: newStatus } : prev);
                    setActiveWorkTab(newStatus);
                }
            } catch (err: any) {
                // 롤백
                setTasks(prev => prev.map(t => t.id === draggableId ? { ...t, status: prevStatus } : t));
                const msg = (err?.message || '').includes('Server Action')
                    ? '페이지를 새로고침하세요 (배포가 갱신되었습니다).'
                    : '상태 변경 실패';
                setSyncResult({ type: 'error', message: msg });
                setTimeout(() => setSyncResult(null), 4000);
            }
        });
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
                                    description: isTemplateEmpty(task.description) ? TASK_DESCRIPTION_TEMPLATE : task.description || '',
                                    beforeWork: task.before_work || '',
                                    afterWork: isTemplateEmpty(task.after_work) ? TASK_AFTER_WORK_TEMPLATE : task.after_work || '',
                                    phase: task.phase || '',
                                    taskType: task.task_type || '',
                                    scale: task.scale || '',
                                    workTodo: task.work_todo || '',
                                    workInProgress: task.work_in_progress || '',
                                    workReview: task.work_review || '',
                                    workDone: task.work_done || ''
                                });
                                setActiveWorkTab(task.status as WorkStatus);
                                setStatusHistory([]);
                                getTaskHistoryAction(task.id).then(h => setStatusHistory(h || [])).catch(() => {});
                                setIsEditingDetails(false);
                            }
                        }}
                        className={`bg-white dark:bg-slate-800/90 border cursor-pointer ${isPulse && !snapshot.isDragging ? 'border-blue-400 dark:border-blue-500/70 ring-2 ring-blue-400/30 dark:ring-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.3)] dark:shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]' : 'border-slate-200 dark:border-slate-700/80 hover:border-slate-300 shadow-sm dark:shadow-none hover:shadow-md'} p-4 rounded-xl transition-all group duration-200 overflow-hidden ${snapshot.isDragging ? 'rotate-2 scale-105 shadow-xl ring-2 ring-indigo-500/50 z-[100]' : ''}`}
                        style={provided.draggableProps.style}
                    >
                        {(task.category || task.is_ai_processing || task.task_type) && (
                            <div className="mb-2 flex items-center gap-2 flex-wrap">
                                {task.category && (
                                    <span className="inline-block px-2 py-0.5 bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 rounded text-[10px] font-bold uppercase tracking-wider">
                                        {task.category}
                                    </span>
                                )}
                                {task.task_type && (
                                    <span className="inline-block px-2 py-0.5 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 rounded text-[10px] font-bold tracking-wider">
                                        {task.task_type}
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
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white mb-2 leading-snug line-clamp-2">
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
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] text-slate-500 font-medium">
                                    {new Date(task.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', timeZone: 'Asia/Seoul' })}
                                </span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm('이 태스크를 삭제하시겠습니까?')) {
                                            startTransition(async () => {
                                                await deleteTaskAction(projectId, task.id);
                                            });
                                        }
                                    }}
                                    className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                                    title="태스크 삭제"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
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
                    <EmptyStateGuide phases={[]} projectName={projectName} projectId={projectId} />
                ) : (
                    <>


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

                        {/* Sub-Header: Actions */}
                        <div className="flex items-center justify-between px-4 sm:px-0 mb-2 w-full">
                            {showAddTask ? (
                                <form
                                    className="flex items-center gap-2"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        if (newTaskTitle.trim()) {
                                            startTransition(async () => {
                                                await createTaskAction(projectId, newTaskTitle.trim(), '수동');
                                                setNewTaskTitle('');
                                                setShowAddTask(false);
                                            });
                                        }
                                    }}
                                >
                                    <input
                                        type="text"
                                        autoFocus
                                        value={newTaskTitle}
                                        onChange={(e) => setNewTaskTitle(e.target.value)}
                                        placeholder="태스크 제목 입력..."
                                        className="px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isPending || !newTaskTitle.trim()}
                                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
                                    >
                                        추가
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setShowAddTask(false); setNewTaskTitle(''); }}
                                        className="px-3 py-1.5 text-slate-500 hover:text-slate-700 text-sm font-medium rounded-lg transition-colors"
                                    >
                                        취소
                                    </button>
                                </form>
                            ) : (
                                <button
                                    onClick={() => setShowAddTask(true)}
                                    disabled={isPending}
                                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add Task
                                </button>
                            )}
                        </div>

                        {/* Board */}
                        {!isMounted ? null : (
                            <DragDropContext onDragEnd={onDragEnd}>
                                <div className="relative w-full">
                                    {isPending && (
                                        <div className="absolute inset-0 z-50 bg-white/10 dark:bg-slate-900/10 pointer-events-none rounded-2xl backdrop-blur-[1px]" />
                                    )}

                                    <div className="flex gap-6 overflow-x-auto pb-4 snap-x custom-scrollbar min-h-[500px] w-full">
                                        {columns.map(column => {
                                            const columnTasks = filteredTasks.filter(t => t.status === column.id);

                                            return (
                                                <section key={column.id} className="snap-center shrink-0 flex flex-col w-80 md:w-[340px]">
                                                    <div className="sticky top-0 z-10 p-4 border border-slate-200 dark:border-slate-800/50 bg-slate-100/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-t-2xl flex items-center justify-between shadow-sm">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`w-2.5 h-2.5 rounded-full ${column.color} shadow-sm`}></span>
                                                            <h2 className={`font-bold tracking-wide text-sm ${column.text}`}>{column.label}</h2>
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
                                                                className={`flex flex-col pt-3 bg-slate-50/50 dark:bg-slate-900/20 px-3 pb-3 rounded-b-2xl border-x border-b border-slate-200 dark:border-slate-800/50 h-full min-h-[120px] transition-colors ${snapshot.isDraggingOver ? 'bg-slate-100/80 dark:bg-slate-800/40' : ''}`}
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
                                    {isEditingDetails ? <><CheckCircle2 className="w-4 h-4" /> 수정 중</> : <><Edit2 className="w-4 h-4" /> 내용 수정</>}
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

                                    {/* Status-Tab Work Log */}
                                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                                <Activity className="w-4 h-4 text-indigo-500" />
                                                상태별 작업 내용 (탭)
                                            </h3>
                                            <span className="text-[11px] font-medium text-slate-400">현재 상태: {selectedTaskDetails.status}</span>
                                        </div>

                                        {/* Tabs header */}
                                        <div className="flex flex-wrap gap-1 mb-3 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl w-fit">
                                            {WORK_STATUSES.map(s => {
                                                const active = activeWorkTab === s;
                                                const meta = STATUS_TAB_META[s];
                                                const key = s === 'TODO' ? 'workTodo' : s === 'IN_PROGRESS' ? 'workInProgress' : s === 'REVIEW' ? 'workReview' : 'workDone';
                                                const hasContent = !isTemplateEmpty((editForm as any)[key]);
                                                const currentStatus = selectedTaskDetails.status as WorkStatus;
                                                const isCurrent = s === currentStatus;
                                                const currentIdx = WORK_STATUSES.indexOf(currentStatus);
                                                const thisIdx = WORK_STATUSES.indexOf(s);
                                                const isFuture = thisIdx > currentIdx;
                                                return (
                                                    <button
                                                        key={s}
                                                        onClick={() => setActiveWorkTab(s)}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${active ? `bg-white dark:bg-slate-900 shadow-sm ring-1 ${meta.ring} ${meta.text}` : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'} ${isFuture && !active ? 'opacity-50' : ''}`}
                                                    >
                                                        <span className={`w-1.5 h-1.5 rounded-full ${meta.accent}`} />
                                                        {meta.label}
                                                        {isCurrent && (
                                                            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${meta.accent} text-white`}>
                                                                현재
                                                            </span>
                                                        )}
                                                        {hasContent && <span className={`ml-0.5 w-1 h-1 rounded-full ${active ? meta.accent : 'bg-slate-400'}`} />}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Prior-stage context (read-only, collapsed) */}
                                        {(() => {
                                            const activeIdx = WORK_STATUSES.indexOf(activeWorkTab);
                                            if (activeIdx === 0) return null;
                                            const priorStages = WORK_STATUSES.slice(0, activeIdx);
                                            const stageKey = (s: WorkStatus) =>
                                                s === 'TODO' ? 'workTodo' : s === 'IN_PROGRESS' ? 'workInProgress' : s === 'REVIEW' ? 'workReview' : 'workDone';
                                            const nonEmpty = priorStages.filter((s) => !isTemplateEmpty((editForm as any)[stageKey(s)]));
                                            if (!nonEmpty.length) return null;
                                            return (
                                                <div className="mb-3 flex flex-col gap-1.5">
                                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">이전 단계 기록</p>
                                                    {nonEmpty.map((s) => {
                                                        const meta = STATUS_TAB_META[s];
                                                        const val = (editForm as any)[stageKey(s)] as string;
                                                        return (
                                                            <details key={s} className={`rounded-lg border border-slate-200 dark:border-slate-700 ${meta.bg}`}>
                                                                <summary className="cursor-pointer list-none flex items-center gap-2 px-3 py-2 text-xs font-semibold">
                                                                    <span className={`w-1.5 h-1.5 rounded-full ${meta.accent}`} />
                                                                    <span className={meta.text}>{meta.label}</span>
                                                                    <span className="text-slate-400 ml-1">({val.length}자)</span>
                                                                    <span className="ml-auto text-slate-400">▸ 펼치기</span>
                                                                </summary>
                                                                <div className="px-3 pb-3 prose prose-sm dark:prose-invert max-w-none leading-relaxed overflow-auto max-h-72 custom-scrollbar">
                                                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{val}</ReactMarkdown>
                                                                </div>
                                                            </details>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })()}

                                        {/* Tab panel */}
                                        {(() => {
                                            const tabKey = activeWorkTab === 'TODO' ? 'workTodo' : activeWorkTab === 'IN_PROGRESS' ? 'workInProgress' : activeWorkTab === 'REVIEW' ? 'workReview' : 'workDone';
                                            const value = (editForm as any)[tabKey] as string;
                                            const meta = STATUS_TAB_META[activeWorkTab];
                                            const setValue = (v: string) => setEditForm(prev => ({ ...prev, [tabKey]: v }));
                                            const applyTemplate = () => setValue(WORK_TEMPLATES[activeWorkTab]);

                                            if (isEditingDetails) {
                                                return (
                                                    <div className="flex flex-col gap-2">
                                                        <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                                            <span>{meta.label} 단계에서 수행한 상세 내역을 기록하세요</span>
                                                            <button onClick={applyTemplate} className="text-indigo-600 dark:text-indigo-400 hover:underline">템플릿 삽입</button>
                                                        </div>
                                                        <textarea
                                                            value={value}
                                                            onChange={(e) => setValue(e.target.value)}
                                                            onFocus={() => { if (!value) applyTemplate(); }}
                                                            className={`w-full min-h-[200px] p-4 rounded-xl border border-slate-200 dark:border-slate-700 ${meta.bg} text-slate-700 dark:text-slate-200 focus:ring-2 focus:${meta.ring} outline-none text-[15px] leading-relaxed transition-all font-sans`}
                                                            placeholder={`${meta.label} 단계 수행 내역 (비워두고 포커스하면 템플릿 자동 삽입)`}
                                                        />
                                                    </div>
                                                );
                                            }
                                            if (isTemplateEmpty(value)) {
                                                return (
                                                    <div className={`p-5 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 ${meta.bg}`}>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                                                            {meta.label} 단계 기록이 아직 비어있습니다. 편집 모드로 전환하면 템플릿이 자동으로 표시됩니다.
                                                        </p>
                                                    </div>
                                                );
                                            }
                                            return (
                                                <div className={`p-5 rounded-2xl border border-slate-200 dark:border-slate-700 ${meta.bg} prose prose-sm dark:prose-invert max-w-none leading-relaxed overflow-auto max-h-[500px] custom-scrollbar`}>
                                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
                                                </div>
                                            );
                                        })()}
                                    </div>

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
                                                await saveTaskWorkByStatus(projectId, selectedTaskDetails.id, {
                                                    workTodo: editForm.workTodo,
                                                    workInProgress: editForm.workInProgress,
                                                    workReview: editForm.workReview,
                                                    workDone: editForm.workDone,
                                                });
                                                setSelectedTaskDetails({
                                                    ...selectedTaskDetails,
                                                    description: editForm.description,
                                                    before_work: editForm.beforeWork,
                                                    after_work: editForm.afterWork,
                                                    phase: editForm.phase,
                                                    task_type: editForm.taskType,
                                                    scale: editForm.scale,
                                                    work_todo: editForm.workTodo,
                                                    work_in_progress: editForm.workInProgress,
                                                    work_review: editForm.workReview,
                                                    work_done: editForm.workDone
                                                });
                                                setTasks(prev => prev.map(t => t.id === selectedTaskDetails.id ? {
                                                    ...t,
                                                    description: editForm.description,
                                                    before_work: editForm.beforeWork,
                                                    after_work: editForm.afterWork,
                                                    phase: editForm.phase,
                                                    task_type: editForm.taskType,
                                                    scale: editForm.scale,
                                                    work_todo: editForm.workTodo,
                                                    work_in_progress: editForm.workInProgress,
                                                    work_review: editForm.workReview,
                                                    work_done: editForm.workDone
                                                } : t));
                                                setIsSaving(false);
                                            }}
                                            disabled={isSaving}
                                        >
                                            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                                            변경사항 저장
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
                                                            description: isTemplateEmpty(freshTask.description) ? TASK_DESCRIPTION_TEMPLATE : freshTask.description || '',
                                                            beforeWork: freshTask.before_work || '',
                                                            afterWork: isTemplateEmpty(freshTask.after_work) ? TASK_AFTER_WORK_TEMPLATE : freshTask.after_work || '',
                                                            phase: freshTask.phase || '',
                                                            taskType: freshTask.task_type || '',
                                                            scale: freshTask.scale || '',
                                                            workTodo: freshTask.work_todo || '',
                                                            workInProgress: freshTask.work_in_progress || '',
                                                            workReview: freshTask.work_review || '',
                                                            workDone: freshTask.work_done || ''
                                                        });
                                                        getTaskHistoryAction(freshTask.id).then(h => setStatusHistory(h || [])).catch(() => {});
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
                                                    <span>동기화 중...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                    <span>DB 동기화</span>
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
                                            MCP를 통해 업데이트 시 자동 저장됩니다
                                        </p>
                                    </div>

                                    {/* Status Change */}
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">상태</h4>
                                        <div className="relative group/status flex">
                                            <select
                                                value={selectedTaskDetails.status}
                                                onChange={(e) => {
                                                    const newStatus = e.target.value as 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
                                                    startTransition(() => {
                                                        setTaskStatus(projectId, selectedTaskDetails.id, newStatus);
                                                        setTasks(prev => prev.map(t => t.id === selectedTaskDetails.id ? { ...t, status: newStatus } : t));
                                                        setSelectedTaskDetails({ ...selectedTaskDetails, status: newStatus });
                                                        setActiveWorkTab(newStatus);
                                                        getTaskHistoryAction(selectedTaskDetails.id).then(h => setStatusHistory(h || [])).catch(() => {});
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
                                        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">타임라인</h4>
                                        {(() => {
                                            const fmt = (iso?: string | null) =>
                                                iso ? new Date(iso).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Seoul' }) : null;
                                            const now = new Date().toISOString();
                                            const createdAt = selectedTaskDetails.created_at;
                                            const startedAt = selectedTaskDetails.started_at;
                                            const reviewAt = selectedTaskDetails.review_at;
                                            const completedAt = selectedTaskDetails.completed_at;
                                            const status = selectedTaskDetails.status;

                                            // 각 구간 duration: 다음 단계 시각이 없으면 현재 상태에 해당하는 구간은 "경과 중"으로 표시
                                            const todoDuration = startedAt
                                                ? diffMs(createdAt, startedAt)
                                                : status === 'TODO' ? diffMs(createdAt, now) : null;
                                            const inProgressDuration = reviewAt
                                                ? diffMs(startedAt, reviewAt)
                                                : (startedAt && status === 'IN_PROGRESS') ? diffMs(startedAt, now)
                                                : (startedAt && !reviewAt && completedAt) ? diffMs(startedAt, completedAt)
                                                : null;
                                            const reviewDuration = completedAt
                                                ? diffMs(reviewAt, completedAt)
                                                : (reviewAt && status === 'REVIEW') ? diffMs(reviewAt, now)
                                                : null;

                                            const isOngoing = (phase: 'TODO' | 'IN_PROGRESS' | 'REVIEW') => status === phase;

                                            return (
                                                <div className="relative pl-3 border-l-2 border-slate-200 dark:border-slate-700 flex flex-col gap-6">

                                                    {/* Created */}
                                                    <div className="relative">
                                                        <div className="absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600 ring-4 ring-slate-50 dark:ring-slate-900" />
                                                        <div className="flex flex-col gap-1 text-sm">
                                                            <span className="font-semibold text-slate-700 dark:text-slate-300">생성일 (TODO)</span>
                                                            <span className="text-slate-500 dark:text-slate-400 text-xs">{fmt(createdAt)}</span>
                                                            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                                                                TODO 경과: {formatDuration(todoDuration)}{isOngoing('TODO') ? ' (진행 중)' : ''}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Started (IN_PROGRESS) */}
                                                    <div className={`relative ${!startedAt ? 'opacity-40 grayscale' : ''}`}>
                                                        <div className={`absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-slate-50 dark:ring-slate-900 ${startedAt ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                                                        <div className="flex flex-col gap-1 text-sm">
                                                            <span className={`font-semibold ${startedAt ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>시작일 (IN_PROGRESS)</span>
                                                            <span className="text-slate-500 dark:text-slate-400 text-xs text-balance">
                                                                {fmt(startedAt) ?? '아직 시작되지 않음'}
                                                            </span>
                                                            {startedAt && (
                                                                <span className="text-[11px] font-medium text-blue-500 dark:text-blue-400">
                                                                    IN_PROGRESS 경과: {formatDuration(inProgressDuration)}{isOngoing('IN_PROGRESS') ? ' (진행 중)' : ''}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Review */}
                                                    <div className={`relative ${!reviewAt ? 'opacity-40 grayscale' : ''}`}>
                                                        <div className={`absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-slate-50 dark:ring-slate-900 ${reviewAt ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                                                        <div className="flex flex-col gap-1 text-sm">
                                                            <span className={`font-semibold ${reviewAt ? 'text-amber-700 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>리뷰 진입 (REVIEW)</span>
                                                            <span className="text-slate-500 dark:text-slate-400 text-xs text-balance">
                                                                {fmt(reviewAt) ?? '아직 리뷰 단계 아님'}
                                                            </span>
                                                            {reviewAt && (
                                                                <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
                                                                    REVIEW 경과: {formatDuration(reviewDuration)}{isOngoing('REVIEW') ? ' (진행 중)' : ''}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Completed */}
                                                    <div className={`relative ${!completedAt ? 'opacity-40 grayscale' : ''}`}>
                                                        <div className={`absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-slate-50 dark:ring-slate-900 ${completedAt ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                                                        <div className="flex flex-col gap-1 text-sm">
                                                            <span className={`font-semibold ${completedAt ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>완료일 (DONE)</span>
                                                            <span className="text-slate-500 dark:text-slate-400 text-xs text-balance">
                                                                {fmt(completedAt) ?? '아직 완료되지 않음'}
                                                            </span>
                                                            {completedAt && (
                                                                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                                                                    총 소요: {formatDuration(diffMs(createdAt, completedAt))}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Updated By */}
                                                    {selectedTaskDetails.updated_by && (
                                                        <div className="relative">
                                                            <div className="absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-slate-50 dark:ring-slate-900 bg-indigo-500" />
                                                            <div className="flex flex-col gap-1 text-sm">
                                                                <span className="font-semibold text-indigo-700 dark:text-indigo-400">최근 수정자</span>
                                                                <span className="text-slate-500 dark:text-slate-400 text-xs text-balance">
                                                                    {selectedTaskDetails.updated_by}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}

                                                </div>
                                            );
                                        })()}
                                    </div>

                                    {/* Status Transition History */}
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">전이 이력</h4>
                                        {statusHistory.length === 0 ? (
                                            <p className="text-xs text-slate-400 italic">아직 상태 변경 이력이 없습니다.</p>
                                        ) : (
                                            <div className="flex flex-col gap-2">
                                                {statusHistory.map((h, idx) => {
                                                    const prev = idx > 0 ? statusHistory[idx - 1] : null;
                                                    const prevTime = prev ? prev.changed_at : selectedTaskDetails.created_at;
                                                    const dur = diffMs(prevTime, h.changed_at);
                                                    const toMeta = STATUS_TAB_META[h.to_status as WorkStatus];
                                                    return (
                                                        <div key={h.id} className={`rounded-lg border border-slate-200 dark:border-slate-700 ${toMeta?.bg ?? ''} p-2.5 text-[11px]`}>
                                                            <div className="flex items-center gap-1.5 font-semibold">
                                                                {h.from_status && <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px]">{h.from_status}</span>}
                                                                <span className="text-slate-400">→</span>
                                                                <span className={`px-1.5 py-0.5 rounded text-[10px] text-white ${toMeta?.accent ?? 'bg-slate-500'}`}>{h.to_status}</span>
                                                            </div>
                                                            <div className="mt-1 text-slate-500 dark:text-slate-400">
                                                                {new Date(h.changed_at).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Seoul' })}
                                                            </div>
                                                            <div className="text-slate-400 dark:text-slate-500 text-[10px]">
                                                                이전 상태 경과: {formatDuration(dur)}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
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
