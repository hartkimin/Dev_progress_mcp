import sqlite3 from 'sqlite3';
import crypto from 'crypto';
import path from 'path';

// Get the database path - standard location is in /app/data for docker
// Default to database.sqlite in root for local execution
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'database.sqlite');

export const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        // Silently fail or handle internally; avoid stdio pollution for MCP
    } else {
        initDb();
    }
});

function initDb() {
    db.serialize(() => {
        db.run(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

        db.run(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        category TEXT,
        phase TEXT,
        task_type TEXT,
        scale TEXT,
        title TEXT NOT NULL,
        description TEXT,
        before_work TEXT,
        after_work TEXT,
        status TEXT NOT NULL,
        started_at DATETIME,
        completed_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_by TEXT,
        FOREIGN KEY (project_id) REFERENCES projects(id)
      )
    `);

        // Run migrations for fields added later
        db.all("PRAGMA table_info(tasks)", (err, columns: any[]) => {
            if (!err && columns) {
                if (!columns.some(c => c.name === 'started_at')) {
                    db.run("ALTER TABLE tasks ADD COLUMN started_at DATETIME", () => { });
                }
                if (!columns.some(c => c.name === 'completed_at')) {
                    db.run("ALTER TABLE tasks ADD COLUMN completed_at DATETIME", () => { });
                }
                if (!columns.some(c => c.name === 'updated_by')) {
                    db.run("ALTER TABLE tasks ADD COLUMN updated_by TEXT", () => { });
                }
                if (!columns.some(c => c.name === 'phase')) {
                    db.run("ALTER TABLE tasks ADD COLUMN phase TEXT", () => { });
                }
                if (!columns.some(c => c.name === 'task_type')) {
                    db.run("ALTER TABLE tasks ADD COLUMN task_type TEXT", () => { });
                }
                if (!columns.some(c => c.name === 'scale')) {
                    db.run("ALTER TABLE tasks ADD COLUMN scale TEXT", () => { });
                }
            }
        });

        db.run(`
      CREATE TABLE IF NOT EXISTS comments(
                id TEXT PRIMARY KEY,
                task_id TEXT NOT NULL,
                author TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(task_id) REFERENCES tasks(id)
            )
            `);

        db.run(`
      CREATE TABLE IF NOT EXISTS users(
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
            `);

        db.run(`
      CREATE TABLE IF NOT EXISTS api_keys(
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                key_value TEXT NOT NULL UNIQUE,
                name TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_used_at DATETIME,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
    `, () => {
            // After tables are created, seed a mock user if none exists
            db.get('SELECT count(*) as count FROM users', [], (err, row: any) => {
                if (!err && row && row.count === 0) {
                    db.run('INSERT INTO users (id, name, email) VALUES (?, ?, ?)', ['mock-user-1', 'Admin Developer', 'admin@example.com']);
                }
            });
        });
    });
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

export interface ApiKey {
    id: string;
    user_id: string;
    key_value: string;
    name: string;
    created_at: string;
    last_used_at: string | null;
}

export async function createProject(name: string, description: string = ''): Promise<string> {
    return new Promise((resolve, reject) => {
        const id = crypto.randomUUID();
        db.run(
            'INSERT INTO projects (id, name, description) VALUES (?, ?, ?)',
            [id, name, description],
            async function (err) {
                if (err) {
                    reject(err);
                    return;
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
                    resolve(id);
                } catch (taskErr) {
                    // Even if task generation fails, the project is created, so we could still resolve
                    resolve(id);
                }
            }
        );
    });
}

export function updateProject(projectId: string, name: string, description: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        db.run(
            'UPDATE projects SET name = ?, description = ? WHERE id = ?',
            [name, description, projectId],
            function (err) {
                if (err) reject(err);
                else resolve(this.changes > 0);
            }
        );
    });
}

export function deleteProject(projectId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        // Run in serialization to ensure tasks are deleted before the project
        db.serialize(() => {
            db.run('DELETE FROM tasks WHERE project_id = ?', [projectId], (err) => {
                if (err) return reject(err);
            });
            db.run('DELETE FROM projects WHERE id = ?', [projectId], function (err) {
                if (err) reject(err);
                else resolve(this.changes > 0);
            });
        });
    });
}

export function listProjects(): Promise<Project[]> {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM projects ORDER BY created_at DESC', (err, rows) => {
            if (err) reject(err);
            else resolve(rows as Project[]);
        });
    });
}

export function createTask(projectId: string, title: string, category: string = '', phase: string = '', taskType: string = '', scale: string = '', description: string = '', status: string = 'TODO'): Promise<string> {
    return new Promise((resolve, reject) => {
        // Validate project existence
        db.get('SELECT id FROM projects WHERE id = ?', [projectId], (err, row) => {
            if (err) return reject(err);
            if (!row) return reject(new Error('Project not found'));

            const id = crypto.randomUUID();
            db.run(
                'INSERT INTO tasks (id, project_id, category, phase, task_type, scale, title, description, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [id, projectId, category, phase, taskType, scale, title, description, status],
                function (err) {
                    if (err) reject(err);
                    else resolve(id);
                }
            );
        });
    });
}

export function updateTaskStatus(taskId: string, status: string, updatedBy: string = 'Unknown'): Promise<boolean> {
    return new Promise((resolve, reject) => {
        let setQuery = 'status = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ?';

        if (status === 'IN_PROGRESS') {
            setQuery = 'status = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ?, started_at = COALESCE(started_at, CURRENT_TIMESTAMP)';
        } else if (status === 'DONE') {
            setQuery = 'status = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ?, completed_at = CURRENT_TIMESTAMP';
        }

        db.run(
            `UPDATE tasks SET ${setQuery} WHERE id = ? `,
            [status, updatedBy, taskId],
            function (err) {
                if (err) reject(err);
                else resolve(this.changes > 0);
            }
        );
    });
}

export function updateTaskDetails(taskId: string, description: string, beforeWork: string, afterWork: string, phase: string, taskType: string, scale: string, updatedBy: string = 'Unknown'): Promise<boolean> {
    return new Promise((resolve, reject) => {
        db.run(
            'UPDATE tasks SET description = ?, before_work = ?, after_work = ?, phase = ?, task_type = ?, scale = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ? WHERE id = ?',
            [description, beforeWork, afterWork, phase, taskType, scale, updatedBy, taskId],
            function (err) {
                if (err) reject(err);
                else resolve(this.changes > 0);
            }
        );
    });
}

export function getTasksByProject(projectId: string): Promise<Task[]> {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT t.*, COUNT(c.id) as comment_count 
            FROM tasks t
            LEFT JOIN comments c ON t.id = c.task_id
            WHERE t.project_id = ?
            GROUP BY t.id
            ORDER BY t.created_at ASC
            `;
        db.all(query, [projectId], (err, rows) => {
            if (err) reject(err);
            else resolve(rows as Task[]);
        });
    });
}

export function getProjectById(projectId: string): Promise<Project | null> {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM projects WHERE id = ?', [projectId], (err, row) => {
            if (err) reject(err);
            else resolve((row as Project) || null);
        });
    });
}

