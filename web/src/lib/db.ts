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
                    db.run(`
                        CREATE TABLE IF NOT EXISTS users (
                            id TEXT PRIMARY KEY,
                            name TEXT NOT NULL,
                            email TEXT NOT NULL UNIQUE,
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                        )
                    `);
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
                    `, () => {
                        db.get('SELECT count(*) as count FROM users', [], (err, row: any) => {
                            if (!err && row && row.count === 0) {
                                db.run('INSERT INTO users (id, name, email) VALUES (?, ?, ?)', ['mock-user-1', 'Admin Developer', 'admin@example.com']);
                            }
                        });
                    });

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
                            title TEXT NOT NULL,
                            description TEXT,
                            status TEXT NOT NULL,
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            FOREIGN KEY (project_id) REFERENCES projects(id)
                        )
                    `, (err) => {
                        if (err) reject(err);
                        else {
                            dbInstance = db;
                            resolve(db);
                        }
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
    title: string;
    description: string;
    status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
    created_at: string;
    updated_at: string;
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
        db.all('SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at ASC', [projectId], (err, rows) => {
            if (err) reject(err);
            else resolve(rows as Task[]);
        });
    });
}

export async function updateTaskStatus(taskId: string, status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE'): Promise<boolean> {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        db.run(
            'UPDATE tasks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [status, taskId],
            function (err) {
                if (err) reject(err);
                else resolve(this.changes > 0);
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

export async function getGlobalAnalytics(): Promise<GlobalAnalytics> {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            let totalProjects = 0;
            let totalTasks = 0;
            const tasksByStatus = { TODO: 0, IN_PROGRESS: 0, REVIEW: 0, DONE: 0 };
            let totalUsers = 0;

            db.get('SELECT count(*) as count FROM projects', [], (err, row: any) => {
                if (err) return reject(err);
                if (row) totalProjects = row.count;
            });
            db.get('SELECT count(*) as count FROM tasks', [], (err, row: any) => {
                if (err) return reject(err);
                if (row) totalTasks = row.count;
            });
            db.all('SELECT status, count(*) as count FROM tasks GROUP BY status', [], (err, rows: any[]) => {
                if (err) return reject(err);
                if (rows) {
                    rows.forEach(r => {
                        tasksByStatus[r.status as keyof typeof tasksByStatus] = r.count;
                    });
                }
            });
            db.get('SELECT count(*) as count FROM users', [], (err, row: any) => {
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
