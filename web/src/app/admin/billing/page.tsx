'use client';

import { useTranslation } from '@/lib/i18n';
import { CreditCard, CheckCircle2, Download, Zap } from 'lucide-react';

export default function BillingPage() {
    const { t } = useTranslation();

    return (
        <main className="max-w-4xl py-12 px-6 sm:px-8">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('billing')}</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">{t('billingSubtitle')}</p>
                </div>
                <button className="self-start sm:self-auto px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
                    <Download size={16} />
                    Download Invoices
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Current Plan Overview */}
                <div className="lg:col-span-2">
                    <div className="bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-3xl p-1 shadow-lg shadow-indigo-500/20">
                        <div className="bg-slate-900 dark:bg-slate-950/80 rounded-[22px] p-8 h-full">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        Pro Plan
                                        <span className="bg-indigo-500/20 text-indigo-300 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold">Active</span>
                                    </h2>
                                    <p className="text-slate-400 mt-1 text-sm">{t('proPlanDesc')}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-3xl font-black text-white">$49</span>
                                    <span className="text-slate-400 text-sm">/mo</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-8 mb-8">
                                {[
                                    'Unlimited Projects', 'Automated Cloud Sync',
                                    'Full MCP Extensions', 'Priority AI Support'
                                ].map((feature) => (
                                    <div key={feature} className="flex items-center gap-2">
                                        <CheckCircle2 size={16} className="text-cyan-400 shrink-0" />
                                        <span className="text-sm font-medium text-slate-200">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between items-center border-t border-slate-700/50 pt-6 mt-6">
                                <span className="text-sm text-slate-400">Renews on Oct 24, 2026</span>
                                <button className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-bold rounded-xl transition-all backdrop-blur-sm">
                                    Manage Subscription
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Method */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-md font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                            <CreditCard size={18} className="text-indigo-500" />
                            {t('paymentMethod')}
                        </h3>

                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-7 bg-slate-800 rounded flex items-center justify-center">
                                    <span className="text-white font-bold text-[10px] italic">VISA</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">•••• 4242</p>
                                    <p className="text-xs text-slate-500">Expires 12/28</p>
                                </div>
                            </div>
                        </div>

                        <button className="w-full mt-4 px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                            {t('updatePayment')}
                        </button>
                    </div>

                    {/* Usage Stats Mini */}
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-md font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                            <Zap size={18} className="text-amber-500" />
                            API Usage
                        </h3>
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-600 dark:text-slate-400">Total Requests</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">12,450 / 50,000</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-2">
                                <div className="bg-gradient-to-r from-amber-400 to-amber-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Invoice History */}
            <div className="mt-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm overflow-hidden">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">{t('invoiceHistory')}</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700/50">
                            <tr>
                                <th className="px-6 py-4 font-medium rounded-tl-lg">Date</th>
                                <th className="px-6 py-4 font-medium">Description</th>
                                <th className="px-6 py-4 font-medium">Amount</th>
                                <th className="px-6 py-4 font-medium rounded-tr-lg">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { date: 'Sep 24, 2026', desc: 'Pro Plan Subscription', amount: '$49.00', status: 'Paid' },
                                { date: 'Aug 24, 2026', desc: 'Pro Plan Subscription', amount: '$49.00', status: 'Paid' },
                                { date: 'Jul 24, 2026', desc: 'Pro Plan Subscription', amount: '$49.00', status: 'Paid' },
                            ].map((invoice, idx) => (
                                <tr key={idx} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{invoice.date}</td>
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{invoice.desc}</td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{invoice.amount}</td>
                                    <td className="px-6 py-4">
                                        <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-2 py-1 rounded">
                                            {invoice.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </main>
    );
}
