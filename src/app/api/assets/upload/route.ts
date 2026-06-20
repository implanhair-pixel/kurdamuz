import { NextRequest, NextResponse } from 'next/server';
import { uploadToSupabaseStorage, deleteFromSupabaseStorage, generateStorageKey } from '@/lib/storage';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const lessonId = formData.get('lessonId') as string;
    const assetType = formData.get('assetType') as 'audio' | 'image' | 'video';
    const title = formData.get('title') as string;

    if (!file || !lessonId || !assetType) {
      return NextResponse.json(
        { error: 'Missing required fields: file, lessonId, assetType' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = {
      audio: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
      image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      video: ['video/mp4', 'video/webm', 'video/ogg'],
    };

    if (!validTypes[assetType].includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type for ${assetType}. Allowed: ${validTypes[assetType].join(', ')}` },
        { status: 400 }
      );
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 50MB limit' },
        { status: 400 }
      );
    }

    // Generate storage key
    const key = generateStorageKey(assetType, lessonId, file.name);

    // Upload to Supabase Storage
    const bucket = 'lesson-assets';
    const fileUrl = await uploadToSupabaseStorage(file, bucket, key, file.type);

    // Save to database
    const { error: dbError } = await supabaseAdmin
      .from('lesson_assets')
      .insert({
        lesson_id: lessonId,
        asset_type: assetType,
        file_url: fileUrl,
        title: title || file.name,
      });

    if (dbError) {
      // Rollback: delete from Supabase Storage if database insert fails
      await deleteFromSupabaseStorage(bucket, key);
      return NextResponse.json(
        { error: 'Failed to save asset to database' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      fileUrl,
      key,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
