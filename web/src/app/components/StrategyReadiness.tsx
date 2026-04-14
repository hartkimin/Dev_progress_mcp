'use client';

import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';
import type { StrategyReadiness } from '@/lib/db';

export default function StrategyReadinessSection({ data }: { data: StrategyReadiness | null }) {
    const { t } = useTranslation();
    if (!data) return null;

    const avgScore = data.aggregate.plan_review_avg_score;
    const ycPct = Math.round(data.aggregate.yc_completion_rate * 100);

    const missingYcTop3 = [...data.projects]
        .sort((a, b) => a.yc_completion_rate - b.yc_completion_rate)
        .slice(0, 3)
        .filter(p => p.yc_completion_rate < 1);

    const projectsWithReviews = data.projects
        .filter(p => Object.values(p.plan_review_count_by_kind).some(c => c > 0))
        .slice(0, 5);

    return (
        <div className="mb-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm p-6 shadow-sm">
            <div className="flex flex-wrap items-baseline gap-4 mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {t('strategyReadinessTitle')}
                </h3>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                    {t('ycCompletionLabel')}: <b>{ycPct}%</b>
                    {' · '}
                    {t('planReviewAvgLabel')}: <b>{avgScore != null ? avgScore.toFixed(1) : '-'}</b>
                </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                    <h4 className="text-sm font-semibold mb-2 text-slate-800 dark:text-slate-200">
                        {t('ycMissingTop3Title')}
                    </h4>
                    {missingYcTop3.length === 0 ? (
                        <p className="text-xs text-slate-400">—</p>
                    ) : (
                        <ul className="space-y-2">
                            {missingYcTop3.map(p => (
                                <li key={p.id} className="flex items-center justify-between text-sm">
                                    <span className="truncate pr-2">{p.name}</span>
                                    <Link
                                        href={`/project/${p.id}?view=yc_questions`}
                                        className="shrink-0 text-xs font-medium text-indigo-600 hover:text-indigo-500"
                                    >
                                        {t('startIdeationCta')} →
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                    <h4 className="text-sm font-semibold mb-2 text-slate-800 dark:text-slate-200">
                        {t('recentPlanReviewsTitle')}
                    </h4>
                    {projectsWithReviews.length === 0 ? (
                        <p className="text-xs text-slate-400">—</p>
                    ) : (
                        <ul className="space-y-1">
                            {projectsWithReviews.map(p => {
                                const total = Object.values(p.plan_review_count_by_kind).reduce((a, b) => a + b, 0);
                                return (
                                    <li key={p.id} className="flex items-center justify-between text-sm">
                                        <Link
                                            href={`/project/${p.id}?view=plan_review_hub`}
                                            className="truncate pr-2 hover:text-indigo-600"
                                        >
                                            {p.name}
                                        </Link>
                                        <span className="shrink-0 text-xs text-slate-500">
                                            {total} reviews{p.plan_review_avg_score != null ? ` · ${p.plan_review_avg_score.toFixed(1)}/10` : ''}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
