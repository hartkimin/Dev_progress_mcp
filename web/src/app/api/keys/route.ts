import { listApiKeys, createApiKey, deleteApiKey } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

const MOCK_USER_ID = 'mock-user-1';

export async function GET() {
    try {
        const keys = await listApiKeys(MOCK_USER_ID);
        return NextResponse.json({ keys });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch keys' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        if (!body.name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

        const key = await createApiKey(MOCK_USER_ID, body.name);
        return NextResponse.json({ key });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create key' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const id = url.searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'Key ID is required' }, { status: 400 });

        await deleteApiKey(MOCK_USER_ID, id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete key' }, { status: 500 });
    }
}
