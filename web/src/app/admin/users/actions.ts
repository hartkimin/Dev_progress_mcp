'use server';

import { addUser, removeUser } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

export async function createUser(name: string, email: string) {
    if (!name.trim() || !email.trim()) throw new Error("Name and email are required");
    const id = crypto.randomUUID();
    await addUser(id, name, email);
    revalidatePath('/admin/users');
}

export async function deleteUser(id: string) {
    if (id === 'mock-user-1') throw new Error("Cannot delete the default admin owner");
    await removeUser(id);
    revalidatePath('/admin/users');
}
