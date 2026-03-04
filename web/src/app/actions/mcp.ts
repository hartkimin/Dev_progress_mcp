'use server';

import os from 'os';

export async function getMcpServerInfo() {
    const interfaces = os.networkInterfaces();
    let ip = '127.0.0.1';

    // Find the first external IPv4 address
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name] || []) {
            if (iface.family === 'IPv4' && !iface.internal) {
                ip = iface.address;
                break;
            }
        }
    }

    return {
        name: 'dev-progress-mcp',
        version: '1.0.0',
        transport: 'stdio',
        status: 'Online',
        ip,
        port: '-', // MCP over stdio doesn't use a traditional TCP port
        nodeVersion: process.version,
        toolsCount: 6,
        os: `${os.type()} ${os.release()}`
    };
}
