'use client';

import React, { useEffect, useState, useRef } from 'react';
import { fetchProjectDocument, saveProjectDocument, fetchProjectDocumentVersions, restoreDocumentVersionAction } from '@/app/actions/documentActions';
import type { ProjectDocumentVersion } from '@/lib/db';
import MermaidCanvas from '@/components/MermaidCanvas';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { History, Upload, Clock, X, FileText } from 'lucide-react';

interface DocumentCanvasViewProps {
    projectId: string;
    docType: 'ARCHITECTURE' | 'DATABASE' | 'WORKFLOW' | 'API' | 'API_GUIDE' | 'ENVIRONMENT' | 'CHANGELOG' | 'DEPENDENCIES' | 'DECISION';
    title: string;
}

export default function DocumentCanvasView({ projectId, docType, title }: DocumentCanvasViewProps) {
    const [content, setContent] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [versions, setVersions] = useState<ProjectDocumentVersion[]>([]);
    const [showVersions, setShowVersions] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const doc = await fetchProjectDocument(projectId, docType);
            if (doc) {
                setContent(doc.content);
            } else {
                setContent(`이 프로젝트에 대한 **${title}** 문서가 아직 생성되지 않았습니다.\nMCP 툴을 통해 데이터를 연동하거나 파일을 업로드 해주세요.`);
            }
            const vs = await fetchProjectDocumentVersions(projectId, docType);
            setVersions(vs);
        } catch (err) {
            console.error(err);
            setContent('문서를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [projectId, docType, title]);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const text = await file.text();
            const result = await saveProjectDocument(projectId, docType, text, 'Upload');
            if (result.success) {
                await loadData();
            } else {
                alert('파일 업로드 실패: ' + result.error);
            }
        } catch (error) {
            console.error(error);
            alert('파일을 읽는 중 오류가 발생했습니다.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleRestore = async (versionId: string) => {
        if (!confirm('이 버전으로 복구하시겠습니까? 현재 문서는 새로운 버전으로 저장됩니다.')) return;

        try {
            const result = await restoreDocumentVersionAction(projectId, docType, versionId, 'Restore');
            if (result.success) {
                await loadData();
                setShowVersions(false);
            } else {
                alert('버전 복구 실패: ' + result.error);
            }
        } catch (error) {
            console.error(error);
            alert('버전을 복구하는 중 오류가 발생했습니다.');
        }
    };

    // Parse the content: extract the FIRST mermaid block to render as the canvas
    const extractMermaid = (markdown: string) => {
        const mermaidRegex = /```mermaid\s([\s\S]*?)```/;
        const match = markdown.match(mermaidRegex);
        if (match) {
            return {
                mermaidChart: match[1],
                cleanMarkdown: markdown.replace(match[0], '').trim(),
            };
        }
        return { mermaidChart: null, cleanMarkdown: markdown };
    };

    const { mermaidChart, cleanMarkdown } = extractMermaid(content);

    return (
        <>
            <div className="w-full h-[calc(100vh-16rem)] flex flex-col xl:flex-row gap-6">
                {/* Interactive Canvas Area */}
                <div className="flex-grow min-w-0 xl:w-2/3 h-[50vh] xl:h-full flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-wrap items-center justify-between gap-3">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-indigo-500" />
                            {title} Canvas
                        </h3>
                        <div className="flex items-center gap-2">
                            <input
                                type="file"
                                accept=".md,.txt"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-700 disabled:opacity-50"
                            >
                                <Upload className="w-4 h-4" />
                                {uploading ? '업로드...' : '업로드'}
                            </button>
                            <button
                                onClick={() => setShowVersions(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-700 relative"
                            >
                                <History className="w-4 h-4" />
                                버전 기록
                                {versions.length > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-indigo-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                        {versions.length}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="flex-grow w-full relative">
                        {loading ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                            </div>
                        ) : mermaidChart ? (
                            <MermaidCanvas chart={mermaidChart} />
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                                <p className="mb-2">렌더링할 Mermaid 다이어그램이 없습니다.</p>
                                <p className="text-sm">마크다운에 ```mermaid 블록을 추가하세요.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Markdown Documentation Area */}
                <div className="w-full xl:w-1/3 h-[50vh] xl:h-[calc(100vh-16rem)] flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                            상세 명세
                        </h3>
                    </div>
                    <div className="flex-grow p-5 overflow-y-auto prose prose-slate dark:prose-invert max-w-none prose-sm">
                        {loading ? (
                            <div className="flex flex-col gap-3 animate-pulse">
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                            </div>
                        ) : (
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {cleanMarkdown}
                            </ReactMarkdown>
                        )}
                    </div>
                </div>
            </div>

            {/* Version History Modal */}
            {
                showVersions && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[80vh] border border-slate-200 dark:border-slate-800 overflow-hidden">
                            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                    <History className="w-5 h-5 text-indigo-500" />
                                    {title} 문서 버전 기록
                                </h3>
                                <button onClick={() => setShowVersions(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex-grow overflow-y-auto p-4 flex flex-col gap-3">
                                {versions.length === 0 ? (
                                    <div className="text-center py-8 text-slate-500">
                                        버전 기록이 없습니다.
                                    </div>
                                ) : (
                                    versions.map((v) => (
                                        <div key={v.id} className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center gap-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold text-slate-800 dark:text-slate-200">버전 {v.version_number}</span>
                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                                        {v.created_by}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-slate-500 flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {new Date(v.created_at).toLocaleString('ko-KR')}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRestore(v.id)}
                                                className="px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md dark:text-indigo-400 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 whitespace-nowrap transition-colors"
                                            >
                                                이 버전으로 복구
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    );
}
