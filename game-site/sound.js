// ─── ARCADE SOUND SYSTEM ───
// Synthesized sounds using Web Audio API - no external files needed
(function() {
  let ctx;
  let muted = localStorage.getItem('arcadeMuted') === 'true';
  let vol = parseFloat(localStorage.getItem('arcadeVol') || '0.35');

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function osc(type, freq, dur, volume, delay) {
    if (muted) return;
    const c = getCtx();
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = (volume || 1) * vol;
    o.connect(g);
    g.connect(c.destination);
    const t = c.currentTime + (delay || 0);
    o.start(t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.stop(t + dur + 0.01);
  }

  function noise(dur, volume, delay) {
    if (muted) return;
    const c = getCtx();
    const bufSize = c.sampleRate * dur;
    const buf = c.createBuffer(1, bufSize, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buf;
    const g = c.createGain();
    g.gain.value = (volume || 0.3) * vol;
    src.connect(g);
    g.connect(c.destination);
    const t = c.currentTime + (delay || 0);
    src.start(t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  }

  const SFX = {
    // UI
    click: () => osc('sine', 800, 0.08, 0.4),
    select: () => osc('sine', 600, 0.06, 0.3),
    back: () => osc('sine', 400, 0.1, 0.3),
    toggle: () => { osc('sine', 500, 0.05, 0.3); osc('sine', 700, 0.05, 0.3, 0.05); },

    // Positive
    coin: () => { osc('sine', 988, 0.08, 0.4); osc('sine', 1319, 0.15, 0.4, 0.08); },
    powerup: () => { for (let i = 0; i < 5; i++) osc('sine', 400 + i * 150, 0.08, 0.35, i * 0.06); },
    win: () => { [523, 659, 784, 1047].forEach((f, i) => osc('sine', f, 0.2, 0.4, i * 0.12)); },
    levelup: () => { [440, 554, 659, 880].forEach((f, i) => osc('square', f, 0.12, 0.2, i * 0.08)); },
    correct: () => { osc('sine', 660, 0.1, 0.4); osc('sine', 880, 0.15, 0.4, 0.1); },
    combo: () => { osc('sine', 600, 0.06, 0.3); osc('sine', 800, 0.06, 0.3, 0.06); osc('sine', 1000, 0.1, 0.3, 0.12); },
    bonus: () => { osc('triangle', 880, 0.1, 0.35); osc('triangle', 1100, 0.15, 0.35, 0.08); },

    // Negative
    hit: () => { noise(0.15, 0.5); osc('square', 120, 0.15, 0.3); },
    death: () => { osc('sawtooth', 300, 0.3, 0.3); osc('sawtooth', 200, 0.3, 0.25, 0.15); osc('sawtooth', 100, 0.4, 0.2, 0.3); },
    fail: () => { osc('sine', 400, 0.15, 0.4); osc('sine', 300, 0.25, 0.4, 0.15); },
    wrong: () => { osc('square', 200, 0.2, 0.25); osc('square', 160, 0.25, 0.2, 0.1); },
    buzz: () => osc('sawtooth', 80, 0.2, 0.3),

    // Actions
    jump: () => { const c = getCtx(); const o = c.createOscillator(); const g = c.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(300, c.currentTime); o.frequency.exponentialRampToValueAtTime(600, c.currentTime + 0.1); g.gain.value = 0.3 * vol; o.connect(g); g.connect(c.destination); o.start(); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.12); o.stop(c.currentTime + 0.13); },
    flip: () => { const c = getCtx(); const o = c.createOscillator(); const g = c.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(500, c.currentTime); o.frequency.exponentialRampToValueAtTime(900, c.currentTime + 0.08); g.gain.value = 0.25 * vol; o.connect(g); g.connect(c.destination); o.start(); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.1); o.stop(c.currentTime + 0.11); },
    shoot: () => { noise(0.08, 0.4); osc('square', 600, 0.05, 0.2); },
    bounce: () => osc('sine', 500, 0.08, 0.3),
    drop: () => osc('sine', 250, 0.12, 0.3),
    place: () => osc('sine', 440, 0.06, 0.25),
    move: () => osc('sine', 350, 0.04, 0.15),
    lock: () => { osc('square', 200, 0.08, 0.2); osc('square', 300, 0.06, 0.2, 0.04); },
    clear: () => { osc('sine', 523, 0.08, 0.3); osc('sine', 659, 0.08, 0.3, 0.06); osc('sine', 784, 0.1, 0.3, 0.12); },
    swoosh: () => { const c = getCtx(); const o = c.createOscillator(); const g = c.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(1200, c.currentTime); o.frequency.exponentialRampToValueAtTime(200, c.currentTime + 0.15); g.gain.value = 0.15 * vol; o.connect(g); g.connect(c.destination); o.start(); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.15); o.stop(c.currentTime + 0.16); },
    explosion: () => { noise(0.3, 0.6); osc('sawtooth', 80, 0.3, 0.25); },
    tick: () => osc('sine', 1000, 0.03, 0.2),
    tock: () => osc('sine', 800, 0.03, 0.2),
    reveal: () => osc('triangle', 700, 0.1, 0.25),
    type: () => osc('sine', 600 + Math.random() * 200, 0.03, 0.15),
    ding: () => osc('sine', 1200, 0.15, 0.35),
    pop: () => osc('sine', 900, 0.05, 0.25),
    slide: () => { const c = getCtx(); const o = c.createOscillator(); const g = c.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(400, c.currentTime); o.frequency.linearRampToValueAtTime(600, c.currentTime + 0.1); g.gain.value = 0.2 * vol; o.connect(g); g.connect(c.destination); o.start(); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.12); o.stop(c.currentTime + 0.13); },
    countdown: (n) => osc('sine', n > 0 ? 440 : 880, n > 0 ? 0.15 : 0.3, 0.4),
    nearmiss: () => { osc('triangle', 1000, 0.05, 0.2); osc('triangle', 1300, 0.08, 0.2, 0.05); },
  };

  // ─── Mute button UI ───
  function createMuteBtn() {
    const btn = document.createElement('button');
    btn.id = 'sfx-mute-btn';
    btn.title = muted ? 'Unmute sounds' : 'Mute sounds';
    btn.innerHTML = muted ? '&#128263;' : '&#128266;';
    Object.assign(btn.style, {
      position: 'fixed', bottom: '16px', right: '64px', zIndex: '999',
      width: '42px', height: '42px', borderRadius: '50%', border: '2px solid #2a2a4a',
      background: '#1a1a2e', fontSize: '1.2rem', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'transform 0.2s', color: '#e0e0e0',
    });
    btn.addEventListener('mouseenter', () => btn.style.transform = 'scale(1.1)');
    btn.addEventListener('mouseleave', () => btn.style.transform = 'scale(1)');
    btn.addEventListener('click', () => {
      muted = !muted;
      localStorage.setItem('arcadeMuted', muted);
      btn.innerHTML = muted ? '&#128263;' : '&#128266;';
      btn.title = muted ? 'Unmute sounds' : 'Mute sounds';
      if (!muted) SFX.click();
    });
    document.body.appendChild(btn);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createMuteBtn);
  } else {
    createMuteBtn();
  }

  // Expose globally
  window.SFX = SFX;
})();
