const { spawn } = require('child_process');

const serverProcess = spawn('docker', [
    'run', '-i', '--rm',
    '-v', 'd:\\Project\\16_Dev_progress_mcp:/app/data',
    'dev-progress-mcp'
], {
    stdio: ['pipe', 'pipe', 'inherit'] // pipe stdin and stdout, inherit stderr
});

let messageId = 1;
const pendingRequests = new Map();
let buffer = '';

serverProcess.stdout.on('data', (data) => {
    buffer += data.toString();
    const lines = buffer.split('\n');
    buffer = lines.pop() || ''; // keep the last potentially incomplete line

    for (const line of lines) {
        if (!line.trim()) continue;
        try {
            const response = JSON.parse(line);
            if (response.id && pendingRequests.has(response.id)) {
                pendingRequests.get(response.id)(response);
                pendingRequests.delete(response.id);
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

    // Currently we know we have the MCP Dev Progress project, let's test listing projects 
    console.log('[2] Calling list_projects tool...');
    const listRes = await sendRequest('tools/call', {
        name: 'list_projects',
        arguments: {}
    });

    const projectsListStr = listRes.result.content[0].text;
    console.log('✅ Projects found:');
    console.log(projectsListStr + '\n');

    // Extract the ID of the Dev Progress MCP project
    const match = projectsListStr.match(/ID: ([a-z0-9-]+) \| Name: Dev Progress MCP/);
    if (!match) {
        console.error('❌ Could not find the Dev Progress MCP project.');
        serverProcess.kill();
        process.exit(1);
    }

    const projectId = match[1];

    console.log(`[3] Testing get_kanban_board for Project ID: ${projectId}...`);
    const kanbanRes = await sendRequest('tools/call', {
        name: 'get_kanban_board',
        arguments: { projectId }
    });

    console.log('✅ Kanban Board Markdown retrieved via MCP:\n');
    console.log(kanbanRes.result.content[0].text);

    console.log('\n✅ All MCP tool tests passed successfully via Docker container.');
    serverProcess.kill();
    process.exit(0);
}

runTest().catch(console.error);
