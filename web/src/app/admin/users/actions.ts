'use server';

import { addUser, removeUser } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

function extractApiMessage(raw: string, fallback: string): string {
    // Payload looks like: API error 409: {"statusCode":409,"message":"..."}
    const jsonMatch = raw.match(/\{[\s\S]*\}$/);
    if (jsonMatch) {
        try {
            const parsed = JSON.parse(jsonMatch[0]);
            if (typeof parsed?.message === 'string') return parsed.message;
        } catch { /* fall through */ }
    }
    return fallback;
}

export type CreateUserResult = { ok: true } | { ok: false; error: string };

export async function createUser(name: string, email: string): Promise<CreateUserResult> {
    if (!name.trim() || !email.trim()) {
        return { ok: false, error: '이름과 이메일을 입력하세요.' };
    }
    const id = crypto.randomUUID();
    try {
        await addUser(id, name, email);
    } catch (e) {
        const raw = e instanceof Error ? e.message : String(e);
        return { ok: false, error: extractApiMessage(raw, '사용자 생성에 실패했습니다') };
    }
    revalidatePath('/admin/users');
    return { ok: true };
}

export async function deleteUser(id: string) {
    if (id === 'mock-user-1') throw new Error("Cannot delete the default admin owner");
    await removeUser(id);
    revalidatePath('/admin/users');
}
