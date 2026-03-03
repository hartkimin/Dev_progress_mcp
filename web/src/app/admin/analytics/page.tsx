import { getGlobalAnalytics } from '@/lib/db';
import { BarChart, Briefcase, ListTodo, Users, CheckCircle, Clock, Activity, Target } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
    const stats = await getGlobalAnalytics();

    const completionRate = stats.totalTasks > 0
        ? Math.round((stats.tasksByStatus.DONE / stats.totalTasks) * 100)
        : 0;

    return (
        <main className="min-h-full text-slate-700 dark:text-slate-300 font-sans selection:bg-indigo-500/30 p-4 sm:p-6 lg:p-8">
            <div className="w-full flex flex-col gap-8 max-w-6xl mx-auto">
                {/* Header */}
                <header className="w-full border-b border-slate-200 dark:border-slate-800/80 pb-6">
                    <div className="flex items-center justify-between mb-4">
                        <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors group">
                            <svg className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Dashboard
                        </Link>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center border border-indigo-200 dark:border-indigo-500/20 shadow-sm">
                            <BarChart className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">System Analytics</h1>
                            <p className="mt-1 text-slate-500">Overview of Dev Progress operations and performance metrics.</p>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Projects Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Projects</p>
                                <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">{stats.totalProjects}</h3>
                            </div>
                            <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg">
                                <Briefcase className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    {/* Users Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Registered Users</p>
                                <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">{stats.totalUsers}</h3>
                            </div>
                            <div className="p-3 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg">
                                <Users className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    {/* Total Tasks Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Tasks</p>
                                <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">{stats.totalTasks}</h3>
                            </div>
                            <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg">
                                <ListTodo className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    {/* Completion Rate Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                        <div className="relative z-10 flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Avg Completion</p>
                                <h3 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight mt-1">{completionRate}%</h3>
                            </div>
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
                                <Target className="w-5 h-5" />
                            </div>
                        </div>
                        {/* Progress Background */}
                        <div
                            className="absolute bottom-0 left-0 h-1.5 bg-emerald-500 dark:bg-emerald-500 transition-all duration-1000 ease-out"
                            style={{ width: `${completionRate}%` }}
                        />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Task Pipeline Distribution</h3>

                    <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
                        {/* Status Bars */}
                        <div className="w-full space-y-5">
                            <TaskStatusLayer
                                label="To Do"
                                count={stats.tasksByStatus.TODO}
                                total={stats.totalTasks}
                                color="bg-slate-400 dark:bg-slate-500"
                                icon={<ListTodo className="w-4 h-4" />}
                            />
                            <TaskStatusLayer
                                label="In Progress"
                                count={stats.tasksByStatus.IN_PROGRESS}
                                total={stats.totalTasks}
                                color="bg-blue-500"
                                icon={<Activity className="w-4 h-4" />}
                            />
                            <TaskStatusLayer
                                label="In Review"
                                count={stats.tasksByStatus.REVIEW}
                                total={stats.totalTasks}
                                color="bg-amber-500"
                                icon={<Clock className="w-4 h-4" />}
                            />
                            <TaskStatusLayer
                                label="Completed"
                                count={stats.tasksByStatus.DONE}
                                total={stats.totalTasks}
                                color="bg-emerald-500"
                                icon={<CheckCircle className="w-4 h-4" />}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

function TaskStatusLayer({ label, count, total, color, icon }: { label: string, count: number, total: number, color: string, icon: React.ReactNode }) {
    const percentage = total > 0 ? (count / total) * 100 : 0;

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <span className={`text-slate-500 dark:text-slate-400 flex items-center justify-center`}>{icon}</span>
                    {label}
                </span>
                <span className="text-sm font-medium text-slate-500">
                    <span className="text-slate-900 dark:text-slate-200 font-bold">{count}</span> / {total} ({Math.round(percentage)}%)
                </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3.5 overflow-hidden">
                <div
                    className={`${color} h-3.5 rounded-full transition-all duration-1000 ease-in-out`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
}
