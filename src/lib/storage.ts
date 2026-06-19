import { supabaseAdmin } from '@/lib/supabase';

const BUCKET_NAMES = {
  audio: 'lesson-assets',
  image: 'lesson-assets',
  video: 'lesson-assets',
  avatars: 'avatars',
  media: 'media',
} as const;

export async function uploadToSupabaseStorage(
  file: File | Buffer | Uint8Array,
  bucket: string,
  key: string,
  contentType: string
): Promise<string> {
  let buffer: Uint8Array;

  if (file instanceof Buffer) {
    buffer = new Uint8Array(file);
  } else if (file instanceof Uint8Array) {
    buffer = file;
  } else {
    buffer = new Uint8Array(await file.arrayBuffer());
  }

  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(key, buffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload to Supabase Storage: ${error.message}`);
  }

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from(bucket)
    .getPublicUrl(key);

  return publicUrl;
}

export async function deleteFromSupabaseStorage(
  bucket: string,
  key: string
): Promise<void> {
  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .remove([key]);

  if (error) {
    throw new Error(`Failed to delete from Supabase Storage: ${error.message}`);
  }
}

export async function getFromSupabaseStorage(
  bucket: string,
  key: string
): Promise<Buffer> {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .download(key);

  if (error) {
    throw new Error(`Failed to download from Supabase Storage: ${error.message}`);
  }

  return Buffer.from(await data.arrayBuffer());
}

export function generateStorageKey(
  type: 'audio' | 'image' | 'video',
  lessonId: string,
  filename: string
): string {
  const timestamp = Date.now();
  const extension = filename.split('.').pop();
  return `${type}/${lessonId}/${timestamp}.${extension}`;
}

export function generateAvatarKey(userId: string, filename: string): string {
  const timestamp = Date.now();
  const extension = filename.split('.').pop();
  return `${userId}/${timestamp}.${extension}`;
}

export function generateMediaKey(filename: string): string {
  const timestamp = Date.now();
  const extension = filename.split('.').pop();
  return `${timestamp}.${extension}`;
}
