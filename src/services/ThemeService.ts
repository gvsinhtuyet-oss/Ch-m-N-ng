
export interface ThemeSettings { desktop: string; mobile: string; lightness: number; blur: number; }
export const DEFAULT_THEME: ThemeSettings = { desktop: '', mobile: '', lightness: 0.12, blur: 0 };
const KEY = 'cham_danang_theme_v1';
export function readTheme(): ThemeSettings {
  try { return validateTheme(JSON.parse(localStorage.getItem(KEY) || '{}')); } catch { return { ...DEFAULT_THEME }; }
}
export function validateTheme(input: Partial<ThemeSettings>): ThemeSettings {
  const valid = (value: unknown) => typeof value === 'string' && (value === '' || /^https:\/\//i.test(value) || /^data:image\/(png|jpeg|webp|gif);base64,/i.test(value));
  return {
    desktop: valid(input.desktop) ? input.desktop! : '',
    mobile: valid(input.mobile) ? input.mobile! : '',
    lightness: Number.isFinite(input.lightness) ? Math.max(0, Math.min(.65, input.lightness!)) : DEFAULT_THEME.lightness,
    blur: Number.isFinite(input.blur) ? Math.max(0, Math.min(6, input.blur!)) : 0,
  };
}
export function saveTheme(theme: ThemeSettings) {
  localStorage.setItem(KEY, JSON.stringify(validateTheme(theme)));
  window.dispatchEvent(new Event('cham-theme-changed'));
}
export async function loadSharedTheme() {
  try {
    const response = await fetch('/api/content', { cache: 'no-store' });
    if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) return;
    const data = await response.json();
    if (data.schemaVersion === 1 && data.theme) saveTheme(data.theme);
  } catch {}
}
