'use server';

import { updateTaskStatus } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function setTaskStatus(projectId: string, taskId: string, status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE') {
    await updateTaskStatus(taskId, status);
    revalidatePath(`/project/${projectId}`);
    return { success: true };
}
