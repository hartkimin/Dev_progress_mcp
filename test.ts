import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log("Testing SafeTrip Data Grouping...\n");

db.all(`
    SELECT t.id, t.title, t.category, t.status, p.name as projectName 
    FROM tasks t 
    JOIN projects p ON t.project_id = p.id
`, (err, rows: any[]) => {
    if (err) {
        console.error(err);
        return;
    }

    const categorized: Record<string, Record<string, any[]>> = {};
    rows.forEach(t => {
        if (!categorized[t.category]) categorized[t.category] = {};
        if (!categorized[t.category][t.status]) categorized[t.category][t.status] = [];
        categorized[t.category][t.status].push(t);
    });

    console.log(`Found ${rows.length} tasks for project: ${rows[0]?.projectName}\n`);

    for (const [category, statuses] of Object.entries(categorized)) {
        console.log(`=== Category: ${category} ===`);
        for (const [status, tasks] of Object.entries(statuses)) {
            console.log(`  [${status}]`);
            tasks.forEach(t => {
                console.log(`    - ${t.title}`);
            });
        }
    }
});
