'use client';
import { useEffect, useMemo, useState, useTransition } from 'react';
import { getLatestYCAnswers, saveYCAnswers } from '@/app/actions/planReviewActions';
import type { YcAnswersInput, YcAnswer } from '@/lib/db';
import { useTranslation } from '@/lib/i18n';
import { Lightbulb, Users, AlertTriangle, Target, Crosshair, Eye, Rocket, Save, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

interface Props { projectId: string; }

type QKey = keyof YcAnswersInput;

interface QDef {
    key: QKey;
    num: number;
    titleK: string;
    placeholderK: string;
    icon: React.ComponentType<any>;
    accent: string;       // dot color
    gradient: string;     // header gradient
    ring: string;
    tag: string;          // label tag bg
}

const QUESTIONS: QDef[] = [
    { key: 'q1Demand',      num: 1, titleK: 'yc.q1', placeholderK: 'yc.q1.placeholder', icon: Users,          accent: 'bg-rose-500',    gradient: 'from-rose-50 to-white dark:from-rose-900/20 dark:to-slate-900',       ring: 'ring-rose-400/40',    tag: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' },
    { key: 'q2StatusQuo',   num: 2, titleK: 'yc.q2', placeholderK: 'yc.q2.placeholder', icon: AlertTriangle,  accent: 'bg-amber-500',   gradient: 'from-amber-50 to-white dark:from-amber-900/20 dark:to-slate-900',     ring: 'ring-amber-400/40',   tag: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
    { key: 'q3Specific',    num: 3, titleK: 'yc.q3', placeholderK: 'yc.q3.placeholder', icon: Target,         accent: 'bg-blue-500',    gradient: 'from-blue-50 to-white dark:from-blue-900/20 dark:to-slate-900',       ring: 'ring-blue-400/40',    tag: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
    { key: 'q4Wedge',       num: 4, titleK: 'yc.q4', placeholderK: 'yc.q4.placeholder', icon: Crosshair,      accent: 'bg-indigo-500',  gradient: 'from-indigo-50 to-white dark:from-indigo-900/20 dark:to-slate-900',   ring: 'ring-indigo-400/40',  tag: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' },
    { key: 'q5Observation', num: 5, titleK: 'yc.q5', placeholderK: 'yc.q5.placeholder', icon: Eye,            accent: 'bg-emerald-500', gradient: 'from-emerald-50 to-white dark:from-emerald-900/20 dark:to-slate-900', ring: 'ring-emerald-400/40', tag: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
    { key: 'q6FutureFit',   num: 6, titleK: 'yc.q6', placeholderK: 'yc.q6.placeholder', icon: Rocket,         accent: 'bg-purple-500',  gradient: 'from-purple-50 to-white dark:from-purple-900/20 dark:to-slate-900',   ring: 'ring-purple-400/40',  tag: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
];

function isFilled(v: string | undefined | null): boolean {
    return !!v && v.trim().length > 0;
}

export default function YCQuestionsCard({ projectId }: Props) {
    const { t } = useTranslation();
    const [vals, setVals] = useState<YcAnswersInput>({});
    const [saved, setSaved] = useState<YcAnswersInput>({});
    const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
    const [saving, startSave] = useTransition();
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const latest = (await getLatestYCAnswers(projectId)) as YcAnswer | null;
            if (!cancelled && latest) {
                const v: YcAnswersInput = {
                    q1Demand: latest.q1_demand,
                    q2StatusQuo: latest.q2_status_quo,
                    q3Specific: latest.q3_specific,
                    q4Wedge: latest.q4_wedge,
                    q5Observation: latest.q5_observation,
                    q6FutureFit: latest.q6_future_fit,
                };
                setVals(v);
                setSaved(v);
                if (latest.created_at) setLastSavedAt(new Date(latest.created_at));
            }
            if (!cancelled) setLoaded(true);
        })();
        return () => { cancelled = true; };
    }, [projectId]);

    const filledCount = useMemo(
        () => QUESTIONS.filter(q => isFilled(vals[q.key])).length,
        [vals]
    );
    const progressPct = Math.round((filledCount / QUESTIONS.length) * 100);

    const isDirty = useMemo(
        () => QUESTIONS.some(q => (vals[q.key] ?? '') !== (saved[q.key] ?? '')),
        [vals, saved]
    );

    const handleSave = () => {
        startSave(async () => {
            await saveYCAnswers(projectId, vals);
            setSaved(vals);
            setLastSavedAt(new Date());
        });
    };

    if (!loaded) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <section className="flex flex-col gap-6">
            {/* Hero Header */}
            <header className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-indigo-950/40 dark:via-slate-900 dark:to-purple-950/40 shadow-sm p-6 md:p-8">
                <div className="absolute -top-8 -right-8 w-48 h-48 bg-indigo-200/30 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg ring-4 ring-indigo-100 dark:ring-indigo-900/30 shrink-0">
                            <Lightbulb className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700 dark:text-indigo-300 bg-white/70 dark:bg-slate-900/70 px-2 py-0.5 rounded-full ring-1 ring-indigo-200 dark:ring-indigo-800">
                                    YC Office Hours
                                </span>
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Ideation Phase</span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight">
                                {t('yc.title')}
                            </h2>
                            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                                수요·문제·웨지·관찰·미래 적합성을 6가지 질문으로 짚고, 기획 단계의 가정을 검증하세요.
                            </p>
                        </div>
                    </div>

                    {/* Save action */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                        <button
                            disabled={saving || !isDirty}
                            onClick={handleSave}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all ${isDirty && !saving ? 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-md' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed'}`}
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : isDirty ? <Save className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                            {saving ? t('common.saving') : isDirty ? t('common.save') : '저장됨'}
                        </button>
                        {lastSavedAt && (
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                최근 저장: {lastSavedAt.toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Seoul' })}
                            </span>
                        )}
                    </div>
                </div>

                {/* Progress bar */}
                <div className="relative mt-6 flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full bg-white/70 dark:bg-slate-800/70 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                            style={{ width: `${progressPct}%` }}
                        />
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 tabular-nums shrink-0">
                        {filledCount} / {QUESTIONS.length} 답변 완료
                    </span>
                </div>
            </header>

            {/* Questions — Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-fr">
                {QUESTIONS.map((q) => {
                    const Icon = q.icon;
                    const value = vals[q.key] ?? '';
                    const filled = isFilled(value);
                    const charCount = value.length;
                    const dirty = (vals[q.key] ?? '') !== (saved[q.key] ?? '');

                    return (
                        <article
                            key={q.key}
                            className={`relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col ${filled ? 'ring-1 ring-inset ' + q.ring : ''}`}
                        >
                            {/* Top accent bar */}
                            <div className={`h-1 w-full ${q.accent}`} />

                            {/* Header */}
                            <div className={`bg-gradient-to-br ${q.gradient} p-4 border-b border-slate-100 dark:border-slate-800/60`}>
                                <div className="flex items-start gap-3">
                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white shadow-sm ${q.accent} shrink-0`}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${q.tag}`}>
                                                Q{q.num}
                                            </span>
                                            {filled && (
                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                                            )}
                                        </div>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                                            {t(q.titleK)}
                                        </h3>
                                    </div>
                                </div>
                                <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                                    <Sparkles className="w-3 h-3 inline-block mr-1 opacity-70" />
                                    {t(q.placeholderK)}
                                </p>
                            </div>

                            {/* Textarea */}
                            <div className="p-4 flex flex-col gap-2 flex-1">
                                <textarea
                                    value={value}
                                    onChange={(e) => setVals((v) => ({ ...v, [q.key]: e.target.value }))}
                                    placeholder={t(q.placeholderK)}
                                    className={`w-full flex-1 min-h-[160px] p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 text-slate-800 dark:text-slate-100 text-[14px] leading-relaxed outline-none focus:ring-2 ${q.ring} focus:bg-white dark:focus:bg-slate-900 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 font-sans resize-none`}
                                />
                                <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                                    <span className="tabular-nums">{charCount > 0 ? `${charCount}자` : '미작성'}</span>
                                    {dirty && (
                                        <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                            미저장
                                        </span>
                                    )}
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>

            {/* Sticky footer save shortcut */}
            {isDirty && (
                <div className="sticky bottom-4 z-10 flex justify-center">
                    <button
                        disabled={saving}
                        onClick={handleSave}
                        className="flex items-center gap-2 px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-xl ring-4 ring-indigo-600/20 transition-all"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? t('common.saving') : '변경사항 저장'}
                    </button>
                </div>
            )}
        </section>
    );
}
