import { Pool } from 'pg';
import crypto from 'crypto';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://vibeplanner:vibeplanner_secret@localhost:5432/vibeplanner';

const pool = new Pool({
    connectionString: DATABASE_URL,
});

export async function initDb(): Promise<void> {
    const client = await pool.connect();
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
                updated_by TEXT
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
    } finally {
        client.release();
    }
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
    comment_count?: number;
}

export interface User {
    id: string;
    name: string;
    email: string;
    created_at: string;
}

export interface ProjectDocument {
    id: string;
    project_id: string;
    doc_type: 'ARCHITECTURE' | 'DATABASE' | 'WORKFLOW' | 'API' | 'ENVIRONMENT' | 'CHANGELOG' | 'DEPENDENCIES' | 'DECISION';
    content: string;
    updated_at: string;
}

export interface ProjectDocumentVersion {
    id: string;
    project_id: string;
    doc_type: 'ARCHITECTURE' | 'DATABASE' | 'WORKFLOW' | 'API' | 'ENVIRONMENT' | 'CHANGELOG' | 'DEPENDENCIES' | 'DECISION';
    content: string;
    created_at: string;
    version_number: number;
    created_by: string;
}

export interface ApiKey {
    id: string;
    user_id: string;
    key_value: string;
    name: string;
    created_at: string;
    last_used_at: string | null;
}

export async function createProject(name: string, description: string = '', mode: 'newbie' | 'import' = 'newbie'): Promise<string> {
    const id = crypto.randomUUID();
    await pool.query(
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
            await createTask(id, t.title, t.category, t.phase, t.type, t.scale, t.desc, 'TODO');
        }
    } catch {
        // Even if task generation fails, the project is created
    }

    return id;
}

export async function updateProject(projectId: string, name: string, description: string): Promise<boolean> {
    const result = await pool.query(
        'UPDATE projects SET name = $1, description = $2 WHERE id = $3',
        [name, description, projectId]
    );
    return (result.rowCount ?? 0) > 0;
}