// User and API Key methods
export function getUser(userId: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
            if (err) reject(err);
            else resolve((row as User) || null);
        });
    });
}

export function createApiKey(userId: string, name: string): Promise<{ id: string, key_value: string }> {
    return new Promise((resolve, reject) => {
        const id = crypto.randomUUID();
        // Generate a secure random API key with a prefix
        const key_value = 'dp_live_' + crypto.randomBytes(24).toString('hex');

        db.run(
            'INSERT INTO api_keys (id, user_id, key_value, name) VALUES (?, ?, ?, ?)',
            [id, userId, key_value, name],
            function (err) {
                if (err) reject(err);
                else resolve({ id, key_value });
            }
        );
    });
}

export function listApiKeys(userId: string): Promise<ApiKey[]> {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM api_keys WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, rows) => {
            if (err) reject(err);
            else resolve(rows as ApiKey[]);
        });
    });
}

export function deleteApiKey(userId: string, keyId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        db.run(
            'DELETE FROM api_keys WHERE id = ? AND user_id = ?',
            [keyId, userId],
            function (err) {
                if (err) reject(err);
                else resolve(this.changes > 0);
            }
        );
    });
}

export function validateApiKey(keyValue: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        db.run(
            'UPDATE api_keys SET last_used_at = CURRENT_TIMESTAMP WHERE key_value = ?',
            [keyValue],
            function (err) {
                if (err) reject(err);
                else resolve(this.changes > 0);
            }
        );
    });
}
