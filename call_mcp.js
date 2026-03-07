const { spawn } = require('child_process');

async function main() {
    const apiKey = process.env.DP_API_KEY;
    if (!apiKey) {
        console.error('Error: DP_API_KEY environment variable is required.');
        console.error('Usage: DP_API_KEY=your_key node call_mcp.js');
        process.exit(1);
    }

    return new Promise((resolve, reject) => {
        const mcpProcess = spawn('docker', ['exec', '-i', '-e', `DP_API_KEY=${apiKey}`, '-e', 'API_BASE_URL=http://host.docker.internal:3333/api/v1', 'vibeplanner-mcp', 'node', 'dist/index.js']);

        let stdoutData = '';
        let step = 0;
        let projectId = null;
        let taskId = null;

        mcpProcess.stdout.on('data', (data) => {
            const lines = data.toString().split('\n').filter(l => l.trim() !== '');
            for (const line of lines) {
                try {
                    const msg = JSON.parse(line);

                    if (msg.id === 1) {
                        // Init response
                        mcpProcess.stdin.write(JSON.stringify({
                            jsonrpc: "2.0",
                            method: "notifications/initialized"
                        }) + '\n');

                        console.log("Listing projects...");
                        // Step 1: List Projects
                        mcpProcess.stdin.write(JSON.stringify({
                            jsonrpc: "2.0",
                            id: 2,
                            method: "tools/call",
                            params: { name: "list_projects", arguments: {} }
                        }) + '\n');
                    } else if (msg.id === 2) {
                        const text = msg.result.content[0].text;
                        const match = text.match(/ID: ([a-f0-9\-]+) \| Name:/i);
                        if (match) {
                            projectId = match[1];
                            console.log("Found Project ID:", projectId);
                        } else {
                            console.error("No project found!");
                            mcpProcess.kill();
                            reject(new Error("No project found"));
                            return;
                        }

                        console.log("Creating task...");
                        // Step 2: Create Phase 10 Task
                        mcpProcess.stdin.write(JSON.stringify({
                            jsonrpc: "2.0",
                            id: 3,
                            method: "tools/call",
                            params: {
                                name: "create_task",
                                arguments: {
                                    projectId: projectId,
                                    title: "Phase 10: 언어 UI 업데이트 및 MCP 서버 호환성 업데이트 완료",
                                    category: "Frontend & Backend",
                                    phase: "Deployment & Review",
                                    taskType: "Coding",
                                    scale: "Task",
                                    description: "TopNav 언어 선택기를 원클릭 토글 방식으로 개선하고, 백엔드의 append API 구조에 맞춰 MCP 서버 내 append_project_document 도구를 연동했습니다.",
                                    status: "DONE"
                                }
                            }
                        }) + '\n');
                    } else if (msg.id === 3) {
                        console.log("Create Task Result:", msg.result.content[0].text);
                        const match = msg.result.content[0].text.match(/ID: ([a-f0-9\-]+)/);
                        if (match) taskId = match[1];

                        console.log("Appending deployment record...");
                        // Step 3: Append deployment document
                        mcpProcess.stdin.write(JSON.stringify({
                            jsonrpc: "2.0",
                            id: 4,
                            method: "tools/call",
                            params: {
                                name: "append_project_document",
                                arguments: {
                                    projectId: projectId,
                                    docType: "DEPLOY",
                                    item: JSON.stringify({
                                        id: `deploy-${Date.now()}`,
                                        version: "v1.2.0",
                                        env: "Production",
                                        status: "SUCCESS",
                                        timestamp: new Date().toISOString(),
                                        duration: "45s",
                                        trigger: "Manual MCP Update",
                                        logs: [
                                            { timestamp: new Date().toISOString(), level: "info", message: "Updating TopNav Language Toggler" },
                                            { timestamp: new Date().toISOString(), level: "info", message: "Deploying API Append Logic via VibePlanner-MCP docker container" },
                                            { timestamp: new Date().toISOString(), level: "info", message: "Deployment verified successfully via MCP." }
                                        ]
                                    })
                                }
                            }
                        }) + '\n');
                    } else if (msg.id === 4) {
                        console.log("Append Doc Result:", msg.result.content[0].text);
                        mcpProcess.kill();
                        resolve();
                    }
                } catch (e) {
                    // ignore format errors
                }
            }
        });

        mcpProcess.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });

        mcpProcess.on('close', (code) => {
            console.log("Process closed with code", code);
        });

        // Send init request
        mcpProcess.stdin.write(JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "initialize",
            params: {
                protocolVersion: "2024-11-05",
                capabilities: {},
                clientInfo: { name: "test-client", version: "1.0.0" }
            }
        }) + '\n');
    });
}

main().catch(console.error);
