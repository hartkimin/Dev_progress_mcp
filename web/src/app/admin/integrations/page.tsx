export default function IntegrationsPage() {
    return (
        <main className="max-w-5xl mx-auto py-10 px-4 sm:px-6">
            <header className="mb-10">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-cyan-500 bg-clip-text text-transparent">
                    Integrations & MCP
                </h1>
                <p className="mt-3 text-slate-600 dark:text-slate-400 max-w-2xl">
                    Connect your DevProgress AI Agent directly to your IDE via the Model Context Protocol (MCP).
                </p>
            </header>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
                <div className="flex items-start gap-6 flex-col md:flex-row">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-500/20">
                        <svg className="w-8 h-8 text-indigo-500 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div className="flex-1 w-full">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Cursor / Claude Desktop Integration</h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-2xl leading-relaxed">
                            To allow your AI assistant to automatically synchronize tasks and project progress to this dashboard, add DevProgress as an MCP tool in your client of choice, passing in one of your generated API keys.
                        </p>

                        <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-5 border border-slate-200 dark:border-slate-800 w-full overflow-hidden">
                            <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-500 mb-3">mcp.json Configuration</h3>
                            <div className="relative">
                                <pre className="bg-slate-800 text-slate-300 p-4 rounded-lg overflow-x-auto text-sm font-mono leading-relaxed">
                                    {`{
  "mcpServers": {
    "dev-progress": {
      "command": "node",
      "args": ["/path/to/dev_progress_mcp/build/index.js"],
      "env": {
        "DP_API_KEY": "dp_live_YOUR_SECRET_KEY_HERE"
      }
    }
  }
}`}
                                </pre>
                            </div>
                        </div>

                        <div className="mt-8 flex items-center gap-3 py-4 px-5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl">
                            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]"></span>
                            <span className="text-sm font-medium text-emerald-800 dark:text-emerald-400">Server Status: Ready to accept connections</span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
