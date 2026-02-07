import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getNoteById, toggleNoteSharing } from '@/lib/notes';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const note = getNoteById(id, session.user.id);

    if (!note) {
        return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    let body: { public: boolean };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    if (typeof body.public !== 'boolean') {
        return NextResponse.json({ error: "Missing 'public' field" }, { status: 400 });
    }

    const result = toggleNoteSharing(id, session.user.id, body.public);

    if (!result.success) {
        return NextResponse.json({ error: 'Failed to update sharing' }, { status: 500 });
    }

    return NextResponse.json({
        is_public: body.public,
        public_slug: result.slug,
        public_url: result.slug ? `/p/${result.slug}` : null,
    });
}
