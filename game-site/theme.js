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
    galaxy: {
      name: 'Galaxy', icon: '🪐',
      bg1:'#0a0520', bg2:'#120a30', bg3:'#1e1245', border:'#2e1a60',
      text:'#d8d0f0', dim:'#8070a8', accent:'#a855f7', accent2:'#e879f9',
      glow:'rgba(168,85,247,0.3)', canvasBg:'#120a30', canvasBg2:'#0a0520',
    },
    mint: {
      name: 'Mint', icon: '🍃',
      bg1:'#0a1a18', bg2:'#102a25', bg3:'#183a32', border:'#205040',
      text:'#d0f0e8', dim:'#68a090', accent:'#00d9a0', accent2:'#80ffd4',
      glow:'rgba(0,217,160,0.3)', canvasBg:'#102a25', canvasBg2:'#0a1a18',
    },
    aurora: {
      name: 'Aurora', icon: '🌌',
      bg1:'#050a18', bg2:'#0a1428', bg3:'#122040', border:'#1a3058',
      text:'#d0e8f8', dim:'#5888b0', accent:'#22d1a0', accent2:'#7b5ef7',
      glow:'rgba(34,209,160,0.3)', canvasBg:'#0a1428', canvasBg2:'#050a18',
    },
    midnight_gold: {
      name: 'Royal', icon: '👑',
      bg1:'#0e0e18', bg2:'#16162a', bg3:'#22223a', border:'#3a3a50',
      text:'#e8e0d0', dim:'#908878', accent:'#d4a520', accent2:'#ffd700',
      glow:'rgba(212,165,32,0.3)', canvasBg:'#16162a', canvasBg2:'#0e0e18',
    },
    blood: {
      name: 'Blood Moon', icon: '🩸',
      bg1:'#120808', bg2:'#1e0e0e', bg3:'#301818', border:'#4a2020',
      text:'#f0d0d0', dim:'#905050', accent:'#dc143c', accent2:'#ff6666',
      glow:'rgba(220,20,60,0.3)', canvasBg:'#1e0e0e', canvasBg2:'#120808',
    },
    coffee: {
      name: 'Coffee', icon: '☕',
      bg1:'#1a1410', bg2:'#2a2018', bg3:'#3a2e22', border:'#4a3828',
      text:'#e8dcd0', dim:'#9a8878', accent:'#c8956c', accent2:'#e8c8a0',
      glow:'rgba(200,149,108,0.3)', canvasBg:'#2a2018', canvasBg2:'#1a1410',
    },
    neon: {
      name: 'Neon', icon: '💡',
      bg1:'#0a0a0a', bg2:'#141414', bg3:'#222222', border:'#333333',
      text:'#ffffff', dim:'#888888', accent:'#39ff14', accent2:'#ff073a',
      glow:'rgba(57,255,20,0.3)', canvasBg:'#141414', canvasBg2:'#0a0a0a',
    },
    lavender: {
      name: 'Lavender', icon: '💜',
      bg1:'#14101e', bg2:'#1e1830', bg3:'#2a2244', border:'#3a3058',
      text:'#e0d8f0', dim:'#8878a8', accent:'#9b7bd4', accent2:'#c8a8f0',
      glow:'rgba(155,123,212,0.3)', canvasBg:'#1e1830', canvasBg2:'#14101e',
    },
    candy: {
      name: 'Candy', icon: '🍬',
      bg1:'#180a18', bg2:'#281428', bg3:'#3a2040', border:'#4a2858',
      text:'#f8e0f0', dim:'#a870a0', accent:'#ff69b4', accent2:'#69d2e7',
      glow:'rgba(255,105,180,0.25)', canvasBg:'#281428', canvasBg2:'#180a18',
    },
    stealth: {
      name: 'Stealth', icon: '🔲',
      bg1:'#0c0c0c', bg2:'#161616', bg3:'#222222', border:'#303030',
      text:'#b0b0b0', dim:'#606060', accent:'#505050', accent2:'#808080',
      glow:'rgba(80,80,80,0.2)', canvasBg:'#161616', canvasBg2:'#0c0c0c',
    },
    tropical: {
      name: 'Tropical', icon: '🌴',
      bg1:'#0a1a10', bg2:'#122818', bg3:'#1e3a24', border:'#2a4a30',
      text:'#d8f0d0', dim:'#68a870', accent:'#ff9f1c', accent2:'#2ec4b6',
      glow:'rgba(255,159,28,0.3)', canvasBg:'#122818', canvasBg2:'#0a1a10',
    },
    ice: {
      name: 'Ice', icon: '🧊',
      bg1:'#0a1420', bg2:'#0f1e30', bg3:'#183048', border:'#204060',
      text:'#d0e8ff', dim:'#6090c0', accent:'#88ccff', accent2:'#aae0ff',
      glow:'rgba(136,204,255,0.25)', canvasBg:'#0f1e30', canvasBg2:'#0a1420',
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

      /* Hall of Fame link */
      .fame-link {
        background:linear-gradient(135deg,${t.bg2},${t.bg3})!important;
        border-color:${t.accent}33!important; color:${t.text}!important;
      }
      .fame-link:hover {
        border-color:${t.accent}!important; box-shadow:0 6px 20px ${t.glow}!important;
      }

      /* Theme picker itself */
      .theme-picker-btn { background:${t.bg2}; border-color:${t.border}; }
      .theme-panel { background:${t.bg2}; border-color:${t.border}; }
      .theme-option { border-color:${t.border}; }
      .theme-option:hover,.theme-option.active { border-color:${t.accent}; }
      .theme-option span { color:${t.text}; }

      /* Sound button */
      #sfx-mute-btn { background:${t.bg2}!important; border-color:${t.border}!important; color:${t.text}!important; }

      /* Scrollbars */
      ::-webkit-scrollbar { width:6px; height:6px; }
      ::-webkit-scrollbar-track { background:${t.bg1}!important; }
      ::-webkit-scrollbar-thumb { background:${t.bg3}!important; border-radius:3px; }
      ::-webkit-scrollbar-thumb:hover { background:${t.border}!important; }
      * { scrollbar-color:${t.bg3} ${t.bg1}; }

      /* Placeholders */
      ::placeholder { color:${t.dim}!important; opacity:0.6!important; }

      /* Modals & overlays */
      .modal-overlay,.overlay,.auth-overlay { background:${t.bg1}dd!important; }
      .modal,.stats-popup,.popup { background:${t.bg2}!important; border-color:${t.accent}44!important; color:${t.text}!important; }

      /* Game-specific containers */
      .move-list,.log-area,.history,.guess-list {
        background:${t.bg1}!important; border-color:${t.border}!important; color:${t.text}!important;
      }
      .host-badge { background:${t.accent2}!important; color:${t.bg1}!important; }
      .player-list-item { background:${t.bg1}!important; border-color:${t.border}!important; }
      .join-error,.error-msg { color:#ff4757!important; }

      /* Table hover */
      .score-table tr:hover { background:${t.bg3}44!important; }

      /* Wordle/word game tile states (keep game colors but tint bg) */
      .tile.absent,.key.absent { background:${t.bg3}!important; }

      /* Minesweeper */
      .cell.hidden { background:${t.bg3}!important; }
      .cell.hidden:hover { background:${t.border}!important; }
      .cell.revealed { background:${t.bg1}!important; color:${t.text}!important; }

      /* General selection */
      ::selection { background:${t.accent}44; color:${t.text}; }

      /* Focus outlines */
      *:focus-visible { outline-color:${t.accent}!important; }
      input,textarea,select {
        background:${t.bg1}!important; border-color:${t.border}!important; color:${t.text}!important;
        caret-color:${t.accent}!important;
      }
      input:focus,textarea:focus,select:focus { border-color:${t.accent}!important; }

      /* Additional panels/containers */
      .end-screen,.game-over,.result-panel,.win-overlay,.win-screen,
      .stats-panel,.info-panel,.help-panel,.settings-panel {
        background:${t.bg2}!important; border-color:${t.border}!important; color:${t.text}!important;
      }

      /* Generic buttons that might be missed */
      button { color:${t.text}!important; }
      .btn,.action-btn { border-color:${t.border}!important; }
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
      display:'none', flexDirection:'column', gap:'6px', width:'210px',
      maxHeight:'min(500px, calc(100vh - 100px))', overflowY:'auto',
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
