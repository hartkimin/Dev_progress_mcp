/**
 * Next.js API route — claude-orchestra daemon (9801) 로 투명 프록시.
 *
 * 브라우저 → /api/orchestra/dreams/recent?n=10
 *       → 이 route 가 http://orchestrator:9801/dreams/recent?n=10 으로 fetch
 *       → 응답 그대로 스트리밍
 *
 * 컨테이너 내부 DNS (docker compose 같은 network) 로 서버사이드 호출.
 * same-origin 이라 브라우저 CORS 불필요.
 *
 * 환경변수:
 *   ORCHESTRA_API_URL  기본 http://orchestra-daemon:9801 (container_name 기준)
 *                      통합 compose 또는 manual `docker network connect` 둘 다 작동
 *                      호스트 개발 모드 (web 이 docker 밖) 면 http://127.0.0.1:9801
 */

import { NextRequest } from 'next/server';

const BACKEND = process.env.ORCHESTRA_API_URL || 'http://orchestra-daemon:9801';
const TIMEOUT_MS = 10_000;

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, ctx: Ctx) {
    const { path } = await ctx.params;
    const search = new URL(req.url).search;
    const url = `${BACKEND}/${(path || []).join('/')}${search}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
        const resp = await fetch(url, {
            method: 'GET',
            headers: { Accept: 'application/json' },
            signal: controller.signal,
            cache: 'no-store',
        });
        const body = await resp.text();
        return new Response(body, {
            status: resp.status,
            headers: {
                'Content-Type': resp.headers.get('Content-Type') || 'application/json',
                'Cache-Control': 'no-store',
            },
        });
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return Response.json(
            {
                error: 'orchestra_unreachable',
                backend: BACKEND,
                detail: msg.slice(0, 200),
            },
            { status: 502 },
        );
    } finally {
        clearTimeout(timer);
    }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
