'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    fetchProjectDocument,
    saveProjectDocument,
    fetchProjectDocumentVersions,
    restoreDocumentVersionAction,
    fetchLiveOpenApiSpec,
} from '@/app/actions/documentActions';
import type { ProjectDocumentVersion } from '@/lib/db';
import {
    FileText,
    History,
    Upload,
    Clock,
    X,
    ChevronDown,
    ChevronRight,
    Lock,
    RefreshCw,
} from 'lucide-react';
import EmptyStatePrompt from '@/components/EmptyStatePrompt';

interface Props {
    projectId: string;
    title: string;
}

type Method = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'options' | 'head';

interface Param {
    name: string;
    in: string;
    required?: boolean;
    description?: string;
    schema?: any;
}

interface Operation {
    summary?: string;
    description?: string;
    operationId?: string;
    tags?: string[];
    parameters?: Param[];
    requestBody?: any;
    responses?: Record<string, any>;
    security?: any[];
}

interface Spec {
    openapi: string;
    info: { title: string; version: string; description?: string };
    servers?: { url: string; description?: string }[];
    paths: Record<string, Partial<Record<Method, Operation>>>;
    components?: {
        schemas?: Record<string, any>;
        securitySchemes?: Record<string, any>;
    };
}

const METHODS: Method[] = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'];

const METHOD_STYLES: Record<Method, { bg: string; text: string; border: string; hover: string }> = {
    get:     { bg: 'bg-sky-500',     text: 'text-white', border: 'border-sky-400',     hover: 'hover:bg-sky-50 dark:hover:bg-sky-950/30' },
    post:    { bg: 'bg-emerald-500', text: 'text-white', border: 'border-emerald-400', hover: 'hover:bg-emerald-50 dark:hover:bg-emerald-950/30' },
    put:     { bg: 'bg-orange-500',  text: 'text-white', border: 'border-orange-400',  hover: 'hover:bg-orange-50 dark:hover:bg-orange-950/30' },
    patch:   { bg: 'bg-teal-500',    text: 'text-white', border: 'border-teal-400',    hover: 'hover:bg-teal-50 dark:hover:bg-teal-950/30' },
    delete:  { bg: 'bg-rose-500',    text: 'text-white', border: 'border-rose-400',    hover: 'hover:bg-rose-50 dark:hover:bg-rose-950/30' },
    options: { bg: 'bg-slate-500',   text: 'text-white', border: 'border-slate-400',   hover: 'hover:bg-slate-50 dark:hover:bg-slate-900/30' },
    head:    { bg: 'bg-slate-500',   text: 'text-white', border: 'border-slate-400',   hover: 'hover:bg-slate-50 dark:hover:bg-slate-900/30' },
};

function extractSpecFromMarkdown(md: string): Spec | null {
    if (!md) return null;
    const fence = /```(?:json)?\s*\n([\s\S]*?)\n```/g;
    let m: RegExpExecArray | null;
    while ((m = fence.exec(md)) !== null) {
        try {
            const obj = JSON.parse(m[1]);
            if (obj && typeof obj === 'object' && obj.openapi && obj.paths) return obj as Spec;
        } catch {}
    }
    try {
        const obj = JSON.parse(md.trim());
        if (obj && obj.openapi && obj.paths) return obj as Spec;
    } catch {}
    return null;
}

function refName(ref: string | undefined): string {
    if (!ref) return '';
    return ref.replace('#/components/schemas/', '');
}

function typeLabel(schema: any): string {
    if (!schema) return 'any';
    if (schema.$ref) return refName(schema.$ref);
    if (schema.type === 'array') return `${typeLabel(schema.items)}[]`;
    if (schema.enum) return `enum(${schema.enum.join(' | ')})`;
    if (schema.format) return `${schema.type}<${schema.format}>`;
    return schema.type || 'object';
}

