#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    McpError,
    ErrorCode,
} from "@modelcontextprotocol/sdk/types.js";
import * as db from './db.js';

const server = new Server(
    {
        name: "dev-progress-mcp",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

// Register available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "create_project",
                description: "Create a new project to track development progress.",
                inputSchema: {
                    type: "object",
                    properties: {
                        name: {
                            type: "string",
                            description: "The name of the project.",
                        },
                        description: {
                            type: "string",
                            description: "A small description of what the project is about.",
                        },
                    },
                    required: ["name"],
                },
            },
            {
                name: "list_projects",
                description: "List all ongoing projects.",
                inputSchema: {
                    type: "object",
                    properties: {},
                },
            },
            {
                name: "create_task",
                description: "Add a new task to a project.",
                inputSchema: {
                    type: "object",
                    properties: {
                        projectId: {
                            type: "string",
                            description: "The ID of the project.",
                        },
                        title: {
                            type: "string",
                            description: "Title of the task.",
                        },
                        category: {
                            type: "string",
                            description: "Optional category of the task used for grouping and displaying progress (e.g. 'Backend API', 'Frontend App').",
                        },
                        description: {
                            type: "string",
                            description: "Description of the task.",
                        },
                        status: {
                            type: "string",
                            description: "Initial status of the task.",
                            enum: ["TODO", "IN_PROGRESS", "REVIEW", "DONE"],
                            default: "TODO"
                        },
                    },
                    required: ["projectId", "title"],
                },
            },
            {
                name: "update_task_status",
                description: "Move a task across the Kanban board (update status).",
                inputSchema: {
                    type: "object",
                    properties: {
                        taskId: {
                            type: "string",
                            description: "The ID of the task.",
                        },
                        status: {
                            type: "string",
                            description: "New status of the task.",
                            enum: ["TODO", "IN_PROGRESS", "REVIEW", "DONE"],
                        },
                    },
                    required: ["taskId", "status"],
                },
            },
            {
                name: "get_kanban_board",
                description: "Retrieve the current Kanban board layout for a specific project.",
                inputSchema: {
                    type: "object",
                    properties: {
                        projectId: {
                            type: "string",
                            description: "The ID of the project.",
                        },
                    },
                    required: ["projectId"],
                },
            }
        ],
    };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
        switch (name) {
            case "create_project": {
                const { name, description = "" } = args as Record<string, any>;
                const id = await db.createProject(name, description);
                return {
                    content: [{ type: "text", text: `Project created successfully with ID: ${id}` }],
                };
            }

            case "list_projects": {
                const projects = await db.listProjects();
                const text = projects.length === 0
                    ? "No projects found."
                    : projects.map(p => `ID: ${p.id} | Name: ${p.name} | Desc: ${p.description}`).join('\n');

                return {
                    content: [{ type: "text", text: `Projects:\n${text}` }],
                };
            }

            case "create_task": {
                const { projectId, title, category = "", description = "", status = "TODO" } = args as Record<string, any>;
                const id = await db.createTask(projectId, title, category, description, status);
                return {
                    content: [{ type: "text", text: `Task created successfully with ID: ${id}` }],
                };
            }

            case "update_task_status": {
                const { taskId, status } = args as Record<string, any>;
                const updated = await db.updateTaskStatus(taskId, status);
                if (!updated) {
                    throw new McpError(ErrorCode.InvalidParams, `Task with ID ${taskId} not found or update failed.`);
                }
                return {
                    content: [{ type: "text", text: `Task ${taskId} status updated to ${status}.` }],
                };
            }

            case "get_kanban_board": {
                const { projectId } = args as Record<string, string>;
                const project = await db.getProjectById(projectId);

                if (!project) {
                    throw new McpError(ErrorCode.InvalidParams, `Project with ID ${projectId} not found.`);
                }

                const tasks = await db.getTasksByProject(projectId);

                // Group by category, then by status
                const categorized: Record<string, Record<string, db.Task[]>> = {};

                tasks.forEach(task => {
                    const cat = task.category || 'Uncategorized';
                    if (!categorized[cat]) {
                        categorized[cat] = { 'TODO': [], 'IN_PROGRESS': [], 'REVIEW': [], 'DONE': [] };
                    }
                    if (categorized[cat][task.status]) {
                        categorized[cat][task.status].push(task);
                    } else {
                        categorized[cat]['TODO'].push(task); // fallback
                    }
                });

                // Format into a Markdown Kanban Board
                let boardMd = `# Kanban Board: ${project.name}\n${project.description ? `*${project.description}*\n` : ''}\n`;

                for (const [category, grouped] of Object.entries(categorized)) {
                    boardMd += `\n### Category: ${category}\n`;
                    for (const [status, statusTasks] of Object.entries(grouped)) {
                        if (statusTasks.length > 0) {
                            boardMd += `#### ${status.replace('_', ' ')}\n`;
                            for (const t of statusTasks) {
                                boardMd += `- [${t.id.slice(0, 8)}] **${t.title}**\n`;
                                if (t.description) boardMd += `  > ${t.description.split('\n').join('\n  > ')}\n`;
                            }
                        }
                    }
                }

                return {
                    content: [{ type: "text", text: boardMd }],
                };
            }

            default:
                throw new McpError(ErrorCode.MethodNotFound, `Tool not found: ${name}`);
        }
    } catch (error: any) {
        throw new McpError(ErrorCode.InternalError, error.message || String(error));
    }
});

// Start the server using stdio transport
async function run() {
    const apiKey = process.env.DP_API_KEY;
    if (!apiKey) {
        console.error("DP_API_KEY environment variable is required to run the DevProgress MCP Server.");
        process.exit(1);
    }

    const isValid = await db.validateApiKey(apiKey);
    if (!isValid) {
        console.error("Invalid DP_API_KEY provided.");
        process.exit(1);
    }

    const transport = new StdioServerTransport();
    await server.connect(transport);
}

run().catch((error) => {
    process.exit(1);
});
