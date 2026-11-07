import React, { useCallback, useEffect } from 'react';
import { progressService } from '../../services/ProgressService';
import { usePortraitStage2Frame } from '../../games/stage2/usePortraitStage2Frame';
import type { Station } from '../../types';

interface Props {
  station: Station;
  studentId: string;
  isReadOnly: boolean;
  onCompleteStage: () => void;
}

function fitMobileGameArtwork(event: React.SyntheticEvent<HTMLIFrameElement>) {
  const gameDocument = event.currentTarget.contentDocument;
  if (!gameDocument?.querySelector('.scene')) return;

  const style = gameDocument.createElement('style');
  style.textContent = `
    @media (max-width: 640px) {
      .scene, .scene.is-victory {
        background-size: 100% auto !important;
        background-position: center top !important;
        background-repeat: no-repeat;
        background-color: #07547d;
      }
    }
    /* On wide screens the original bitmap title touched the frame edge,
       and its quiz panel consumed too much of the background illustration. */
    @media (min-width: 1024px) {
      .scene:not(.is-victory) {
        background-position: center 30px !important;
        background-repeat: no-repeat !important;
        background-size: 100% auto !important;
      }
      .scene:not(.is-victory) .panel {
        box-sizing: border-box !important;
        width: min(88vw, 1100px) !important;
        max-width: 1100px !important;
        align-self: center !important;
        margin: auto 0 !important;
        padding: clamp(14px, 1.8vw, 22px) !important;
      }
      .scene:not(.is-victory) .panel .prompt {
        font-size: clamp(19px, 2vw, 26px) !important;
        line-height: 1.3 !important;
        margin: 7px 0 12px !important;
      }
      .scene:not(.is-victory) .panel .answers button {
        min-height: 62px !important;
        padding: 9px 14px !important;
        font-size: clamp(16px, 1.5vw, 21px) !important;
      }
    }
  `;
  gameDocument.head.append(style);
}

/** Install the shared offline sound service only when the V12 game has no sound switch.
 *  Keep the same live HUD and preserve its existing question/award logic. */
function installLegacySoundControl(frame: HTMLIFrameElement) {
  const doc = frame.contentDocument;
  if (!doc?.documentElement) return;
  if (!doc.getElementById('cham-danang-shared-audio')) {
    const script = doc.createElement('script');
    script.id = 'cham-danang-shared-audio';
    script.src = '/games/shared/game-audio.js';
    script.async = false;
    doc.head.appendChild(script);
  }
  const attach = () => {
    const hud = doc.querySelector<HTMLElement>('.panel > .hud, .panel > .top, .shell > .hud, .shell > .top');
    if (!hud || hud.querySelector('.music-toggle,.sound-toggle,.audio-toggle')) return;
    const button = doc.createElement('button');
    button.type = 'button';
    button.className = 'music-toggle';
    const readEnabled = () => {
      try { return frame.contentWindow?.localStorage.getItem('cham_danang_sound_enabled') !== 'false'; }
      catch { return true; }
    };
    const update = () => {
      const enabled = readEnabled();
      button.setAttribute('aria-label', enabled ? 'Tắt âm thanh' : 'Bật âm thanh');
      button.setAttribute('aria-pressed', String(enabled));
      button.textContent = enabled ? '♫' : '♪̸';
    };
    button.addEventListener('click', () => {
      const enabled = !readEnabled();
      try { frame.contentWindow?.localStorage.setItem('cham_danang_sound_enabled', String(enabled)); }
      catch { /* Private mode may block storage. */ }
      const gameWindow = frame.contentWindow as (Window & {
        ChamDaNangGameAudio?: { setMuted: (muted: boolean) => void };
      }) | null;
      gameWindow?.ChamDaNangGameAudio?.setMuted(!enabled);
      update();
    });
    update();
    hud.appendChild(button);
  };
  attach();
  // V12 may recreate its scene during setup or replay.
  const observer = new MutationObserver(attach);
  observer.observe(doc.documentElement, {childList:true,subtree:true});
  frame.contentWindow?.addEventListener('pagehide', () => observer.disconnect(), {once:true});
}

/** Only mount this component for g3-station-1; the iframe contains approved V12. */
export const MyKheBanThanV12: React.FC<Props> = ({station,studentId,isReadOnly,onCompleteStage}) => {
  const fitPortrait = usePortraitStage2Frame();
  const onContinue = useCallback(() => {
    const reward = station.rewards.find(r => r.stage === 2) || station.rewards[1];
    if (!isReadOnly) progressService.completeStage2(studentId,station.id,reward?.id);
    onCompleteStage();
  },[station,studentId,isReadOnly,onCompleteStage]);
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.source !== document.querySelector<HTMLIFrameElement>('#my-khe-v12-frame')?.contentWindow) return;
      if (event.data?.type !== 'cham-danang-game-continue' || event.data?.stationId !== 'g3-station-1') return;
      onContinue();
    };
    window.addEventListener('message',handler);
    return () => window.removeEventListener('message',handler);
  },[onContinue]);
  return <iframe data-stage2-game-frame id="my-khe-v12-frame" title="Mật mã hai miền biển – Chặng 2" src="/games/grade3-my-khe-ban-than/v12/index.html" className="block h-[100dvh] min-h-[500px] w-full rounded-2xl border-0" allow="autoplay; fullscreen" onLoad={event => {
    fitMobileGameArtwork(event);
    fitPortrait(event);
    installLegacySoundControl(event.currentTarget);
  }} />;
};
