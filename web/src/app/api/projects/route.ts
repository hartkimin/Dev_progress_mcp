import { listProjects, updateProject, deleteProject } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const projects = await listProjects();
        return NextResponse.json(projects);
    } catch (error) {
        console.error('Failed to fetch projects', error);
        return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, name, description } = body;

        if (!id || !name) {
            return NextResponse.json({ error: 'Missing required fields (id, name)' }, { status: 400 });
        }

        const success = await updateProject(id, name, description || '');
        if (success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: 'Project not found or no changes made' }, { status: 404 });
        }
    } catch (error) {
        console.error('Failed to update project', error);
        return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        // We expect the ID to be passed as a query parameter (e.g. ?id=123)
        // or we could use the dynamic route [id]/route.ts
        // Since this is the root /api/projects route, let's look for a query param.
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
        }

        const success = await deleteProject(id);
        if (success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }
    } catch (error) {
        console.error('Failed to delete project', error);
        return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
    }
}
