import sqlite3 from 'sqlite3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const projectName = "SafeTrip Tracking Support";
const projectDesc = "Implementation of real-time safe trip tracking and panic features for the mobile app.";
const projectId = uuidv4();

const tasks = [
    // Backend API
    { title: "Define SafeTrip WebSocket events", category: "Backend API", desc: "Define connect, location_update, panic, and disconnect events." },
    { title: "Setup Redis Pub/Sub for location broadcasting", category: "Backend API", desc: "Use Redis to broadcast location updates to safety contacts." },
    { title: "Implement Panic Mode trigger endpoint", category: "Backend API", desc: "Endpoint to instantly trigger panic mode and notify emergency contacts." },

    // Mobile App (React Native)
    { title: "Background location tracking service", category: "Mobile App", desc: "Implement background Geolocation tracking using Expo Location." },
    { title: "SafeTrip UI map view", category: "Mobile App", desc: "Create the map overlay showing real-time path and ETA." },
    { title: "Panic Button UI", category: "Mobile App", desc: "Add a prominent, accessible panic button on the active trip screen." },

    // Safety Contacts Web Portal
    { title: "Live tracking dashboard", category: "Web Portal", desc: "Web view for assigned safety contacts to see real-time location." },
    { title: "Emergency alert notifications", category: "Web Portal", desc: "Receive loud browser notifications when panic mode is triggered." },
];

db.serialize(() => {
    // Create tables
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
    `);

    // Insert project
    const stmtProj = db.prepare('INSERT INTO projects (id, name, description) VALUES (?, ?, ?)');
    stmtProj.run(projectId, projectName, projectDesc);
    stmtProj.finalize();

    // Insert tasks
    const stmtTask = db.prepare('INSERT INTO tasks (id, project_id, title, category, description, status) VALUES (?, ?, ?, ?, ?, ?)');

    for (const task of tasks) {
        stmtTask.run(
            uuidv4(),
            projectId,
            task.title,
            task.category,
            task.desc,
            'TODO'
        );
    }
    stmtTask.finalize();
});

db.close((err) => {
    if (err) {
        console.error('Error closing database', err);
    } else {
        console.log(`Successfully seeded SafeTrip project. Project ID: ${projectId}`);
    }
});
