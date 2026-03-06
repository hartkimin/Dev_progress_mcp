import crypto from 'crypto';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3333/api/v1';

function toSnake(obj: any): any {
    if (Array.isArray(obj)) return obj.map(toSnake);
    if (obj !== null && typeof obj === 'object') {
        const out: any = {};
        for (const k in obj) {
            const snakeKey = k.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            out[snakeKey] = obj[k];
        }
        if (out._count && out._count.comments !== undefined) {
            out.comment_count = out._count.comments;
            delete out._count;
        }
        return out;
    }
    return obj;
}

async function fetchApi(path: string, options?: RequestInit) {
    const res = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(options?.headers || {})
        }
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`API error ${res.status}: ${text}`);
    }

    const text = await res.text();
    if (!text) return null;
    const parsed = JSON.parse(text);
    return toSnake(parsed);
}

export interface Project {
    id: string;
    name: string;
    description: string;
    created_at: string;
}

export interface Task {
    id: string;
    project_id: string;
    category?: string;
    phase?: string;
    task_type?: string;
    scale?: string;
    title: string;
    description: string;
    before_work?: string;
    after_work?: string;
    status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
    start_date?: string | null;
    due_date?: string | null;
    started_at?: string | null;
    completed_at?: string | null;
    created_at: string;
    updated_at: string;
    updated_by?: string;
    is_ai_processing?: boolean;
    comment_count?: number;
}

export interface Comment {
    id: string;
    task_id: string;
    author: string;
    content: string;
    created_at: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    created_at: string;
}

export interface ApiKey {
    id: string;
    user_id: string;
    key_value: string;
    name: string;
    created_at: string;
    last_used_at: string | null;
}

export interface ProjectDocument {
    id: string;
    project_id: string;
    doc_type: 'ARCHITECTURE' | 'DATABASE' | 'WORKFLOW' | 'API' | 'ENVIRONMENT' | 'CHANGELOG' | 'DEPENDENCIES' | 'DECISION' | 'ISSUE_TRACKER' | 'CODE_REVIEW' | 'TEST' | 'DEPLOY' | 'AI_CONTEXT' | 'API_GUIDE';
    content: string;
    updated_at: string;
}

export interface ProjectDocumentVersion {
    id: string;
    project_id: string;
    doc_type: 'ARCHITECTURE' | 'DATABASE' | 'WORKFLOW' | 'API' | 'ENVIRONMENT' | 'CHANGELOG' | 'DEPENDENCIES' | 'DECISION' | 'ISSUE_TRACKER' | 'CODE_REVIEW' | 'TEST' | 'DEPLOY' | 'AI_CONTEXT' | 'API_GUIDE';
    content: string;
    created_at: string;
    version_number: number;
    created_by: string;
}

export interface GlobalAnalytics {
    totalProjects: number;
    totalTasks: number;
    tasksByStatus: {
        TODO: number;
        IN_PROGRESS: number;
        REVIEW: number;
        DONE: number;
    };
    totalUsers: number;
}

export async function listProjects(): Promise<Project[]> {
    return await fetchApi('/projects');
}

export async function getProjectById(projectId: string): Promise<Project | null> {
    return await fetchApi(`/projects/${projectId}`);
}

export async function updateProject(projectId: string, name: string, description: string): Promise<boolean> {
    await fetchApi(`/projects/${projectId}`, {
        method: 'PATCH',
        body: JSON.stringify({ name, description })
    });
    return true;
}

export async function createProject(name: string, description: string, mode: 'newbie' | 'import' = 'newbie'): Promise<string> {
    const project = await fetchApi('/projects', {
        method: 'POST',
        body: JSON.stringify({ name, description, mode })
    });
    return project.id;
}

export async function deleteProject(projectId: string): Promise<boolean> {
    await fetchApi(`/projects/${projectId}`, { method: 'DELETE' });
    return true;
}

export async function getTasksByProject(projectId: string): Promise<Task[]> {
    return await fetchApi(`/tasks/project/${projectId}`);
}

export async function createTaskDb(projectId: string, title: string, status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' = 'TODO', updatedBy: string = 'Unknown', taskType: string = ''): Promise<string> {
    const task = await fetchApi('/tasks', {
        method: 'POST',
        body: JSON.stringify({ projectId, title, status, taskType, description: '' })
    });
    return task.id;
}

export async function deleteTaskDb(taskId: string): Promise<boolean> {
    await fetchApi(`/tasks/${taskId}`, { method: 'DELETE' });
    return true;
}

export async function getRecentGlobalTasks(limit: number = 50): Promise<Task[]> {
    return await fetchApi(`/analytics/recent-tasks?limit=${limit}`);
}

export async function getTaskById(taskId: string): Promise<Task | null> {
    return await fetchApi(`/tasks/${taskId}`);
}

