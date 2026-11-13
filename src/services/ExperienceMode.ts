/** Ephemeral UI mode, never an authorization signal for the server. */
let active = typeof window !== 'undefined' && (window.location.hash.startsWith('#demo-student=') || new URLSearchParams(window.location.search).get('experience')==='1');
export const isExperienceMode = () => active;
export function setExperienceMode(value:boolean) { active=value; }
