'use client';

import React, { useState } from 'react';
import { fetchProjectDocument } from '@/app/actions/documentActions';
import { useTranslation } from '@/lib/i18n';
import { Brain, Clock, FileText, Bot, ChevronDown, ChevronUp, AlertTriangle, Cpu, FolderOpen, MessageSquare } from 'lucide-react';
import EmptyStatePrompt from '@/components/EmptyStatePrompt';
import PlanReviewHistory from './planReview/PlanReviewHistory';

interface AIContext {
    id: string; taskTitle: string; model: string; createdAt: string;
    systemPrompt: string; userPrompt: string; contextFiles: string[];
    resultSummary: string;
}

// Dummy data removed, now fetched from DB

export default function AIContextView({ projectId }: { projectId: string }) {
    const { language } = useTranslation();
    const ko = language === 'ko';
    const [expanded, setExpanded] = useState<string | null>(null);

    const [contexts, setContexts] = useState<AIContext[]>([]);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const doc = await fetchProjectDocument(projectId, 'AI_CONTEXT');
                if (doc && doc.content) {
                    const parsed = JSON.parse(doc.content);
                    setContexts(Array.isArray(parsed) ? parsed : []);
                } else {
                    setContexts([]);
                }
            } catch (err) {
                console.error("Failed to parse AI_CONTEXT document", err);
                setContexts([]);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [projectId]);

    const MOCK = contexts;

    if (loading) {
        return (
            <div className="w-full flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-6">
            {MOCK.length === 0 ? (
                <EmptyStatePrompt
                    title={ko ? "AI 컨텍스트 기록이 없습니다" : "No AI Context Records"}
                    description={ko ? "아직 이 프로젝트에 대해 AI가 작업을 수행하고 남긴 컨텍스트 기록이 없습니다. AI에게 시스템 프롬프트 및 작업 요약을 포함한 초기 데이터 생성을 요청해보세요." : "There are no AI context records for this project yet. Ask AI to generate initial context data including system prompts and summaries."}
                    suggestedPrompt={ko ? "현재 프로젝트의 성격에 맞는 가상의 AI 컨텍스트(시스템 프롬프트, 사용자 지시, 결과 요약 포함) 데이터 3개를 생성해줘." : "Create data for the 3 most recent virtual AI context records (including system prompt, user prompt, and summary) and add them to the AI Context tab."}
                />
            ) : (
                <>
                    {/* Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { v: MOCK.length, l: ko ? '전체 기록' : 'Total Records', c: 'text-violet-600 dark:text-violet-400', i: <Brain className="w-5 h-5" /> },
                            { v: [...new Set(MOCK.map(m => m.model))].length, l: ko ? '사용 모델' : 'Models Used', c: 'text-indigo-600 dark:text-indigo-400', i: <Cpu className="w-5 h-5" /> },
                            { v: MOCK.reduce((a, m) => a + m.contextFiles.length, 0), l: ko ? '컨텍스트 파일' : 'Context Files', c: 'text-emerald-600 dark:text-emerald-400', i: <FolderOpen className="w-5 h-5" /> },
                            { v: MOCK.length, l: ko ? '프롬프트' : 'Prompts', c: 'text-amber-600 dark:text-amber-400', i: <MessageSquare className="w-5 h-5" /> },
                        ].map((card, i) => (
                            <div key={i} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                                <div className={`${card.c} mb-2`}>{card.i}</div>
                                <div className={`text-2xl font-bold ${card.c}`}>{card.v}</div>
                                <div className="text-sm text-slate-500 mt-1">{card.l}</div>
                            </div>
                        ))}
                    </div>

                    {/* Context Records */}
                    <div className="flex flex-col gap-3">
                        {MOCK.map(ctx => {
                            const isExp = expanded === ctx.id;
                            return (
                                <div key={ctx.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                                    <button onClick={() => setExpanded(isExp ? null : ctx.id)} className="w-full p-4 text-left flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <div className="shrink-0 w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center">
                                            <Bot className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-medium text-slate-800 dark:text-slate-200">{ctx.taskTitle}</span>
                                                <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">{ctx.model}</span>
                                            </div>
                                            <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(ctx.createdAt).toLocaleDateString(ko ? 'ko-KR' : 'en-US')}</span>
                                                <span className="flex items-center gap-1"><FolderOpen className="w-3 h-3" />{ctx.contextFiles.length} {ko ? '파일' : 'files'}</span>
                                            </div>
                                        </div>
                                        {isExp ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                                    </button>

                                    {isExp && (
                                        <div className="border-t border-slate-200 dark:border-slate-700 p-4 space-y-4 bg-slate-50/50 dark:bg-slate-800/20">
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{ko ? '시스템 프롬프트' : 'System Prompt'}</h4>
                                                <div className="p-3 rounded-lg bg-violet-50 dark:bg-violet-950/30 text-sm text-slate-700 dark:text-slate-300 font-mono">{ctx.systemPrompt}</div>
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{ko ? '사용자 지시사항' : 'User Prompt'}</h4>
                                                <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-sm text-slate-700 dark:text-slate-300">{ctx.userPrompt}</div>
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{ko ? '컨텍스트 파일' : 'Context Files'}</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {ctx.contextFiles.map((f, i) => (
                                                        <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                                            <FileText className="w-3 h-3" />{f}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{ko ? '결과 요약' : 'Result Summary'}</h4>
                                                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-sm text-slate-700 dark:text-slate-300">{ctx.resultSummary}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-xs text-slate-500">
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                        {ko ? 'MCP를 통해 수집된 실제 데이터가 표시됩니다.' : 'Showing live data tracked via MCP.'}
                    </div>
                </>
            )}
            {/* Plan review history — T13 */}
            <PlanReviewHistory projectId={projectId} />
        </div>
    );
}
