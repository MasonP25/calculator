// ─── ARCADE AMBIENT SOUNDS ───
// Procedural ambient soundscapes using Web Audio API — no external files
(function() {
  'use strict';

  // ─── CSS injection ───
  const style = document.createElement('style');
  style.textContent = `
    @keyframes ambient-pulse {
      0%, 100% { box-shadow: 0 0 0 0 var(--t-accent, #7b2ff7); }
      50% { box-shadow: 0 0 8px 3px var(--t-accent, #7b2ff7); }
    }
    .ambient-btn {
      position: fixed; top: 72px; right: 16px; z-index: 9996;
      width: 42px; height: 42px; border-radius: 50%;
      border: 2px solid var(--t-border, #2a2a4a);
      background: var(--t-bg2, #1a1a2e);
      color: var(--t-text, #e0e0e0);
      font-size: 1.2rem; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.2s, border-color 0.2s;
      font-family: 'Segoe UI', Tahoma, sans-serif;
      padding: 0; line-height: 1;
    }
    .ambient-btn:hover {
      transform: scale(1.1);
      border-color: var(--t-accent, #7b2ff7);
    }
    .ambient-btn.playing {
      animation: ambient-pulse 2s ease-in-out infinite;
    }
    .ambient-panel {
      position: fixed; top: 120px; right: 16px; z-index: 9997;
      background: var(--t-bg2, #1a1a2e);
      border: 2px solid var(--t-border, #2a2a4a);
      border-radius: 12px;
      padding: 12px;
      display: none; flex-direction: column; gap: 6px;
      width: 190px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.5);
      font-family: 'Segoe UI', Tahoma, sans-serif;
    }
    .ambient-panel.open { display: flex; }
    .ambient-option {
      display: flex; align-items: center; gap: 8px;
      padding: 7px 10px; border-radius: 8px; cursor: pointer;
      border: 2px solid transparent;
      transition: border-color 0.2s, background 0.15s;
      color: var(--t-text, #e0e0e0);
      font-size: 0.85rem;
    }
    .ambient-option:hover {
      background: var(--t-bg3, #2a2a4a);
    }
    .ambient-option.active {
      border-color: var(--t-accent, #7b2ff7);
    }
    .ambient-option .ambient-emoji {
      font-size: 1.1rem; width: 22px; text-align: center; flex-shrink: 0;
    }
    .ambient-option .ambient-name {
      flex: 1;
    }
    .ambient-vol-row {
      display: flex; align-items: center; gap: 8px;
      padding: 6px 4px 2px 4px;
      border-top: 1px solid var(--t-border, #2a2a4a);
      margin-top: 4px;
    }
    .ambient-vol-row label {
      font-size: 0.75rem; color: var(--t-dim, #888);
      flex-shrink: 0;
    }
    .ambient-vol-row input[type="range"] {
      flex: 1; height: 4px;
      -webkit-appearance: none; appearance: none;
      background: var(--t-border, #2a2a4a);
      border-radius: 2px; outline: none;
      cursor: pointer;
    }
    .ambient-vol-row input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none; appearance: none;
      width: 14px; height: 14px; border-radius: 50%;
      background: var(--t-accent, #7b2ff7);
      border: none; cursor: pointer;
    }
    .ambient-vol-row input[type="range"]::-moz-range-thumb {
      width: 14px; height: 14px; border-radius: 50%;
      background: var(--t-accent, #7b2ff7);
      border: none; cursor: pointer;
    }
    @media (max-width: 600px) {
      .ambient-btn { width: 34px; height: 34px; font-size: 0.95rem; top: 62px; right: 10px; }
      .ambient-panel { top: 102px; right: 10px; width: 170px; }
    }
  `;
  document.head.appendChild(style);

  // ─── State ───
  let audioCtx = null;
  let masterGain = null;
  let currentSound = null; // { id, nodes[] }
  let panelOpen = false;
  let savedState = null;

  try {
    savedState = JSON.parse(localStorage.getItem('arcade_ambient'));
  } catch(e) { savedState = null; }
  if (!savedState) savedState = { sound: null, volume: 50 };

  function getCtx() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = savedState.volume / 100;
      masterGain.connect(audioCtx.destination);
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  function save() {
    localStorage.setItem('arcade_ambient', JSON.stringify({
      sound: currentSound ? currentSound.id : null,
      volume: savedState.volume,
    }));
  }

  // ─── Sound generators ───
  // Each returns { nodes: [...AudioNodes], stop: fn }
  // All connect through masterGain

  const SOUNDS = [
    { id: 'rain',      emoji: '\u{1F327}\uFE0F', name: 'Rain',      gen: genRain },
    { id: 'ocean',     emoji: '\u{1F30A}',        name: 'Ocean',     gen: genOcean },
    { id: 'fireplace', emoji: '\u{1F525}',        name: 'Fireplace', gen: genFireplace },
    { id: 'forest',    emoji: '\u{1F333}',        name: 'Forest',    gen: genForest },
    { id: 'cafe',      emoji: '\u2615',           name: 'Caf\u00e9', gen: genCafe },
    { id: 'lofi',      emoji: '\u{1F3B6}',        name: 'Lo-fi',     gen: genLofi },
  ];

  // Helper: create white noise buffer
  function createNoiseBuffer(ctx, duration) {
    const sr = ctx.sampleRate;
    const len = sr * duration;
    const buf = ctx.createBuffer(1, len, sr);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  // Helper: create looping noise source
  function createNoiseSource(ctx, duration) {
    const buf = createNoiseBuffer(ctx, duration || 2);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    return src;
  }

  // RAIN: white noise through a bandpass filter
  function genRain() {
    const ctx = getCtx();
    const noise = createNoiseSource(ctx, 2);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 800;
    bp.Q.value = 0.5;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    noise.connect(bp);
    bp.connect(gain);
    gain.connect(masterGain);
    noise.start();
    // Fade in
    gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.5);

    // Add a subtle low rumble for body
    const noise2 = createNoiseSource(ctx, 3);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 400;
    const gain2 = ctx.createGain();
    gain2.gain.value = 0;
    noise2.connect(lp);
    lp.connect(gain2);
    gain2.connect(masterGain);
    noise2.start();
    gain2.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.5);

    return {
      gains: [gain, gain2],
      stop() {
        const t = ctx.currentTime;
        gain.gain.linearRampToValueAtTime(0.0001, t + 0.5);
        gain2.gain.linearRampToValueAtTime(0.0001, t + 0.5);
        setTimeout(() => { noise.stop(); noise2.stop(); }, 600);
      }
    };
  }

  // OCEAN: low-frequency oscillating noise
  function genOcean() {
    const ctx = getCtx();
    const noise = createNoiseSource(ctx, 4);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 300;
    // Modulate volume with LFO for wave effect
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.08; // slow waves
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.15;
    lfo.connect(lfoGain);
    const gain = ctx.createGain();
    gain.gain.value = 0;
    lfoGain.connect(gain.gain);
    noise.connect(lp);
    lp.connect(gain);
    gain.connect(masterGain);
    noise.start();
    lfo.start();
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.5);

    // Higher frequency hiss for foam
    const noise2 = createNoiseSource(ctx, 2);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 2000;
    bp.Q.value = 0.3;
    const lfo2 = ctx.createOscillator();
    lfo2.type = 'sine';
    lfo2.frequency.value = 0.1;
    const lfoGain2 = ctx.createGain();
    lfoGain2.gain.value = 0.06;
    lfo2.connect(lfoGain2);
    const gain2 = ctx.createGain();
    gain2.gain.value = 0;
    lfoGain2.connect(gain2.gain);
    noise2.connect(bp);
    bp.connect(gain2);
    gain2.connect(masterGain);
    noise2.start();
    lfo2.start();
    gain2.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.5);

    return {
      gains: [gain, gain2],
      stop() {
        const t = ctx.currentTime;
        gain.gain.linearRampToValueAtTime(0.0001, t + 0.5);
        gain2.gain.linearRampToValueAtTime(0.0001, t + 0.5);
        setTimeout(() => {
          noise.stop(); noise2.stop(); lfo.stop(); lfo2.stop();
        }, 600);
      }
    };
  }

  // FIREPLACE: crackling noise with random pops
  function genFireplace() {
    const ctx = getCtx();
    // Base crackle — filtered noise
    const noise = createNoiseSource(ctx, 2);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1200;
    bp.Q.value = 1.5;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    noise.connect(bp);
    bp.connect(gain);
    gain.connect(masterGain);
    noise.start();
    gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.5);

    // Low rumble
    const noise2 = createNoiseSource(ctx, 3);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 200;
    const gain2 = ctx.createGain();
    gain2.gain.value = 0;
    noise2.connect(lp);
    lp.connect(gain2);
    gain2.connect(masterGain);
    noise2.start();
    gain2.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.5);

    // Random pops/crackles
    let alive = true;
    function schedulePop() {
      if (!alive) return;
      const delay = 80 + Math.random() * 400;
      setTimeout(() => {
        if (!alive) return;
        try {
          const popBuf = createNoiseBuffer(ctx, 0.02 + Math.random() * 0.04);
          const popSrc = ctx.createBufferSource();
          popSrc.buffer = popBuf;
          const popBp = ctx.createBiquadFilter();
          popBp.type = 'bandpass';
          popBp.frequency.value = 800 + Math.random() * 3000;
          popBp.Q.value = 2 + Math.random() * 4;
          const popGain = ctx.createGain();
          popGain.gain.value = 0.08 + Math.random() * 0.2;
          popSrc.connect(popBp);
          popBp.connect(popGain);
          popGain.connect(masterGain);
          popSrc.start();
          popGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        } catch(e) {}
        schedulePop();
      }, delay);
    }
    schedulePop();

    return {
      gains: [gain, gain2],
      stop() {
        alive = false;
        const t = ctx.currentTime;
        gain.gain.linearRampToValueAtTime(0.0001, t + 0.5);
        gain2.gain.linearRampToValueAtTime(0.0001, t + 0.5);
        setTimeout(() => { noise.stop(); noise2.stop(); }, 600);
      }
    };
  }

  // FOREST: gentle noise with bird-like chirps
  function genForest() {
    const ctx = getCtx();
    // Wind/rustling
    const noise = createNoiseSource(ctx, 3);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 600;
    bp.Q.value = 0.3;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    noise.connect(bp);
    bp.connect(gain);
    gain.connect(masterGain);
    noise.start();
    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.5);

    // Occasional bird chirps
    let alive = true;
    function scheduleChirp() {
      if (!alive) return;
      const delay = 1500 + Math.random() * 4000;
      setTimeout(() => {
        if (!alive) return;
        try {
          const baseFreq = 1800 + Math.random() * 2000;
          const numNotes = 2 + Math.floor(Math.random() * 4);
          for (let i = 0; i < numNotes; i++) {
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            const f = baseFreq + (Math.random() - 0.5) * 600;
            osc.frequency.value = f;
            const g = ctx.createGain();
            g.gain.value = 0;
            osc.connect(g);
            g.connect(masterGain);
            const t = ctx.currentTime + i * (0.08 + Math.random() * 0.1);
            const dur = 0.05 + Math.random() * 0.08;
            osc.start(t);
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(0.06 + Math.random() * 0.06, t + 0.01);
            g.gain.exponentialRampToValueAtTime(0.001, t + dur);
            osc.stop(t + dur + 0.01);
          }
        } catch(e) {}
        scheduleChirp();
      }, delay);
    }
    scheduleChirp();

    return {
      gains: [gain],
      stop() {
        alive = false;
        const t = ctx.currentTime;
        gain.gain.linearRampToValueAtTime(0.0001, t + 0.5);
        setTimeout(() => { noise.stop(); }, 600);
      }
    };
  }

  // CAFE: medium noise with occasional clinks
  function genCafe() {
    const ctx = getCtx();
    // Background chatter (filtered noise)
    const noise = createNoiseSource(ctx, 3);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 500;
    bp.Q.value = 0.4;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    noise.connect(bp);
    bp.connect(gain);
    gain.connect(masterGain);
    noise.start();
    gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.5);

    // Higher chatter layer
    const noise2 = createNoiseSource(ctx, 2);
    const bp2 = ctx.createBiquadFilter();
    bp2.type = 'bandpass';
    bp2.frequency.value = 1800;
    bp2.Q.value = 0.8;
    const gain2 = ctx.createGain();
    gain2.gain.value = 0;
    noise2.connect(bp2);
    bp2.connect(gain2);
    gain2.connect(masterGain);
    noise2.start();
    gain2.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.5);

    // Occasional clinks
    let alive = true;
    function scheduleClink() {
      if (!alive) return;
      const delay = 2000 + Math.random() * 5000;
      setTimeout(() => {
        if (!alive) return;
        try {
          const freq = 2500 + Math.random() * 2000;
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.value = freq;
          const g = ctx.createGain();
          g.gain.value = 0.05 + Math.random() * 0.08;
          osc.connect(g);
          g.connect(masterGain);
          osc.start();
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08 + Math.random() * 0.06);
          osc.stop(ctx.currentTime + 0.15);
        } catch(e) {}
        scheduleClink();
      }, delay);
    }
    scheduleClink();

    return {
      gains: [gain, gain2],
      stop() {
        alive = false;
        const t = ctx.currentTime;
        gain.gain.linearRampToValueAtTime(0.0001, t + 0.5);
        gain2.gain.linearRampToValueAtTime(0.0001, t + 0.5);
        setTimeout(() => { noise.stop(); noise2.stop(); }, 600);
      }
    };
  }

  // LO-FI: soft sine wave chord progression with subtle noise
  function genLofi() {
    const ctx = getCtx();
    // Warm noise bed
    const noise = createNoiseSource(ctx, 3);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 800;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    noise.connect(lp);
    lp.connect(gain);
    gain.connect(masterGain);
    noise.start();
    gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.5);

    // Chord progression — oscillators cycle through chords
    const chords = [
      [261.6, 329.6, 392.0],   // C major
      [220.0, 277.2, 329.6],   // A minor
      [349.2, 440.0, 523.3],   // F major
      [293.7, 370.0, 440.0],   // D minor (approx)
    ];
    let chordIndex = 0;
    let oscs = [];
    let oscGains = [];
    let alive = true;

    function playChord() {
      if (!alive) return;
      // Clean up old oscillators
      oscs.forEach(o => { try { o.stop(); } catch(e) {} });
      oscs = [];
      oscGains = [];

      const chord = chords[chordIndex % chords.length];
      chordIndex++;

      chord.forEach(freq => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const g = ctx.createGain();
        g.gain.value = 0;
        osc.connect(g);
        g.connect(masterGain);
        osc.start();
        // Gentle fade in
        g.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.3);
        // Sustain then fade
        g.gain.setValueAtTime(0.04, ctx.currentTime + 3.0);
        g.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 3.8);
        osc.stop(ctx.currentTime + 4.0);
        oscs.push(osc);
        oscGains.push(g);
      });

      // Also add a subtle triangle sub
      const sub = ctx.createOscillator();
      sub.type = 'triangle';
      sub.frequency.value = chords[chordIndex % chords.length]?.[0] / 2 || 130;
      const sg = ctx.createGain();
      sg.gain.value = 0;
      sub.connect(sg);
      sg.connect(masterGain);
      sub.start();
      sg.gain.linearRampToValueAtTime(0.025, ctx.currentTime + 0.5);
      sg.gain.setValueAtTime(0.025, ctx.currentTime + 3.0);
      sg.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 3.8);
      sub.stop(ctx.currentTime + 4.0);
      oscs.push(sub);
      oscGains.push(sg);
    }

    playChord();
    const chordInterval = setInterval(() => {
      if (!alive) { clearInterval(chordInterval); return; }
      playChord();
    }, 4000);

    return {
      gains: [gain],
      stop() {
        alive = false;
        clearInterval(chordInterval);
        const t = ctx.currentTime;
        gain.gain.linearRampToValueAtTime(0.0001, t + 0.5);
        oscGains.forEach(g => {
          try { g.gain.cancelScheduledValues(t); g.gain.linearRampToValueAtTime(0.0001, t + 0.5); } catch(e) {}
        });
        setTimeout(() => {
          try { noise.stop(); } catch(e) {}
          oscs.forEach(o => { try { o.stop(); } catch(e) {} });
        }, 600);
      }
    };
  }

  // ─── Playback control ───
  function startSound(id) {
    if (currentSound) {
      currentSound.handle.stop();
      currentSound = null;
    }
    const def = SOUNDS.find(s => s.id === id);
    if (!def) return;
    const handle = def.gen();
    currentSound = { id, handle };
    savedState.sound = id;
    save();
    updateUI();
  }

  function stopSound() {
    if (currentSound) {
      currentSound.handle.stop();
      currentSound = null;
    }
    savedState.sound = null;
    save();
    updateUI();
  }

  function setVolume(v) {
    savedState.volume = v;
    save();
    if (masterGain) {
      masterGain.gain.value = v / 100;
    }
  }

  // ─── Visibility handling ───
  let pausedByVisibility = false;
  let pausedSoundId = null;

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (currentSound) {
        pausedSoundId = currentSound.id;
        currentSound.handle.stop();
        currentSound = null;
        pausedByVisibility = true;
        updateUI();
      }
    } else {
      if (pausedByVisibility && pausedSoundId) {
        // Small delay to let audio context resume
        setTimeout(() => {
          startSound(pausedSoundId);
          pausedByVisibility = false;
          pausedSoundId = null;
        }, 200);
      }
    }
  });

  // ─── UI ───
  let btn, panel, volumeSlider;

  function updateUI() {
    if (!btn) return;
    const playing = !!currentSound;
    btn.classList.toggle('playing', playing);
    btn.title = playing ? 'Ambient: ' + currentSound.id : 'Ambient sounds';

    if (panel) {
      panel.querySelectorAll('.ambient-option').forEach(opt => {
        opt.classList.toggle('active', currentSound && opt.dataset.sound === currentSound.id);
      });
    }
  }

  function createUI() {
    // Button
    btn = document.createElement('button');
    btn.className = 'ambient-btn';
    btn.innerHTML = '\u{1F3B5}';
    btn.title = 'Ambient sounds';
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      panelOpen = !panelOpen;
      panel.classList.toggle('open', panelOpen);
    });

    // Panel
    panel = document.createElement('div');
    panel.className = 'ambient-panel';
    panel.addEventListener('click', (e) => e.stopPropagation());

    // Sound options
    SOUNDS.forEach(s => {
      const row = document.createElement('div');
      row.className = 'ambient-option';
      row.dataset.sound = s.id;
      row.innerHTML = `<span class="ambient-emoji">${s.emoji}</span><span class="ambient-name">${s.name}</span>`;
      row.addEventListener('click', () => {
        if (currentSound && currentSound.id === s.id) {
          stopSound();
        } else {
          startSound(s.id);
        }
      });
      panel.appendChild(row);
    });

    // Volume slider
    const volRow = document.createElement('div');
    volRow.className = 'ambient-vol-row';
    const volLabel = document.createElement('label');
    volLabel.textContent = '\u{1F50A}';
    volumeSlider = document.createElement('input');
    volumeSlider.type = 'range';
    volumeSlider.min = '0';
    volumeSlider.max = '100';
    volumeSlider.value = savedState.volume;
    volumeSlider.addEventListener('input', () => {
      setVolume(parseInt(volumeSlider.value, 10));
    });
    volRow.appendChild(volLabel);
    volRow.appendChild(volumeSlider);
    panel.appendChild(volRow);

    // Close panel on outside click
    document.addEventListener('click', (e) => {
      if (panelOpen && !panel.contains(e.target) && e.target !== btn) {
        panelOpen = false;
        panel.classList.remove('open');
      }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && panelOpen) {
        panelOpen = false;
        panel.classList.remove('open');
      }
    });

    document.body.appendChild(panel);
    document.body.appendChild(btn);

    updateUI();

    // Auto-resume saved sound
    if (savedState.sound) {
      // Need user gesture on most browsers — try immediately, fallback to first click
      try {
        startSound(savedState.sound);
      } catch(e) {
        const resumeOnGesture = () => {
          if (savedState.sound && !currentSound) {
            startSound(savedState.sound);
          }
          document.removeEventListener('click', resumeOnGesture);
          document.removeEventListener('keydown', resumeOnGesture);
        };
        document.addEventListener('click', resumeOnGesture, { once: false });
        document.addEventListener('keydown', resumeOnGesture, { once: false });
      }
    }
  }

  // ─── Init ───
  function init() {
    createUI();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
