'use client';

import React from 'react';
import { useTranslation } from '@/lib/i18n';
import { Copy, Sparkles, Check } from 'lucide-react';

interface EmptyStatePromptProps {
    title: string;
    description: string;
    suggestedPrompt: string;
}

export default function EmptyStatePrompt({ title, description, suggestedPrompt }: EmptyStatePromptProps) {
    const { language } = useTranslation();
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(suggestedPrompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="w-full flex flex-col items-center justify-center p-8 md:p-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
            <div className="w-12 h-12 flex items-center justify-center bg-indigo-50 dark:bg-indigo-500/10 rounded-full mb-4 ring-8 ring-indigo-50/50 dark:ring-indigo-500/5">
                <Sparkles className="w-6 h-6 text-indigo-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">{title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-8 leading-relaxed">
                {description}
            </p>

            <div className="w-full max-w-2xl bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-indigo-100 dark:border-indigo-500/20 p-5 relative group text-left shadow-sm">
                <div className="absolute -top-3 left-6 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm border border-indigo-200 dark:border-indigo-500/30">
                    <Sparkles className="w-3 h-3" />
                    {language === 'ko' ? 'AI 프롬프트 제안' : 'AI Prompt Suggestion'}
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 font-medium whitespace-pre-wrap mt-2 pr-12 leading-relaxed font-mono">
                    &quot;{suggestedPrompt}&quot;
                </p>
                <div className="absolute top-0 right-0 h-full flex flex-col justify-center px-4">
                    <button
                        onClick={handleCopy}
                        className="p-2.5 bg-white dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 border border-slate-200 dark:border-slate-600 rounded-lg transition-all shadow-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 active:scale-95"
                        title={language === 'ko' ? '프롬프트 복사' : 'Copy prompt'}
                    >
                        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                    {copied && (
                        <p className="absolute -bottom-6 right-0 text-[10px] text-emerald-500 font-bold animate-pulse whitespace-nowrap">
                            {language === 'ko' ? '복사 완료!' : 'Copied!'}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
