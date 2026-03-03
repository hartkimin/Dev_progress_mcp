'use server';

import { getTasksByProject } from '@/lib/db';

export async function getProjectTasks(projectId: string) {
    return await getTasksByProject(projectId);
}
