import { getProjectById, getTasksByProject, Task } from '@/lib/db';
import Link from 'next/link';
import AutoRefresh from '../../components/AutoRefresh';

import KanbanBoardClient from './KanbanBoardClient';

export const dynamic = 'force-dynamic';

export default async function ProjectBoard({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const project = await getProjectById(id);

    if (!project) {
        return (
            <div className="h-full flex items-center justify-center p-4 text-center">
                <div>
                    <h1 className="text-2xl font-bold text-red-500 dark:text-red-400 mb-2">Project Not Found</h1>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">The requested project ID does not exist in the database.</p>
                    <Link href="/" className="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition">
                        &larr; Return to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const tasks = await getTasksByProject(id);

    // Calculate category metrics
    const categoryStats: Record<string, { total: number, done: number }> = {};
    tasks.forEach(task => {
        const cat = task.category || 'Uncategorized';
        if (!categoryStats[cat]) {
            categoryStats[cat] = { total: 0, done: 0 };
        }
        categoryStats[cat].total += 1;
        if (task.status === 'DONE') {
            categoryStats[cat].done += 1;
        }
    });

    return (
        <main className="min-h-full text-slate-700 dark:text-slate-300 font-sans selection:bg-indigo-500/30 overflow-x-hidden p-4 sm:p-6 lg:p-8 transition-colors duration-300">
            {/* Realtime component injection */}
            <AutoRefresh interval={3000} />

            <div className="w-full flex flex-col items-start gap-8">
                {/* Header */}
                <header className="w-full mb-2 pb-6 border-b border-slate-200 dark:border-slate-800/80 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="flex-1">
                        <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors mb-4 group">
                            <svg className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Projects
                        </Link>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            {project.name}
                        </h1>
                        {project.description && (
                            <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-3xl">
                                {project.description}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-500 bg-white dark:bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Syncing via MCP
                    </div>
                </header>

                <KanbanBoardClient tasks={tasks} categoryStats={categoryStats} projectId={project.id} />
            </div>
        </main>
    );
}
