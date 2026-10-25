/* Chạm Đà Nẵng — shared, offline, zero-cost game sound effects.
 * Loaded within same-origin station game frames after user gesture.
 * No external audio files or network calls. */
(function () {
  'use strict';
  if (window.ChamDaNangGameAudio) return;
  var ctx = null;
  var muted = false;
  var lastAt = 0;
  try { muted = localStorage.getItem('cham_danang_sound_enabled') === 'false'; } catch (_) {}
  function context() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!ctx) ctx = new AC();
    if (ctx.state === 'suspended') ctx.resume().catch(function () {});
    return ctx;
  }
  function tone(freq, start, duration, type, gain) {
    var c = context();
    if (!c || muted) return;
    var osc = c.createOscillator(), volume = c.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, start);
    volume.gain.setValueAtTime(0.0001, start);
    volume.gain.exponentialRampToValueAtTime(gain || 0.045, start + 0.012);
    volume.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(volume); volume.connect(c.destination);
    osc.start(start); osc.stop(start + duration + 0.015);
  }
  var patterns = {
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
  function play(name) {
    if (muted) return;
    var c = context(), p = patterns[name] || patterns.tap;
    if (!c) return;
    var now = c.currentTime + .005;
    p.forEach(function (n) { tone(n[0],now+n[1],n[2],n[3],n[4]); });
  }
  function setMuted(value) {
    muted = !!value;
    try { localStorage.setItem('cham_danang_sound_enabled',String(!muted)); } catch (_) {}
  }
  function classify(el) {
    var id = (el.id || '').toLowerCase(), cls = String(el.className || '').toLowerCase();
    var label = ((el.getAttribute('aria-label') || '') + ' ' + (el.textContent || '')).toLowerCase();
    if (/music-toggle|sound-toggle|audio-toggle/.test(id+' '+cls)) return 'tap';
    if (/confirm|xác nhận/.test(id+' '+cls+' '+label)) return 'confirm';
    if (/replay|restart|review|truy lại|chơi lại/.test(id+' '+cls+' '+label)) return 'retry';
    if (/continue|tiếp tục|next|bắt đầu/.test(id+' '+cls+' '+label)) return 'next';
    if (/^l\\d+$|^r\\d+$/.test(id) || /pickleft|pickright/.test(cls)) return 'connect';
    if (/^a\\d+$/.test(id) || /option|answer|choice/.test(cls)) return 'select';
    return 'tap';
  }
  function isInteractive(el) {
    return el && el.closest && el.closest('button,[role="button"],[role="option"],a,input[type="button"],input[type="submit"],.answer,.option,.choice');
  }
  function handle(e) {
    var el = isInteractive(e.target);
    if (!el || el.disabled || el.getAttribute('aria-disabled') === 'true') return;
    var now = Date.now();
    if (now-lastAt < 45) return;
    lastAt = now;
    var isMuteButton = /music-toggle|sound-toggle|audio-toggle/.test((el.id || '')+' '+String(el.className || ''));
    if (isMuteButton) {
      // The game owns the mute toggle; resync from shared storage after its click handler.
      setTimeout(function () {
        try { muted = localStorage.getItem('cham_danang_sound_enabled') === 'false'; } catch (_) {}
      },0);
    }
    play(classify(el));
  }
  document.addEventListener('pointerdown',handle,true);
  document.addEventListener('keydown',function (e) {
    if (e.key === 'Enter' || e.key === ' ') handle(e);
  },true);
  window.ChamDaNangGameAudio = {play:play,setMuted:setMuted,isMuted:function(){return muted;}};
})();