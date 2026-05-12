// Uploads service — wraps Supabase Storage for hotel image management

import { supabase } from '../config/supabase';
import { AppError } from '../middlewares/errorHandler';

const BUCKET = 'hotel-images';

export async function uploadHotelImage(
  buffer: Buffer,
  originalName: string,
  mimetype: string,
): Promise<{ url: string; path: string }> {
  const ext = originalName.split('.').pop() ?? 'jpg';
  const path = `hotels/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: mimetype, upsert: false });

  if (error) throw new AppError(`Storage upload failed: ${error.message}`, 500);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

export async function deleteHotelImage(path: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw new AppError(`Storage delete failed: ${error.message}`, 500);
}
