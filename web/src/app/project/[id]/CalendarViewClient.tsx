'use client';

import React, { useState, useMemo } from 'react';
import { Task } from '@/lib/db';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from 'lucide-react';
import EmptyStatePrompt from '@/components/EmptyStatePrompt';

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
    const [selectedDay, setSelectedDay] = useState<{ day: number; tasks: Task[] } | null>(null);

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

    const getTasksForDate = (day: number) => {
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();
        const targetDate = new Date(currentYear, currentMonth, day);
        targetDate.setHours(0, 0, 0, 0);

        return tasks.filter(task => {
            try {
                // DONE tasks: show on due_date (completion date) only
                if (task.status === 'DONE') {
                    if (!task.due_date) return false;
                    const dueDate = new Date(task.due_date);
                    dueDate.setHours(0, 0, 0, 0);
                    return targetDate.getTime() === dueDate.getTime();
                }

                // IN_PROGRESS tasks: show on start_date only
                if (task.status === 'IN_PROGRESS') {
                    if (!task.start_date) return false;
                    const startDate = new Date(task.start_date);
                    startDate.setHours(0, 0, 0, 0);
                    return targetDate.getTime() === startDate.getTime();
                }

                // TODO, REVIEW: not shown on calendar
                return false;
            } catch {
                return false;
            }
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

    return (
        <>
            {tasks.length === 0 ? (
                <EmptyStatePrompt
                    title="일정이 없습니다"
                    description="달력에 표시할 태스크가 아직 없습니다. 태스크를 생성하거나 AI에게 일정을 만들어 달라고 요청해보세요."
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
                            const dateTasks = getTasksForDate(day);
                            const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();
                            const visibleTasks = dateTasks.slice(0, MAX_VISIBLE_TASKS);
                            const hiddenCount = dateTasks.length - MAX_VISIBLE_TASKS;

                            return (
                                <div
                                    key={day}
                                    className={`bg-white dark:bg-slate-900 p-2 min-h-[120px] flex flex-col gap-1 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer`}
                                    onClick={() => {
                                        if (dateTasks.length > 0) {
                                            setSelectedDay({ day, tasks: dateTasks });
                                        }
                                    }}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                                            {day}
                                        </span>
                                        {dateTasks.length > 0 && (
                                            <span className="text-[10px] font-semibold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded-full">
                                                {dateTasks.length}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-1 overflow-hidden flex-grow">
                                        {visibleTasks.map(task => (
                                            <div
                                                key={task.id}
                                                className={`text-[10px] font-medium px-2 py-1 rounded border truncate ${statusColors[task.status] || statusColors['TODO']}`}
                                                title={task.title}
                                            >
                                                {task.title}
                                            </div>
                                        ))}
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
                                <span className="text-sm font-normal text-slate-500">({selectedDay.tasks.length}개 태스크)</span>
                            </h3>
                            <button onClick={() => setSelectedDay(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 flex flex-col gap-3 max-h-[60vh] overflow-y-auto">
                            {selectedDay.tasks.map(task => (
                                <div key={task.id} className={`p-4 rounded-xl border ${statusColors[task.status] || statusColors['TODO']} transition-colors`}>
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                        <h4 className="font-semibold text-sm leading-snug flex-grow">{task.title}</h4>
                                        <span className={`shrink-0 flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full border ${statusColors[task.status] || statusColors['TODO']}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${statusDot[task.status] || 'bg-slate-400'}`}></span>
                                            {statusLabels[task.status] || task.status}
                                        </span>
                                    </div>
                                    {task.description && (
                                        <p className="text-xs opacity-75 line-clamp-2 mb-2">{task.description}</p>
                                    )}
                                    <div className="flex items-center gap-3 text-[10px] opacity-60">
                                        {task.category && (
                                            <span className="font-semibold uppercase">{task.category}</span>
                                        )}
                                        <span className="font-mono">#{task.id.slice(0, 6)}</span>
                                        {task.task_type && (
                                            <span className="px-1.5 py-0.5 bg-white/50 dark:bg-slate-700/50 rounded border border-current/20 font-medium">{task.task_type}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
