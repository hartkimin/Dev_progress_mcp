const { spawn } = require('child_process');

const serverProcess = spawn('docker', [
    'run', '-i', '--rm',
    '-v', 'd:\\Project\\16_Dev_progress_mcp:/app/data',
    'dev-progress-mcp'
], {
    stdio: ['pipe', 'pipe', 'inherit']
});

let messageId = 1;
const pendingRequests = new Map();
let buffer = '';

serverProcess.stdout.on('data', (data) => {
    buffer += data.toString();
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
        if (!line.trim()) continue;
        try {
            const response = JSON.parse(line);
            if (response.id && pendingRequests.has(response.id)) {
                pendingRequests.get(response.id)(response);
                pendingRequests.delete(response.id);
            } else if (response.method && response.method === 'notifications/message') {
                // ignore
            }
        } catch (e) {
            console.error('Failed to parse line:', line, e);
        }
    }
});

function sendRequest(method, params = {}) {
    return new Promise((resolve) => {
        const id = messageId++;
        const payload = JSON.stringify({
            jsonrpc: '2.0',
            id,
            method,
            params
        });
        pendingRequests.set(id, resolve);
        serverProcess.stdin.write(payload + '\n');
    });
}

async function runTest() {
    console.log('[1] Initializing MCP Server...');
    await sendRequest('initialize', {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'test-client', version: '1.0.0' }
    });
    console.log('✅ Initialization successful.\n');

    console.log('[2] Getting projects...');
    const listRes = await sendRequest('tools/call', {
        name: 'list_projects',
        arguments: {}
    });
    const projectsListStr = listRes.result.content[0].text;
    const match = projectsListStr.match(/ID: ([a-z0-9-]+) \| Name: Dev Progress MCP/);
    if (!match) {
        console.error('❌ Could not find the Dev Progress MCP project.');
        serverProcess.kill();
        process.exit(1);
    }
    const projectId = match[1];

    // Create a brand new task through MCP
    console.log(`[3] Creating a new test task via MCP...`);
    const createRes = await sendRequest('tools/call', {
        name: 'create_task',
        arguments: {
            projectId,
            title: 'Live MCP Integration Test',
            description: 'This task was created by the MCP container script while Next.js is running.',
            category: 'Testing',
            status: 'IN_PROGRESS'
        }
    });

    console.log('✅ Task created successfully via MCP!\n');
    console.log("Check the browser! The new task should appear automatically in 3-5 seconds in the 'IN_PROGRESS' column.");

    // Hold open for 10 seconds, then exit
    setTimeout(() => {
        console.log('Test completed.');
        serverProcess.kill();
        process.exit(0);
    }, 10000);
}

runTest().catch(console.error);
