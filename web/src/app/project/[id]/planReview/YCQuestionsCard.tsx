'use client';
import { useEffect, useState, useTransition } from 'react';
import { getLatestYCAnswers, saveYCAnswers, type YcAnswersInput, type YcAnswer } from '@/app/actions/planReviewActions';
import { useTranslation } from '@/lib/i18n';

// NOTE: i18n hook in this project is `useTranslation` (not `useI18n`).
// The YC translation keys (yc.title, yc.q1…q6, yc.*.placeholder) are not yet
// registered in web/src/lib/i18n.tsx — t() falls back to the key string, which
// is readable English. T14 should register these keys in the translations map.

interface Props { projectId: string; }

export default function YCQuestionsCard({ projectId }: Props) {
    const { t } = useTranslation();
    const [vals, setVals] = useState<YcAnswersInput>({});
    const [saving, startSave] = useTransition();
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const latest = (await getLatestYCAnswers(projectId)) as YcAnswer | null;
            if (!cancelled && latest) {
                setVals({
                    q1Demand: latest.q1_demand,
                    q2StatusQuo: latest.q2_status_quo,
                    q3Specific: latest.q3_specific,
                    q4Wedge: latest.q4_wedge,
                    q5Observation: latest.q5_observation,
                    q6FutureFit: latest.q6_future_fit,
                });
            }
            if (!cancelled) setLoaded(true);
        })();
        return () => { cancelled = true; };
    }, [projectId]);

    const field = (key: keyof YcAnswersInput, labelKey: string) => (
        <label key={key} className="flex flex-col gap-1 text-sm">
            <span className="font-medium">{t(labelKey)}</span>
            <textarea
                className="rounded border px-2 py-1 bg-transparent"
                rows={3}
                value={vals[key] ?? ''}
                onChange={(e) => setVals((v) => ({ ...v, [key]: e.target.value }))}
                placeholder={t(`${labelKey}.placeholder`)}
            />
        </label>
    );

    if (!loaded) return <div className="rounded-lg border p-4 text-sm opacity-60">{t('loading')}</div>;

    return (
        <section className="rounded-lg border p-4 space-y-3">
            <header className="flex items-center justify-between">
                <h3 className="text-base font-semibold">{t('yc.title')}</h3>
                <button
                    disabled={saving}
                    onClick={() => startSave(async () => { await saveYCAnswers(projectId, vals); })}
                    className="rounded bg-blue-600 px-3 py-1 text-xs text-white disabled:opacity-50"
                >
                    {saving ? t('common.saving') : t('common.save')}
                </button>
            </header>
            <div className="grid gap-3 md:grid-cols-2">
                {field('q1Demand', 'yc.q1')}
                {field('q2StatusQuo', 'yc.q2')}
                {field('q3Specific', 'yc.q3')}
                {field('q4Wedge', 'yc.q4')}
                {field('q5Observation', 'yc.q5')}
                {field('q6FutureFit', 'yc.q6')}
            </div>
        </section>
    );
}
