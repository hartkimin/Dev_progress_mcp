import { getProjectById, getTasksByProject, Task } from '@/lib/db';
import Link from 'next/link';
import AutoRefresh from '../../components/AutoRefresh';

import ProjectViewsContainer from './ProjectViewsContainer';

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
        <main className="min-h-full text-slate-700 dark:text-slate-300 font-sans selection:bg-indigo-500/30 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
            {/* Realtime component injection */}
            <AutoRefresh projectId={id} />

            <div className="w-full flex flex-col items-start gap-4">
                {/* Compact header — single row: back chevron + title + description */}
                <header className="relative z-50 w-full flex items-baseline gap-3 flex-wrap">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center w-6 h-6 rounded-md text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                        aria-label="Back to Projects"
                        title="Back to Projects"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                        {project.name}
                    </h1>
                    {project.description && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-2xl">
                            {project.description}
                        </p>
                    )}
                </header>

                <div className="w-full">
                    <ProjectViewsContainer tasks={tasks} categoryStats={categoryStats} projectId={project.id} projectName={project.name} />
                </div>
            </div>
        </main>
    );
}