export async function deleteProject(projectId: string): Promise<boolean> {
    const client = await pool.connect();
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

export async function listProjects(): Promise<Project[]> {
    const result = await pool.query('SELECT * FROM projects ORDER BY created_at DESC');
    return result.rows as Project[];
}

export async function createTask(projectId: string, title: string, category: string = '', phase: string = '', taskType: string = '', scale: string = '', description: string = '', status: string = 'TODO', startDate: string | null = null, dueDate: string | null = null): Promise<string> {
    // Validate project existence
    const proj = await pool.query('SELECT id FROM projects WHERE id = $1', [projectId]);
    if (proj.rows.length === 0) throw new Error('Project not found');

    const id = crypto.randomUUID();
    await pool.query(
        'INSERT INTO tasks (id, project_id, category, phase, task_type, scale, title, description, status, start_date, due_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
        [id, projectId, category, phase, taskType, scale, title, description, status, startDate, dueDate]
    );
    return id;
}

export async function updateTaskStatus(taskId: string, status: string, updatedBy: string = 'Unknown'): Promise<boolean> {
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

    const result = await pool.query(query, params);
    return (result.rowCount ?? 0) > 0;
}

export async function updateTaskDetails(taskId: string, description: string, beforeWork: string, afterWork: string, phase: string, taskType: string, scale: string, updatedBy: string = 'Unknown', startDate?: string | null, dueDate?: string | null): Promise<boolean> {
    let query = 'UPDATE tasks SET description = $1, before_work = $2, after_work = $3, phase = $4, task_type = $5, scale = $6, updated_at = NOW(), updated_by = $7';
    const params: any[] = [description, beforeWork, afterWork, phase, taskType, scale, updatedBy];
    let paramIdx = 8;

    if (startDate !== undefined) {
        query += `, start_date = $${paramIdx}`;
        params.push(startDate);
        paramIdx++;
    }
    if (dueDate !== undefined) {
        query += `, due_date = $${paramIdx}`;
        params.push(dueDate);
        paramIdx++;
    }

    query += ` WHERE id = $${paramIdx}`;
    params.push(taskId);

    const result = await pool.query(query, params);
    return (result.rowCount ?? 0) > 0;
}

export async function getTasksByProject(projectId: string): Promise<Task[]> {
    const result = await pool.query(
        `SELECT t.*, COUNT(c.id)::int as comment_count
         FROM tasks t
         LEFT JOIN comments c ON t.id = c.task_id
         WHERE t.project_id = $1
         GROUP BY t.id
         ORDER BY t.created_at ASC`,
        [projectId]
    );
    return result.rows as Task[];
}

export async function getProjectById(projectId: string): Promise<Project | null> {
    const result = await pool.query('SELECT * FROM projects WHERE id = $1', [projectId]);
    return (result.rows[0] as Project) || null;
}

export async function getProjectDocument(projectId: string, docType: string): Promise<ProjectDocument | null> {
    const result = await pool.query(
        'SELECT * FROM project_documents WHERE project_id = $1 AND doc_type = $2',
        [projectId, docType]
    );
    return (result.rows[0] as ProjectDocument) || null;
}

export async function updateProjectDocument(projectId: string, docType: string, content: string, createdBy: string = 'System'): Promise<boolean> {
    const client = await pool.connect();
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

export async function getProjectDocumentVersions(projectId: string, docType: string): Promise<ProjectDocumentVersion[]> {
    const result = await pool.query(
        'SELECT * FROM project_document_versions WHERE project_id = $1 AND doc_type = $2 ORDER BY version_number DESC',
        [projectId, docType]
    );
    return result.rows as ProjectDocumentVersion[];
}

export async function getProjectDocumentVersionById(projectId: string, docType: string, versionId: string): Promise<ProjectDocumentVersion | null> {
    const result = await pool.query(
        'SELECT * FROM project_document_versions WHERE id = $1 AND project_id = $2 AND doc_type = $3',
        [versionId, projectId, docType]
    );
    return (result.rows[0] as ProjectDocumentVersion) || null;
}

export async function restoreProjectDocumentVersion(projectId: string, docType: string, versionId: string, restoredBy: string = 'System'): Promise<boolean> {
    const version = await getProjectDocumentVersionById(projectId, docType, versionId);
    if (!version) {
        throw new Error('Version not found');
    }
    return updateProjectDocument(projectId, docType, version.content, restoredBy);
}

// Delete a task
export async function deleteTask(taskId: string): Promise<boolean> {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query('DELETE FROM comments WHERE task_id = $1', [taskId]);
        const result = await client.query('DELETE FROM tasks WHERE id = $1', [taskId]);
        await client.query('COMMIT');
        return (result.rowCount ?? 0) > 0;
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
}

// Get a single task by ID
export async function getTaskById(taskId: string): Promise<Task | null> {
    const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    return (result.rows[0] as Task) || null;
}

// Comments
export interface Comment {
    id: string;
    task_id: string;
    author: string;
    content: string;
    created_at: string;
}

export async function getComments(taskId: string): Promise<Comment[]> {
    const result = await pool.query(
        'SELECT * FROM comments WHERE task_id = $1 ORDER BY created_at ASC',
        [taskId]
    );
    return result.rows as Comment[];
}

export async function addComment(taskId: string, author: string, content: string): Promise<string> {
    const id = crypto.randomUUID();
    await pool.query(
        'INSERT INTO comments (id, task_id, author, content) VALUES ($1, $2, $3, $4)',
        [id, taskId, author, content]
    );
    return id;
}

// Analytics
export interface GlobalAnalytics {
    totalProjects: number;
    totalTasks: number;
    tasksByStatus: { TODO: number; IN_PROGRESS: number; REVIEW: number; DONE: number };
    totalUsers: number;
}

export async function getGlobalAnalytics(projectId?: string): Promise<GlobalAnalytics> {
    const projectCount = await pool.query('SELECT count(*) as count FROM projects');
    const userCount = await pool.query('SELECT count(*) as count FROM users');

    let taskQuery = 'SELECT status, count(*) as count FROM tasks';
    const params: string[] = [];
    if (projectId) {
        taskQuery += ' WHERE project_id = $1';
        params.push(projectId);
    }
    taskQuery += ' GROUP BY status';
    const taskResult = await pool.query(taskQuery, params);

    const tasksByStatus = { TODO: 0, IN_PROGRESS: 0, REVIEW: 0, DONE: 0 };
    let totalTasks = 0;
    for (const row of taskResult.rows) {
        const status = row.status as keyof typeof tasksByStatus;
        const count = parseInt(row.count);
        if (tasksByStatus.hasOwnProperty(status)) {
            tasksByStatus[status] = count;
        }
        totalTasks += count;
    }

    return {
        totalProjects: parseInt(projectCount.rows[0].count),
        totalTasks,
        tasksByStatus,
        totalUsers: parseInt(userCount.rows[0].count),
    };
}

// Recent tasks across all projects
export async function getRecentGlobalTasks(limit: number = 50): Promise<Task[]> {
    const result = await pool.query(
        'SELECT t.*, p.name as project_name FROM tasks t LEFT JOIN projects p ON t.project_id = p.id ORDER BY t.updated_at DESC LIMIT $1',
        [limit]
    );
    return result.rows as Task[];
}

// User and API Key methods
export async function getUser(userId: string): Promise<User | null> {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    return (result.rows[0] as User) || null;
}

export async function createApiKey(userId: string, name: string): Promise<{ id: string, key_value: string }> {
    const id = crypto.randomUUID();
    const key_value = 'dp_live_' + crypto.randomBytes(24).toString('hex');

    await pool.query(
        'INSERT INTO api_keys (id, user_id, key_value, name) VALUES ($1, $2, $3, $4)',
        [id, userId, key_value, name]
    );
    return { id, key_value };
}

export async function listApiKeys(userId: string): Promise<ApiKey[]> {
    const result = await pool.query(
        'SELECT * FROM api_keys WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
    );
    return result.rows as ApiKey[];
}

export async function deleteApiKey(userId: string, keyId: string): Promise<boolean> {
    const result = await pool.query(
        'DELETE FROM api_keys WHERE id = $1 AND user_id = $2',
        [keyId, userId]
    );
    return (result.rowCount ?? 0) > 0;
}

export async function validateApiKey(keyValue: string): Promise<boolean> {
    const result = await pool.query(
        'UPDATE api_keys SET last_used_at = NOW() WHERE key_value = $1',
        [keyValue]
    );
    return (result.rowCount ?? 0) > 0;
}
