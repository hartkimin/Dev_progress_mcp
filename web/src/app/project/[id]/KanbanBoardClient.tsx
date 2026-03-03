'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Task } from '@/lib/db';
import { X, Calendar, Tag, Hash, Activity, Clock, Loader2 } from 'lucide-react';
import { setTaskStatus } from './actions';

export default function KanbanBoardClient({
    tasks: initialTasks,
    categoryStats,
    projectId
}: {
    tasks: Task[],
    categoryStats: Record<string, { total: number, done: number }>,
    projectId: string
}) {
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedTaskDetails, setSelectedTaskDetails] = useState<Task | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [isPending, startTransition] = useTransition();

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

        // Optimistic UI update
        setTasks(prev => prev.map(t => t.id === draggableId ? { ...t, status: newStatus } : t));

        // Server Action
        startTransition(() => {
            setTaskStatus(projectId, draggableId, newStatus);
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

    return (
        <>
            <div className="flex flex-col gap-6 w-full">
                {/* Category Progress Overview */}
                {Object.keys(categoryStats).length > 0 && (
                    <div className="mb-2">
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
                                            }`}
                                    >
                                        <span className="font-semibold">{cat}</span>
                                        <div className="flex items-center gap-1.5 border-l border-slate-200 dark:border-slate-700 pl-3">
                                            {/* Minimal Progress Ring */}
                                            <div className="relative w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                                                <div
                                                    className={`absolute bottom-0 left-0 right-0 transition-all duration-500 ${isSelected ? 'bg-indigo-500' : 'bg-emerald-500 dark:bg-emerald-600'}`}
                                                    style={{ height: `${percent}%` }}
                                                />
                                            </div>
                                            <span className={`text-xs font-medium ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                                {stats.done}/{stats.total}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Board */}
                {!isMounted ? null : (
                    <DragDropContext onDragEnd={onDragEnd}>
                        <div className="flex gap-6 overflow-x-auto pb-4 snap-x custom-scrollbar min-h-[500px] w-full relative">
                            {isPending && (
                                <div className="absolute inset-0 z-50 bg-white/10 dark:bg-slate-900/10 pointer-events-none rounded-2xl backdrop-blur-[1px]" />
                            )}
                            {columns.map(column => {
                                const columnTasks = filteredTasks.filter(t => t.status === column.id);

                                return (
                                    <section key={column.id} className="snap-center shrink-0 flex flex-col w-80 md:w-[340px]">
                                        <div className="sticky top-0 z-10 p-4 border border-slate-200 dark:border-slate-800/50 bg-slate-100/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-t-2xl flex items-center justify-between shadow-sm">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2.5 h-2.5 rounded-full ${column.color} shadow-sm dark:shadow-[0_0_8px_rgba(0,0,0,0.5)]`}></span>
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
                                                            {columnTasks.map((task, index) => {
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
                                                                                    }
                                                                                }}
                                                                                className={`bg-white dark:bg-slate-800/90 border cursor-pointer ${isPulse && !snapshot.isDragging ? 'border-blue-400 dark:border-blue-500/70 ring-2 ring-blue-400/30 dark:ring-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.3)] dark:shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]' : 'border-slate-200 dark:border-slate-700/80 hover:border-slate-300 shadow-sm dark:shadow-none hover:shadow-md'} p-4 rounded-xl transition-all group duration-200 ${snapshot.isDragging ? 'rotate-2 scale-105 shadow-xl ring-2 ring-indigo-500/50 z-[100]' : ''}`}
                                                                                style={provided.draggableProps.style}
                                                                            >
                                                                                {task.category && (
                                                                                    <div className="mb-2">
                                                                                        <span className="inline-block px-2 py-0.5 bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 rounded text-[10px] font-bold uppercase tracking-wider">
                                                                                            {task.category}
                                                                                        </span>
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
                                                                                    <span className="text-[10px] font-mono font-medium text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-slate-900/80 px-2 py-1 rounded cursor-text">
                                                                                        #{task.id.slice(0, 6)}
                                                                                    </span>
                                                                                    <span className="text-[11px] text-slate-500 font-medium">
                                                                                        {new Date(task.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </Draggable>
                                                                );
                                                            })}
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
                    </DragDropContext>
                )}
            </div>

            {/* Task Details Modal */}
            {selectedTaskDetails && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md transition-opacity">
                    <div
                        className="absolute inset-0"
                        onClick={() => setSelectedTaskDetails(null)}
                    ></div>

                    <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                        {/* Header */}
                        <div className="flex items-start justify-between p-6 md:p-8 border-b border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900/80 backdrop-blur-sm z-10 sticky top-0">
                            <div className="pr-8">
                                <div className="flex flex-wrap items-center gap-3 mb-4">
                                    {selectedTaskDetails.category && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 rounded-full text-xs font-bold uppercase tracking-wide border border-indigo-200 dark:border-indigo-500/20">
                                            <Tag className="w-3.5 h-3.5" />
                                            {selectedTaskDetails.category}
                                        </span>
                                    )}
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-xs font-bold tracking-wide border border-slate-200 dark:border-slate-700">
                                        <Activity className="w-3.5 h-3.5" />
                                        {columns.find(c => c.id === selectedTaskDetails.status)?.label}
                                    </span>
                                </div>
                                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                                    {selectedTaskDetails.title}
                                </h2>
                            </div>
                            <button
                                onClick={() => setSelectedTaskDetails(null)}
                                className="p-2 -m-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-slate-50/50 dark:bg-slate-950/30">
                            <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
                                {selectedTaskDetails.description ? (
                                    <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{selectedTaskDetails.description}</p>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                                        <svg className="w-12 h-12 mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p className="italic font-medium">No description provided for this task.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer / Metadata */}
                        <div className="p-5 md:px-8 md:py-6 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-x-6 gap-y-3 text-xs md:text-sm text-slate-500 dark:text-slate-400 justify-between items-center">
                            <div className="flex items-center gap-2 font-mono bg-white dark:bg-slate-900 px-2.5 py-1 rounded shadow-sm border border-slate-200 dark:border-slate-800">
                                <Hash className="w-3.5 h-3.5 text-indigo-400" />
                                {selectedTaskDetails.id}
                            </div>
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-slate-400" />
                                    <span>{new Date(selectedTaskDetails.created_at).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </>
    );
}
