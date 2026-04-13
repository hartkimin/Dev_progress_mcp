'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';
import { MessageSquare, X, Wrench, Zap, Lock } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function AiSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [modelTier, setModelTier] = useState<'free' | 'pro'>('free');
  const pathname = usePathname();

  // Extract projectId if on a project page
  const projectIdMatch = pathname?.match(/^\/project\/([^\/]+)/);
  const projectId = projectIdMatch ? projectIdMatch[1] : undefined;

  const { messages, input, handleInputChange, handleSubmit, isLoading } = (useChat as any)({
    api: '/api/ai/chat',
    body: { projectId, modelTier },
  });


  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 p-4 bg-indigo-600 text-white rounded-full shadow-2xl hover:bg-indigo-700 transition-all z-50 flex items-center justify-center group"
        >
          <MessageSquare size={24} />
        </button>
      )}

      {/* Sidebar Overlay */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 w-80 bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 z-[200] flex flex-col transform transition-transform duration-300">
          <div className="flex flex-col p-4 border-b border-slate-200 dark:border-slate-800 gap-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <MessageSquare size={18} className="text-indigo-500" />
                VibePlanner AI
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* AI Model Tiering Selector (Monetization Demo) */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button
                onClick={() => setModelTier('free')}
                className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all ${modelTier === 'free' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-slate-200' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                GPT-4o mini (Free)
              </button>
              <button
                onClick={() => setModelTier('pro')}
                className={`flex-1 flex items-center justify-center gap-1 text-xs font-medium py-1.5 rounded-md transition-all ${modelTier === 'pro' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                o3-mini (Pro) {modelTier !== 'pro' && <Lock size={10} />}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 text-sm text-center mt-10">
                Hi! Im your AI project assistant. Ask me to generate tasks, write specs, or give advice!
              </p>
            ) : (
              (messages as any[]).map((m: any) => (
                <div key={m.id} className="flex flex-col gap-1">
                  {m.content && (
                    <div
                      className={`max-w-[85%] rounded-2xl p-3 text-sm ${m.role === 'user'
                          ? 'bg-indigo-600 text-white ml-auto rounded-br-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 mr-auto rounded-bl-sm'
                        }`}
                    >
                      {m.content}
                    </div>
                  )}
                  {m.toolInvocations?.map((tool: any) => (
                    <div key={tool.toolCallId} className="max-w-[85%] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs rounded-lg p-2 mr-auto border border-indigo-100 dark:border-indigo-800/50 flex items-center gap-1.5">
                      <Wrench size={12} />
                      <span className="font-medium">{tool.toolName}</span>
                      {tool.state === 'result' ? ' (Completed)' : ' (Running...)'}
                    </div>
                  ))}
                </div>
              ))
            )}
            {isLoading && (
              <div className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 max-w-[85%] rounded-2xl p-3 text-sm mr-auto rounded-bl-sm animate-pulse flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t border-slate-200 dark:border-slate-800 relative">
            <input
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
              value={input}
              placeholder={modelTier === 'pro' ? "Pro: Architect your system..." : "Free: Ask for simple tasks..."}
              onChange={handleInputChange}
              disabled={isLoading}
            />
            {modelTier === 'pro' && (
              <Zap size={16} className="absolute right-7 top-1/2 -translate-y-1/2 text-amber-500" />
            )}
          </form>
        </div>
      )}
    </>
  );
}
