'use client';

import { useState, useEffect, useRef } from 'react';
import { getMcpServerInfo } from '@/app/actions/mcp';
import { usePathname } from 'next/navigation';

interface McpInfo {
    status: string;
    version: string;
    ip: string;
    nodeVersion: string;
    os: string;
    toolsCount: number;
}
import { Server } from 'lucide-react';

export default function LiveSyncIndicator() {
    const [mcpInfo, setMcpInfo] = useState<McpInfo | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    useEffect(() => {
        getMcpServerInfo()
            .then(setMcpInfo)
            .catch(err => console.error("Failed to fetch MCP Info:", err));
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    return (
        <div className="relative z-50 flex items-center" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                title="MCP Server Status"
                className="relative flex justify-center items-center p-2 rounded-full transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-indigo-500 dark:hover:text-indigo-400 text-slate-600 dark:text-slate-300"
            >
                <Server size={18} strokeWidth={2} />
                <span className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full border border-white dark:border-slate-900 ${mcpInfo && mcpInfo.status === 'Online' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 shadow-xl rounded-xl p-4 overflow-hidden origin-top-right animate-in fade-in zoom-in duration-200">
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
