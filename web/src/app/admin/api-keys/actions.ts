'use server';

import { createApiKey, deleteApiKey } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const MOCK_USER_ID = 'mock-user-1';

export async function generateKey(name: string) {
    if (!name.trim()) throw new Error("Name is required");
    const result = await createApiKey(MOCK_USER_ID, name);
    revalidatePath('/admin/api-keys');
    return result.key_value; // Show it to the user once
}

export async function revokeKey(keyId: string) {
    await deleteApiKey(MOCK_USER_ID, keyId);
    revalidatePath('/admin/api-keys');
}
