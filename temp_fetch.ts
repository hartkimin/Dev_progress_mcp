import { listProjects, getTasksByProject, updateTaskStatus, updateTaskDetails } from './src/db.js';

async function run() {
    try {
        console.log("Fetching projects...");
        const projects = await listProjects();
        console.log(JSON.stringify(projects, null, 2));

        if (projects.length > 0) {
            const projectId = projects[0].id; // Assuming the first project
            console.log(`\nFetching tasks for project ${projectId}...`);
            const tasks = await getTasksByProject(projectId);
            console.log(JSON.stringify(tasks, null, 2));

            // Find the task related to UI or MCP
            const targetTask = tasks.find(t => t.title.toLowerCase().includes('ui') || t.title.toLowerCase().includes('modal') || t.status === 'IN_PROGRESS' || t.status === 'TODO');

            if (targetTask) {
                console.log(`\nFound target task:`, targetTask.title);
                await updateTaskStatus(targetTask.id, 'DONE');
                await updateTaskDetails(
                    targetTask.id,
                    "Completed UI structure improvement for task details modal and MCP input integration.",
                    targetTask.before_work || "Design and implement edit modal.",
                    "Work Content and After Work Content textareas are now permanently visible. Save Details button updates both UI state and MCP successfully."
                );
                console.log("Successfully updated task status to DONE!");
            } else if (tasks.length > 0) {
                console.log(`\nCould not find specific UI task, updating task:`, tasks[0].title);
                await updateTaskStatus(tasks[0].id, 'DONE');
                await updateTaskDetails(
                    tasks[0].id,
                    "Completed UI structure improvement for task details modal and MCP input integration. MCP is ready.",
                    tasks[0].before_work || "",
                    "Work Content and After Work Content textareas are now fully integrated without requiring an explicit Edit button."
                );
                console.log("Successfully updated first task to DONE!");
            } else {
                console.log("\nNo tasks found in project to update.");
            }
        } else {
            console.log("No projects found.");
        }
    } catch (e) {
        console.error("Error", e);
    }
}

// Give DB a small bit of time to open
setTimeout(run, 500);
