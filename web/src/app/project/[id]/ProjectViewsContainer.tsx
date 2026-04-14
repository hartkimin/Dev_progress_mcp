'use client';

import React, { useState } from 'react';
import { Task } from '@/lib/db';
import KanbanBoardClient from './KanbanBoardClient';
import CalendarViewClient from './CalendarViewClient';
import DocumentCanvasView from './DocumentCanvasView';
import DocumentMarkdownView from './DocumentMarkdownView';
import ProjectHealthDashboard from './ProjectHealthDashboard';
import IssueTrackerView from './IssueTrackerView';
import CodeReviewView from './CodeReviewView';
import TestDashboardView from './TestDashboardView';
import DeploymentView from './DeploymentView';
import AIContextView from './AIContextView';
import VibePhaseDashboard from './VibePhaseDashboard';
import { useTranslation } from '@/lib/i18n';
import YCQuestionsView from './planReview/YCQuestionsView';
import PlanReviewHub from './planReview/PlanReviewHub';
import PlanReviewBadges from './planReview/PlanReviewBadges';
import {
    LayoutDashboard, Calendar, Bug, BarChart3,
    Box, Database, FileJson,
    GitPullRequest, TestTube2, Server, Rocket,
    Brain, Lightbulb, FileText, Workflow,
    Sparkles, ClipboardList,
} from 'lucide-react';

type ViewType =
    | 'kanban' | 'calendar' | 'issue_tracker' | 'kpi' | 'phase_tracker'
    | 'yc_questions' | 'plan_review_hub'
    | 'architecture' | 'database' | 'api_spec'
    | 'code_review' | 'test' | 'environment' | 'deploy'
    | 'ai_context' | 'decision' | 'changelog';

type CategoryKey = 'overview' | 'ideation' | 'design' | 'build' | 'qa' | 'deploy';

interface CategoryConfig {
    key: CategoryKey;
    emoji: string;
    activeColor: string;
    hoverBg: string;
}

