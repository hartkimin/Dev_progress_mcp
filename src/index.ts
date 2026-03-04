#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    ListPromptsRequestSchema,
    GetPromptRequestSchema,
    McpError,
    ErrorCode,
} from "@modelcontextprotocol/sdk/types.js";
import * as db from './db.js';

const server = new Server(
    {
        name: "vibeplanner",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
            prompts: {},
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
                        phase: {
                            type: "string",
                            description: "Vibe Coding phase of the task (e.g. 'Ideation & Requirements', 'Architecture & Design', 'Implementation', 'Testing & QA', 'Deployment & Review')",
                        },
                        taskType: {
                            type: "string",
                            description: "Type of task (e.g. 'Prompting', 'Coding', 'Review', 'Docs')",
                        },
                        scale: {
                            type: "string",
                            description: "Scale of the task (e.g. 'Epic', 'Story', 'Task')",
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
                name: "update_task_details",
                description: "Update the detailed description, before work, and after work content of a task.",
                inputSchema: {
                    type: "object",
                    properties: {
                        taskId: {
                            type: "string",
                            description: "The ID of the task.",
                        },
                        description: {
                            type: "string",
                            description: "The main description or flow of the task.",
                        },
                        beforeWork: {
                            type: "string",
                            description: "Work Content (작업 내용). What the state or context was before the work started or what work is currently being done.",
                        },
                        afterWork: {
                            type: "string",
                            description: "After Work Content (작업 후 내용). The outcome or results after the work is completed.",
                        },
                        phase: {
                            type: "string",
                            description: "Vibe Coding phase of the task (e.g. 'Ideation & Requirements', 'Architecture & Design', 'Implementation', 'Testing & QA', 'Deployment & Review')",
                        },
                        taskType: {
                            type: "string",
                            description: "Type of task (e.g. 'Prompting', 'Coding', 'Review', 'Docs')",
                        },
                        scale: {
                            type: "string",
                            description: "Scale of the task (e.g. 'Epic', 'Story', 'Task')",
                        },
                    },
                    required: ["taskId"],
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

// Register available prompts for Vibe Coding Workflows
server.setRequestHandler(ListPromptsRequestSchema, async () => {
    return {
        prompts: [
            {
                name: "vibe_coding_phase_1_ideation",
                description: "Phase 1: 기획 단계 (Ideation & Planning) - 프로젝트 초기 기획 및 요구사항 도출 자동화 오케스트레이션",
                arguments: [
                    {
                        name: "projectId",
                        description: "적용할 대상 Project ID (선택사항, 생략 시 먼저 진행할 프로젝트를 묻게 됩니다)",
                        required: false
                    }
                ]
            },
            {
                name: "vibe_coding_phase_2_architecture",
                description: "Phase 2: 아키텍처 설계 (Architecture & Design) - 기술 스택, DB 스키마, UI 와이어프레임 설계 자동화 오케스트레이션",
                arguments: [
                    {
                        name: "projectId",
                        description: "적용할 대상 Project ID",
                        required: false
                    }
                ]
            },
            {
                name: "vibe_coding_phase_3_implementation",
                description: "Phase 3: 핵심 기능 구현 (Implementation) - 프론트엔드/백엔드 로직 구현 및 태스크 자동 생성 오케스트레이션",
                arguments: [
                    {
                        name: "projectId",
                        description: "적용할 대상 Project ID",
                        required: false
                    }
                ]
            },
            {
                name: "vibe_coding_phase_4_testing",
                description: "Phase 4: 테스트 및 디버깅 (Testing & QA) - 유닛/통합 테스트, 버그 수정 태스크 자동 생성 오케스트레이션",
                arguments: [
                    {
                        name: "projectId",
                        description: "적용할 대상 Project ID",
                        required: false
                    }
                ]
            },
            {
                name: "vibe_coding_phase_5_deployment",
                description: "Phase 5: 배포 및 완성 (Deployment & Review) - CI/CD 파이프라인, 실서버 호스팅, 문서화 태스크 자동 생성 오케스트레이션",
                arguments: [
                    {
                        name: "projectId",
                        description: "적용할 대상 Project ID",
                        required: false
                    }
                ]
            }
        ]
    };
});

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const projectId = args?.projectId;

    const basePromptInstructions = (phaseTitle: string, mandatoryTasks: string[]) => `
당신은 완벽한 Vibe Coding 마스터이자 프로젝트 매니저 어시스턴트입니다.
사용자는 지금 **${phaseTitle}** 단계를 시작하려고 합니다.
현재 프로젝트 ID: ${projectId ? projectId : '알 수 없음. 사용자에게 대상 프로젝트 ID 또는 이름을 물어보세요.'}

[당신의 임무 워크플로우]
1. 사용자에게 환영 인사를 건네고, 이 단계(${phaseTitle})에서 어떤 일들을 해야 하는지 안내합니다.
2. 아래 필수 TODO 리스트를 뼈대로 삼되, 사용자 프로젝트의 특수성에 맞게 구체적인 질문 1~2개를 먼저 던져서 컨텍스트를 파악합니다.
3. 사용자가 단답형으로라도 대답하면, 사용자를 대신하여 \`create_task\` MCP 툴을 직접 호출해서 아래 필수 항목을 포함한 구체화된 태스크들을 칸반보드에 추가합니다.
4. 툴 호출이 성공하면, 추가된 태스크 목록을 정리해서 보여주고 "기획이 끝났다면 다음 페이즈로 넘어갈까요?"와 같이 친절하게 안내합니다.

[반드시 생성해야 하는 필수 TODO 리스트 (create_task 사용)]
${mandatoryTasks.map(t => `- ${t}`).join('\n')}

**주의:** 이 프롬프트는 화면에 노출되는 텍스트가 아니라, 당신(LLM)이 어떻게 행동해야 할지를 지시하는 시스템 프롬프트입니다. 안내-질문-답변수신-Tool실행-피드백 이라는 워크플로우를 주도적으로 이끌어주세요!`;

    switch (name) {
        case "vibe_coding_phase_1_ideation":
            return {
                messages: [
                    {
                        role: "user",
                        content: {
                            type: "text",
                            text: basePromptInstructions("Phase 1: 기획 (Ideation)", [
                                "프로젝트 핵심 목표 및 타겟 유저 정의",
                                "주요 기능(Core Features) 목록 및 우선순위 선정",
                                "비기능적 요구사항(보안, 성능 등) 식별",
                                "유스케이스(Use-Case) 시나리오 작성"
                            ])
                        }
                    }
                ]
            };
        case "vibe_coding_phase_2_architecture":
            return {
                messages: [
                    {
                        role: "user",
                        content: {
                            type: "text",
                            text: basePromptInstructions("Phase 2: 아키텍처 설계 (Architecture)", [
                                "프론트엔드/백엔드 기술 스택 선정 및 컴포넌트 아키텍처 설계",
                                "데이터베이스 스키마(ERD) 설계",
                                "주요 API 엔드포인트 명세서 작성",
                                "주요 화면 구성 및 UI/UX 와이어프레임 설계",
                                "공통 상태 관리 및 디자인 시스템 정의"
                            ])
                        }
                    }
                ]
            };
        case "vibe_coding_phase_3_implementation":
            return {
                messages: [
                    {
                        role: "user",
                        content: {
                            type: "text",
                            text: basePromptInstructions("Phase 3: 핵심 기능 구현 (Implementation)", [
                                "프로젝트 초기 보일러플레이트 세팅 및 환경 변수 구성",
                                "코어 데이터베이스 모델 및 마이그레이션 적용",
                                "인증/인가 로직 및 핵심 API 계층 구현",
                                "주요 화면별 프론트엔드 UI 컴포넌트 개발 및 API 연동",
                                "코드 스멜 제거를 위한 지속적인 리팩토링 진행"
                            ])
                        }
                    }
                ]
            };
        case "vibe_coding_phase_4_testing":
            return {
                messages: [
                    {
                        role: "user",
                        content: {
                            type: "text",
                            text: basePromptInstructions("Phase 4: 테스트 및 디버깅 (Testing)", [
                                "주요 비즈니스 로직에 대한 단위 테스트(Unit Test) 작성",
                                "클라이언트-서버 간 통합 테스트(Integration Test) 진행",
                                "예외 상황(Edge Cases) 트래킹 및 에러 핸들링 검증",
                                "크로스 브라우징 및 다양한 디바이스(반응형) 환경 동작 확인",
                                "발견된 성능 병목 지점 및 버그 식별 시 수정 완료"
                            ])
                        }
                    }
                ]
            };
        case "vibe_coding_phase_5_deployment":
            return {
                messages: [
                    {
                        role: "user",
                        content: {
                            type: "text",
                            text: basePromptInstructions("Phase 5: 배포 및 완성 (Deployment)", [
                                "코드베이스 최적화 및 프로덕션 빌드(Production Build) 검증",
                                "CI/CD 파이프라인(Github Actions 등) 구축",
                                "클라우드 서비스(호스팅 등) 실서버 리소스 프로비저닝 및 실제 배포",
                                "프로젝트 README.md 업데이트 (실행 방법, 아키텍처 등 명시)",
                                "도메인 연결 및 SSL 처리, 최적화 모니터링 적용"
                            ])
                        }
                    }
                ]
            };
        default:
            throw new McpError(ErrorCode.MethodNotFound, `Prompt not found: ${name}`);
    }
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
                const { projectId, title, category = "", phase = "", taskType = "", scale = "", description = "", status = "TODO" } = args as Record<string, any>;
                const id = await db.createTask(projectId, title, category, phase, taskType, scale, description, status);
                return {
                    content: [{ type: "text", text: `Task created successfully with ID: ${id}` }],
                };
            }

            case "update_task_status": {
                const { taskId, status } = args as Record<string, any>;
                const updated = await db.updateTaskStatus(taskId, status, 'MCP Server');
                if (!updated) {
                    throw new McpError(ErrorCode.InvalidParams, `Task with ID ${taskId} not found or update failed.`);
                }
                return {
                    content: [{ type: "text", text: `Task ${taskId} status updated to ${status}.` }],
                };
            }

            case "update_task_details": {
                const { taskId, description = "", beforeWork = "", afterWork = "", phase = "", taskType = "", scale = "" } = args as Record<string, any>;
                const updated = await db.updateTaskDetails(taskId, description, beforeWork, afterWork, phase, taskType, scale, 'MCP Server');
                if (!updated) {
                    throw new McpError(ErrorCode.InvalidParams, `Task with ID ${taskId} not found or update failed.`);
                }
                return {
                    content: [{ type: "text", text: `Task ${taskId} details updated successfully.` }],
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
                                if (t.comment_count && t.comment_count > 0) boardMd += `  💬 ${t.comment_count} comment(s)\n`;
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
