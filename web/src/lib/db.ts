import sqlite3 from 'sqlite3';
import path from 'path';
import crypto from 'crypto';

// Point back to the main project directory where `database.sqlite` is
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), '..', 'database.sqlite');

let dbInstance: sqlite3.Database | null = null;

export function getDb(): Promise<sqlite3.Database> {
    return new Promise((resolve, reject) => {
        if (dbInstance) return resolve(dbInstance);

        const db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error('Error opening database for Next.js', err.message);
                reject(err);
            } else {
                db.serialize(() => {
                    // 1. Users table
                    db.run(`
                        CREATE TABLE IF NOT EXISTS users (
                            id TEXT PRIMARY KEY,
                            name TEXT NOT NULL,
                            email TEXT NOT NULL UNIQUE,
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                        )
                    `);

                    // 2. API Keys table
                    db.run(`
                        CREATE TABLE IF NOT EXISTS api_keys (
                            id TEXT PRIMARY KEY,
                            user_id TEXT NOT NULL,
                            key_value TEXT NOT NULL UNIQUE,
                            name TEXT NOT NULL,
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            last_used_at DATETIME,
                            FOREIGN KEY (user_id) REFERENCES users(id)
                        )
                    `);

                    // 3. Projects table
                    db.run(`
                        CREATE TABLE IF NOT EXISTS projects (
                            id TEXT PRIMARY KEY,
                            name TEXT NOT NULL,
                            description TEXT,
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                        )
                    `);

                    // 4. Tasks table with Migrations
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
                            is_ai_processing BOOLEAN DEFAULT 0,
                            FOREIGN KEY (project_id) REFERENCES projects(id)
                        )
                    `, (err) => {
                        if (err) return reject(err);
                        
                        // Run Task Migrations
                        db.all("PRAGMA table_info(tasks)", (err, columns: Array<{ name: string }> | undefined) => {
                            if (!err && columns) {
                                if (!columns.some(c => c.name === 'started_at')) db.run("ALTER TABLE tasks ADD COLUMN started_at DATETIME");
                                if (!columns.some(c => c.name === 'completed_at')) db.run("ALTER TABLE tasks ADD COLUMN completed_at DATETIME");
                                if (!columns.some(c => c.name === 'updated_by')) db.run("ALTER TABLE tasks ADD COLUMN updated_by TEXT");
                                if (!columns.some(c => c.name === 'phase')) db.run("ALTER TABLE tasks ADD COLUMN phase TEXT");
                                if (!columns.some(c => c.name === 'task_type')) db.run("ALTER TABLE tasks ADD COLUMN task_type TEXT");
                                if (!columns.some(c => c.name === 'scale')) db.run("ALTER TABLE tasks ADD COLUMN scale TEXT");
                                if (!columns.some(c => c.name === 'is_ai_processing')) db.run("ALTER TABLE tasks ADD COLUMN is_ai_processing BOOLEAN DEFAULT 0");
                            }
                        });

                        // 5. Comments table
                        db.run(`
                            CREATE TABLE IF NOT EXISTS comments (
                                id TEXT PRIMARY KEY,
                                task_id TEXT NOT NULL,
                                author TEXT NOT NULL,
                                content TEXT NOT NULL,
                                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                FOREIGN KEY (task_id) REFERENCES tasks(id)
                            )
                        `, (err) => {
                            if (err) reject(err);
                            else {
                                // Seed initial user if empty
                                db.get('SELECT count(*) as count FROM users', [], (err, row: { count: number } | undefined) => {
                                    if (!err && row && row.count === 0) {
                                        db.run('INSERT INTO users (id, name, email) VALUES (?, ?, ?)', ['mock-user-1', 'Admin Developer', 'admin@example.com']);
                                    }
                                });
                                dbInstance = db;
                                resolve(db);
                            }
                        });
                    });
                });
            }
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
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM projects ORDER BY created_at DESC', (err, rows) => {
            if (err) reject(err);
            else resolve(rows as Project[]);
        });
    });
}

export async function getProjectById(projectId: string): Promise<Project | null> {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM projects WHERE id = ?', [projectId], (err, row) => {
            if (err) reject(err);
            else resolve((row as Project) || null);
        });
    });
}

export async function updateProject(projectId: string, name: string, description: string): Promise<boolean> {
    const db = await getDb();
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

export async function createProject(name: string, description: string): Promise<string> {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        const id = crypto.randomUUID();
        db.run(
            'INSERT INTO projects (id, name, description) VALUES (?, ?, ?)',
            [id, name, description],
            function (err) {
                if (err) reject(err);
                else resolve(id);
            }
        );
    });
}

export async function deleteProject(projectId: string): Promise<boolean> {
    const db = await getDb();
    return new Promise((resolve, reject) => {
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

export async function getTasksByProject(projectId: string): Promise<Task[]> {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        const query = `
            SELECT t.*, COUNT(c.id) as comment_count 
            FROM tasks t
            LEFT JOIN comments c ON t.id = c.task_id
            WHERE t.project_id = ? 
            GROUP BY t.id
            ORDER BY t.phase ASC, t.category ASC, t.created_at ASC
        `;
        db.all(query, [projectId], (err, rows) => {
            if (err) reject(err);
            else resolve(rows as Task[]);
        });
    });
}

export async function createTaskDb(projectId: string, title: string, status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' = 'TODO', updatedBy: string = 'Unknown'): Promise<string> {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        const id = crypto.randomUUID();
        db.run(
            'INSERT INTO tasks (id, project_id, title, status, description, updated_by) VALUES (?, ?, ?, ?, ?, ?)',
            [id, projectId, title, status, '', updatedBy],
            function (err) {
                if (err) reject(err);
                else resolve(id);
            }
        );
    });
}

export async function getRecentGlobalTasks(limit: number = 50): Promise<Task[]> {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        const query = `
            SELECT t.*, p.name as project_name 
            FROM tasks t
            JOIN projects p ON t.project_id = p.id
            ORDER BY t.updated_at DESC
            LIMIT ?
        `;
        db.all(query, [limit], (err, rows) => {
            if (err) reject(err);
            else resolve(rows as Task[]);
        });
    });
}

export async function getTaskById(taskId: string): Promise<Task | null> {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM tasks WHERE id = ?', [taskId], (err, row) => {
            if (err) reject(err);
            else resolve((row as Task) || null);
        });
    });
}

export async function updateTaskStatus(taskId: string, status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE', updatedBy: string = 'Unknown'): Promise<boolean> {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        let setQuery = 'status = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ?';

        if (status === 'IN_PROGRESS') {
            setQuery = 'status = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ?, started_at = COALESCE(started_at, CURRENT_TIMESTAMP)';
        } else if (status === 'DONE') {
            setQuery = 'status = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ?, completed_at = CURRENT_TIMESTAMP';
        }

        db.run(
            `UPDATE tasks SET ${setQuery} WHERE id = ?`,
            [status, updatedBy, taskId],
            function (err) {
                if (err) reject(err);
                else resolve(this.changes > 0);
            }
        );
    });
}

export async function updateTaskPhaseAndStatusDb(taskId: string, phase: string, status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE', updatedBy: string = 'Unknown'): Promise<boolean> {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        let setQuery = 'status = ?, phase = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ?';

        if (status === 'IN_PROGRESS') {
            setQuery = 'status = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ?, started_at = COALESCE(started_at, CURRENT_TIMESTAMP)';
        } else if (status === 'DONE') {
            setQuery = 'status = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ?, completed_at = CURRENT_TIMESTAMP';
        }

        db.run(
            `UPDATE tasks SET ${setQuery} WHERE id = ?`,
            [status, phase, updatedBy, taskId],
            function (err) {
                if (err) reject(err);
                else resolve(this.changes > 0);
            }
        );
    });
}

export async function updateTaskDetails(taskId: string, description: string, beforeWork: string, afterWork: string, phase: string, taskType: string, scale: string, updatedBy: string = 'Unknown'): Promise<boolean> {
    const db = await getDb();
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

export async function updateTaskTitle(taskId: string, title: string, updatedBy: string = 'Unknown'): Promise<boolean> {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        db.run(
            'UPDATE tasks SET title = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ? WHERE id = ?',
            [title, updatedBy, taskId],
            function (err) {
                if (err) reject(err);
                else resolve(this.changes > 0);
            }
        );
    });
}

export async function setTaskAiProcessing(taskId: string, isProcessing: boolean): Promise<boolean> {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        db.run(
            'UPDATE tasks SET is_ai_processing = ? WHERE id = ?',
            [isProcessing ? 1 : 0, taskId],
            function (err) {
                if (err) reject(err);
                else resolve(this.changes > 0);
            }
        );
    });
}

// Comments
export async function getCommentsActionDb(taskId: string): Promise<Comment[]> {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM comments WHERE task_id = ? ORDER BY created_at ASC', [taskId], (err, rows) => {
            if (err) reject(err);
            else resolve(rows as Comment[]);
        });
    });
}

export async function addCommentActionDb(taskId: string, author: string, content: string): Promise<string> {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        const id = crypto.randomUUID();
        db.run(
            'INSERT INTO comments (id, task_id, author, content) VALUES (?, ?, ?, ?)',
            [id, taskId, author, content],
            function (err) {
                if (err) {
                    console.error("Failed to add comment:", err);
                    reject(err);
                }
                else resolve(id);
            }
        );
    });
}

// User and API Key methods
export async function getUser(userId: string): Promise<User | null> {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
            if (err) reject(err);
            else resolve((row as User) || null);
        });
    });
}

export async function createApiKey(userId: string, name: string): Promise<{ id: string, key_value: string }> {
    const db = await getDb();
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

export async function listApiKeys(userId: string): Promise<ApiKey[]> {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM api_keys WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, rows) => {
            if (err) reject(err);
            else resolve(rows as ApiKey[]);
        });
    });
}

export async function deleteApiKey(userId: string, keyId: string): Promise<boolean> {
    const db = await getDb();
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

export async function listUsers(): Promise<User[]> {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM users ORDER BY created_at DESC', (err, rows) => {
            if (err) reject(err);
            else resolve(rows as User[]);
        });
    });
}

export async function addUser(id: string, name: string, email: string): Promise<void> {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO users (id, name, email) VALUES (?, ?, ?)', [id, name, email], function (err) {
            if (err) reject(err);
            else resolve();
        });
    });
}

export async function removeUser(id: string): Promise<boolean> {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('DELETE FROM api_keys WHERE user_id = ?', [id], (err) => {
                if (err) return reject(err);
            });
            db.run('DELETE FROM users WHERE id = ?', [id], function (err) {
                if (err) reject(err);
                else resolve(this.changes > 0);
            });
        });
    });
}

export async function getGlobalAnalytics(projectId?: string): Promise<GlobalAnalytics> {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            let totalProjects = 0;
            let totalTasks = 0;
            const tasksByStatus = { TODO: 0, IN_PROGRESS: 0, REVIEW: 0, DONE: 0 };
            let totalUsers = 0;

            const projQuery = projectId ? 'SELECT count(*) as count FROM projects WHERE id = ?' : 'SELECT count(*) as count FROM projects';
            const projParams = projectId ? [projectId] : [];
            db.get(projQuery, projParams, (err, row: { count: number } | undefined) => {
                if (err) return reject(err);
                if (row) totalProjects = row.count;
            });

            const taskQuery = projectId ? 'SELECT count(*) as count FROM tasks WHERE project_id = ?' : 'SELECT count(*) as count FROM tasks';
            const taskParams = projectId ? [projectId] : [];
            db.get(taskQuery, taskParams, (err, row: { count: number } | undefined) => {
                if (err) return reject(err);
                if (row) totalTasks = row.count;
            });

            const statusQuery = projectId ? 'SELECT status, count(*) as count FROM tasks WHERE project_id = ? GROUP BY status' : 'SELECT status, count(*) as count FROM tasks GROUP BY status';
            const statusParams = projectId ? [projectId] : [];
            db.all(statusQuery, statusParams, (err, rows: Array<{ status: string, count: number }> | undefined) => {
                if (err) return reject(err);
                if (rows) {
                    rows.forEach(r => {
                        tasksByStatus[r.status as keyof typeof tasksByStatus] = r.count;
                    });
                }
            });

            db.get('SELECT count(*) as count FROM users', [], (err, row: { count: number } | undefined) => {
                if (err) return reject(err);
                if (row) totalUsers = row.count;

                resolve({
                    totalProjects,
                    totalTasks,
                    tasksByStatus,
                    totalUsers
                });
            });
        });
    });
}
