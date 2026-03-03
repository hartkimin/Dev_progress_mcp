'use client';
import React, { useState, useEffect, useTransition } from 'react';
import { getCommentsAction, addCommentAction } from './actions';
import { Loader2, MessageSquare, Send } from 'lucide-react';
import { Comment } from '@/lib/db';

export function TaskComments({ taskId }: { taskId: string }) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isPosting, startTransition] = useTransition();

    const fetchComments = async () => {
        setIsLoading(true);
        const data = await getCommentsAction(taskId);
        setComments(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchComments();
    }, [taskId]);

    const handlePostComment = () => {
        if (!newComment.trim()) return;
        const currentContent = newComment;
        setNewComment('');

        startTransition(async () => {
            await addCommentAction(taskId, 'Admin Developer', currentContent);
            await fetchComments();
        });
    };

    return (
        <div className="flex flex-col gap-4 mt-6 border-t border-slate-200 dark:border-slate-800 pt-6">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-500" />
                Comments ({comments.length})
            </h4>

            <div className="flex flex-col gap-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {isLoading ? (
                    <div className="flex justify-center p-4 text-slate-400">
                        <Loader2 className="w-5 h-5 animate-spin" />
                    </div>
                ) : comments.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400 italic py-2">No comments yet.</p>
                ) : (
                    comments.map(c => (
                        <div key={c.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-sm">
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{c.author}</span>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500">{new Date(c.created_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}</span>
                            </div>
                            <p className="text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{c.content}</p>
                        </div>
                    ))
                )}
            </div>

            <div className="flex relative mt-1">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full text-sm p-3 pr-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none min-h-[80px] shadow-sm"
                />
                <button
                    onClick={handlePostComment}
                    disabled={isPosting || !newComment.trim()}
                    className="absolute right-2 bottom-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
                >
                    {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
            </div>
        </div>
    );
}
