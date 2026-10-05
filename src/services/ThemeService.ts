
export interface ThemeSettings { desktop: string; mobile: string; lightness: number; blur: number; }
export const DEFAULT_THEME: ThemeSettings = { desktop: '', mobile: '', lightness: 0.12, blur: 0 };
const KEY = 'cham_danang_theme_v1';
let sessionTheme: ThemeSettings | null = null;
export function readTheme(fromStorage = false): ThemeSettings {
  if (sessionTheme && !fromStorage) return { ...sessionTheme };
  try { sessionTheme = validateTheme(JSON.parse(localStorage.getItem(KEY) || '{}')); }
  catch { sessionTheme = { ...DEFAULT_THEME }; }
  return { ...sessionTheme };
}
export function validateTheme(input: Partial<ThemeSettings> | null): ThemeSettings {
  const value: Partial<ThemeSettings> = input && typeof input === 'object' ? input : {};
  const valid = (item: unknown) => typeof item === 'string' && (item === '' || /^https:\/\//i.test(item) || /^data:image\/(png|jpeg|webp|gif);base64,/i.test(item));
  return {
    desktop: valid(value.desktop) ? value.desktop! : '',
    mobile: valid(value.mobile) ? value.mobile! : '',
    lightness: Number.isFinite(value.lightness) ? Math.max(0, Math.min(.65, value.lightness!)) : DEFAULT_THEME.lightness,
    blur: Number.isFinite(value.blur) ? Math.max(0, Math.min(6, value.blur!)) : 0,
  };
}
export function saveTheme(theme: ThemeSettings) {
  sessionTheme = validateTheme(theme);
  try { localStorage.setItem(KEY, JSON.stringify(sessionTheme)); }
  finally { window.dispatchEvent(new Event('cham-theme-changed')); }
}
