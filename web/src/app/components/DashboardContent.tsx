'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransition, useState } from 'react';
import ProjectActions from './ProjectActions';
import LiveSyncIndicator from './LiveSyncIndicator';
import { useTranslation } from '@/lib/i18n';
import type { Project } from '@/lib/db';
import { createProjectAction } from '@/app/actions';

function CreateProjectModal({ onClose, onCreate }: { onClose: () => void; onCreate: (name: string, desc: string) => void }) {
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        onCreate(name.trim(), desc.trim());
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md mx-4 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6"
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">새 프로젝트 생성</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">프로젝트 정보를 입력하세요.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            프로젝트 이름 <span className="text-red-500">*</span>
                        </label>
                        <input
                            autoFocus
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="예: SafeTrip Mobile App"
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            설명 <span className="text-slate-400 font-normal">(선택)</span>
                        </label>
                        <textarea
                            value={desc}
                            onChange={e => setDesc(e.target.value)}
                            placeholder="프로젝트에 대한 간단한 설명..."
                            rows={3}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                        />
                    </div>
                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={!name.trim()}
                            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
                        >
                            생성
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function CreateProjectButton() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [showModal, setShowModal] = useState(false);

    const handleCreate = (name: string, desc: string) => {
        setShowModal(false);
        startTransition(async () => {
            const result = await createProjectAction(name, desc);
            if (result.success) {
                router.push(`/project/${result.id}`);
            }
        });
    };

    return (
        <>
            {showModal && (
                <CreateProjectModal
                    onClose={() => setShowModal(false)}
                    onCreate={handleCreate}
                />
            )}
            <button
                onClick={() => setShowModal(true)}
                disabled={isPending}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2"
            >
                {isPending ? (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                )}
                Create Project
            </button>
        </>
    );
}

export default function DashboardContent({ projects }: { projects: Project[] }) {
    const { t } = useTranslation();

    return (
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <header className="mb-12 border-b border-slate-200/60 dark:border-slate-800/60 pb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4 backdrop-blur-sm">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-500 dark:from-indigo-400 dark:to-cyan-400">
                        {t('developerConsole') || "Developer Console"}
                    </h1>
                    <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
                        {t('developerConsoleSubtitle') || "Real-time synchronization with MCP local context. Track your coding progress effortlessly."}
                    </p>
                </div>
                <LiveSyncIndicator />
            </header>

            <section>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                        <span className="w-2.5 h-8 bg-gradient-to-b from-indigo-500 to-cyan-500 rounded-full shadow-lg shadow-indigo-500/20 inline-block"></span>
                        {t('activeProjects') || "Active Projects"}
                    </h2>
                    <div className="flex items-center gap-4">
                        <CreateProjectButton />
                        <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                            {projects.length} {projects.length === 1 ? (t('project') || "Project") : (t('projects') || "Projects")}
                        </div>
                    </div>
                </div>

                {projects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 px-4 bg-white dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 shadow-sm dark:shadow-none">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300">{t('noProjectsFound') || "No Projects Found"}</h3>
                        <p className="text-slate-500 mt-2 max-w-sm text-center">
                            {t('getStartedByCreatingProject') || "Get started by creating a project via the MCP tool from your AI assistant."}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
                            <div key={project.id} className="relative group">
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
                                                {project.description || (t('noDescriptionProvided') || "No description provided.")}
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
    );
}
