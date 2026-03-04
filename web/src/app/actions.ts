'use server';

import { getTasksByProject, getRecentGlobalTasks, createProject } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getProjectTasks(projectId: string) {
    return await getTasksByProject(projectId);
}

export async function getRecentGlobalTasksAction(limit: number = 50) {
    return await getRecentGlobalTasks(limit);
}

export async function createProjectAction(name: string, description: string) {
    const id = await createProject(name, description);
    revalidatePath('/');
    return { success: true, id };
}
