import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createVocabularyNotebookSchema } from '@/types/notebook';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = authHeader.replace('Bearer ', '');

    const { data: notebooks, error } = await supabaseAdmin
      .from('vocabulary_notebooks')
      .select(`
        *,
        entries:notebook_entries(
          vocabulary:vocabulary(*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Notebooks fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch notebooks' },
        { status: 500 }
      );
    }

    // Add entry count to each notebook
    const notebooksWithCounts = notebooks?.map((notebook: any) => ({
      ...notebook,
      entryCount: notebook.entries?.length || 0,
    })) || [];

    return NextResponse.json({ notebooks: notebooksWithCounts });
  } catch (error) {
    console.error('Notebooks API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createVocabularyNotebookSchema.parse(body);

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
      .insert({
        user_id: userId,
        title: validatedData.title,
        description: validatedData.description,
      })
      .select()
      .single();

    if (error) {
      console.error('Create notebook error:', error);
      return NextResponse.json(
        { error: 'Failed to create notebook' },
        { status: 500 }
      );
    }

    return NextResponse.json({ notebook }, { status: 201 });
  } catch (error) {
    console.error('Create notebook API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
