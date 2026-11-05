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

    const artwork = frame.contentWindow?.getComputedStyle(scene).backgroundImage.match(/url\("[^"]+"\)/)?.[0];
    if (!artwork) return;
    scene.style.setProperty('--game-artwork', artwork);
    const style = gameDocument.createElement('style');
    style.textContent = embeddedPortraitCss + framePortraitCss;
    gameDocument.head.append(style);

    const media = window.matchMedia(portraitQuery);
    const resize = () => {
      if (media.matches) {
        const height = Math.ceil(scene.getBoundingClientRect().height);
        if (height > 0) frame.style.setProperty('--stage2-frame-height', `${height}px`);
      }
    };
    const observer = new ResizeObserver(resize);
    const updateMode = () => {
      gameDocument.documentElement.toggleAttribute('data-stage2-portrait', media.matches);
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
      frame.style.removeProperty('--stage2-frame-height');
      style.remove();
    };
  };
}
