/** Optimize uploaded still images locally before embedding them in published content. */
export type OptimizedImage = { dataUrl: string; originalBytes: number; finalBytes: number; optimized: boolean };
const MAX_UPLOAD = 20 * 1024 * 1024;
const MAX_EMBED = 4 * 1024 * 1024;
function readDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Không đọc được ảnh.'));
    reader.readAsDataURL(blob);
  });
}
export async function optimizeImage(file: File, maxWidth = 1920, maxHeight = 1920): Promise<OptimizedImage> {
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type))
    throw new Error('Chọn ảnh JPG, PNG, WebP hoặc GIF.');
  if (file.size > MAX_UPLOAD) throw new Error('Ảnh gốc tối đa 20 MB.');
  // GIF may be animated: converting it to canvas would silently erase its animation.
  if (file.type === 'image/gif') {
    if (file.size > MAX_EMBED) throw new Error('GIF lớn hơn 4 MB. Hãy dùng đường dẫn HTTPS hoặc giảm GIF trước.');
    return { dataUrl: await readDataUrl(file), originalBytes: file.size, finalBytes: file.size, optimized: false };
  }
  let bitmap: ImageBitmap;
  try { bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' }); }
  catch { throw new Error('Không mở được ảnh để tối ưu. Vui lòng dùng PNG hoặc JPG khác.'); }
  try {
    const scale = Math.min(1, maxWidth / bitmap.width, maxHeight / bitmap.height);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Trình duyệt không hỗ trợ nén ảnh.');
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const webp = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/webp', 0.82));
    // Keep the original if optimization would make it larger, or WebP is unsupported.
    const chosen = webp?.type === 'image/webp' && webp.size < file.size ? webp : file;
    if (chosen.size > MAX_EMBED)
      throw new Error('Ảnh sau tối ưu vẫn vượt 4 MB. Hãy chọn ảnh khác hoặc dùng đường dẫn HTTPS.');
    return { dataUrl: await readDataUrl(chosen), originalBytes: file.size, finalBytes: chosen.size, optimized: chosen !== file };
  } finally { bitmap.close(); }
}
export function describeOptimization(image: OptimizedImage): string {
  const kb = (size: number) => (size / 1024).toFixed(0) + ' KB';
  return image.optimized
    ? `Đã tự tối ưu ảnh: ${kb(image.originalBytes)} → ${kb(image.finalBytes)} (giảm ${Math.round((1 - image.finalBytes / image.originalBytes) * 100)}%).`
    : `Đã giữ ảnh gốc ${kb(image.finalBytes)} vì ảnh đã nhỏ hoặc là GIF động.`;
}
