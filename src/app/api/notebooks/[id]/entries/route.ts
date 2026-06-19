import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { 
  createNotebookEntrySchema, 
  bulkAddNotebookEntriesSchema,
  bulkRemoveNotebookEntriesSchema 
} from '@/types/notebook';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const notebookId = id;
    const body = await request.json();

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = authHeader.replace('Bearer ', '');

    // Check if notebook belongs to user
    const { data: notebook } = await supabaseAdmin
      .from('vocabulary_notebooks')
      .select('id')
      .eq('id', notebookId)
      .eq('user_id', userId)
      .single();

    if (!notebook) {
      return NextResponse.json(
        { error: 'Notebook not found' },
        { status: 404 }
      );
    }

    // Check if this is a bulk operation
    if (body.vocabularyIds && Array.isArray(body.vocabularyIds)) {
      const validatedData = bulkAddNotebookEntriesSchema.parse(body);
      
      const entriesToAdd = validatedData.vocabularyIds.map((vocabularyId: string) => ({
        notebook_id: notebookId,
        vocabulary_id: vocabularyId,
      }));

      const { data: entries, error } = await supabaseAdmin
        .from('notebook_entries')
        .insert(entriesToAdd)
        .select();

      if (error) {
        console.error('Bulk add notebook entries error:', error);
        return NextResponse.json(
          { error: 'Failed to add entries to notebook' },
          { status: 500 }
        );
      }

      return NextResponse.json({ entries }, { status: 201 });
    }

    // Single entry
    const validatedData = createNotebookEntrySchema.parse({ ...body, notebookId });

    const { data: entry, error } = await supabaseAdmin
      .from('notebook_entries')
      .insert({
        notebook_id: validatedData.notebookId,
        vocabulary_id: validatedData.vocabularyId,
      })
      .select()
      .single();

    if (error) {
      console.error('Add notebook entry error:', error);
      return NextResponse.json(
        { error: 'Failed to add entry to notebook' },
        { status: 500 }
      );
    }

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error('Notebook entries API error:', error);
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
    const notebookId = id;
    const body = await request.json();

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = authHeader.replace('Bearer ', '');

    // Check if notebook belongs to user
    const { data: notebook } = await supabaseAdmin
      .from('vocabulary_notebooks')
      .select('id')
      .eq('id', notebookId)
      .eq('user_id', userId)
      .single();

    if (!notebook) {
      return NextResponse.json(
        { error: 'Notebook not found' },
        { status: 404 }
      );
    }

    // Check if this is a bulk operation
    if (body.vocabularyIds && Array.isArray(body.vocabularyIds)) {
      const validatedData = bulkRemoveNotebookEntriesSchema.parse(body);
      
      const { error } = await supabaseAdmin
        .from('notebook_entries')
        .delete()
        .eq('notebook_id', notebookId)
        .in('vocabulary_id', validatedData.vocabularyIds);

      if (error) {
        console.error('Bulk remove notebook entries error:', error);
        return NextResponse.json(
          { error: 'Failed to remove entries from notebook' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    // Single entry removal
    const vocabularyId = body.vocabularyId;
    if (!vocabularyId) {
      return NextResponse.json(
        { error: 'vocabularyId is required' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('notebook_entries')
      .delete()
      .eq('notebook_id', notebookId)
      .eq('vocabulary_id', vocabularyId);

    if (error) {
      console.error('Remove notebook entry error:', error);
      return NextResponse.json(
        { error: 'Failed to remove entry from notebook' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Remove notebook entries API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
