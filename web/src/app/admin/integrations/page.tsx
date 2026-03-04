'use client';

import { ExternalLink, Terminal, Puzzle, Box, Code2, Server, Layers, FileEdit, LayoutDashboard, Activity } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import LiveSyncIndicator from '@/app/components/LiveSyncIndicator';

export default function IntegrationsPage() {
    const { t } = useTranslation();

    return (
        <main className="max-w-6xl mx-auto py-12 px-6 sm:px-8">
            <header className="mb-14 border-b border-slate-200/60 dark:border-slate-800/60 pb-8 relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 dark:bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-400 dark:to-teal-400 mb-4">
                            {t('mcpIntegrations')}
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
                            {t('mcpIntegrationsSubtitle')}
                        </p>
                    </div>
                    <LiveSyncIndicator />
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Configuration Panel - Takes 2/3 width on large screens */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Main Client Config Card */}
                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-8 shadow-xl shadow-slate-200/20 dark:shadow-none relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        <div className="relative z-10 flex items-start gap-6 flex-col sm:flex-row">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/25">
                                <Terminal className="w-8 h-8 text-white" strokeWidth={1.5} />
                            </div>
                            <div className="flex-1 w-full">
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-3">
                                    {t('clientConfiguration')}
                                    <span className="text-xs font-semibold px-2 py-1 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 tracking-wide">{t('required')}</span>
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                                    {t('clientConfigDesc')}
                                </p>

                                <div className="bg-[#0d1117] rounded-xl border border-slate-800 shadow-inner overflow-hidden relative group/code">
                                    <div className="flex items-center justify-between px-4 py-2 bg-slate-900/80 border-b border-slate-800 text-xs text-slate-400 font-mono">
                                        <span>mcp.json</span>
                                        <div className="flex gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                                            <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                                            <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                                        </div>
                                    </div>
                                    <div className="p-0 overflow-x-auto relative code-block">
                                        <pre className="text-sm font-mono leading-relaxed text-slate-300 p-5 bg-transparent m-0">
                                            {`{
  "mcpServers": {
    "vibeplanner": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-v",
        "/absolute/path/to/dev_progress_mcp:/app",
        "-e",
        "DP_API_KEY=vp_live_YOUR_SECRET_KEY",
        "vibeplanner"
      ]
    }
  }
}`}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Server Status Panel */}
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200/60 dark:border-emerald-800/60 rounded-2xl p-6 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="relative flex">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
                            </div>
                            <div>
                                <h3 className="font-bold text-emerald-900 dark:text-emerald-400">{t('localMcpServerStatus')}</h3>
                                <p className="text-sm text-emerald-700 dark:text-emerald-500/80 mt-1">{t('mcpServerReady')}</p>
                            </div>
                        </div>
                        <Server className="w-8 h-8 text-emerald-500/40" />
                    </div>
                </div>

                {/* Available Tools - Side Panel */}
                <div className="lg:col-span-1">
                    <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-sm h-full">
                        <div className="flex items-center gap-3 mb-6">
                            <Puzzle className="w-5 h-5 text-indigo-500" />
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">{t('availableCapabilities')}</h3>
                        </div>

                        <p className="text-sm text-slate-500 mb-6">
                            {t('mcpCapabilitiesDesc')}
                        </p>

                        <div className="space-y-4">
                            {[
                                { name: 'list_projects', icon: Box, desc: t('toolListProjects') },
                                { name: 'create_project', icon: Code2, desc: t('toolCreateProject') },
                                { name: 'get_kanban_board', icon: LayoutDashboard, desc: t('toolGetKanbanBoard') },
                                { name: 'create_task', icon: Activity, desc: t('toolCreateTask') },
                                { name: 'update_task_status', icon: Layers, desc: t('toolUpdateTaskStatus') },
                                { name: 'update_task_details', icon: FileEdit, desc: t('toolUpdateTaskDetails') },
                            ].map((tool) => {
                                const Icon = tool.icon;
                                return (
                                    <div key={tool.name} className="group p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all shadow-sm hover:shadow-md cursor-default">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <Icon className="w-4 h-4 text-indigo-500 group-hover:text-indigo-600 dark:text-indigo-400 dark:group-hover:text-indigo-300 transition-colors" />
                                            <span className="font-bold text-sm text-slate-700 dark:text-slate-200 font-mono tracking-tight">{tool.name}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 leading-snug">{tool.desc}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
