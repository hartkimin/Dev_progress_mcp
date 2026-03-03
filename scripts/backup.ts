import fs from 'fs';
import path from 'path';

// Assume script is run from project root, or resolve relative to __dirname
const rootDir = path.resolve(__dirname, '..');
const dbPath = process.env.DB_PATH || path.join(rootDir, 'database.sqlite');
const backupDir = path.join(rootDir, 'backups');

if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}

// Ensure the db exists before backing up
if (fs.existsSync(dbPath)) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `database-${timestamp}.sqlite`);

    fs.copyFileSync(dbPath, backupPath);
    console.log(`[Backup Success] Created backup at ${backupPath}`);

    // Keep only last 7 backups to avoid disk space issues
    const files = fs.readdirSync(backupDir)
        .filter(f => f.startsWith('database-') && f.endsWith('.sqlite'))
        .map(f => ({ name: f, time: fs.statSync(path.join(backupDir, f)).mtime.getTime() }))
        .sort((a, b) => b.time - a.time);

    if (files.length > 7) {
        const filesToDelete = files.slice(7);
        for (const file of filesToDelete) {
            fs.unlinkSync(path.join(backupDir, file.name));
            console.log(`[Clean Up] Deleted old backup: ${file.name}`);
        }
    }
} else {
    console.warn(`[Backup Failed] Database not found at ${dbPath}`);
    process.exit(1);
}
