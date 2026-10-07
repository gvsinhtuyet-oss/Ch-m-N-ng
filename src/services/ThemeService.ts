export interface ThemeSettings {
  coverDesktop: string;
  coverMobile: string;
  roleDesktop: string;
  roleMobile: string;
  journeyDesktop: string;
  journeyMobile: string;
  lightness: number;
  blur: number;
}

export const DEFAULT_THEME: ThemeSettings = {
  coverDesktop: '',
  coverMobile: '',
  roleDesktop: '',
  roleMobile: '',
  journeyDesktop: '',
  journeyMobile: '',
  lightness: 0.12,
  blur: 0,
};

const KEY = 'cham_danang_theme_v1';
let sessionTheme: ThemeSettings | null = null;

const validImage = (item: unknown) =>
  typeof item === 'string' &&
  (item === '' || /^https:\/\//i.test(item) || /^data:image\/(png|jpeg|webp|gif);base64,/i.test(item));

export function validateTheme(input: Partial<ThemeSettings> & { desktop?: string; mobile?: string } | null): ThemeSettings {
  const value = input && typeof input === 'object' ? input : {};
  const legacyDesktop = validImage(value.desktop) ? value.desktop! : '';
  const legacyMobile = validImage(value.mobile) ? value.mobile! : '';

  const image = (specific: unknown, fallback: string) =>
    validImage(specific) ? String(specific) : fallback;

  return {
    coverDesktop: image(value.coverDesktop, legacyDesktop),
    coverMobile: image(value.coverMobile, legacyMobile || legacyDesktop),
    roleDesktop: image(value.roleDesktop, legacyDesktop),
    roleMobile: image(value.roleMobile, legacyMobile || legacyDesktop),
    journeyDesktop: image(value.journeyDesktop, legacyDesktop),
    journeyMobile: image(value.journeyMobile, legacyMobile || legacyDesktop),
    lightness: Number.isFinite(value.lightness) ? Math.max(0, Math.min(.65, value.lightness!)) : DEFAULT_THEME.lightness,
    blur: Number.isFinite(value.blur) ? Math.max(0, Math.min(6, value.blur!)) : DEFAULT_THEME.blur,
  };
}

export function readTheme(fromStorage = false): ThemeSettings {
  if (sessionTheme && !fromStorage) return { ...sessionTheme };
  try { sessionTheme = validateTheme(JSON.parse(localStorage.getItem(KEY) || '{}')); }
  catch { sessionTheme = { ...DEFAULT_THEME }; }
  return { ...sessionTheme };
}

export function saveTheme(theme: ThemeSettings) {
  sessionTheme = validateTheme(theme);
  try { localStorage.setItem(KEY, JSON.stringify(sessionTheme)); }
  finally { window.dispatchEvent(new Event('cham-theme-changed')); }
}
