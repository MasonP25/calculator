// ─── ARCADE THEME SYSTEM ───
(function() {
  const THEMES = {
    midnight: {
      name: 'Midnight', icon: '🌙',
      bg1:'#0f0f1a', bg2:'#1a1a2e', bg3:'#2a2a4a', border:'#2a2a4a',
      text:'#e0e0e0', dim:'#888', accent:'#7b2ff7', accent2:'#00d4ff',
      glow:'rgba(123,47,247,0.3)', canvasBg:'#1a1a2e', canvasBg2:'#0a0a15',
    },
    cyberpunk: {
      name: 'Cyberpunk', icon: '⚡',
      bg1:'#0a0014', bg2:'#140020', bg3:'#2a0040', border:'#ff00aa44',
      text:'#f0e0ff', dim:'#9966bb', accent:'#ff00aa', accent2:'#00ffee',
      glow:'rgba(255,0,170,0.3)', canvasBg:'#140020', canvasBg2:'#0a0014',
    },
    ocean: {
      name: 'Ocean', icon: '🌊',
      bg1:'#0a1628', bg2:'#0f2035', bg3:'#1a3050', border:'#1a3a5a',
      text:'#c8dce8', dim:'#6090a8', accent:'#00a8cc', accent2:'#48cfad',
      glow:'rgba(0,168,204,0.3)', canvasBg:'#0f2035', canvasBg2:'#0a1628',
    },
    sunset: {
      name: 'Sunset', icon: '🌅',
      bg1:'#1a0f0a', bg2:'#2a1810', bg3:'#4a2820', border:'#5a3020',
      text:'#f0d8c8', dim:'#a07860', accent:'#ff6b35', accent2:'#ffd166',
      glow:'rgba(255,107,53,0.3)', canvasBg:'#2a1810', canvasBg2:'#1a0f0a',
    },
    forest: {
      name: 'Forest', icon: '🌲',
      bg1:'#0a1a0f', bg2:'#102818', bg3:'#1a3a22', border:'#1a4a28',
      text:'#c8e8d0', dim:'#608a68', accent:'#35a855', accent2:'#a8d86e',
      glow:'rgba(53,168,85,0.3)', canvasBg:'#102818', canvasBg2:'#0a1a0f',
    },
    arctic: {
      name: 'Arctic', icon: '❄️',
      bg1:'#e8ecf0', bg2:'#f4f6f8', bg3:'#dce2e8', border:'#c0c8d0',
      text:'#1a2a3a', dim:'#6080a0', accent:'#3060c0', accent2:'#00a0d0',
      glow:'rgba(48,96,192,0.2)', canvasBg:'#f4f6f8', canvasBg2:'#e8ecf0',
    },
    retro: {
      name: 'Retro', icon: '📺',
      bg1:'#0a0a00', bg2:'#141400', bg3:'#1e2800', border:'#2a3a00',
      text:'#33ff00', dim:'#1a8800', accent:'#33ff00', accent2:'#ffaa00',
      glow:'rgba(51,255,0,0.3)', canvasBg:'#141400', canvasBg2:'#0a0a00',
    },
    sakura: {
      name: 'Sakura', icon: '🌸',
      bg1:'#1a0f18', bg2:'#281828', bg3:'#3a2838', border:'#4a2848',
      text:'#f0d8e8', dim:'#a07890', accent:'#ff69b4', accent2:'#ffb7d5',
      glow:'rgba(255,105,180,0.3)', canvasBg:'#281828', canvasBg2:'#1a0f18',
    },
    volcano: {
      name: 'Volcano', icon: '🌋',
      bg1:'#1a0a0a', bg2:'#2a1010', bg3:'#3a1818', border:'#5a2020',
      text:'#f0d0c0', dim:'#a06050', accent:'#ff4500', accent2:'#ffcc00',
      glow:'rgba(255,69,0,0.3)', canvasBg:'#2a1010', canvasBg2:'#1a0a0a',
    },
  };

  const saved = localStorage.getItem('arcadeTheme') || 'midnight';
  let current = THEMES[saved] ? saved : 'midnight';

  function applyTheme(id) {
    current = id;
    localStorage.setItem('arcadeTheme', id);
    const t = THEMES[id];
    let style = document.getElementById('theme-override');
    if (!style) {
      style = document.createElement('style');
      style.id = 'theme-override';
      document.head.appendChild(style);
    }
    style.textContent = `
      :root {
        --t-bg1:${t.bg1}; --t-bg2:${t.bg2}; --t-bg3:${t.bg3};
        --t-border:${t.border}; --t-text:${t.text}; --t-dim:${t.dim};
        --t-accent:${t.accent}; --t-accent2:${t.accent2}; --t-glow:${t.glow};
        --t-canvas:${t.canvasBg}; --t-canvas2:${t.canvasBg2};
      }
      body { background:${t.bg1}!important; color:${t.text}!important; }
      a { color:${t.accent}!important; }
      h1 { background:linear-gradient(135deg,${t.accent2},${t.accent})!important;
           -webkit-background-clip:text!important; -webkit-text-fill-color:transparent!important; }
      .subtitle,.hint,.controls,.hint-text { color:${t.dim}!important; }
      canvas { border-color:${t.border}!important; }

      /* Cards & panels */
      .card,.panel,.score-col,.results-box,#setup,.vs-scores,.board,
      .mode-select button,.diff-btn,.round-btn,.mode-btn,
      .game-card,.stat-box,.online-panel,.online-info,.online-score,
      .score-display,.selector-btn,.lobby-container,.screen {
        background:${t.bg2}!important; border-color:${t.border}!important; color:${t.text}!important;
      }
      .card:hover,.game-card:hover { border-color:${t.accent}!important; box-shadow:0 8px 30px ${t.glow}!important; }
      .card.featured { background:linear-gradient(135deg,${t.bg2},${t.bg3})!important; border-color:${t.accent}33!important; }
      .card.featured:hover { border-color:${t.accent}!important; }
      .card p,.card .badge.solo,.game-card p { color:${t.dim}!important; }

      /* Badges */
      .badge.mp { background:${t.accent}20!important; color:${t.accent}!important; border-color:${t.accent}44!important; }
      .badge.solo { background:${t.accent2}15!important; color:${t.accent2}88!important; border-color:${t.accent2}33!important; }
      .badge.new { background:${t.accent2}18!important; color:${t.accent2}!important; border-color:${t.accent2}44!important; }

      /* Buttons */
      .start-btn,.next-btn,.restart,button.restart,.new-game-btn,.online-btn,.menu-btn {
        background:linear-gradient(135deg,${t.accent},${t.bg3})!important;
      }
      .mode-select button.active,.diff-btn.active,.round-btn.active,.mode-btn.active,
      .selector-btn.active,.scope-btn.active,
      .mode-select button:hover,.diff-btn:hover,.round-btn:hover,.mode-btn:hover,
      .selector-btn:hover,.scope-btn:hover {
        border-color:${t.accent}!important; color:${t.accent}!important;
      }
      .selector-btn.active { background:${t.bg3}!important; }

      /* Info/scores */
      .info span,.scores .val,.scores .p1v,.scores .p2v,.lb-score,.panel .val,
      .p1c,.p2c,#score,#high,#best,#lives,#level,#lines,#spd,
      .stat-value,.score-val {
        color:${t.accent2}!important;
      }
      .scores .label,.round-info,.section-title,.count,.stat-label,.score-type { color:${t.dim}!important; }

      /* Game specific */
      .player-row,.lb-row { background:${t.bg1}!important; }
      .player-name { border-color:${t.border}!important; color:${t.text}!important; background:transparent!important; }
      .key-btn { background:${t.bg3}!important; border-color:${t.border}!important; color:${t.accent2}!important; }
      .add-btn { border-color:${t.border}!important; color:${t.accent}!important; background:${t.bg3}!important; }

      /* Cells */
      .cell.hidden { background:${t.bg3}!important; }
      .cell.hidden:hover { background:${t.border}!important; }
      .cell.revealed { background:${t.bg1}!important; }

      /* Top bar */
      .top-bar a { color:${t.accent}!important; }

      /* Split/arena */
      .arena.waiting,.arena.result,.split-half.waiting { background:${t.bg2}!important; border-color:${t.border}!important; }

      /* Memory cards */
      .card-front { background:linear-gradient(135deg,${t.bg3},${t.bg2})!important; border-color:${t.border}!important; }
      .card-back { border-color:${t.accent}!important; background:${t.bg2}!important; }

      /* Tile colors for 2048 */
      .tile { color:${t.text}!important; }

      /* Leaderboard / Hall of Fame */
      .game-card-header .score-type { background:${t.bg1}!important; }
      .score-table th { color:${t.dim}!important; border-bottom-color:${t.border}!important; }
      .score-table td { border-bottom-color:${t.bg3}!important; color:${t.text}!important; }
      .scope-btn { background:${t.bg2}!important; border-color:${t.border}!important; color:${t.dim}!important; }
      .scope-btn.active { background:${t.accent}!important; border-color:${t.accent}!important; color:#fff!important; }
      .search-input,.name-section input,.join-input {
        background:${t.bg1}!important; border-color:${t.border}!important; color:${t.text}!important;
      }
      .search-input:focus,.name-section input:focus,.join-input:focus { border-color:${t.accent}!important; }
      .empty-msg { color:${t.dim}!important; }

      /* Online panels */
      .room-code-display { color:${t.accent2}!important; }
      .waiting-msg { color:${t.dim}!important; }
      .leave-btn { border-color:${t.border}!important; }

      /* Chat elements */
      #chat-panel,#chat-header { background:${t.bg2}!important; border-color:${t.border}!important; }
      #chat-body,#chat-messages { background:${t.bg1}!important; }
      #chat-input-area { background:${t.bg2}!important; border-color:${t.border}!important; }
      #chat-input { background:${t.bg1}!important; border-color:${t.border}!important; color:${t.text}!important; }
      #chat-input:focus { border-color:${t.accent}!important; }
      #chat-send { background:${t.accent}!important; }
      #chat-tabs { background:${t.bg1}!important; border-color:${t.border}!important; }
      .chat-tab { color:${t.dim}!important; }
      .chat-tab.active { color:${t.text}!important; border-bottom-color:${t.accent}!important; }

      /* Auth */
      .auth-badge { background:${t.bg2}!important; border-color:${t.border}!important; }
      .auth-box { background:${t.bg2}!important; border-color:${t.border}!important; }
      .auth-tab { background:${t.bg1}!important; border-color:${t.border}!important; color:${t.dim}!important; }
      .auth-tab.active { background:${t.accent}!important; border-color:${t.accent}!important; color:#fff!important; }
      .auth-inp { background:${t.bg1}!important; border-color:${t.border}!important; color:${t.text}!important; }
      .auth-inp:focus { border-color:${t.accent}!important; }
      .auth-btn { background:linear-gradient(135deg,${t.accent},${t.bg3})!important; }
      .auth-overlay { background:${t.bg1}dd!important; }

      /* Theme picker itself */
      .theme-picker-btn { background:${t.bg2}; border-color:${t.border}; }
      .theme-panel { background:${t.bg2}; border-color:${t.border}; }
      .theme-option { border-color:${t.border}; }
      .theme-option:hover,.theme-option.active { border-color:${t.accent}; }
      .theme-option span { color:${t.text}; }

      /* Sound button */
      #sfx-mute-btn { background:${t.bg2}!important; border-color:${t.border}!important; color:${t.text}!important; }
    `;

    // Update picker active state
    document.querySelectorAll('.theme-option').forEach(el => {
      el.classList.toggle('active', el.dataset.theme === id);
    });

    // Expose theme to canvas-based games
    window.THEME = t;
    window.dispatchEvent(new Event('themechange'));
  }

  // ─── UI ───
  function createPicker() {
    const btn = document.createElement('button');
    btn.className = 'theme-picker-btn';
    btn.innerHTML = '&#9783;';
    btn.title = 'Change theme';
    Object.assign(btn.style, {
      position:'fixed', bottom:'16px', right:'16px', zIndex:'999',
      width:'42px', height:'42px', borderRadius:'50%', border:'2px solid',
      fontSize:'1.3rem', cursor:'pointer', display:'flex', alignItems:'center',
      justifyContent:'center', transition:'transform 0.2s',
    });
    btn.addEventListener('mouseenter', () => btn.style.transform = 'scale(1.1)');
    btn.addEventListener('mouseleave', () => btn.style.transform = 'scale(1)');

    const panel = document.createElement('div');
    panel.className = 'theme-panel';
    Object.assign(panel.style, {
      position:'fixed', bottom:'68px', right:'16px', zIndex:'998',
      borderRadius:'12px', border:'2px solid', padding:'12px',
      display:'none', flexWrap:'wrap', gap:'8px', width:'210px',
      boxShadow:'0 8px 30px rgba(0,0,0,0.5)',
    });

    for (const [id, t] of Object.entries(THEMES)) {
      const opt = document.createElement('div');
      opt.className = 'theme-option';
      opt.dataset.theme = id;
      Object.assign(opt.style, {
        display:'flex', alignItems:'center', gap:'8px', padding:'6px 10px',
        borderRadius:'8px', cursor:'pointer', border:'2px solid transparent',
        width:'100%', transition:'border-color 0.2s',
      });
      opt.innerHTML = `
        <span style="font-size:1.1rem">${t.icon}</span>
        <div style="display:flex;gap:3px">
          <div style="width:14px;height:14px;border-radius:50%;background:${t.bg1};border:1px solid ${t.border}"></div>
          <div style="width:14px;height:14px;border-radius:50%;background:${t.accent}"></div>
          <div style="width:14px;height:14px;border-radius:50%;background:${t.accent2}"></div>
        </div>
        <span style="font-size:0.78rem;flex:1">${t.name}</span>
      `;
      opt.addEventListener('click', () => applyTheme(id));
      panel.appendChild(opt);
    }

    let open = false;
    btn.addEventListener('click', () => {
      open = !open;
      panel.style.display = open ? 'flex' : 'none';
      btn.innerHTML = open ? '&#10005;' : '&#9783;';
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && open) {
        open = false;
        panel.style.display = 'none';
        btn.innerHTML = '&#9783;';
      }
    });

    document.body.appendChild(panel);
    document.body.appendChild(btn);
  }

  // Init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { createPicker(); applyTheme(current); });
  } else {
    createPicker(); applyTheme(current);
  }
})();
