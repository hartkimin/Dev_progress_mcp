'use client';

import { useState, useEffect } from 'react';
import { getMcpServerInfo } from '@/app/actions/mcp';

interface McpInfo {
    status: string;
    version: string;
    ip: string;
    nodeVersion: string;
    os: string;
    toolsCount: number;
}

export default function LiveSyncIndicator() {
    const [mcpInfo, setMcpInfo] = useState<McpInfo | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        getMcpServerInfo()
            .then(setMcpInfo)
            .catch(err => console.error("Failed to fetch MCP Info:", err));
    }, []);

    return (
        <div className="relative z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-500 bg-white dark:bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none self-start md:self-auto hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Live Sync Active
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 shadow-xl rounded-xl p-4 overflow-hidden origin-top-right animate-in fade-in zoom-in duration-200">
                    <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 border-b border-slate-100 dark:border-slate-700 pb-2 flex items-center justify-between">
                        MCP Server Details
                        <div className={`w-1.5 h-1.5 rounded-full ${mcpInfo && mcpInfo.status === 'Online' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                    </h3>

                    {mcpInfo ? (
                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between items-center group/item hover:bg-slate-50 dark:hover:bg-slate-700/50 p-1 -mx-1 rounded">
                                <span className="text-slate-500 dark:text-slate-400">Status</span>
                                <span className={`font-semibold ${mcpInfo.status === 'Online' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{mcpInfo.status}</span>
                            </div>
                            <div className="flex justify-between items-center group/item hover:bg-slate-50 dark:hover:bg-slate-700/50 p-1 -mx-1 rounded">
                                <span className="text-slate-500 dark:text-slate-400">Version</span>
                                <span className="font-medium text-slate-700 dark:text-slate-300">{mcpInfo.version}</span>
                            </div>
                            <div className="flex justify-between items-center group/item hover:bg-slate-50 dark:hover:bg-slate-700/50 p-1 -mx-1 rounded">
                                <span className="text-slate-500 dark:text-slate-400">IP</span>
                                <span className="font-mono text-slate-700 dark:text-slate-300">{mcpInfo.ip}</span>
                            </div>
                            <div className="flex justify-between items-center group/item hover:bg-slate-50 dark:hover:bg-slate-700/50 p-1 -mx-1 rounded">
                                <span className="text-slate-500 dark:text-slate-400">Node</span>
                                <span className="font-mono text-slate-700 dark:text-slate-300">{mcpInfo.nodeVersion}</span>
                            </div>
                            <div className="flex justify-between items-center group/item hover:bg-slate-50 dark:hover:bg-slate-700/50 p-1 -mx-1 rounded">
                                <span className="text-slate-500 dark:text-slate-400">OS</span>
                                <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[80px]" title={mcpInfo.os}>{mcpInfo.os}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-100 dark:border-slate-700 group/item p-1 -mx-1 rounded">
                                <span className="text-slate-500 dark:text-slate-400">Tools Loaded</span>
                                <span className="font-bold text-indigo-600 dark:text-indigo-400">{mcpInfo.toolsCount} Active</span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-xs text-slate-500 dark:text-slate-400 py-3 flex items-center gap-2 justify-center">
                            <div className="w-3 h-3 border-2 border-slate-300 dark:border-slate-600 border-t-indigo-500 dark:border-t-indigo-400 rounded-full animate-spin"></div>
                            Fetching MCP Info...
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
