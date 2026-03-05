'use client';

import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';

interface MermaidCanvasProps {
    chart: string;
}

export default function MermaidCanvas({ chart }: MermaidCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [svg, setSvg] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        mermaid.initialize({
            startOnLoad: true,
            theme: 'default',
            securityLevel: 'loose',
            fontFamily: 'Inter, sans-serif'
        });

        const renderChart = async () => {
            try {
                if (containerRef.current && chart.trim()) {
                    setError(null);
                    const id = `mermaid-svg-${Math.random().toString(36).substring(2, 9)}`;
                    const { svg } = await mermaid.render(id, chart);
                    setSvg(svg);
                } else if (!chart.trim()) {
                    setSvg('');
                }
            } catch (err: any) {
                console.error('Mermaid rendering failed', err);
                setError(err.message || '다이어그램 렌더링에 실패했습니다.');
                setSvg('');
            }
        };

        renderChart();
    }, [chart]);

    if (!chart.trim()) return null;

    return (
        <div className="relative w-full h-[600px] border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900 group">
            {error ? (
                <div className="p-4 text-rose-500 bg-rose-50 dark:bg-rose-900/20 text-sm font-mono whitespace-pre w-full h-full overflow-auto">
                    {error}
                </div>
            ) : (
                <TransformWrapper
                    initialScale={1}
                    minScale={0.1}
                    maxScale={5}
                    centerOnInit
                    wheel={{ step: 0.1 }}
                >
                    {({ zoomIn, zoomOut, resetTransform, centerView }) => (
                        <>
                            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => zoomIn()}
                                    className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                                    title="확대 (Zoom In)"
                                >
                                    <ZoomIn className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => zoomOut()}
                                    className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                                    title="축소 (Zoom Out)"
                                >
                                    <ZoomOut className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => centerView()}
                                    className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                                    title="화면 맞춤 (Fit to screen)"
                                >
                                    <Maximize className="w-4 h-4" />
                                </button>
                            </div>
                            <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }}>
                                <div
                                    ref={containerRef}
                                    className="w-full h-full flex items-center justify-center p-8"
                                    dangerouslySetInnerHTML={{ __html: svg }}
                                />
                            </TransformComponent>
                        </>
                    )}
                </TransformWrapper>
            )}
        </div>
    );
}
