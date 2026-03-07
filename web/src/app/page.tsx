import DashboardContent from './components/DashboardContent';
import AutoRefresh from './components/AutoRefresh';

import { getAllProjectSummaries, ProjectSummary } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  let projectSummaries: ProjectSummary[] = [];
  try {
    projectSummaries = await getAllProjectSummaries();
  } catch (e) {
    // Fallback: API may not be available yet
    console.error('Failed to fetch project summaries:', e);
  }

  return (
    <main className="min-h-full">
      <AutoRefresh />

      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-indigo-50/50 to-transparent dark:from-indigo-950/20 pointer-events-none"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-20 -left-20 w-72 h-72 bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <DashboardContent projectSummaries={projectSummaries} />
    </main>
  );
}
