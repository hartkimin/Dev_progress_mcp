import { listApiKeys } from '@/lib/db';
import ApiKeyClient from './ApiKeyClient';

export const dynamic = 'force-dynamic';

export default async function ApiKeysPage() {
    // Hardcoded to the mock user we created in initDb
    const keys = await listApiKeys('mock-user-1');

    return (
        <main className="max-w-6xl mx-auto py-12 px-6 sm:px-8">
            <ApiKeyClient initialKeys={keys} />
        </main>
    );
}
