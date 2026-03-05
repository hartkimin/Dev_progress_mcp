'use client';

import { useState } from 'react';
import { Terminal, Puzzle, Box, Code2, Server, Layers, FileEdit, LayoutDashboard, Activity, FileText, History, RotateCcw, ChevronDown, ChevronUp, Trash2, Search, MessageSquare, MessageCircle, PenLine, BarChart3, Clock, Copy, Check } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface ToolDef {
    name: string;
    icon: React.ComponentType<any>;
    descKey: string;
    params: { name: string; required: boolean; desc: { en: string; ko: string } }[];
}

interface ToolCategory {
    labelKey: string;
    color: string;
    iconBg: string;
    tools: ToolDef[];
}

const TOOL_CATEGORIES: ToolCategory[] = [
    {
        labelKey: 'toolCategoryProject',
        color: 'indigo',
        iconBg: 'from-indigo-500 to-blue-500',
        tools: [
            {
                name: 'list_projects', icon: Box, descKey: 'toolListProjects',
                params: []
            },
            {
                name: 'create_project', icon: Code2, descKey: 'toolCreateProject',
                params: [
                    { name: 'name', required: true, desc: { en: 'Project name', ko: '프로젝트 이름' } },
                    { name: 'description', required: false, desc: { en: 'Project description', ko: '프로젝트 설명' } },
                    { name: 'mode', required: false, desc: { en: "'newbie' or 'import'", ko: "'newbie' 또는 'import'" } },
                ]
            },
            {
                name: 'update_project', icon: PenLine, descKey: 'toolUpdateProject',
                params: [
                    { name: 'projectId', required: true, desc: { en: 'Project ID', ko: '프로젝트 ID' } },
                    { name: 'name', required: false, desc: { en: 'New name', ko: '새 이름' } },
                    { name: 'description', required: false, desc: { en: 'New description', ko: '새 설명' } },
                ]
            },
            {
                name: 'delete_project', icon: Trash2, descKey: 'toolDeleteProject',
                params: [
                    { name: 'projectId', required: true, desc: { en: 'Project ID to delete', ko: '삭제할 프로젝트 ID' } },
                ]
            },
        ]
    },
    {
        labelKey: 'toolCategoryTask',
        color: 'emerald',
        iconBg: 'from-emerald-500 to-teal-500',
        tools: [
            {
                name: 'get_kanban_board', icon: LayoutDashboard, descKey: 'toolGetKanbanBoard',
                params: [
                    { name: 'projectId', required: true, desc: { en: 'Project ID', ko: '프로젝트 ID' } },
                ]
            },
            {
                name: 'create_task', icon: Activity, descKey: 'toolCreateTask',
                params: [
                    { name: 'projectId', required: true, desc: { en: 'Project ID', ko: '프로젝트 ID' } },
                    { name: 'title', required: true, desc: { en: 'Task title', ko: '태스크 제목' } },
                    { name: 'status', required: false, desc: { en: 'TODO | IN_PROGRESS | REVIEW | DONE', ko: 'TODO | IN_PROGRESS | REVIEW | DONE' } },
                    { name: 'phase', required: false, desc: { en: 'Vibe Coding phase', ko: 'Vibe Coding 단계' } },
                    { name: 'category', required: false, desc: { en: 'Task category', ko: '태스크 카테고리' } },
                    { name: 'taskType', required: false, desc: { en: 'Task type', ko: '태스크 유형' } },
                    { name: 'scale', required: false, desc: { en: 'Task scale', ko: '태스크 규모' } },
                    { name: 'description', required: false, desc: { en: 'Task description', ko: '태스크 설명' } },
                    { name: 'startDate', required: false, desc: { en: 'Start Date (ISO)', ko: '시작일 (ISO)' } },
                    { name: 'dueDate', required: false, desc: { en: 'Due Date (ISO)', ko: '완료일 (ISO)' } },
                ]
            },
            {
                name: 'get_task', icon: Search, descKey: 'toolGetTask',
                params: [
                    { name: 'taskId', required: true, desc: { en: 'Task ID', ko: '태스크 ID' } },
                ]
            },
            {
                name: 'update_task_status', icon: Layers, descKey: 'toolUpdateTaskStatus',
                params: [
                    { name: 'taskId', required: true, desc: { en: 'Task ID', ko: '태스크 ID' } },
                    { name: 'status', required: true, desc: { en: 'TODO | IN_PROGRESS | REVIEW | DONE', ko: 'TODO | IN_PROGRESS | REVIEW | DONE' } },
                ]
            },
            {
                name: 'update_task_details', icon: FileEdit, descKey: 'toolUpdateTaskDetails',
                params: [
                    { name: 'taskId', required: true, desc: { en: 'Task ID', ko: '태스크 ID' } },
                    { name: 'description', required: false, desc: { en: 'Task description', ko: '태스크 설명' } },
                    { name: 'beforeWork', required: false, desc: { en: 'Work context', ko: '작업 내용' } },
                    { name: 'afterWork', required: false, desc: { en: 'Work result', ko: '작업 결과' } },
                    { name: 'phase', required: false, desc: { en: 'Vibe Coding phase', ko: 'Vibe Coding 단계' } },
                    { name: 'taskType', required: false, desc: { en: 'Task type', ko: '태스크 유형' } },
                    { name: 'scale', required: false, desc: { en: 'Task scale', ko: '태스크 규모' } },
                    { name: 'startDate', required: false, desc: { en: 'Start Date (ISO)', ko: '시작일 (ISO)' } },
                    { name: 'dueDate', required: false, desc: { en: 'Due Date (ISO)', ko: '완료일 (ISO)' } },
                ]
            },
            {
                name: 'delete_task', icon: Trash2, descKey: 'toolDeleteTask',
                params: [
                    { name: 'taskId', required: true, desc: { en: 'Task ID to delete', ko: '삭제할 태스크 ID' } },
                ]
            },
            {
                name: 'add_comment', icon: MessageSquare, descKey: 'toolAddComment',
                params: [
                    { name: 'taskId', required: true, desc: { en: 'Task ID', ko: '태스크 ID' } },
                    { name: 'content', required: true, desc: { en: 'Comment content', ko: '코멘트 내용' } },
                    { name: 'author', required: false, desc: { en: 'Author name', ko: '작성자 이름' } },
                ]
            },
            {
                name: 'get_comments', icon: MessageCircle, descKey: 'toolGetComments',
                params: [
                    { name: 'taskId', required: true, desc: { en: 'Task ID', ko: '태스크 ID' } },
                ]
            },
        ]
    },
    {
        labelKey: 'toolCategoryDocument',
        color: 'amber',
        iconBg: 'from-amber-500 to-orange-500',
        tools: [
            {
                name: 'get_project_document', icon: FileText, descKey: 'toolGetProjectDocument',
                params: [
                    { name: 'projectId', required: true, desc: { en: 'Project ID', ko: '프로젝트 ID' } },
                    { name: 'docType', required: true, desc: { en: 'ARCHITECTURE | DATABASE | WORKFLOW | API | ENVIRONMENT | CHANGELOG | DEPENDENCIES | DECISION | ISSUE_TRACKER | CODE_REVIEW | TEST | DEPLOY | AI_CONTEXT | API_GUIDE', ko: 'ARCHITECTURE | DATABASE | WORKFLOW | API | ENVIRONMENT | CHANGELOG | DEPENDENCIES | DECISION | ISSUE_TRACKER | CODE_REVIEW | TEST | DEPLOY | AI_CONTEXT | API_GUIDE' } },
                ]
            },
            {
                name: 'update_project_document', icon: FileEdit, descKey: 'toolUpdateProjectDocument',
                params: [
                    { name: 'projectId', required: true, desc: { en: 'Project ID', ko: '프로젝트 ID' } },
                    { name: 'docType', required: true, desc: { en: 'ARCHITECTURE | DATABASE | WORKFLOW | API | ENVIRONMENT | CHANGELOG | DEPENDENCIES | DECISION | ISSUE_TRACKER | CODE_REVIEW | TEST | DEPLOY | AI_CONTEXT | API_GUIDE', ko: 'ARCHITECTURE | DATABASE | WORKFLOW | API | ENVIRONMENT | CHANGELOG | DEPENDENCIES | DECISION | ISSUE_TRACKER | CODE_REVIEW | TEST | DEPLOY | AI_CONTEXT | API_GUIDE' } },
                    { name: 'content', required: true, desc: { en: 'Markdown content', ko: '마크다운 내용' } },
                ]
            },
            {
                name: 'get_project_document_versions', icon: History, descKey: 'toolGetProjectDocumentVersions',
                params: [
                    { name: 'projectId', required: true, desc: { en: 'Project ID', ko: '프로젝트 ID' } },
                    { name: 'docType', required: true, desc: { en: 'ARCHITECTURE | DATABASE | WORKFLOW | API | ENVIRONMENT | CHANGELOG | DEPENDENCIES | DECISION | ISSUE_TRACKER | CODE_REVIEW | TEST | DEPLOY | AI_CONTEXT | API_GUIDE', ko: 'ARCHITECTURE | DATABASE | WORKFLOW | API | ENVIRONMENT | CHANGELOG | DEPENDENCIES | DECISION | ISSUE_TRACKER | CODE_REVIEW | TEST | DEPLOY | AI_CONTEXT | API_GUIDE' } },
                ]
            },
            {
                name: 'restore_project_document_version', icon: RotateCcw, descKey: 'toolRestoreProjectDocumentVersion',
                params: [
                    { name: 'projectId', required: true, desc: { en: 'Project ID', ko: '프로젝트 ID' } },
                    { name: 'docType', required: true, desc: { en: 'ARCHITECTURE | DATABASE | WORKFLOW | API | ENVIRONMENT | CHANGELOG | DEPENDENCIES | DECISION | ISSUE_TRACKER | CODE_REVIEW | TEST | DEPLOY | AI_CONTEXT | API_GUIDE', ko: 'ARCHITECTURE | DATABASE | WORKFLOW | API | ENVIRONMENT | CHANGELOG | DEPENDENCIES | DECISION | ISSUE_TRACKER | CODE_REVIEW | TEST | DEPLOY | AI_CONTEXT | API_GUIDE' } },
                    { name: 'versionId', required: true, desc: { en: 'Version ID to restore', ko: '복원할 버전 ID' } },
                ]
            },
        ]
    },
    {
        labelKey: 'toolCategoryAnalytics',
        color: 'violet',
        iconBg: 'from-violet-500 to-purple-500',
        tools: [
            {
                name: 'get_analytics', icon: BarChart3, descKey: 'toolGetAnalytics',
                params: [
                    { name: 'projectId', required: false, desc: { en: 'Filter by project (optional)', ko: '프로젝트 필터 (선택)' } },
                ]
            },
            {
                name: 'get_recent_tasks', icon: Clock, descKey: 'toolGetRecentTasks',
                params: [
                    { name: 'limit', required: false, desc: { en: 'Number of tasks (default: 50)', ko: '반환 수 (기본: 50)' } },
                ]
            },
        ]
    },
];

