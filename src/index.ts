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
                description: "개발 진행 상황을 추적하기 위한 새 프로젝트를 생성합니다.",
                inputSchema: {
                    type: "object",
                    properties: {
                        name: {
                            type: "string",
                            description: "프로젝트의 이름입니다.",
                        },
                        description: {
                            type: "string",
                            description: "프로젝트에 대한 간단한 설명입니다.",
                        },
                        mode: {
                            type: "string",
                            description: "가이드 태스크와 함께 완전히 새로 시작하려면 'newbie'를 사용하세요. 기존 프로젝트 상태를 가져오기 위한 빈 프로젝트를 생성하려면 'import'를 사용하세요.",
                            enum: ["newbie", "import"],
                            default: "newbie"
                        }
                    },
                    required: ["name"],
                },
            },
            {
                name: "list_projects",
                description: "진행 중인 모든 프로젝트를 나열합니다.",
                inputSchema: {
                    type: "object",
                    properties: {},
                },
            },
            {
                name: "create_task",
                description: "프로젝트에 새 태스크를 추가합니다.",
                inputSchema: {
                    type: "object",
                    properties: {
                        projectId: {
                            type: "string",
                            description: "프로젝트의 ID입니다.",
                        },
                        title: {
                            type: "string",
                            description: "태스크의 제목입니다.",
                        },
                        category: {
                            type: "string",
                            description: "그룹화 및 진행 상황 표시에 사용되는 태스크의 선택적 카테고리입니다 (예: 'Backend API', 'Frontend App').",
                        },
                        phase: {
                            type: "string",
                            description: "태스크의 Vibe Coding 단계입니다 (예: 'Ideation & Requirements', 'Architecture & Design', 'Implementation', 'Testing & QA', 'Deployment & Review').",
                        },
                        taskType: {
                            type: "string",
                            description: "태스크의 유형입니다 (예: 'Prompting', 'Coding', 'Review', 'Docs').",
                        },
                        scale: {
                            type: "string",
                            description: "태스크의 규모입니다 (예: 'Epic', 'Story', 'Task').",
                        },
                        description: {
                            type: "string",
                            description: "태스크의 설명입니다.",
                        },
                        status: {
                            type: "string",
                            description: "태스크의 초기 상태입니다.",
                            enum: ["TODO", "IN_PROGRESS", "REVIEW", "DONE"],
                            default: "TODO"
                        },
                        startDate: {
                            type: "string",
                            description: "달력 뷰에 유용한 태스크의 선택적 시작 날짜/시간(ISO 8601 문자열)입니다 (예: '2025-03-01T09:00:00Z').",
                        },
                        dueDate: {
                            type: "string",
                            description: "달력 뷰에 유용한 태스크의 선택적 마감 날짜/시간(ISO 8601 문자열)입니다.",
                        },
                    },
                    required: ["projectId", "title"],
                },
            },
            {
                name: "update_task_status",
                description: "칸반 보드에서 태스크를 이동합니다 (상태 업데이트).",
                inputSchema: {
                    type: "object",
                    properties: {
                        taskId: {
                            type: "string",
                            description: "태스크의 ID입니다.",
                        },
                        status: {
                            type: "string",
                            description: "태스크의 새로운 상태입니다.",
                            enum: ["TODO", "IN_PROGRESS", "REVIEW", "DONE"],
                        },
                    },
                    required: ["taskId", "status"],
                },
            },
            {
                name: "update_task_details",
                description: "태스크의 상세 설명, 작업 전 내용 및 작업 후 내용을 업데이트합니다.",
                inputSchema: {
                    type: "object",
                    properties: {
                        taskId: {
                            type: "string",
                            description: "태스크의 ID입니다.",
                        },
                        description: {
                            type: "string",
                            description: "태스크의 주요 설명 또는 흐름입니다.",
                        },
                        beforeWork: {
                            type: "string",
                            description: "Work Content (작업 내용). 작업이 시작되기 전의 상태 또는 컨텍스트, 혹은 현재 진행 중인 작업 내용입니다.",
                        },
                        afterWork: {
                            type: "string",
                            description: "After Work Content (작업 후 내용). 작업 완료 후의 결과물 또는 성과입니다.",
                        },
                        phase: {
                            type: "string",
                            description: "태스크의 Vibe Coding 단계입니다 (예: 'Ideation & Requirements', 'Architecture & Design', 'Implementation', 'Testing & QA', 'Deployment & Review').",
                        },
                        taskType: {
                            type: "string",
                            description: "태스크의 유형입니다 (예: 'Prompting', 'Coding', 'Review', 'Docs').",
                        },
                        scale: {
                            type: "string",
                            description: "태스크의 규모입니다 (예: 'Epic', 'Story', 'Task').",
                        },
                        startDate: {
                            type: "string",
                            description: "선택적 시작 날짜/시간(ISO 8601 문자열)입니다.",
                        },
                        dueDate: {
                            type: "string",
                            description: "선택적 마감 날짜/시간(ISO 8601 문자열)입니다.",
                        },
                    },
                    required: ["taskId"],
                },
            },
            {
                name: "get_kanban_board",
                description: "특정 프로젝트의 현재 칸반 보드 레이아웃을 검색합니다.",
                inputSchema: {
                    type: "object",
                    properties: {
                        projectId: {
                            type: "string",
                            description: "프로젝트의 ID입니다.",
                        },
                    },
                    required: ["projectId"],
                },
            },
            {
                name: "get_project_document",
                description: "특정 프로젝트의 문서를 검색합니다. 지원 타입: ARCHITECTURE(시스템 구조), DATABASE(DB 스키마), WORKFLOW(워크플로우), API(API 명세), ENVIRONMENT(환경/인프라), CHANGELOG(변경 이력), DEPENDENCIES(의존성), DECISION(의사결정 기록), ISSUE_TRACKER(이슈 트래커), CODE_REVIEW(코드 리뷰), TEST(테스트 대시보드), DEPLOY(배포 내역), AI_CONTEXT(AI 컨텍스트), API_GUIDE(API 연동 가이드). 대시보드의 특정 뷰에서 JSON 또는 Markdown 형태로 렌더링됩니다.",
                inputSchema: {
                    type: "object",
                    properties: {
                        projectId: {
                            type: "string",
                            description: "프로젝트의 ID입니다.",
                        },
                        docType: {
                            type: "string",
                            description: "문서 유형입니다.",
                            enum: ["ARCHITECTURE", "DATABASE", "WORKFLOW", "API", "ENVIRONMENT", "CHANGELOG", "DEPENDENCIES", "DECISION", "ISSUE_TRACKER", "CODE_REVIEW", "TEST", "DEPLOY", "AI_CONTEXT", "API_GUIDE"]
                        }
                    },
                    required: ["projectId", "docType"],
                },
            },
            {
                name: "update_project_document",
                description: "특정 프로젝트의 문서를 업데이트하거나 생성합니다. 일반 문서는 마크다운/Mermaid 구조이며, ISSUE_TRACKER/CODE_REVIEW/TEST/DEPLOY/AI_CONTEXT는 JSON 형식의 데이터를 문자열화하여 저장해야 합니다.",
                inputSchema: {
                    type: "object",
                    properties: {
                        projectId: {
                            type: "string",
                            description: "프로젝트의 ID입니다.",
                        },
                        docType: {
                            type: "string",
                            description: "문서 유형입니다.",
                            enum: ["ARCHITECTURE", "DATABASE", "WORKFLOW", "API", "ENVIRONMENT", "CHANGELOG", "DEPENDENCIES", "DECISION", "ISSUE_TRACKER", "CODE_REVIEW", "TEST", "DEPLOY", "AI_CONTEXT", "API_GUIDE"]
                        },
                        content: {
                            type: "string",
                            description: "마크다운 형식의 문서 내용입니다."
                        }
                    },
                    required: ["projectId", "docType", "content"],
                },
            },
            {
                name: "get_project_document_versions",
                description: "특정 프로젝트 문서의 버전 기록을 검색합니다.",
                inputSchema: {
                    type: "object",
                    properties: {
                        projectId: {
                            type: "string",
                            description: "프로젝트의 ID입니다.",
                        },
                        docType: {
                            type: "string",
                            description: "문서 유형입니다.",
                            enum: ["ARCHITECTURE", "DATABASE", "WORKFLOW", "API", "ENVIRONMENT", "CHANGELOG", "DEPENDENCIES", "DECISION", "ISSUE_TRACKER", "CODE_REVIEW", "TEST", "DEPLOY", "AI_CONTEXT", "API_GUIDE"]
                        }
                    },
                    required: ["projectId", "docType"],
                },
            },
            {
                name: "restore_project_document_version",
                description: "문서를 특정 과거 버전으로 복원합니다.",
                inputSchema: {
                    type: "object",
                    properties: {
                        projectId: {
                            type: "string",
                            description: "프로젝트의 ID입니다.",
                        },
                        docType: {
                            type: "string",
                            description: "문서 유형입니다.",
                            enum: ["ARCHITECTURE", "DATABASE", "WORKFLOW", "API", "ENVIRONMENT", "CHANGELOG", "DEPENDENCIES", "DECISION", "ISSUE_TRACKER", "CODE_REVIEW", "TEST", "DEPLOY", "AI_CONTEXT", "API_GUIDE"]
                        },
                        versionId: {
                            type: "string",
                            description: "복원할 이전 버전의 식별자(ID)입니다."
                        }
                    },
                    required: ["projectId", "docType", "versionId"],
                },
            },
            {
                name: "delete_project",
                description: "프로젝트를 삭제합니다. 프로젝트에 포함된 모든 태스크, 코멘트, 문서도 함께 삭제됩니다.",
                inputSchema: {
                    type: "object",
                    properties: {
                        projectId: {
                            type: "string",
                            description: "삭제할 프로젝트의 ID입니다.",
                        }
                    },
                    required: ["projectId"],
                },
            },
            {
                name: "delete_task",
                description: "특정 태스크를 삭제합니다. 태스크에 달린 코멘트도 함께 삭제됩니다.",
                inputSchema: {
                    type: "object",
                    properties: {
                        taskId: {
                            type: "string",
                            description: "삭제할 태스크의 ID입니다.",
                        }
                    },
                    required: ["taskId"],
                },
            },
            {
                name: "get_task",
                description: "특정 태스크의 상세 정보를 조회합니다.",
                inputSchema: {
                    type: "object",
                    properties: {
                        taskId: {
                            type: "string",
                            description: "조회할 태스크의 ID입니다.",
                        }
                    },
                    required: ["taskId"],
                },
            },
            {
                name: "add_comment",
                description: "태스크에 코멘트를 추가합니다. 작업 진행 상황이나 논의 내용을 기록할 수 있습니다.",
                inputSchema: {
                    type: "object",
                    properties: {
                        taskId: {
                            type: "string",
                            description: "코멘트를 추가할 태스크의 ID입니다.",
                        },
                        author: {
                            type: "string",
                            description: "코멘트 작성자 이름입니다.",
                        },
                        content: {
                            type: "string",
                            description: "코멘트 내용입니다.",
                        }
                    },
                    required: ["taskId", "content"],
                },
            },
            {
                name: "get_comments",
                description: "특정 태스크에 달린 모든 코멘트를 조회합니다.",
                inputSchema: {
                    type: "object",
                    properties: {
                        taskId: {
                            type: "string",
                            description: "코멘트를 조회할 태스크의 ID입니다.",
                        }
                    },
                    required: ["taskId"],
                },
            },
            {
                name: "update_project",
                description: "프로젝트의 이름이나 설명을 수정합니다.",
                inputSchema: {
                    type: "object",
                    properties: {
                        projectId: {
                            type: "string",
                            description: "수정할 프로젝트의 ID입니다.",
                        },
                        name: {
                            type: "string",
                            description: "프로젝트의 새 이름입니다.",
                        },
                        description: {
                            type: "string",
                            description: "프로젝트의 새 설명입니다.",
                        }
                    },
                    required: ["projectId"],
                },
            },
            {
                name: "get_analytics",
                description: "프로젝트 및 태스크의 전체 통계를 조회합니다. 프로젝트 수, 태스크 수, 상태별 분포 등을 확인할 수 있습니다.",
                inputSchema: {
                    type: "object",
                    properties: {
                        projectId: {
                            type: "string",
                            description: "선택. 특정 프로젝트의 통계만 조회합니다.",
                        }
                    },
                },
            },
            {
                name: "get_recent_tasks",
                description: "전체 프로젝트에서 최근 업데이트된 태스크를 조회합니다.",
                inputSchema: {
                    type: "object",
                    properties: {
                        limit: {
                            type: "number",
                            description: "반환할 태스크 수 (기본: 50)",
                        }
                    },
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
                                "update_project_document 툴을 사용하여 ARCHITECTURE 문서를 Mermaid 구조도로 시각화 업데이트",
                                "update_project_document 툴을 사용하여 DATABASE 문서를 ERD 및 스키마 형태로 업데이트",
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
                const { name, description = "", mode = "newbie" } = args as Record<string, any>;
                const id = await db.createProject(name, description, mode);
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
                const { projectId, title, category = "", phase = "", taskType = "", scale = "", description = "", status = "TODO", startDate = null, dueDate = null } = args as Record<string, any>;
                const id = await db.createTask(projectId, title, category, phase, taskType, scale, description, status, startDate, dueDate);
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
                const { taskId, description = "", beforeWork = "", afterWork = "", phase = "", taskType = "", scale = "", startDate, dueDate } = args as Record<string, any>;
                const updated = await db.updateTaskDetails(taskId, description, beforeWork, afterWork, phase, taskType, scale, 'MCP Server', startDate, dueDate);
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

            case "get_project_document": {
                const { projectId, docType } = args as Record<string, string>;
                const doc = await db.getProjectDocument(projectId, docType);
                if (!doc) {
                    return { content: [{ type: "text", text: `해당 유형 생성이 필요합니다.` }] };
                }
                return {
                    content: [{ type: "text", text: doc.content }],
                };
            }

            case "update_project_document": {
                const { projectId, docType, content } = args as Record<string, string>;
                const updated = await db.updateProjectDocument(projectId, docType, content, "MCP Server");
                if (!updated) {
                    throw new McpError(ErrorCode.InternalError, "Failed to update project document.");
                }
                return {
                    content: [{ type: "text", text: `Document ${docType} updated successfully.` }],
                };
            }

            case "get_project_document_versions": {
                const { projectId, docType } = args as Record<string, string>;
                const versions = await db.getProjectDocumentVersions(projectId, docType);
                if (versions.length === 0) {
                    return { content: [{ type: "text", text: `해당 문서의 버전 기록이 없습니다.` }] };
                }
                const text = versions.map((v: any) => `Version ID: ${v.id} | Number: ${v.version_number} | Author: ${v.created_by} | Date: ${v.created_at}`).join('\n');
                return {
                    content: [{ type: "text", text: `Versions:\n${text}` }],
                };
            }

            case "restore_project_document_version": {
                const { projectId, docType, versionId } = args as Record<string, string>;
                try {
                    const restored = await db.restoreProjectDocumentVersion(projectId, docType, versionId, "MCP Server (Restore)");
                    if (!restored) {
                        throw new Error("Restore failed in DB.");
                    }
                    return {
                        content: [{ type: "text", text: `Document ${docType} restored successfully to version ID ${versionId}.` }],
                    };
                } catch (e: any) {
                    throw new McpError(ErrorCode.InternalError, `Failed to restore project document: ${e.message}`);
                }
            }

            case "delete_project": {
                const { projectId } = args as Record<string, string>;
                const deleted = await db.deleteProject(projectId);
                if (!deleted) {
                    throw new McpError(ErrorCode.InvalidParams, `Project with ID ${projectId} not found or delete failed.`);
                }
                return {
                    content: [{ type: "text", text: `Project ${projectId} deleted successfully.` }],
                };
            }

            case "delete_task": {
                const { taskId } = args as Record<string, string>;
                const deleted = await db.deleteTask(taskId);
                if (!deleted) {
                    throw new McpError(ErrorCode.InvalidParams, `Task with ID ${taskId} not found or delete failed.`);
                }
                return {
                    content: [{ type: "text", text: `Task ${taskId} deleted successfully.` }],
                };
            }

            case "get_task": {
                const { taskId } = args as Record<string, string>;
                const task = await db.getTaskById(taskId);
                if (!task) {
                    throw new McpError(ErrorCode.InvalidParams, `Task with ID ${taskId} not found.`);
                }
                const taskInfo = [
                    `ID: ${task.id}`,
                    `Title: ${task.title}`,
                    `Status: ${task.status}`,
                    task.category ? `Category: ${task.category}` : null,
                    task.phase ? `Phase: ${task.phase}` : null,
                    task.task_type ? `Type: ${task.task_type}` : null,
                    task.scale ? `Scale: ${task.scale}` : null,
                    task.description ? `Description: ${task.description}` : null,
                    task.before_work ? `Before Work: ${task.before_work}` : null,
                    task.after_work ? `After Work: ${task.after_work}` : null,
                    task.start_date ? `Start Date: ${task.start_date}` : null,
                    task.due_date ? `Due Date: ${task.due_date}` : null,
                    `Created: ${task.created_at}`,
                    `Updated: ${task.updated_at}`,
                ].filter(Boolean).join('\n');
                return {
                    content: [{ type: "text", text: taskInfo }],
                };
            }

            case "add_comment": {
                const { taskId, author = "MCP Server", content } = args as Record<string, string>;
                const id = await db.addComment(taskId, author, content);
                return {
                    content: [{ type: "text", text: `Comment added successfully with ID: ${id}` }],
                };
            }

            case "get_comments": {
                const { taskId } = args as Record<string, string>;
                const comments = await db.getComments(taskId);
                if (comments.length === 0) {
                    return { content: [{ type: "text", text: `No comments found for task ${taskId}.` }] };
                }
                const text = comments.map(c => `[${c.created_at}] ${c.author}: ${c.content}`).join('\n');
                return {
                    content: [{ type: "text", text: `Comments (${comments.length}):\n${text}` }],
                };
            }

            case "update_project": {
                const { projectId, name: newName, description: newDesc } = args as Record<string, string>;
                const project = await db.getProjectById(projectId);
                if (!project) {
                    throw new McpError(ErrorCode.InvalidParams, `Project with ID ${projectId} not found.`);
                }
                const updated = await db.updateProject(
                    projectId,
                    newName || project.name,
                    newDesc !== undefined ? newDesc : project.description
                );
                if (!updated) {
                    throw new McpError(ErrorCode.InternalError, `Failed to update project.`);
                }
                return {
                    content: [{ type: "text", text: `Project ${projectId} updated successfully.` }],
                };
            }

            case "get_analytics": {
                const { projectId } = (args || {}) as Record<string, string>;
                const analytics = await db.getGlobalAnalytics(projectId);
                const text = [
                    `📊 Analytics Summary${projectId ? ` (Project: ${projectId})` : ' (Global)'}`,
                    ``,
                    `Total Projects: ${analytics.totalProjects}`,
                    `Total Tasks: ${analytics.totalTasks}`,
                    `Total Users: ${analytics.totalUsers}`,
                    ``,
                    `Tasks by Status:`,
                    `  📋 TODO: ${analytics.tasksByStatus.TODO}`,
                    `  🔄 IN_PROGRESS: ${analytics.tasksByStatus.IN_PROGRESS}`,
                    `  👀 REVIEW: ${analytics.tasksByStatus.REVIEW}`,
                    `  ✅ DONE: ${analytics.tasksByStatus.DONE}`,
                ].join('\n');
                return {
                    content: [{ type: "text", text }],
                };
            }

            case "get_recent_tasks": {
                const { limit = 50 } = (args || {}) as Record<string, any>;
                const tasks = await db.getRecentGlobalTasks(Number(limit));
                if (tasks.length === 0) {
                    return { content: [{ type: "text", text: "No recent tasks found." }] };
                }
                const text = tasks.map((t: any) =>
                    `[${t.status}] ${t.title}${t.project_name ? ` (${t.project_name})` : ''} | Updated: ${t.updated_at}`
                ).join('\n');
                return {
                    content: [{ type: "text", text: `Recent Tasks (${tasks.length}):\n${text}` }],
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

    // Initialize the database tables
    await db.initDb();

    const isValid = await db.validateApiKey(apiKey);
    if (!isValid) {
        console.error("Invalid DP_API_KEY provided.");
        process.exit(1);
    }

    const transport = new StdioServerTransport();
    await server.connect(transport);
}

run().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
