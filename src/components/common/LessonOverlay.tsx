import React from 'react';
import {createPortal} from 'react-dom';

/** Escape lesson stacking contexts while remaining inside native fullscreen. */
export function LessonOverlay({children}: {children: React.ReactNode}) {
  if (typeof document === 'undefined') return null;
  return createPortal(children, document.fullscreenElement || document.body);
}
