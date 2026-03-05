'use server';

import {
    getProjectDocumentDb,
    updateProjectDocumentDb,
    getProjectDocumentVersionsDb,
    restoreProjectDocumentVersionDb,
    ProjectDocumentVersion,
    ProjectDocument
} from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function fetchProjectDocument(projectId: string, docType: string): Promise<ProjectDocument | null> {
    try {
        return await getProjectDocumentDb(projectId, docType);
    } catch (e) {
        console.error('Error fetching project document:', e);
        return null;
    }
}

export async function saveProjectDocument(projectId: string, docType: string, content: string, createdBy: string = 'User'): Promise<{ success: boolean; error?: string }> {
    try {
        await updateProjectDocumentDb(projectId, docType, content, createdBy);
        revalidatePath(`/project/${projectId}`);
        return { success: true };
    } catch (e: any) {
        console.error('Error saving project document:', e);
        return { success: false, error: e.message || 'Failed to save document' };
    }
}

export async function fetchProjectDocumentVersions(projectId: string, docType: string): Promise<ProjectDocumentVersion[]> {
    try {
        return await getProjectDocumentVersionsDb(projectId, docType);
    } catch (e) {
        console.error('Error fetching project document versions:', e);
        return [];
    }
}

export async function restoreDocumentVersionAction(projectId: string, docType: string, versionId: string, restoredBy: string = 'User'): Promise<{ success: boolean; error?: string }> {
    try {
        await restoreProjectDocumentVersionDb(projectId, docType, versionId, restoredBy);
        revalidatePath(`/project/${projectId}`);
        return { success: true };
    } catch (e: any) {
        console.error('Error restoring project document version:', e);
        return { success: false, error: e.message || 'Failed to restore document version' };
    }
}
