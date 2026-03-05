'use server';

import { getTasksByProject, getRecentGlobalTasks, createProject, getProjectDocumentDb, updateProjectDocumentDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getProjectTasks(projectId: string) {
    return await getTasksByProject(projectId);
}

export async function getRecentGlobalTasksAction(limit: number = 50) {
    return await getRecentGlobalTasks(limit);
}

export async function createProjectAction(name: string, description: string, mode: 'newbie' | 'import' = 'newbie') {
    const id = await createProject(name, description, mode);
    revalidatePath('/');
    return { success: true, id };
}

export async function getProjectDocumentAction(projectId: string, docType: string) {
    const doc = await getProjectDocumentDb(projectId, docType);
    return doc;
}

export async function updateProjectDocumentAction(projectId: string, docType: string, content: string) {
    const success = await updateProjectDocumentDb(projectId, docType, content);
    if (success) {
        revalidatePath(`/project/${projectId}`);
    }
    return success;
}
