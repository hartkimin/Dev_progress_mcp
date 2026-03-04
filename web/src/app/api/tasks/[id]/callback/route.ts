import { NextRequest, NextResponse } from 'next/server';
import { updateTaskDetails, updateTaskStatus, updateTaskTitle, getTaskById, setTaskAiProcessing } from '@/lib/db';
import { revalidatePath } from 'next/cache';

/**
 * POST /api/tasks/:id/callback
 *
 * n8n 워크플로우가 AI 실행 결과를 Vibeplanner에 돌려주는 콜백 엔드포인트.
 *
 * Request Body:
 * {
 *   status?: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE',
 *   description?: string,   // AI가 생성한 설명 (Work Context)
 *   afterWork?: string,     // AI가 생성한 결과/요약 (Resolution)
 *   phase?: string,
 *   taskType?: string,
 *   scale?: string,
 *   secret?: string         // 간단한 보안 토큰
 * }
 */
export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id: taskId } = await context.params;

        // 선택적 보안: N8N_CALLBACK_SECRET 환경변수가 있으면 검증
        const callbackSecret = process.env.N8N_CALLBACK_SECRET;
        if (callbackSecret) {
            const authHeader = req.headers.get('x-callback-secret');
            if (authHeader !== callbackSecret) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
        }

        const body = await req.json();
        const {
            status,
            title,
            description,
            beforeWork,
            afterWork,
            phase,
            taskType,
            scale,
        } = body as {
            status?: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
            title?: string;
            description?: string;
            beforeWork?: string;
            afterWork?: string;
            phase?: string;
            taskType?: string;
            scale?: string;
        };

        // 태스크 존재 여부 확인
        const task = await getTaskById(taskId);
        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        const updatedFields: Record<string, boolean> = {};

        // title 업데이트
        if (title !== undefined) {
            await updateTaskTitle(taskId, title, 'n8n-ai-agent');
            updatedFields.title = true;
        }

        // Details 중 하나라도 있으면 업데이트
        if (
            description !== undefined ||
            beforeWork !== undefined ||
            afterWork !== undefined ||
            phase !== undefined ||
            taskType !== undefined ||
            scale !== undefined
        ) {
            await updateTaskDetails(
                taskId,
                description ?? task.description ?? '',
                beforeWork ?? task.before_work ?? '',
                afterWork ?? task.after_work ?? '',
                phase ?? task.phase ?? '',
                taskType ?? task.task_type ?? '',
                scale ?? task.scale ?? '',
                'n8n-ai-agent'
            );
            updatedFields.details = true;
        }

        // status가 있으면 업데이트
        if (status) {
            await updateTaskStatus(taskId, status, 'n8n-ai-agent');
            updatedFields.status = true;
        }

        // AI 작업 완료되었음을 파악할 수 있는 임의 필드 업데이트 (n8n 호출)
        await setTaskAiProcessing(taskId, false);

        // 캐시 무효화 (UI 갱신)
        revalidatePath(`/project/${task.project_id}`);
        revalidatePath(`/project/${task.project_id}/manage`);
        revalidatePath('/');

        return NextResponse.json({
            ok: true,
            taskId,
            updated: updatedFields,
        });
    } catch (error) {
        console.error('[n8n callback] Error:', error);
        return NextResponse.json(
            { error: 'Internal server error', detail: String(error) },
            { status: 500 }
        );
    }
}