export default function IntegrationsPage() {
    const { t, language } = useTranslation();
    const [expandedTool, setExpandedTool] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const mcpConfigStr = `{
  "mcpServers": {
    "vibeplanner": {
      "command": "docker",
      "args": [
        "exec",
        "-i",
        "-e",
        "DP_API_KEY=YOUR_API_KEY_HERE",
        "vibeplanner-mcp",
        "node",
        "dist/index.js"
      ]
    }
  }
}`;

    const handleCopyConfig = () => {
        navigator.clipboard.writeText(mcpConfigStr);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const totalTools = TOOL_CATEGORIES.reduce((sum, cat) => sum + cat.tools.length, 0);

    return (
        <main className="max-w-5xl mx-auto py-12 px-6 sm:px-8">
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
                </div>
            </header>

            {/* Vertical stacked layout */}
            <div className="space-y-10">

                {/* Configuration Card */}
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
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={handleCopyConfig}
                                            className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
                                            title="Copy config"
                                        >
                                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                            <span className="text-[10px] font-medium tracking-wider">{copied ? 'COPIED' : 'COPY'}</span>
                                        </button>
                                        <div className="flex gap-1.5 opacity-50">
                                            <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                                            <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                                            <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-0 overflow-x-auto relative code-block">
                                    <pre className="text-sm font-mono leading-relaxed text-slate-300 p-5 bg-transparent m-0">
                                        {mcpConfigStr}
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
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-mono font-bold px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
                            {totalTools} tools
                        </span>
                        <Server className="w-8 h-8 text-emerald-500/40" />
                    </div>
                </div>

                {/* Available Tools - Full Width, Vertical */}
                <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <Puzzle className="w-6 h-6 text-indigo-500" />
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{t('availableCapabilities')}</h3>
                    </div>
                    <p className="text-sm text-slate-500 mb-8">
                        {t('mcpCapabilitiesDesc')}
                    </p>

                    <div className="space-y-10">
                        {TOOL_CATEGORIES.map((category) => (
                            <div key={category.labelKey}>
                                {/* Category Header */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${category.iconBg} flex items-center justify-center shadow-md`}>
                                        <span className="text-white text-xs font-bold">{category.tools.length}</span>
                                    </div>
                                    <h4 className="text-lg font-bold text-slate-700 dark:text-slate-200">
                                        {t(category.labelKey)}
                                    </h4>
                                </div>

                                {/* Tools Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {category.tools.map((tool) => {
                                        const Icon = tool.icon;
                                        const isExpanded = expandedTool === tool.name;
                                        return (
                                            <div
                                                key={tool.name}
                                                className={`group rounded-xl border transition-all duration-200 cursor-pointer ${isExpanded
                                                    ? 'bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-700 shadow-lg shadow-indigo-500/10 md:col-span-2'
                                                    : 'bg-slate-50 dark:bg-slate-800/50 border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800 shadow-sm hover:shadow-md'
                                                    }`}
                                            >
                                                {/* Tool Header - always visible */}
                                                <div
                                                    className="flex items-center justify-between gap-3 p-4"
                                                    onClick={() => setExpandedTool(isExpanded ? null : tool.name)}
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <Icon className={`w-4 h-4 shrink-0 ${isExpanded ? 'text-indigo-600 dark:text-indigo-400' : 'text-indigo-500 group-hover:text-indigo-600 dark:text-indigo-400'} transition-colors`} />
                                                        <span className="font-bold text-sm text-slate-700 dark:text-slate-200 font-mono tracking-tight truncate">{tool.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <span className="text-xs text-slate-500 hidden sm:inline">{t(tool.descKey)}</span>
                                                        {isExpanded ? (
                                                            <ChevronUp className="w-4 h-4 text-indigo-500" />
                                                        ) : (
                                                            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Mobile description */}
                                                <div className="px-4 pb-2 sm:hidden">
                                                    <p className="text-xs text-slate-500">{t(tool.descKey)}</p>
                                                </div>

                                                {/* Expanded Detail */}
                                                {isExpanded && (
                                                    <div className="px-4 pb-4 border-t border-slate-200 dark:border-slate-700 pt-4 animate-in slide-in-from-top-2">
                                                        {tool.params.length > 0 ? (
                                                            <div className="overflow-x-auto">
                                                                <table className="w-full text-xs">
                                                                    <thead>
                                                                        <tr className="text-left text-slate-400 border-b border-slate-100 dark:border-slate-700">
                                                                            <th className="pb-2 pr-4 font-semibold">Parameter</th>
                                                                            <th className="pb-2 pr-4 font-semibold">Required</th>
                                                                            <th className="pb-2 font-semibold">Description</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {tool.params.map((p) => (
                                                                            <tr key={p.name} className="border-b border-slate-50 dark:border-slate-800 last:border-0">
                                                                                <td className="py-2 pr-4 font-mono font-semibold text-indigo-600 dark:text-indigo-400">{p.name}</td>
                                                                                <td className="py-2 pr-4">
                                                                                    {p.required ? (
                                                                                        <span className="px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-semibold">required</span>
                                                                                    ) : (
                                                                                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">optional</span>
                                                                                    )}
                                                                                </td>
                                                                                <td className="py-2 text-slate-600 dark:text-slate-400">{p.desc[language as 'en' | 'ko']}</td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        ) : (
                                                            <p className="text-xs text-slate-400 italic">
                                                                {language === 'ko' ? '파라미터 없음' : 'No parameters required'}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
