import { listApiKeys } from '@/lib/db';
import ApiKeyClient from './ApiKeyClient';

export const dynamic = 'force-dynamic';

export default async function ApiKeysPage() {
    // Hardcoded to the mock user we created in initDb
    const keys = await listApiKeys('mock-user-1');

    return (
        <main className="max-w-5xl mx-auto py-10 px-4 sm:px-6">
            <header className="mb-10">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-cyan-500 bg-clip-text text-transparent">
                    API Keys
                </h1>
                <p className="mt-3 text-slate-600 dark:text-slate-400 max-w-2xl">
                    Manage your secret API keys. Use these keys to authenticate external MCP clients, CI/CD pipelines, or custom scripts to your DevProgress server.
                </p>
            </header>

            <ApiKeyClient initialKeys={keys} />
        </main>
    );
}
