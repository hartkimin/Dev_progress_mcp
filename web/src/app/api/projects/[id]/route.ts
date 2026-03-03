import { getProjectById, getTasksByProject } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> } // In Next.js 15, params is a Promise
) {
    const { id } = await params;
    try {
        const project = await getProjectById(id);
        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }
        const tasks = await getTasksByProject(id);

        return NextResponse.json({ project, tasks });
    } catch (error) {
        console.error(`Failed to fetch project ${id}`, error);
        return NextResponse.json({ error: 'Failed to fetch project details' }, { status: 500 });
    }
}
