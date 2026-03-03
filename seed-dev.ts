import { createProject, createTask, updateTaskStatus } from './src/db';
import { v4 as uuidv4 } from 'uuid';

async function seedDevMcp() {
    try {
        console.log('Seeding Dev Progress MCP project...\n');
        const projectId = await createProject(
            'Dev Progress MCP Development',
            'Applying the MCP to its own development process to visualize real-time progress.'
        );

        const tasks = [
            { title: 'Project Initialization', category: 'Infrastructure', desc: 'Initialize SQLite database, project structure, and Docker configurations.', status: 'DONE' },
            { title: 'MCP Server Core', category: 'Backend', desc: 'Implement create_project, create_task, and get_kanban_board in stdio output.', status: 'DONE' },
            { title: 'Next.js Kanban UI', category: 'Frontend', desc: 'Build the stunning Tailwind CSS server-side rendered Kanban board.', status: 'DONE' },
            { title: 'SafeTrip Feature Categories', category: 'Enhancements', desc: 'Add category metadata, UI badges, and category progress bars.', status: 'DONE' },
            { title: 'UI Light Mode', category: 'UI Polish', desc: 'Implement full light mode support across the Next.js app alongside dark mode.', status: 'IN_PROGRESS' },
            { title: 'Real-time UI Polling', category: 'UI Polish', desc: 'Enable Next.js auto-refresh so state changes appear live on the Kanban board.', status: 'IN_PROGRESS' },
            { title: 'In-Progress Active Indicator', category: 'UI Polish', desc: 'Add glowing effects to tasks actively being worked on.', status: 'IN_PROGRESS' },
            { title: 'Documentation & Walkthrough', category: 'Infrastructure', desc: 'Finalize walkthrough.md and prepare repository for final handoff.', status: 'TODO' },
        ];

        for (const t of tasks) {
            const taskId = await createTask(projectId, t.title, t.category, t.desc);
            if (t.status !== 'TODO') {
                await updateTaskStatus(taskId, t.status as any);
            }
        }

        console.log(`Successfully seeded Dev Progress MCP project. Project ID: ${projectId}`);
    } catch (err) {
        console.error('Failed to seed DB:', err);
    }
}

seedDevMcp();
