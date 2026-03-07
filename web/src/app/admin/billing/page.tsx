'use client';

import React, { useState, useEffect } from 'react';
import { Check, CreditCard, Zap, ShieldCheck, Star } from 'lucide-react';

const PLANS = [
    {
        name: 'FREE',
        price: '$0',
        description: '개인 기획자 및 초기 아이디어 빌더를 위한 무료 플랜',
        features: ['프로젝트 최대 3개 생성', '기본 AI 가이드 패널', '커뮤니티 지원', '기본 문서 버전 관리'],
        priceId: null,
        buttonText: 'Current Plan',
        isPro: false
    },
    {
        name: 'PRO',
        price: '$19',
        description: '전문 개발팀과 기업을 위한 무제한 기획 도구',
        features: ['프로젝트 무제한 생성', '고급 AI 설계 도구 (MCP 연동)', '실시간 팀 협업 및 동기화', '우선 순위 기술 지원', '고급 분석 대시보드'],
        priceId: 'price_H5ggY...', // 실제 Stripe Price ID로 대체 필요
        buttonText: 'Upgrade to PRO',
        isPro: true
    },
];

export default function BillingPage() {
    const [subscription, setSubscription] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch current subscription status
        const fetchSubscription = async () => {
            try {
                const res = await fetch('/api/billing/subscription');
                if (res.ok) {
                    const data = await res.json();
                    setSubscription(data);
                }
            } catch (err) {
                console.error('Failed to fetch subscription', err);
            } finally {
                setLoading(false);
            }
        };
        fetchSubscription();
    }, []);

    const handleUpgrade = async (priceId: string | null) => {
        if (!priceId) return;

        try {
            const res = await fetch('/api/billing/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priceId }),
            });
            
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url; // Redirect to Stripe Checkout
            }
        } catch (err) {
            alert('결제 세션 생성 중 오류가 발생했습니다.');
        }
    };

    const isCurrentPlan = (plan: typeof PLANS[0]) => {
        if (!subscription) return plan.name === 'FREE';
        return subscription.status === plan.name;
    };

    return (
        <div className="p-8 max-w-6xl mx-auto min-h-screen bg-slate-50 dark:bg-slate-950">
            <header className="mb-12 text-center">
                <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">VibePlanner 요금제</h1>
                <p className="text-lg text-slate-600 dark:text-slate-400">당신의 프로젝트 기획 감성을 실제 코드로 실현하세요.</p>
            </header>

            {/* Current Status Overview */}
            {!loading && subscription && (
                <div className="mb-12 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                            <ShieldCheck size={32} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">현재 이용 중인 플랜: {subscription.status}</h2>
                            <p className="text-slate-500">
                                {subscription.status === 'PRO' 
                                    ? `구독 만료일: ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}` 
                                    : '더 많은 프로젝트를 위해 업그레이드하세요.'}
                            </p>
                        </div>
                    </div>
                    {subscription.status === 'PRO' && (
                        <button className="px-6 py-2 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            구독 관리
                        </button>
                    )}
                </div>
            )}

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {PLANS.map((plan) => (
                    <div 
                        key={plan.name}
                        className={`relative p-8 rounded-3xl border-2 transition-all ${
                            plan.isPro 
                                ? 'border-indigo-600 shadow-xl shadow-indigo-600/10 bg-white dark:bg-slate-900' 
                                : 'border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50'
                        }`}
                    >
                        {plan.isPro && (
                            <div className="absolute top-0 right-8 -translate-y-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                                <Star size={14} fill="white" /> Most Popular
                            </div>
                        )}

                        <div className="mb-8">
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{plan.name}</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-black text-slate-900 dark:text-white">{plan.price}</span>
                                <span className="text-slate-500">/mo</span>
                            </div>
                            <p className="mt-4 text-slate-600 dark:text-slate-400">{plan.description}</p>
                        </div>

                        <ul className="space-y-4 mb-10">
                            {plan.features.map((feature) => (
                                <li key={feature} className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                                    <div className="mt-1 p-0.5 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full">
                                        <Check size={14} strokeWidth={3} />
                                    </div>
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <button
                            disabled={isCurrentPlan(plan)}
                            onClick={() => handleUpgrade(plan.priceId)}
                            className={`w-full py-4 rounded-2xl font-bold transition-all active:scale-[0.98] ${
                                isCurrentPlan(plan)
                                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-default'
                                    : plan.isPro
                                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20'
                                        : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90'
                            }`}
                        >
                            {isCurrentPlan(plan) ? '이용 중인 플랜' : plan.buttonText}
                        </button>
                    </div>
                ))}
            </div>

            <div className="mt-16 p-8 bg-indigo-600 rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="max-w-md">
                    <h3 className="text-2xl font-bold mb-2">기업용 커스텀 플랜이 필요하신가요?</h3>
                    <p className="text-indigo-100">팀 규모에 맞는 맞춤형 인프라와 보안 정책을 지원합니다.</p>
                </div>
                <button className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-2xl shadow-lg hover:bg-indigo-50 transition-colors whitespace-nowrap">
                    영업팀에 문의하기
                </button>
            </div>
        </div>
    );
}