function SchemaBlock({ schema, schemas }: { schema: any; schemas: Record<string, any> }) {
    if (!schema) return <span className="text-slate-400 italic">no schema</span>;
    if (schema.$ref) {
        const name = refName(schema.$ref);
        const resolved = schemas[name];
        return (
            <div>
                <div className="text-xs font-mono text-indigo-600 dark:text-indigo-400 mb-1">{name}</div>
                {resolved ? <SchemaBlock schema={resolved} schemas={schemas} /> : <span className="text-slate-400 italic">unresolved</span>}
            </div>
        );
    }
    if (schema.type === 'array') {
        return (
            <div className="border-l-2 border-slate-200 dark:border-slate-700 pl-3">
                <div className="text-xs font-mono text-slate-500 mb-1">array of</div>
                <SchemaBlock schema={schema.items} schemas={schemas} />
            </div>
        );
    }
    if (schema.properties) {
        const required = new Set<string>(schema.required || []);
        return (
            <table className="w-full text-sm">
                <thead>
                    <tr className="text-left text-xs text-slate-500 border-b border-slate-200 dark:border-slate-700">
                        <th className="py-1.5 pr-3 font-medium">Property</th>
                        <th className="py-1.5 pr-3 font-medium">Type</th>
                        <th className="py-1.5 pr-3 font-medium">Required</th>
                        <th className="py-1.5 font-medium">Description</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(schema.properties).map(([k, v]: [string, any]) => (
                        <tr key={k} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                            <td className="py-1.5 pr-3 font-mono text-indigo-600 dark:text-indigo-400">{k}</td>
                            <td className="py-1.5 pr-3 font-mono text-slate-600 dark:text-slate-300">{typeLabel(v)}</td>
                            <td className="py-1.5 pr-3">{required.has(k) ? <span className="text-rose-500">✓</span> : <span className="text-slate-400">—</span>}</td>
                            <td className="py-1.5 text-slate-600 dark:text-slate-400">{v.description || ''}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    }
    return <span className="font-mono text-xs text-slate-600 dark:text-slate-300">{typeLabel(schema)}</span>;
}

function OperationRow({
    path,
    method,
    op,
    schemas,
}: {
    path: string;
    method: Method;
    op: Operation;
    schemas: Record<string, any>;
}) {
    const [open, setOpen] = useState(false);
    const style = METHOD_STYLES[method];
    const summary = op.summary || op.operationId || '';
    const hasAuth = (op.security && op.security.length > 0);
    return (
        <div className={`border ${style.border} rounded-md overflow-hidden bg-white dark:bg-slate-900`}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left ${style.hover} transition-colors`}
            >
                <span className={`${style.bg} ${style.text} px-2.5 py-1 text-xs font-bold uppercase rounded-md min-w-[70px] text-center shadow-sm`}>
                    {method}
                </span>
                <span className="font-mono text-sm text-slate-800 dark:text-slate-100 break-all">{path}</span>
                {summary && (
                    <span className="text-sm text-slate-500 dark:text-slate-400 flex-1 truncate">{summary}</span>
                )}
                {hasAuth && <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                {open ? <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />}
            </button>
            {open && (
                <div className="border-t border-slate-200 dark:border-slate-700 p-4 bg-slate-50/50 dark:bg-slate-900/50 space-y-4">
                    {op.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-300">{op.description}</p>
                    )}

                    {op.parameters && op.parameters.length > 0 && (
                        <section>
                            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Parameters</h4>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-xs text-slate-500 border-b border-slate-200 dark:border-slate-700">
                                        <th className="py-1.5 pr-3 font-medium">Name</th>
                                        <th className="py-1.5 pr-3 font-medium">In</th>
                                        <th className="py-1.5 pr-3 font-medium">Type</th>
                                        <th className="py-1.5 pr-3 font-medium">Required</th>
                                        <th className="py-1.5 font-medium">Description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {op.parameters.map((p) => (
                                        <tr key={`${p.in}-${p.name}`} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                                            <td className="py-1.5 pr-3 font-mono text-indigo-600 dark:text-indigo-400">{p.name}</td>
                                            <td className="py-1.5 pr-3"><span className="text-xs px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{p.in}</span></td>
                                            <td className="py-1.5 pr-3 font-mono text-slate-600 dark:text-slate-300">{typeLabel(p.schema)}</td>
                                            <td className="py-1.5 pr-3">{p.required ? <span className="text-rose-500">✓</span> : <span className="text-slate-400">—</span>}</td>
                                            <td className="py-1.5 text-slate-600 dark:text-slate-400">{p.description || ''}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </section>
                    )}

                    {op.requestBody && (
                        <section>
                            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                                Request Body {op.requestBody.required && <span className="text-rose-500 normal-case">(required)</span>}
                            </h4>
                            <div className="border border-slate-200 dark:border-slate-700 rounded-md p-3 bg-white dark:bg-slate-950">
                                {Object.entries(op.requestBody.content || {}).map(([mt, media]: [string, any]) => (
                                    <div key={mt}>
                                        <div className="text-xs font-mono text-slate-500 mb-2">{mt}</div>
                                        <SchemaBlock schema={media.schema} schemas={schemas} />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {op.responses && (
                        <section>
                            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Responses</h4>
                            <div className="space-y-2">
                                {Object.entries(op.responses).map(([code, r]: [string, any]) => {
                                    const ok = code.startsWith('2');
                                    const body = r.content?.['application/json']?.schema;
                                    return (
                                        <div key={code} className="border border-slate-200 dark:border-slate-700 rounded-md overflow-hidden">
                                            <div className={`px-3 py-2 flex items-center gap-3 ${ok ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'bg-amber-50 dark:bg-amber-950/30'}`}>
                                                <span className={`font-mono text-sm font-bold ${ok ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>{code}</span>
                                                <span className="text-sm text-slate-600 dark:text-slate-300">{r.description || ''}</span>
                                            </div>
                                            {body && (
                                                <div className="p-3 bg-white dark:bg-slate-950">
                                                    <SchemaBlock schema={body} schemas={schemas} />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
}

function TagSection({
    tag,
    operations,
    schemas,
}: {
    tag: string;
    operations: { path: string; method: Method; op: Operation }[];
    schemas: Record<string, any>;
}) {
    const [open, setOpen] = useState(true);
    return (
        <section className="border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="w-full flex items-center justify-between py-2 mb-3 text-left"
            >
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 capitalize flex items-center gap-2">
                    {tag}
                    <span className="text-xs text-slate-400 font-normal">{operations.length}</span>
                </h2>
                {open ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
            </button>
            {open && (
                <div className="space-y-2">
                    {operations.map((o) => (
                        <OperationRow key={`${o.method}-${o.path}`} {...o} schemas={schemas} />
                    ))}
                </div>
            )}
        </section>
    );
}

function SchemasSection({ schemas }: { schemas: Record<string, any> }) {
    const [open, setOpen] = useState(false);
    const [expandedName, setExpandedName] = useState<string | null>(null);
    const names = Object.keys(schemas);
    if (names.length === 0) return null;
    return (
        <section className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="w-full flex items-center justify-between py-2 mb-3 text-left"
            >
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    Schemas
                    <span className="text-xs text-slate-400 font-normal">{names.length}</span>
                </h2>
                {open ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
            </button>
            {open && (
                <div className="space-y-2">
                    {names.map((name) => {
                        const expanded = expandedName === name;
                        return (
                            <div key={name} className="border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900">
                                <button
                                    type="button"
                                    onClick={() => setExpandedName(expanded ? null : name)}
                                    className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                >
                                    <span className="font-mono text-sm text-indigo-600 dark:text-indigo-400">{name}</span>
                                    {expanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                                </button>
                                {expanded && (
                                    <div className="border-t border-slate-200 dark:border-slate-700 p-3 bg-slate-50/50 dark:bg-slate-900/50">
                                        <SchemaBlock schema={schemas[name]} schemas={schemas} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}

function deriveTag(p: string): string {
    const seg = p.replace(/^\/api\/v1/, '').split('/').filter(Boolean);
    if (seg.length === 0) return 'root';
    if (seg[0] === 'projects' && seg.length > 2) return seg[2];
    return seg[0];
}

export default function SwaggerApiView({ projectId, title }: Props) {
    const docType = 'API';
    const [loading, setLoading] = useState(true);
    const [spec, setSpec] = useState<Spec | null>(null);
    const [hasDoc, setHasDoc] = useState(true);
    const [versions, setVersions] = useState<ProjectDocumentVersion[]>([]);
    const [showVersions, setShowVersions] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [source, setSource] = useState<'document' | 'live'>('document');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const doc = await fetchProjectDocument(projectId, docType);
            const vs = await fetchProjectDocumentVersions(projectId, docType);
            setVersions(vs);
            if (doc && doc.content.trim()) {
                setHasDoc(true);
                const parsed = extractSpecFromMarkdown(doc.content);
                if (parsed) {
                    setSpec(parsed);
                    setSource('document');
                    return;
                }
            } else {
                setHasDoc(false);
            }
            const live = await fetchLiveOpenApiSpec();
            if (live) {
                setSpec(live as Spec);
                setSource('live');
            } else {
                setSpec(null);
            }
        } catch (err) {
            console.error(err);
            setSpec(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [projectId]);

    const refreshFromLive = async () => {
        setRefreshing(true);
        try {
            const live = await fetchLiveOpenApiSpec();
            if (live) {
                setSpec(live as Spec);
                setSource('live');
            } else {
                alert('라이브 Swagger 스펙을 가져오지 못했습니다.');
            }
        } finally {
            setRefreshing(false);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const text = await file.text();
            const result = await saveProjectDocument(projectId, docType, text, 'Upload');
            if (result.success) await loadData();
            else alert('파일 업로드 실패: ' + result.error);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleRestore = async (versionId: string) => {
        if (!confirm('이 버전으로 복구하시겠습니까?')) return;
        const result = await restoreDocumentVersionAction(projectId, docType, versionId, 'Restore');
        if (result.success) {
            await loadData();
            setShowVersions(false);
        } else {
            alert('버전 복구 실패: ' + result.error);
        }
    };

    const grouped = useMemo(() => {
        if (!spec) return new Map<string, { path: string; method: Method; op: Operation }[]>();
        const map = new Map<string, { path: string; method: Method; op: Operation }[]>();
        for (const [p, ops] of Object.entries(spec.paths || {})) {
            for (const m of METHODS) {
                const op = (ops as any)[m] as Operation | undefined;
                if (!op) continue;
                const tag = (op.tags && op.tags[0]) || deriveTag(p);
                if (!map.has(tag)) map.set(tag, []);
                map.get(tag)!.push({ path: p, method: m, op });
            }
        }
        for (const arr of map.values()) {
            arr.sort((a, b) => a.path.localeCompare(b.path) || METHODS.indexOf(a.method) - METHODS.indexOf(b.method));
        }
        return map;
    }, [spec]);

    if (!loading && !spec && !hasDoc) {
        return (
            <div className="w-full flex-grow flex items-center justify-center min-h-[50vh]">
                <EmptyStatePrompt
                    title={`${title} 문서가 없습니다`}
                    description="OpenAPI/Swagger 명세가 아직 없습니다. 백엔드 Swagger 엔드포인트를 연결하거나 JSON을 업로드해 주세요."
                    suggestedPrompt={`현재 백엔드의 OpenAPI 3.0 스펙을 기반으로 API 명세를 이 항목에 저장해줘.`}
                />
            </div>
        );
    }

    const info = spec?.info;
    const servers = spec?.servers || [{ url: 'http://localhost:3333' }];
    const schemas = spec?.components?.schemas || {};
    const security = spec?.components?.securitySchemes || {};

    return (
        <>
            <div className="w-full h-[calc(100vh-16rem)] flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-wrap items-center justify-between gap-3 shrink-0">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-500" />
                        {title}
                        {spec && (
                            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-mono">
                                OpenAPI {spec.openapi}
                            </span>
                        )}
                        <span className="text-xs text-slate-400">· {source === 'live' ? 'Live Swagger' : 'Saved'}</span>
                    </h3>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={refreshFromLive}
                            disabled={refreshing}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-700 disabled:opacity-50"
                            title="백엔드 /api/docs-json 에서 최신 스펙 불러오기"
                        >
                            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                            라이브 동기화
                        </button>
                        <input type="file" accept=".json,.md,.txt" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-700 disabled:opacity-50"
                        >
                            <Upload className="w-4 h-4" />
                            {uploading ? '업로드...' : '업로드'}
                        </button>
                        <button
                            onClick={() => setShowVersions(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-700 relative"
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

                <div className="flex-grow overflow-y-auto">
                    {loading ? (
                        <div className="p-8 flex flex-col gap-3 animate-pulse">
                            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                            <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded" />
                        </div>
                    ) : !spec ? (
                        <div className="p-8 text-center text-slate-500">
                            유효한 OpenAPI 스펙을 찾을 수 없습니다. "라이브 동기화"를 눌러 백엔드에서 가져오거나 Swagger JSON을 업로드해 주세요.
                        </div>
                    ) : (
                        <div className="max-w-5xl mx-auto px-8 py-6">
                            <header className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-800">
                                <div className="flex items-baseline gap-3 flex-wrap">
                                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{info?.title || 'API'}</h1>
                                    {info?.version && (
                                        <span className="text-sm font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                            v{info.version}
                                        </span>
                                    )}
                                </div>
                                {info?.description && (
                                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{info.description}</p>
                                )}
                                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                    <div>
                                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Servers</div>
                                        <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-0.5">
                                            {servers.map((s, i) => (
                                                <li key={i} className="font-mono">{s.url}{s.description ? <span className="text-slate-400"> — {s.description}</span> : null}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Authentication</div>
                                        <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-0.5">
                                            {Object.keys(security).length === 0 ? (
                                                <li>Bearer JWT / API Key (<code className="font-mono text-xs">vp_…</code>)</li>
                                            ) : (
                                                Object.entries(security).map(([k, v]: [string, any]) => (
                                                    <li key={k} className="flex items-center gap-1.5">
                                                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                                                        <span className="font-mono">{k}</span>
                                                        <span className="text-slate-400">— {v.type}{v.scheme ? `/${v.scheme}` : ''}{v.bearerFormat ? ` (${v.bearerFormat})` : ''}</span>
                                                    </li>
                                                ))
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </header>

                            {[...grouped.keys()].sort().map((tag) => (
                                <TagSection key={tag} tag={tag} operations={grouped.get(tag)!} schemas={schemas} />
                            ))}

                            <SchemasSection schemas={schemas} />
                        </div>
                    )}
                </div>
            </div>

            {showVersions && (
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
                                <div className="text-center py-8 text-slate-500">버전 기록이 없습니다.</div>
                            ) : (
                                versions.map((v) => (
                                    <div key={v.id} className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold text-slate-800 dark:text-slate-200">버전 {v.version_number}</span>
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">{v.created_by}</span>
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
            )}
        </>
    );
}
