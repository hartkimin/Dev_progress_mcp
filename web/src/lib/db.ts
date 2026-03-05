import { Pool, PoolClient } from 'pg';
import crypto from 'crypto';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://vibeplanner:vibeplanner_secret@localhost:5432/vibeplanner';

let pool: Pool | null = null;
let initialized = false;

function getPool(): Pool {
    if (!pool) {
        pool = new Pool({
            connectionString: DATABASE_URL,
        });
    }
    return pool;
}

async function initDb(): Promise<void> {
    if (initialized) return;

    const p = getPool();
    const client = await p.connect();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS api_keys (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL REFERENCES users(id),
                key_value TEXT NOT NULL UNIQUE,
                name TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT NOW(),
                last_used_at TIMESTAMP
            )
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS projects (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS tasks (
                id TEXT PRIMARY KEY,
                project_id TEXT NOT NULL REFERENCES projects(id),
                category TEXT,
                phase TEXT,
                task_type TEXT,
                scale TEXT,
                title TEXT NOT NULL,
                description TEXT,
                before_work TEXT,
                after_work TEXT,
                status TEXT NOT NULL,
                start_date TIMESTAMP,
                due_date TIMESTAMP,
                started_at TIMESTAMP,
                completed_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW(),
                updated_by TEXT,
                is_ai_processing BOOLEAN DEFAULT false
            )
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS comments (
                id TEXT PRIMARY KEY,
                task_id TEXT NOT NULL REFERENCES tasks(id),
                author TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS project_documents (
                id TEXT PRIMARY KEY,
                project_id TEXT NOT NULL REFERENCES projects(id),
                doc_type TEXT NOT NULL,
                content TEXT,
                updated_at TIMESTAMP DEFAULT NOW(),
                UNIQUE(project_id, doc_type)
            )
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS project_document_versions (
                id TEXT PRIMARY KEY,
                project_id TEXT NOT NULL REFERENCES projects(id),
                doc_type TEXT NOT NULL,
                content TEXT,
                created_at TIMESTAMP DEFAULT NOW(),
                version_number INTEGER NOT NULL,
                created_by TEXT DEFAULT 'System'
            )
        `);

        // Seed a mock user if none exists
        const userCount = await client.query('SELECT count(*) as count FROM users');
        if (parseInt(userCount.rows[0].count) === 0) {
            await client.query(
                'INSERT INTO users (id, name, email) VALUES ($1, $2, $3)',
                ['mock-user-1', 'Admin Developer', 'admin@example.com']
            );
        }

        initialized = true;
    } finally {
        client.release();
    }
}

async function getDb(): Promise<Pool> {
    await initDb();
    return getPool();
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
    const db = await getDb();
    const result = await db.query('SELECT * FROM projects ORDER BY created_at DESC');
    return result.rows as Project[];
}

export async function getProjectById(projectId: string): Promise<Project | null> {
    const db = await getDb();
    const result = await db.query('SELECT * FROM projects WHERE id = $1', [projectId]);
    return (result.rows[0] as Project) || null;
}

export async function updateProject(projectId: string, name: string, description: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.query(
        'UPDATE projects SET name = $1, description = $2 WHERE id = $3',
        [name, description, projectId]
    );
    return (result.rowCount ?? 0) > 0;
}

export async function createProject(name: string, description: string, mode: 'newbie' | 'import' = 'newbie'): Promise<string> {
    const db = await getDb();
    const id = crypto.randomUUID();
    await db.query(
        'INSERT INTO projects (id, name, description) VALUES ($1, $2, $3)',
        [id, name, description]
    );

    if (mode === 'import') {
        return id;
    }

    // Add default Vibe Coding Planner template tasks
    const templateTasks = [
        { title: "Define Project Scope & Core Features", category: "Planning", phase: "1. Ideation", type: "Prompting", scale: "Epic", desc: "AI와 브레인스토밍하여 프로젝트의 핵심 목표와 주요 기능을 정의하세요." },
        { title: "Extract User Stories & Requirements", category: "Planning", phase: "1. Ideation", type: "Docs", scale: "Story", desc: "정의된 기능들을 바탕으로 구체적인 유저 스토리와 요구사항 문서를 작성하세요." },
        { title: "Design Database Schema & Tech Stack", category: "Architecture", phase: "2. Architecture", type: "Prompting", scale: "Epic", desc: "어떤 기술 스택을 사용할지 결정하고, 데이터베이스 스키마(ERD)를 설계하세요." },
        { title: "Create UI Wireframes & Layout Plan", category: "Architecture", phase: "2. Architecture", type: "Docs", scale: "Story", desc: "사용자 인터페이스의 전체적인 레이아웃과 와이어프레임을 기획하세요." },
        { title: "Setup Project Boilerplate & Routing", category: "Infrastructure", phase: "3. Implementation", type: "Coding", scale: "Task", desc: "프로젝트 초기 세팅(Next.js 등)을 진행하고 기본 라우팅 구조를 잡으세요." },
        { title: "Implement Core DB Models & APIs", category: "Backend", phase: "3. Implementation", type: "Coding", scale: "Task", desc: "설계한 스키마를 바탕으로 데이터베이스 모델과 핵심 API를 구현하세요." },
        { title: "Develop Main UI Components", category: "Frontend", phase: "3. Implementation", type: "Coding", scale: "Task", desc: "와이어프레임을 바탕으로 실제 화면 컴포넌트들을 개발하세요." },
        { title: "Write Unit Tests for Core Logic", category: "Testing", phase: "4. Testing", type: "Coding", scale: "Task", desc: "핵심 비즈니스 로직에 대한 유닛 테스트를 작성하여 안정성을 확보하세요." },
        { title: "Perform Manual QA & Fix Bugs", category: "Testing", phase: "4. Testing", type: "Review", scale: "Task", desc: "엣지 케이스를 포함한 수동 테스트를 진행하고 발견된 버그를 수정하세요." },
        { title: "Write README & Deployment Guide", category: "Documentation", phase: "5. Deployment", type: "Docs", scale: "Task", desc: "프로젝트 설명서(README)를 작성하고 배포를 진행하세요." }
    ];

    try {
        for (const t of templateTasks) {
            const taskId = crypto.randomUUID();
            await db.query(
                'INSERT INTO tasks (id, project_id, category, phase, task_type, scale, title, description, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
                [taskId, id, t.category, t.phase, t.type, t.scale, t.title, t.desc, 'TODO']
            );
        }
    } catch {
        // Even if task generation fails, the project is created
    }

    return id;
}

export async function deleteProject(projectId: string): Promise<boolean> {
    const db = await getDb();
    const client = await (db as Pool).connect();
    try {
        await client.query('BEGIN');
        await client.query('DELETE FROM comments WHERE task_id IN (SELECT id FROM tasks WHERE project_id = $1)', [projectId]);
        await client.query('DELETE FROM tasks WHERE project_id = $1', [projectId]);
        await client.query('DELETE FROM project_document_versions WHERE project_id = $1', [projectId]);
        await client.query('DELETE FROM project_documents WHERE project_id = $1', [projectId]);
        const result = await client.query('DELETE FROM projects WHERE id = $1', [projectId]);
        await client.query('COMMIT');
        return (result.rowCount ?? 0) > 0;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

export async function getTasksByProject(projectId: string): Promise<Task[]> {
    const db = await getDb();
    const result = await db.query(
        `SELECT t.*, COUNT(c.id)::int as comment_count
         FROM tasks t
         LEFT JOIN comments c ON t.id = c.task_id
         WHERE t.project_id = $1
         GROUP BY t.id
         ORDER BY t.phase ASC, t.category ASC, t.created_at ASC`,
        [projectId]
    );
    return result.rows as Task[];
}

export async function createTaskDb(projectId: string, title: string, status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' = 'TODO', updatedBy: string = 'Unknown', taskType: string = ''): Promise<string> {
    const db = await getDb();
    const id = crypto.randomUUID();
    await db.query(
        'INSERT INTO tasks (id, project_id, title, status, description, updated_by, task_type) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [id, projectId, title, status, '', updatedBy, taskType]
    );
    return id;
}

export async function deleteTaskDb(taskId: string): Promise<boolean> {
    const db = await getDb();
    await db.query('DELETE FROM comments WHERE task_id = $1', [taskId]);
    const result = await db.query('DELETE FROM tasks WHERE id = $1', [taskId]);
    return (result.rowCount ?? 0) > 0;
}

export async function getRecentGlobalTasks(limit: number = 50): Promise<Task[]> {
    const db = await getDb();
    const result = await db.query(
        `SELECT t.*, p.name as project_name
         FROM tasks t
         JOIN projects p ON t.project_id = p.id
         ORDER BY t.updated_at DESC
         LIMIT $1`,
        [limit]
    );
    return result.rows as Task[];
}

export async function getTaskById(taskId: string): Promise<Task | null> {
    const db = await getDb();
    const result = await db.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    return (result.rows[0] as Task) || null;
}

export async function updateTaskStatus(taskId: string, status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE', updatedBy: string = 'Unknown'): Promise<boolean> {
    const db = await getDb();
    let query: string;
    let params: any[];

    if (status === 'IN_PROGRESS') {
        query = 'UPDATE tasks SET status = $1, updated_at = NOW(), updated_by = $2, started_at = COALESCE(started_at, NOW()) WHERE id = $3';
        params = [status, updatedBy, taskId];
    } else if (status === 'DONE') {
        query = 'UPDATE tasks SET status = $1, updated_at = NOW(), updated_by = $2, completed_at = NOW() WHERE id = $3';
        params = [status, updatedBy, taskId];
    } else {
        query = 'UPDATE tasks SET status = $1, updated_at = NOW(), updated_by = $2 WHERE id = $3';
        params = [status, updatedBy, taskId];
    }

    const result = await db.query(query, params);
    return (result.rowCount ?? 0) > 0;
}

export async function updateTaskPhaseAndStatusDb(taskId: string, phase: string, status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE', updatedBy: string = 'Unknown'): Promise<boolean> {
    const db = await getDb();
    let query: string;
    let params: any[];

    if (status === 'IN_PROGRESS') {
        query = 'UPDATE tasks SET status = $1, phase = $2, updated_at = NOW(), updated_by = $3, started_at = COALESCE(started_at, NOW()) WHERE id = $4';
        params = [status, phase, updatedBy, taskId];
    } else if (status === 'DONE') {
        query = 'UPDATE tasks SET status = $1, phase = $2, updated_at = NOW(), updated_by = $3, completed_at = NOW() WHERE id = $4';
        params = [status, phase, updatedBy, taskId];
    } else {
        query = 'UPDATE tasks SET status = $1, phase = $2, updated_at = NOW(), updated_by = $3 WHERE id = $4';
        params = [status, phase, updatedBy, taskId];
    }

    const result = await db.query(query, params);
    return (result.rowCount ?? 0) > 0;
}

export async function updateTaskDetails(taskId: string, description: string, beforeWork: string, afterWork: string, phase: string, taskType: string, scale: string, updatedBy: string = 'Unknown'): Promise<boolean> {
    const db = await getDb();
    const result = await db.query(
        'UPDATE tasks SET description = $1, before_work = $2, after_work = $3, phase = $4, task_type = $5, scale = $6, updated_at = NOW(), updated_by = $7 WHERE id = $8',
        [description, beforeWork, afterWork, phase, taskType, scale, updatedBy, taskId]
    );
    return (result.rowCount ?? 0) > 0;
}

export async function updateTaskTitle(taskId: string, title: string, updatedBy: string = 'Unknown'): Promise<boolean> {
    const db = await getDb();
    const result = await db.query(
        'UPDATE tasks SET title = $1, updated_at = NOW(), updated_by = $2 WHERE id = $3',
        [title, updatedBy, taskId]
    );
    return (result.rowCount ?? 0) > 0;
}

export async function setTaskAiProcessing(taskId: string, isProcessing: boolean): Promise<boolean> {
    const db = await getDb();
    const result = await db.query(
        'UPDATE tasks SET is_ai_processing = $1 WHERE id = $2',
        [isProcessing, taskId]
    );
    return (result.rowCount ?? 0) > 0;
}

// Comments
export async function getCommentsActionDb(taskId: string): Promise<Comment[]> {
    const db = await getDb();
    const result = await db.query(
        'SELECT * FROM comments WHERE task_id = $1 ORDER BY created_at ASC',
        [taskId]
    );
    return result.rows as Comment[];
}

export async function addCommentActionDb(taskId: string, author: string, content: string): Promise<string> {
    const db = await getDb();
    const id = crypto.randomUUID();
    await db.query(
        'INSERT INTO comments (id, task_id, author, content) VALUES ($1, $2, $3, $4)',
        [id, taskId, author, content]
    );
    return id;
}

// User and API Key methods
export async function getUser(userId: string): Promise<User | null> {
    const db = await getDb();
    const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    return (result.rows[0] as User) || null;
}

export async function createApiKey(userId: string, name: string): Promise<{ id: string, key_value: string }> {
    const db = await getDb();
    const id = crypto.randomUUID();
    const key_value = 'dp_live_' + crypto.randomBytes(24).toString('hex');

    await db.query(
        'INSERT INTO api_keys (id, user_id, key_value, name) VALUES ($1, $2, $3, $4)',
        [id, userId, key_value, name]
    );
    return { id, key_value };
}

export async function listApiKeys(userId: string): Promise<ApiKey[]> {
    const db = await getDb();
    const result = await db.query(
        'SELECT * FROM api_keys WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
    );
    return result.rows as ApiKey[];
}

export async function deleteApiKey(userId: string, keyId: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.query(
        'DELETE FROM api_keys WHERE id = $1 AND user_id = $2',
        [keyId, userId]
    );
    return (result.rowCount ?? 0) > 0;
}

export async function listUsers(): Promise<User[]> {
    const db = await getDb();
    const result = await db.query('SELECT * FROM users ORDER BY created_at DESC');
    return result.rows as User[];
}

export async function addUser(id: string, name: string, email: string): Promise<void> {
    const db = await getDb();
    await db.query(
        'INSERT INTO users (id, name, email) VALUES ($1, $2, $3)',
        [id, name, email]
    );
}

export async function removeUser(id: string): Promise<boolean> {
    const db = await getDb();
    const client = await (db as Pool).connect();
    try {
        await client.query('BEGIN');
        await client.query('DELETE FROM api_keys WHERE user_id = $1', [id]);
        const result = await client.query('DELETE FROM users WHERE id = $1', [id]);
        await client.query('COMMIT');
        return (result.rowCount ?? 0) > 0;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

export async function getGlobalAnalytics(projectId?: string): Promise<GlobalAnalytics> {
    const db = await getDb();

    const projQuery = projectId
        ? 'SELECT count(*)::int as count FROM projects WHERE id = $1'
        : 'SELECT count(*)::int as count FROM projects';
    const projParams = projectId ? [projectId] : [];
    const projResult = await db.query(projQuery, projParams);
    const totalProjects = projResult.rows[0]?.count ?? 0;

    const taskQuery = projectId
        ? 'SELECT count(*)::int as count FROM tasks WHERE project_id = $1'
        : 'SELECT count(*)::int as count FROM tasks';
    const taskParams = projectId ? [projectId] : [];
    const taskResult = await db.query(taskQuery, taskParams);
    const totalTasks = taskResult.rows[0]?.count ?? 0;

    const statusQuery = projectId
        ? 'SELECT status, count(*)::int as count FROM tasks WHERE project_id = $1 GROUP BY status'
        : 'SELECT status, count(*)::int as count FROM tasks GROUP BY status';
    const statusParams = projectId ? [projectId] : [];
    const statusResult = await db.query(statusQuery, statusParams);
    const tasksByStatus = { TODO: 0, IN_PROGRESS: 0, REVIEW: 0, DONE: 0 };
    statusResult.rows.forEach((r: { status: string; count: number }) => {
        tasksByStatus[r.status as keyof typeof tasksByStatus] = r.count;
    });

    const userResult = await db.query('SELECT count(*)::int as count FROM users');
    const totalUsers = userResult.rows[0]?.count ?? 0;

    return { totalProjects, totalTasks, tasksByStatus, totalUsers };
}

export async function getProjectDocumentDb(projectId: string, docType: string): Promise<ProjectDocument | null> {
    const db = await getDb();
    const result = await db.query(
        'SELECT * FROM project_documents WHERE project_id = $1 AND doc_type = $2',
        [projectId, docType]
    );
    return (result.rows[0] as ProjectDocument) || null;
}

export async function updateProjectDocumentDb(projectId: string, docType: string, content: string, createdBy: string = 'System'): Promise<boolean> {
    const db = await getDb();
    const client = await (db as Pool).connect();
    try {
        await client.query('BEGIN');

        const id = crypto.randomUUID();
        await client.query(
            `INSERT INTO project_documents (id, project_id, doc_type, content, updated_at)
             VALUES ($1, $2, $3, $4, NOW())
             ON CONFLICT(project_id, doc_type)
             DO UPDATE SET content = EXCLUDED.content, updated_at = NOW()`,
            [id, projectId, docType, content]
        );

        const versionResult = await client.query(
            'SELECT MAX(version_number) as max_version FROM project_document_versions WHERE project_id = $1 AND doc_type = $2',
            [projectId, docType]
        );

        const nextVersion = (versionResult.rows[0]?.max_version ?? 0) + 1;
        const versionId = crypto.randomUUID();

        await client.query(
            `INSERT INTO project_document_versions (id, project_id, doc_type, content, version_number, created_by)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [versionId, projectId, docType, content, nextVersion, createdBy]
        );

        await client.query('COMMIT');
        return true;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

export async function getProjectDocumentVersionsDb(projectId: string, docType: string): Promise<ProjectDocumentVersion[]> {
    const db = await getDb();
    const result = await db.query(
        'SELECT * FROM project_document_versions WHERE project_id = $1 AND doc_type = $2 ORDER BY version_number DESC',
        [projectId, docType]
    );
    return result.rows as ProjectDocumentVersion[];
}

export async function getProjectDocumentVersionByIdDb(projectId: string, docType: string, versionId: string): Promise<ProjectDocumentVersion | null> {
    const db = await getDb();
    const result = await db.query(
        'SELECT * FROM project_document_versions WHERE id = $1 AND project_id = $2 AND doc_type = $3',
        [versionId, projectId, docType]
    );
    return (result.rows[0] as ProjectDocumentVersion) || null;
}

export async function restoreProjectDocumentVersionDb(projectId: string, docType: string, versionId: string, restoredBy: string = 'System'): Promise<boolean> {
    const version = await getProjectDocumentVersionByIdDb(projectId, docType, versionId);
    if (!version) {
        throw new Error('Version not found');
    }
    return updateProjectDocumentDb(projectId, docType, version.content, restoredBy);
}
