import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { updateVocabularyNotebookSchema } from '@/types/notebook';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = authHeader.replace('Bearer ', '');

    const { data: notebook, error } = await supabaseAdmin
      .from('vocabulary_notebooks')
      .select(`
        *,
        entries:notebook_entries(
          vocabulary:vocabulary(*)
        )
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Notebook fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch notebook' },
        { status: 500 }
      );
    }

    if (!notebook) {
      return NextResponse.json(
        { error: 'Notebook not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ notebook });
  } catch (error) {
    console.error('Notebook API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const validatedData = updateVocabularyNotebookSchema.parse(body);

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = authHeader.replace('Bearer ', '');

    const { data: notebook, error } = await supabaseAdmin
      .from('vocabulary_notebooks')
      .update({
        title: validatedData.title,
        description: validatedData.description,
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Update notebook error:', error);
      return NextResponse.json(
        { error: 'Failed to update notebook' },
        { status: 500 }
      );
    }

    return NextResponse.json({ notebook });
  } catch (error) {
    console.error('Update notebook API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = authHeader.replace('Bearer ', '');

    // Delete notebook entries first
    await supabaseAdmin
      .from('notebook_entries')
      .delete()
      .eq('notebook_id', id);

    // Delete notebook
    const { error } = await supabaseAdmin
      .from('vocabulary_notebooks')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Delete notebook error:', error);
      return NextResponse.json(
        { error: 'Failed to delete notebook' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete notebook API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
