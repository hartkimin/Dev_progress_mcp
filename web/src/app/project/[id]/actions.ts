'use server';

import { updateTaskStatus, updateTaskDetails, getCommentsActionDb, addCommentActionDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function setTaskStatus(projectId: string, taskId: string, status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE') {
    await updateTaskStatus(taskId, status);
    revalidatePath(`/project/${projectId}`);
    return { success: true };
}

export async function saveTaskDetails(projectId: string, taskId: string, description: string, beforeWork: string, afterWork: string) {
    await updateTaskDetails(taskId, description, beforeWork, afterWork);
    revalidatePath(`/project/${projectId}`);
    return { success: true };
}

export async function getCommentsAction(taskId: string) {
    return await getCommentsActionDb(taskId);
}

export async function addCommentAction(taskId: string, author: string, content: string) {
    const id = await addCommentActionDb(taskId, author, content);
    return id;
}
