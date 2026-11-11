/**
 * Accept only a 12-character CHẠM student credential or a QR link issued for this
 * site's existing #student-code=... entry route. Decoding QR never authenticates.
 * The backend /api/student/sync/restore remains the authority.
 */
export function normalizeStudentCode(value: string): string | null {
  if (typeof value !== 'string') return null;
  const input = value.trim().toUpperCase();
  if (!/^(?:[A-Z0-9]{12}|[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4})$/.test(input)) return null;
  return input.replace(/-/g, '');
}

export function extractStudentCodeFromQr(raw: string, currentOrigin: string): string | null {
  if (typeof raw !== 'string' || raw.length > 2048) return null;
  const value = raw.trim();
  const direct = normalizeStudentCode(value);
  if (direct) return direct;
  let url: URL;
  try { url = new URL(value); } catch { return null; }
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && /^(?:localhost|127\.0\.0\.1)$/.test(url.hostname))) return null;
  let ownOrigin: string;
  try { ownOrigin = new URL(currentOrigin).origin; } catch { return null; }
  const allowedOrigins = new Set([ownOrigin, 'https://chamdanang-gddp.pages.dev']);
  if (!allowedOrigins.has(url.origin)) return null;
  if ((url.pathname !== '/' && url.pathname !== '/index.html') || url.search) return null;
  const match = /^#student-code=([^&?#]+)$/i.exec(url.hash);
  if (!match) return null;
  try { return normalizeStudentCode(decodeURIComponent(match[1])); } catch { return null; }
}
