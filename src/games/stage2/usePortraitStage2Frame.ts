import { useEffect, useRef, type SyntheticEvent } from 'react';
import mobilePortraitCss from './mobile-portrait.css?raw';
import framePortraitCss from './frame-portrait.css?raw';

const portraitQuery = '(max-width: 650px) and (orientation: portrait)';
const embeddedPortraitCss = mobilePortraitCss
  .replaceAll(':host([data-embedded])', 'html[data-stage2-portrait]')
  .replace(' and (orientation:portrait)', '')
  .replaceAll('button[data-choice]', 'button');

/** Share the portrait layout with the approved standalone games inside a station. */
export function usePortraitStage2Frame() {
  const cleanup = useRef<() => void>(() => {});
  useEffect(() => () => cleanup.current(), []);

  return (event: SyntheticEvent<HTMLIFrameElement>) => {
    cleanup.current();
    const frame = event.currentTarget;
    const gameDocument = frame.contentDocument;
    const scene = gameDocument?.querySelector<HTMLElement>('.scene');
    if (!gameDocument || !scene) return;

    const originalBackground = frame.contentWindow?.getComputedStyle(scene).backgroundImage ?? '';
    const artwork = originalBackground.match(/url\((?:"[^"]+"|'[^']+'|[^)]+)\)/)?.[0];
    // Layout still applies when a legacy game has no extractable artwork.
    // In that case show its existing heading instead of an empty banner.
    gameDocument.documentElement.toggleAttribute('data-stage2-artwork-missing', !artwork);
    if (artwork) scene.style.setProperty('--game-artwork', artwork);
    const style = gameDocument.createElement('style');
    style.textContent = embeddedPortraitCss + framePortraitCss;
    gameDocument.head.append(style);

    const media = window.matchMedia(portraitQuery);
    // V12 keeps the live HUD inside .panel; V18 already keeps it in .shell.
    // Move the actual DOM node, not a duplicate, so audio/rewards retain listeners.
    let relocatedHud: HTMLElement | null = null;
    let originalParent: Node | null = null;
    let originalNext: Node | null = null;
    const placeHud = () => {
      const shell = scene.querySelector<HTMLElement>('.shell');
      const hud = scene.querySelector<HTMLElement>('.hud');
      if (!shell || !hud || hud.parentElement === shell) return;
      originalParent = hud.parentNode;
      originalNext = hud.nextSibling;
      shell.insertBefore(hud, shell.firstChild);
      relocatedHud = hud;
    };
    const restoreHud = () => {
      if (relocatedHud && originalParent?.isConnected) {
        const next = originalNext?.parentNode === originalParent ? originalNext : null;
        originalParent.insertBefore(relocatedHud, next);
      }
      relocatedHud = null;
      originalParent = null;
      originalNext = null;
    };
    const resize = () => {
      if (media.matches) {
        const height = Math.ceil(scene.getBoundingClientRect().height);
        if (height > 0) frame.style.setProperty('--stage2-frame-height', `${height}px`);
      }
    };
    const observer = new ResizeObserver(resize);
    const updateMode = () => {
      gameDocument.documentElement.toggleAttribute('data-stage2-portrait', media.matches);
      if (media.matches) placeHud(); else restoreHud();
      observer.disconnect();
      if (media.matches) {
        observer.observe(scene);
        resize();
      } else {
        frame.style.removeProperty('--stage2-frame-height');
      }
    };

    updateMode();
    media.addEventListener('change', updateMode);
    cleanup.current = () => {
      observer.disconnect();
      media.removeEventListener('change', updateMode);
      gameDocument.documentElement.removeAttribute('data-stage2-portrait');
      gameDocument.documentElement.removeAttribute('data-stage2-artwork-missing');
      frame.style.removeProperty('--stage2-frame-height');
      restoreHud();
      style.remove();
    };
  };
}
