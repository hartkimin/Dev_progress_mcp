
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3333/api/v1';

let globalAccessToken: string | null = null;

export function setAccessToken(token: string | null) {
    globalAccessToken = token;
}

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

async function resolveServerAccessToken(): Promise<string | null> {
    try {
        const [{ getServerSession }, { authOptions }] = await Promise.all([
            import('next-auth/next'),
            import('./authOptions'),
        ]);
        const session = await getServerSession(authOptions);
        return (session as any)?.accessToken ?? null;
    } catch {
        return null;
    }
}

async function fetchApi(path: string, options?: RequestInit) {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options?.headers as Record<string, string> || {})
    };

    let token = globalAccessToken;
    if (!token && typeof window === 'undefined') {
        token = await resolveServerAccessToken();
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers
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
    assignee_id?: string | null;
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

// TODO: Add `title` field to UpdateTaskDetailsDto in NestJS backend API.
// Currently NestJS validation strips the `title` field since it's not in the DTO.
export async function updateTaskTitle(taskId: string, title: string, updatedBy: string = 'Unknown'): Promise<boolean> {
    await fetchApi(`/tasks/${taskId}/details`, {
        method: 'PATCH',
        body: JSON.stringify({ title })
    });
    return true;
}

// TODO: Re-implement AI processing flag when the feature is reintroduced.
// Removed `is_ai_processing` column from Prisma in the API-driven migration.
export async function setTaskAiProcessing(_taskId: string, _isProcessing: boolean): Promise<boolean> {
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

// User and API Key methods (Restored logic connected to real API)
export async function getUser(userId: string): Promise<User | null> {
    return await fetchApi(`/auth/profile`);
}

export async function createApiKey(userId: string, name: string): Promise<{ id: string, key_value: string }> {
    return await fetchApi('/keys', {
        method: 'POST',
        body: JSON.stringify({ name })
    });
}

export async function listApiKeys(userId: string): Promise<ApiKey[]> {
    return await fetchApi('/keys');
}

export async function deleteApiKey(userId: string, keyId: string): Promise<boolean> {
    await fetchApi(`/keys/${keyId}`, { method: 'DELETE' });
    return true;
}

export async function listUsers(): Promise<User[]> {
    return await fetchApi('/users');
}

export async function addUser(id: string, name: string, email: string): Promise<void> {
    await fetchApi('/users', {
        method: 'POST',
        body: JSON.stringify({ id, name, email })
    });
}

export async function removeUser(id: string): Promise<boolean> {
    await fetchApi(`/users/${id}`, { method: 'DELETE' });
    return true;
}

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

// ─── Analytics API ───────────────────────────────────────────────

export interface PhaseProgress {
    phase: string;
    total: number;
    done: number;
}

export interface ProjectSummary {
    id: string;
    name: string;
    description: string | null;
    created_at: string;
    task_summary: {
        total: number;
        todo: number;
        in_progress: number;
        review: number;
        done: number;
        completion_rate: number;
        dominant_phase: string;
        last_activity: string | null;
    };
    phase_progress?: PhaseProgress[];
}

export interface PhaseBreakdownItem {
    name: string;
    total: number;
    todo: number;
    in_progress: number;
    review: number;
    done: number;
    completion_rate: number;
    avg_lead_time_days: number | null;
}

export interface BurndownPoint {
    date: string;
    remaining: number;
    completed: number;
    created: number;
}

export interface CategoryDistItem {
    name: string;
    total: number;
    done: number;
    in_progress: number;
    todo: number;
    review: number;
    completion_rate: number;
}

export interface VelocityPoint {
    week_label: string;
    week_start: string;
    completed: number;
}

export async function getAllProjectSummaries(): Promise<ProjectSummary[]> {
    return await fetchApi('/analytics/project-summaries');
}

export async function getPhaseBreakdown(projectId: string): Promise<{ phases: PhaseBreakdownItem[] }> {
    return await fetchApi(`/analytics/phase-breakdown?projectId=${projectId}`);
}

export async function getBurndownData(projectId: string, days: number = 30): Promise<{ total_tasks: number; days: number; data_points: BurndownPoint[] }> {
    return await fetchApi(`/analytics/burndown?projectId=${projectId}&days=${days}`);
}

export async function getCategoryDistribution(projectId: string): Promise<{ distribution: CategoryDistItem[]; total_tasks: number }> {
    return await fetchApi(`/analytics/category-distribution?projectId=${projectId}`);
}

export async function getVelocityHistory(projectId: string, weeks: number = 8): Promise<{ weeks: number; avg_velocity: number; velocity_data: VelocityPoint[] }> {
    return await fetchApi(`/analytics/velocity?projectId=${projectId}&weeks=${weeks}`);
}

// ---------- Plan Review & YC Answers (Phase 1 gstack integration) ----------

export interface YcAnswer {
    id: string;
    project_id: string;
    q1_demand?: string;
    q2_status_quo?: string;
    q3_specific?: string;
    q4_wedge?: string;
    q5_observation?: string;
    q6_future_fit?: string;
    created_at: string;
}

export interface PlanReview {
    id: string;
    project_id: string;
    kind: 'ceo' | 'eng' | 'design' | 'devex';
    spec_path?: string;
    md_path?: string;
    score?: number;
    decision?: 'accept' | 'revise' | 'reject';
    payload: Record<string, unknown>;
    reviewer: string;
    created_at: string;
}

export interface YcAnswersInput {
    q1Demand?: string;
    q2StatusQuo?: string;
    q3Specific?: string;
    q4Wedge?: string;
    q5Observation?: string;
    q6FutureFit?: string;
}

export interface PlanReviewInput {
    kind: 'ceo' | 'eng' | 'design' | 'devex';
    specPath?: string;
    score?: number;
    decision?: 'accept' | 'revise' | 'reject';
    payload: Record<string, unknown>;
    reviewer?: string;
}

export async function saveYcAnswers(projectId: string, answers: YcAnswersInput): Promise<YcAnswer> {
    return await fetchApi(`/projects/${projectId}/yc-answers`, {
        method: 'POST',
        body: JSON.stringify(answers),
    });
}

export async function getLatestYcAnswers(projectId: string): Promise<YcAnswer | null> {
    return await fetchApi(`/projects/${projectId}/yc-answers/latest`);
}

export async function savePlanReview(projectId: string, input: PlanReviewInput): Promise<PlanReview> {
    return await fetchApi(`/projects/${projectId}/plan-reviews`, {
        method: 'POST',
        body: JSON.stringify(input),
    });
}

export async function listPlanReviews(projectId: string, kind?: string): Promise<PlanReview[]> {
    const q = kind ? `?kind=${encodeURIComponent(kind)}` : '';
    return await fetchApi(`/projects/${projectId}/plan-reviews${q}`);
}

export async function getPlanReview(id: string): Promise<PlanReview | null> {
    return await fetchApi(`/plan-reviews/${id}`);
}

export interface StrategyReadinessProject {
    id: string;
    name: string;
    yc_completion_rate: number;
    plan_review_avg_score: number | null;
    plan_review_count_by_kind: { ceo: number; eng: number; design: number; devex: number };
    phase_progress: PhaseProgress[];
}

export interface StrategyReadiness {
    projects: StrategyReadinessProject[];
    aggregate: {
        yc_completion_rate: number;
        plan_review_avg_score: number | null;
    };
}

export async function getStrategyReadiness(): Promise<StrategyReadiness> {
    return await fetchApi('/analytics/strategy-readiness');
}
