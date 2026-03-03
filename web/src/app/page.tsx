import Link from 'next/link';
import AutoRefresh from './components/AutoRefresh';
import ProjectActions from './components/ProjectActions';

// Fetch data on the server component directly.
import { listProjects, Project } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const projects: Project[] = await listProjects();

  return (
    <main className="min-h-full">
      <AutoRefresh interval={3000} />

      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-indigo-50/50 to-transparent dark:from-indigo-950/20 pointer-events-none"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-20 -left-20 w-72 h-72 bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-12 border-b border-slate-200/60 dark:border-slate-800/60 pb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4 backdrop-blur-sm">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-500 dark:from-indigo-400 dark:to-cyan-400">
              Developer Console
            </h1>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
              Real-time synchronization with MCP local context. Track your coding progress effortlessly.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-500 bg-white dark:bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none self-start md:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Live Sync Active
          </div>
        </header>

        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              <span className="w-2.5 h-8 bg-gradient-to-b from-indigo-500 to-cyan-500 rounded-full shadow-lg shadow-indigo-500/20 inline-block"></span>
              Active Projects
            </h2>
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
              {projects.length} {projects.length === 1 ? 'Project' : 'Projects'}
            </div>
          </div>

          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 px-4 bg-white dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 shadow-sm dark:shadow-none">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300">No Projects Found</h3>
              <p className="text-slate-500 mt-2 max-w-sm text-center">
                Get started by creating a project via the MCP tool from your AI assistant.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div key={project.id} className="relative group">
                  {/* Provide the interactive client component absolutely positioned */}
                  <ProjectActions project={project} />

                  <Link
                    href={`/project/${project.id}`}
                    className="block h-full p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-200/60 dark:border-slate-800/60 hover:border-indigo-400/50 dark:hover:border-indigo-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1.5 overflow-hidden relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-transparent dark:from-indigo-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>

                    <div className="relative z-10 flex flex-col h-full">
                      <div className="mt-2 mb-6">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-cyan-600 dark:group-hover:from-indigo-400 dark:group-hover:to-cyan-400 transition-all duration-300">
                          {project.name}
                        </h3>
                        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                          {project.description || "No description provided."}
                        </p>
                      </div>

                      <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 group-hover:border-indigo-200 dark:group-hover:border-indigo-500/20 transition-colors">
                        <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
                          ID: {project.id.slice(0, 8)}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/10 flex items-center justify-center transition-colors">
                          <svg className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
