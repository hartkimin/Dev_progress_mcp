import { getGlobalAnalytics, listProjects } from '@/lib/db';
import AnalyticsClient from './AnalyticsClient';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage(props: { searchParams: Promise<{ projectId?: string }> }) {
    const searchParams = await props.searchParams;
    const projectId = searchParams?.projectId || '';

    const stats = await getGlobalAnalytics(projectId || undefined);
    const projects = await listProjects();

    return (
        <main className="min-h-full text-slate-700 dark:text-slate-300 font-sans selection:bg-indigo-500/30 p-4 sm:p-6 lg:p-8">
            <AnalyticsClient
                stats={stats}
                projects={projects.map(p => ({ id: p.id, name: p.name }))}
                projectId={projectId}
            />
        </main>
    );
}