const CATEGORIES: CategoryConfig[] = [
    { key: 'overview', emoji: '🏠', activeColor: 'bg-slate-500/10 text-slate-700 dark:text-slate-200 shadow-[inset_0_-2px_0_0_#64748b]',  hoverBg: 'hover:text-slate-700 dark:hover:text-slate-200' },
    { key: 'ideation', emoji: '💡', activeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-[inset_0_-2px_0_0_#f59e0b]',  hoverBg: 'hover:text-amber-500 dark:hover:text-amber-400' },
    { key: 'design',   emoji: '🏗️', activeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-[inset_0_-2px_0_0_#10b981]', hoverBg: 'hover:text-emerald-500 dark:hover:text-emerald-400' },
    { key: 'build',    emoji: '🔨', activeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-[inset_0_-2px_0_0_#6366f1]',  hoverBg: 'hover:text-indigo-500 dark:hover:text-indigo-400' },
    { key: 'qa',       emoji: '🧪', activeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 shadow-[inset_0_-2px_0_0_#f43f5e]',       hoverBg: 'hover:text-rose-500 dark:hover:text-rose-400' },
    { key: 'deploy',   emoji: '🚀', activeColor: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 shadow-[inset_0_-2px_0_0_#8b5cf6]', hoverBg: 'hover:text-violet-500 dark:hover:text-violet-400' },
];

export default function ProjectViewsContainer({
    tasks,
    categoryStats,
    projectId,
    projectName
}: {
    tasks: Task[],
    categoryStats: Record<string, { total: number, done: number }>,
    projectId: string,
    projectName: string
}) {
    const [view, setView] = useState<ViewType>('kanban');
    const { t } = useTranslation();

    const tabs: { key: ViewType; label: string; icon: React.ReactNode; category: CategoryKey }[] = [
        // 🏠 Overview (cross-cutting)
        { key: 'kanban',        label: t('tabKanban'),       icon: <LayoutDashboard className="w-4 h-4" />, category: 'overview' },
        { key: 'calendar',      label: t('tabCalendar'),     icon: <Calendar className="w-4 h-4" />,        category: 'overview' },
        { key: 'kpi',           label: 'KPI',                icon: <BarChart3 className="w-4 h-4" />,       category: 'overview' },
        { key: 'phase_tracker', label: 'Phases',             icon: <Workflow className="w-4 h-4" />,        category: 'overview' },
        { key: 'ai_context',    label: t('tabAIContext'),    icon: <Brain className="w-4 h-4" />,           category: 'overview' },
        { key: 'decision',      label: t('tabDecision'),     icon: <Lightbulb className="w-4 h-4" />,       category: 'overview' },
        // 💡 Ideation
        { key: 'yc_questions',    label: t('tabYcQuestions'),   icon: <Sparkles className="w-4 h-4" />,      category: 'ideation' },
        { key: 'plan_review_hub', label: t('tabPlanReviewHub'), icon: <ClipboardList className="w-4 h-4" />, category: 'ideation' },
        // 🏗️ Design
        { key: 'architecture',  label: t('tabArchitecture'), icon: <Box className="w-4 h-4" />,             category: 'design' },
        { key: 'database',      label: t('tabDatabase'),     icon: <Database className="w-4 h-4" />,        category: 'design' },
        { key: 'api_spec',      label: t('tabApiSpec'),      icon: <FileJson className="w-4 h-4" />,        category: 'design' },
        // 🔨 Build
        { key: 'code_review',   label: t('tabCodeReview'),   icon: <GitPullRequest className="w-4 h-4" />,  category: 'build' },
        { key: 'environment',   label: t('tabEnvironment'),  icon: <Server className="w-4 h-4" />,          category: 'build' },
        // 🧪 QA
        { key: 'test',          label: t('tabTest'),         icon: <TestTube2 className="w-4 h-4" />,       category: 'qa' },
        { key: 'issue_tracker', label: t('tabIssueTracker'), icon: <Bug className="w-4 h-4" />,             category: 'qa' },
        // 🚀 Deploy
        { key: 'deploy',        label: t('tabDeploy'),       icon: <Rocket className="w-4 h-4" />,          category: 'deploy' },
        { key: 'changelog',     label: t('tabChangelog'),    icon: <FileText className="w-4 h-4" />,        category: 'deploy' },
    ];

    const getCategoryConfig = (catKey: CategoryKey) => CATEGORIES.find(c => c.key === catKey)!;
    const activeCategory = tabs.find(tab => tab.key === view)?.category || 'overview';

    const renderTab = (tab: typeof tabs[0]) => {
        const cat = getCategoryConfig(tab.category);
        const isActive = view === tab.key;
        return (
            <button
                key={tab.key}
                onClick={() => setView(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 whitespace-nowrap ${isActive
                    ? `bg-white dark:bg-slate-700 ${cat.activeColor} shadow-sm`
                    : `text-slate-600 dark:text-slate-400 ${cat.hoverBg}`
                    }`}
            >
                {tab.icon}
                {tab.label}
            </button>
        );
    };

    return (
        <div className="w-full flex flex-col gap-6">
            <div className="flex items-center justify-end w-full overflow-x-auto">
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg gap-0">
                    {CATEGORIES.map((cat, catIdx) => {
                        const catTabs = tabs.filter(t => t.category === cat.key);
                        return (
                            <React.Fragment key={cat.key}>
                                {catIdx > 0 && <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1 shrink-0"></div>}
                                <span className="text-xs px-1 shrink-0 select-none" title={t(`navGroup${cat.key.charAt(0).toUpperCase() + cat.key.slice(1)}`)}>
                                    {cat.emoji}
                                </span>
                                {catTabs.map(renderTab)}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            {/* Plan review badge strip — shown above the active view for relevant phases */}
            {activeCategory === 'ideation' && (
                <PlanReviewBadges projectId={projectId} kinds={['ceo', 'design']} />
            )}
            {activeCategory === 'design' && (
                <PlanReviewBadges projectId={projectId} kinds={['eng', 'design']} />
            )}
            {activeCategory === 'deploy' && (
                <PlanReviewBadges projectId={projectId} kinds={['devex']} />
            )}

            {/* 📋 프로젝트 */}
            {view === 'kanban' && (
                <KanbanBoardClient tasks={tasks} categoryStats={categoryStats} projectId={projectId} projectName={projectName} />
            )}
            {view === 'calendar' && (
                <CalendarViewClient tasks={tasks} projectId={projectId} projectName={projectName} />
            )}
            {view === 'issue_tracker' && (
                <IssueTrackerView projectId={projectId} />
            )}
            {view === 'kpi' && (
                <ProjectHealthDashboard tasks={tasks} categoryStats={categoryStats} projectId={projectId} projectName={projectName} />
            )}
            {view === 'phase_tracker' && (
                <VibePhaseDashboard projectId={projectId} />
            )}

            {/* 💡 Ideation */}
            {view === 'yc_questions' && (
                <YCQuestionsView projectId={projectId} />
            )}
            {view === 'plan_review_hub' && (
                <PlanReviewHub projectId={projectId} />
            )}

            {/* 🏗️ 설계 */}
            {view === 'architecture' && (
                <DocumentCanvasView projectId={projectId} docType="ARCHITECTURE" title={t('tabArchitecture')} />
            )}
            {view === 'database' && (
                <DocumentCanvasView projectId={projectId} docType="DATABASE" title={t('tabDatabase') + ' (ERD)'} />
            )}
            {view === 'api_spec' && (
                <DocumentMarkdownView projectId={projectId} docType="API" title={t('tabApiSpec')} />
            )}

            {/* 🔌 개발 */}
            {view === 'code_review' && (
                <CodeReviewView projectId={projectId} />
            )}
            {view === 'test' && (
                <TestDashboardView projectId={projectId} />
            )}
            {view === 'environment' && (
                <DocumentCanvasView projectId={projectId} docType="ENVIRONMENT" title={t('tabEnvironment')} />
            )}
            {view === 'deploy' && (
                <DeploymentView projectId={projectId} />
            )}

            {/* 🤖 AI 관리 */}
            {view === 'ai_context' && (
                <AIContextView projectId={projectId} />
            )}
            {view === 'decision' && (
                <DocumentMarkdownView projectId={projectId} docType="DECISION" title={t('tabDecision')} />
            )}
            {view === 'changelog' && (
                <DocumentMarkdownView projectId={projectId} docType="CHANGELOG" title={t('tabChangelog')} />
            )}
        </div>
    );
}
