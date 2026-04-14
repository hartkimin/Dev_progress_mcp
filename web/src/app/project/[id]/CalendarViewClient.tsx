'use client';

import React, { useState, useMemo } from 'react';
import { Task } from '@/lib/db';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X, Plus, Play, Search, CheckCircle2, Flag, Target } from 'lucide-react';
import EmptyStatePrompt from '@/components/EmptyStatePrompt';

type EventKind = 'CREATED' | 'STARTED' | 'REVIEW' | 'DONE' | 'PLAN_START' | 'DUE';

interface CalendarEvent {
    task: Task;
    kind: EventKind;
    at: Date;
}

const EVENT_META: Record<EventKind, { label: string; dot: string; chip: string; icon: React.ComponentType<any> }> = {
    CREATED:    { label: '생성',    dot: 'bg-slate-400',   chip: 'bg-slate-100 border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300',                     icon: Plus },
    STARTED:    { label: '시작',    dot: 'bg-blue-500',    chip: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-500/30 dark:text-blue-300',                      icon: Play },
    REVIEW:     { label: '리뷰',    dot: 'bg-amber-500',   chip: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/30 dark:border-amber-500/30 dark:text-amber-300',                icon: Search },
    DONE:       { label: '완료',    dot: 'bg-emerald-500', chip: 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-500/30 dark:text-emerald-300',   icon: CheckCircle2 },
    PLAN_START: { label: '예정시작', dot: 'bg-indigo-500',  chip: 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-500/30 dark:text-indigo-300',          icon: Target },
    DUE:        { label: '마감',    dot: 'bg-rose-500',    chip: 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-900/30 dark:border-rose-500/30 dark:text-rose-300',                      icon: Flag },
};

const ALL_KINDS: EventKind[] = ['CREATED', 'STARTED', 'REVIEW', 'DONE', 'PLAN_START', 'DUE'];

function buildEvents(tasks: Task[]): CalendarEvent[] {
    const events: CalendarEvent[] = [];
    for (const t of tasks) {
        const push = (iso: string | null | undefined, kind: EventKind) => {
            if (!iso) return;
            const d = new Date(iso);
            if (Number.isNaN(d.getTime())) return;
            events.push({ task: t, kind, at: d });
        };
        push(t.created_at, 'CREATED');
        push(t.started_at, 'STARTED');
        push((t as any).review_at, 'REVIEW');
        push(t.completed_at, 'DONE');
        push(t.start_date, 'PLAN_START');
        push(t.due_date, 'DUE');
    }
    return events;
}

export default function CalendarViewClient({
    tasks,
    projectId,
    projectName
}: {
    tasks: Task[],
    projectId: string,
    projectName: string
}) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<{ day: number; events: CalendarEvent[] } | null>(null);
    const [enabledKinds, setEnabledKinds] = useState<Set<EventKind>>(new Set(ALL_KINDS));

    const allEvents = useMemo(() => buildEvents(tasks), [tasks]);
    const filteredEvents = useMemo(() => allEvents.filter(e => enabledKinds.has(e.kind)), [allEvents, enabledKinds]);

    const { daysInMonth, firstDayOfMonth } = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        return { daysInMonth, firstDayOfMonth };
    }, [currentDate]);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };

    const getEventsForDate = (day: number): CalendarEvent[] => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        return filteredEvents.filter(ev =>
            ev.at.getFullYear() === year &&
            ev.at.getMonth() === month &&
            ev.at.getDate() === day
        ).sort((a, b) => a.at.getTime() - b.at.getTime());
    };

    const toggleKind = (k: EventKind) => {
        setEnabledKinds(prev => {
            const next = new Set(prev);
            if (next.has(k)) next.delete(k); else next.add(k);
            return next;
        });
    };

    const statusColors: Record<string, string> = {
        'TODO': 'bg-slate-100 border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300',
        'IN_PROGRESS': 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-500/30 dark:text-blue-300',
        'REVIEW': 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/30 dark:border-amber-500/30 dark:text-amber-300',
        'DONE': 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-500/30 dark:text-emerald-300',
    };

    const statusLabels: Record<string, string> = {
        'TODO': 'To Do',
        'IN_PROGRESS': 'In Progress',
        'REVIEW': 'Review',
        'DONE': 'Done',
    };

    const statusDot: Record<string, string> = {
        'TODO': 'bg-slate-400',
        'IN_PROGRESS': 'bg-blue-500',
        'REVIEW': 'bg-amber-500',
        'DONE': 'bg-emerald-500',
    };

    const monthNames = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

    const MAX_VISIBLE_TASKS = 3;
    const hasAnyEvent = allEvents.length > 0;

    return (
        <>
            {!hasAnyEvent ? (
                <EmptyStatePrompt
                    title="타임라인 이벤트가 없습니다"
                    description="태스크가 아직 없거나 생성/시작/리뷰/완료 시각이 기록되지 않았습니다. 태스크를 생성·이동하면 자동으로 캘린더에 반영됩니다."
                    suggestedPrompt="현재 프로젝트의 마일스톤에 맞게 이번 주에 수행할 주요 프론트엔드 및 백엔드 태스크 5개를 달력 일정(마감일 포함)으로 생성해줘."
                />
            ) : (
                <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
                        <div className="flex items-center gap-4">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                                <CalendarIcon className="w-5 h-5 text-indigo-500" />
                                {currentDate.getFullYear()}년 {monthNames[currentDate.getMonth()]}
                            </h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={handleToday} className="px-3 py-1.5 text-sm font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                                오늘
                            </button>
                            <div className="flex border border-slate-200 dark:border-slate-700 rounded-md overflow-hidden">
                                <button onClick={handlePrevMonth} className="p-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition border-r border-slate-200 dark:border-slate-700">
                                    <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                                </button>
                                <button onClick={handleNextMonth} className="p-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                                    <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Event Kind Filter */}
                    <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1">타임라인 이벤트:</span>
                        {ALL_KINDS.map(k => {
                            const meta = EVENT_META[k];
                            const active = enabledKinds.has(k);
                            const Icon = meta.icon;
                            return (
                                <button
                                    key={k}
                                    onClick={() => toggleKind(k)}
                                    className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all ${active ? meta.chip : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 opacity-60 hover:opacity-100'}`}
                                >
                                    <Icon className="w-3 h-3" />
                                    {meta.label}
                                </button>
                            );
                        })}
                    </div>

                    <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                        {dayNames.map(day => (
                            <div key={day} className="py-2 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-r border-slate-200 dark:border-slate-800 last:border-r-0">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 auto-rows-[minmax(120px,1fr)] bg-slate-100 dark:bg-slate-800 gap-[1px]">
                        {/* Empty cells for previous month */}
                        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                            <div key={`empty-${i}`} className="bg-white dark:bg-slate-900 p-2 min-h-[120px] opacity-50"></div>
                        ))}

                        {/* Days of current month */}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const dateEvents = getEventsForDate(day);
                            const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();
                            const visibleEvents = dateEvents.slice(0, MAX_VISIBLE_TASKS);
                            const hiddenCount = dateEvents.length - MAX_VISIBLE_TASKS;

                            return (
                                <div
                                    key={day}
                                    className={`bg-white dark:bg-slate-900 p-2 min-h-[120px] flex flex-col gap-1 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer`}
                                    onClick={() => {
                                        if (dateEvents.length > 0) {
                                            setSelectedDay({ day, events: dateEvents });
                                        }
                                    }}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                                            {day}
                                        </span>
                                        {dateEvents.length > 0 && (
                                            <span className="text-[10px] font-semibold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded-full">
                                                {dateEvents.length}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-1 overflow-hidden flex-grow">
                                        {visibleEvents.map((ev, idx) => {
                                            const meta = EVENT_META[ev.kind];
                                            return (
                                                <div
                                                    key={`${ev.task.id}-${ev.kind}-${idx}`}
                                                    className={`text-[10px] font-medium px-2 py-1 rounded border truncate flex items-center gap-1 ${meta.chip}`}
                                                    title={`[${meta.label}] ${ev.task.title}`}
                                                >
                                                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${meta.dot}`} />
                                                    <span className="truncate">{ev.task.title}</span>
                                                </div>
                                            );
                                        })}
                                        {hiddenCount > 0 && (
                                            <div className="text-[10px] font-semibold text-indigo-500 px-2 py-0.5 text-center hover:text-indigo-700 transition-colors">
                                                +{hiddenCount}개 더보기
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Empty cells for next month to complete the grid */}
                        {Array.from({ length: (7 - ((firstDayOfMonth + daysInMonth) % 7)) % 7 }).map((_, i) => (
                            <div key={`empty-end-${i}`} className="bg-white dark:bg-slate-900 p-2 min-h-[120px] opacity-50"></div>
                        ))}
                    </div>
                </div>
            )}

            {/* Day Detail Popup */}
            {selectedDay && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setSelectedDay(null)}>
                    <div
                        className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                <CalendarIcon className="w-5 h-5 text-indigo-500" />
                                {currentDate.getFullYear()}년 {monthNames[currentDate.getMonth()]} {selectedDay.day}일
                                <span className="text-sm font-normal text-slate-500">({selectedDay.events.length}개 이벤트)</span>
                            </h3>
                            <button onClick={() => setSelectedDay(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 flex flex-col gap-3 max-h-[60vh] overflow-y-auto">
                            {selectedDay.events.map((ev, idx) => {
                                const meta = EVENT_META[ev.kind];
                                const Icon = meta.icon;
                                return (
                                    <div key={`${ev.task.id}-${ev.kind}-${idx}`} className={`p-4 rounded-xl border ${meta.chip} transition-colors`}>
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                            <div className="flex-grow">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.chip}`}>
                                                        <Icon className="w-3 h-3" />
                                                        {meta.label}
                                                    </span>
                                                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                                                        {ev.at.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Seoul' })}
                                                    </span>
                                                </div>
                                                <h4 className="font-semibold text-sm leading-snug">{ev.task.title}</h4>
                                            </div>
                                            <span className={`shrink-0 flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full border ${statusColors[ev.task.status] || statusColors['TODO']}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${statusDot[ev.task.status] || 'bg-slate-400'}`}></span>
                                                {statusLabels[ev.task.status] || ev.task.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-[10px] opacity-60">
                                            {ev.task.category && (
                                                <span className="font-semibold uppercase">{ev.task.category}</span>
                                            )}
                                            <span className="font-mono">#{ev.task.id.slice(0, 6)}</span>
                                            {ev.task.task_type && (
                                                <span className="px-1.5 py-0.5 bg-white/50 dark:bg-slate-700/50 rounded border border-current/20 font-medium">{ev.task.task_type}</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
