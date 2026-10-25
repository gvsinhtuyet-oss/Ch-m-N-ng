// Patterns reused from public/games/shared/game-audio.js.
export const patterns: Record<string, [number,number,number,OscillatorType,number][]> = {
    tap: [[660,0,.075,'sine',.03]],
    select: [[660,0,.065,'sine',.032],[880,.07,.085,'sine',.027]],
    confirm: [[600,0,.08,'triangle',.035],[900,.09,.11,'sine',.035]],
    connect: [[480,0,.065,'sine',.03],[740,.065,.095,'sine',.03]],
    next: [[620,0,.07,'sine',.03],[830,.085,.11,'sine',.035]],
    retry: [[540,0,.07,'triangle',.032],[700,.08,.08,'sine',.032],[920,.16,.12,'sine',.032]],
    key: [[830,0,.08,'sine',.032],[1245,.075,.16,'sine',.03]],
    right: [[660,0,.08,'sine',.036],[880,.09,.1,'sine',.04],[1100,.19,.16,'sine',.035]],
    wrong: [[380,0,.12,'triangle',.026],[310,.12,.14,'triangle',.025]],
    victory: [[523,0,.14,'sine',.04],[659,.16,.14,'sine',.04],[784,.32,.14,'sine',.04],[1047,.48,.32,'sine',.04]]
  };
