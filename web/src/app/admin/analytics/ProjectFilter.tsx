'use client';

import { useRouter } from 'next/navigation';

export default function ProjectFilter({ projects, currentProjectId }: { projects: { id: string, name: string }[], currentProjectId: string }) {
    const router = useRouter();

    return (
        <div className="flex items-center gap-3">
            <label htmlFor="project-filter" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Filter by Project:
            </label>
            <select
                id="project-filter"
                value={currentProjectId}
                onChange={(e) => {
                    const val = e.target.value;
                    if (val) {
                        router.push(`/admin/analytics?projectId=${val}`);
                    } else {
                        router.push(`/admin/analytics`);
                    }
                }}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl min-w-[200px] focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm cursor-pointer"
            >
                <option value="">All Projects</option>
                {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                ))}
            </select>
        </div>
    );
}
