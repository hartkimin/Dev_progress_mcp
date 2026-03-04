'use server';

import { updateTaskStatus, updateTaskDetails, getCommentsActionDb, addCommentActionDb, getTaskById, updateTaskPhaseAndStatusDb, createTaskDb, setTaskAiProcessing } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function setTaskStatus(projectId: string, taskId: string, status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE') {
    await updateTaskStatus(taskId, status, 'Dashboard User');
    revalidatePath(`/project/${projectId}`);
    return { success: true };
}

export async function setTaskPhaseAndStatus(taskId: string, phase: string, status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE', projectId: string) {
    await updateTaskPhaseAndStatusDb(taskId, phase, status, 'Web UI');
    revalidatePath(`/project/${projectId}`);
    return { success: true };
}

export async function saveTaskDetails(projectId: string, taskId: string, description: string, beforeWork: string, afterWork: string, phase: string, taskType: string, scale: string) {
    await updateTaskDetails(taskId, description, beforeWork, afterWork, phase, taskType, scale, 'Dashboard User');
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

export async function syncTaskFromDb(taskId: string) {
    return await getTaskById(taskId);
}

export async function createTaskAction(projectId: string, title: string) {
    const id = await createTaskDb(projectId, title, 'TODO', 'Web UI');
    revalidatePath(`/project/${projectId}`);
    return { success: true, id };
}
