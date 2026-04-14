import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import DashboardContent from './components/DashboardContent';
import AutoRefresh from './components/AutoRefresh';

import { getAllProjectSummaries, getStrategyReadiness, ProjectSummary, StrategyReadiness } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/auth/signin');
  }

  let projectSummaries: ProjectSummary[] = [];
  let strategyReadiness: StrategyReadiness | null = null;
  try {
    projectSummaries = await getAllProjectSummaries();
  } catch (e) {
    // Fallback: API may not be available yet
    console.error('Failed to fetch project summaries:', e);
  }
  try {
    strategyReadiness = await getStrategyReadiness();
  } catch (e) {
    console.error('Failed to fetch strategy readiness:', e);
  }

  return (
    <main className="min-h-full">
      <AutoRefresh />

      <div className="absolute inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay" style={{
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"
      }}></div>
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-indigo-50/50 to-transparent dark:from-indigo-950/20 pointer-events-none"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-20 -left-20 w-72 h-72 bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <DashboardContent projectSummaries={projectSummaries} strategyReadiness={strategyReadiness} />
    </main>
  );
}