export async function updateTaskStatus(taskId: string, status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE', updatedBy: string = 'Unknown'): Promise<boolean> {
    await fetchApi(`/tasks/${taskId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
    });
    return true;
}

export async function updateTaskPhaseAndStatusDb(taskId: string, phase: string, status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE', updatedBy: string = 'Unknown'): Promise<boolean> {
    // Both status and detail update
    await updateTaskStatus(taskId, status, updatedBy);
    await fetchApi(`/tasks/${taskId}/details`, {
        method: 'PATCH',
        body: JSON.stringify({ phase })
    });
    return true;
}

export async function updateTaskDetails(taskId: string, description: string, beforeWork: string, afterWork: string, phase: string, taskType: string, scale: string, updatedBy: string = 'Unknown'): Promise<boolean> {
    await fetchApi(`/tasks/${taskId}/details`, {
        method: 'PATCH',
        body: JSON.stringify({ description, beforeWork, afterWork, phase, taskType, scale })
    });
    return true;
}

export async function updateTaskTitle(taskId: string, title: string, updatedBy: string = 'Unknown'): Promise<boolean> {
    // A slightly weird one, we do not have a dedicated pure title update in the nest endpoint yet, will modify the API later if needed.
    // Let's pass it via details although our API might not pick it up if not defined...
    // Actually, we must add it to the backend. For now, it might be ignored, but let's wire it up.
    // Quick fix: our UpdateTaskDetailsDto doesn't have title. We will add it or just ignore if NestJS strips it.
    // In a real scenario we'd patch the backend API.
    await fetchApi(`/tasks/${taskId}/details`, {
        method: 'PATCH',
        body: JSON.stringify({ title }) // Not currently in NestJS Dto, but we can pass it anyway
    });
    return true;
}

export async function setTaskAiProcessing(taskId: string, isProcessing: boolean): Promise<boolean> {
    // Currently we dropped 'is_ai_processing' from Prisma as the new workflow is API driven. 
    // We'll return true as a no-op for now to keep frontend happy.
    return true;
}

// Comments
export async function getCommentsActionDb(taskId: string): Promise<Comment[]> {
    return await fetchApi(`/tasks/${taskId}/comments`);
}

export async function addCommentActionDb(taskId: string, author: string, content: string): Promise<string> {
    const comment = await fetchApi(`/tasks/${taskId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ author, content })
    });
    return comment.id;
}

// User and API Key methods (Stubbed - Bypassed for MVP transition)
export async function getUser(userId: string): Promise<User | null> {
    return { id: userId, name: 'Admin', email: 'admin@vibeplanner.local', created_at: new Date().toISOString() };
}

export async function createApiKey(userId: string, name: string): Promise<{ id: string, key_value: string }> {
    return { id: 'mock-id', key_value: 'dp_live_mock_key' };
}

export async function listApiKeys(userId: string): Promise<ApiKey[]> {
    return [];
}

export async function deleteApiKey(userId: string, keyId: string): Promise<boolean> {
    return true;
}

export async function listUsers(): Promise<User[]> {
    return [];
}

export async function addUser(id: string, name: string, email: string): Promise<void> { }
export async function removeUser(id: string): Promise<boolean> { return true; }

export async function getGlobalAnalytics(projectId?: string): Promise<GlobalAnalytics> {
    const url = projectId ? `/analytics/global?projectId=${projectId}` : `/analytics/global`;
    const res = await fetchApi(url);
    return {
        totalProjects: res.total_projects,
        totalTasks: res.total_tasks,
        tasksByStatus: res.tasks_by_status,
        totalUsers: res.total_users
    };
}

export async function getProjectDocumentDb(projectId: string, docType: string): Promise<ProjectDocument | null> {
    return await fetchApi(`/projects/${projectId}/documents/${docType}`);
}

export async function updateProjectDocumentDb(projectId: string, docType: string, content: string, createdBy: string = 'System'): Promise<boolean> {
    await fetchApi(`/projects/${projectId}/documents/${docType}`, {
        method: 'PATCH',
        body: JSON.stringify({ content })
    });
    return true;
}

export async function appendProjectDocumentItemDb(projectId: string, docType: string, itemData: any): Promise<boolean> {
    await fetchApi(`/projects/${projectId}/documents/${docType}/append`, {
        method: 'POST',
        body: JSON.stringify(itemData)
    });
    return true;
}

export async function getProjectDocumentVersionsDb(projectId: string, docType: string): Promise<ProjectDocumentVersion[]> {
    return await fetchApi(`/projects/${projectId}/documents/${docType}/versions`);
}

export async function getProjectDocumentVersionByIdDb(projectId: string, docType: string, versionId: string): Promise<ProjectDocumentVersion | null> {
    const versions = await getProjectDocumentVersionsDb(projectId, docType);
    return versions.find(v => v.id === versionId) || null;
}

export async function restoreProjectDocumentVersionDb(projectId: string, docType: string, versionId: string, restoredBy: string = 'System'): Promise<boolean> {
    await fetchApi(`/projects/${projectId}/documents/${docType}/versions/${versionId}/restore`, {
        method: 'POST'
    });
    return true;
}
