(function () {
  'use strict';

  var SVG_NS = 'http://www.w3.org/2000/svg';

  function el(tag, attrs, parent) {
    var e = document.createElementNS(SVG_NS, tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        e.setAttribute(k, attrs[k]);
      });
    }
    if (parent) parent.appendChild(e);
    return e;
  }

  // ── Item Catalog ──────────────────────────────────────────────────────
  var ITEMS = {
    // Hats
    hat_cap:     { name: 'Cap',       category: 'hat', price: 50 },
    hat_beanie:  { name: 'Beanie',    category: 'hat', price: 60 },
    hat_headband:{ name: 'Headband',  category: 'hat', price: 40 },
    hat_crown:   { name: 'Crown',     category: 'hat', price: 200 },
    hat_tophat:  { name: 'Top Hat',   category: 'hat', price: 150 },
    hat_wizard:  { name: 'Wizard Hat', category: 'hat', price: 175 },
    hat_cowboy:  { name: 'Cowboy Hat', category: 'hat', price: 120 },
    hat_party:   { name: 'Party Hat', category: 'hat', price: 80 },
    hat_halo:    { name: 'Halo',      category: 'hat', price: 250 },
    hat_devil:   { name: 'Devil Horns', category: 'hat', price: 200 },
    // Hair
    hair_short:    { name: 'Short',    category: 'hair', price: 30 },
    hair_long:     { name: 'Long',     category: 'hair', price: 40 },
    hair_curly:    { name: 'Curly',    category: 'hair', price: 45 },
    hair_spiky:    { name: 'Spiky',    category: 'hair', price: 50 },
    hair_mohawk:   { name: 'Mohawk',   category: 'hair', price: 75 },
    hair_ponytail: { name: 'Ponytail', category: 'hair', price: 45 },
    hair_afro:     { name: 'Afro',     category: 'hair', price: 60 },
    hair_buzz:     { name: 'Buzz Cut', category: 'hair', price: 25 },
    hair_wavy:     { name: 'Wavy',     category: 'hair', price: 50 },
    hair_pigtails: { name: 'Pigtails', category: 'hair', price: 55 },
    hair_braids:   { name: 'Braids',   category: 'hair', price: 65 },
    hair_mullet:   { name: 'Mullet',   category: 'hair', price: 60 },
    hair_bun:      { name: 'Bun',      category: 'hair', price: 45 },
    hair_dreads:   { name: 'Dreads',   category: 'hair', price: 70 },
    hair_emo:      { name: 'Emo',      category: 'hair', price: 55 },
    // Faces
    face_smile:    { name: 'Smile',     category: 'face', price: 30 },
    face_grin:     { name: 'Grin',      category: 'face', price: 40 },
    face_cool:     { name: 'Cool',      category: 'face', price: 100 },
    face_wink:     { name: 'Wink',      category: 'face', price: 50 },
    face_surprised:{ name: 'Surprised', category: 'face', price: 40 },
    face_sleepy:   { name: 'Sleepy',    category: 'face', price: 35 },
    face_hearts:   { name: 'Hearts',    category: 'face', price: 120 },
    face_stars:    { name: 'Stars',     category: 'face', price: 120 },
    face_angry:    { name: 'Angry',     category: 'face', price: 60 },
    face_monocle:  { name: 'Monocle',   category: 'face', price: 150 },
    // Shirts
    shirt_basic:    { name: 'Basic Tee',  category: 'shirt', price: 30 },
    shirt_striped:  { name: 'Striped',    category: 'shirt', price: 50 },
    shirt_hoodie:   { name: 'Hoodie',     category: 'shirt', price: 75 },
    shirt_jersey:   { name: 'Jersey',     category: 'shirt', price: 80 },
    shirt_suit:     { name: 'Suit',       category: 'shirt', price: 150 },
    shirt_hawaiian: { name: 'Hawaiian',   category: 'shirt', price: 90 },
    shirt_tank:     { name: 'Tank Top',   category: 'shirt', price: 25 },
    shirt_tuxedo:   { name: 'Tuxedo',     category: 'shirt', price: 200 },
    shirt_varsity:  { name: 'Varsity',    category: 'shirt', price: 100 },
    shirt_space:    { name: 'Space',      category: 'shirt', price: 110 }
  };

  // ── Skin Colors ─────────────────────────────────────────────────────
  var SKIN_COLORS = {
    // Free realistic skin tones
    skin_light:    { name: 'Light',    color: '#FFD3B5', price: 0 },
    skin_fair:     { name: 'Fair',     color: '#FFCBA4', price: 0 },
    skin_peach:    { name: 'Peach',    color: '#F5C5A3', price: 0 },
    skin_tan:      { name: 'Tan',      color: '#D4A373', price: 0 },
    skin_caramel:  { name: 'Caramel',  color: '#C68642', price: 0 },
    skin_brown:    { name: 'Brown',    color: '#A0724A', price: 0 },
    skin_dark:     { name: 'Dark',     color: '#6B4226', price: 0 },
    skin_deep:     { name: 'Deep',     color: '#4A2C17', price: 0 },
    skin_olive:    { name: 'Olive',    color: '#C4A882', price: 0 },
    skin_golden:   { name: 'Golden',   color: '#E8B878', price: 0 },
    // ROYGBIV colors (purchasable)
    skin_red:      { name: 'Red',      color: '#FF4444', price: 50 },
    skin_orange:   { name: 'Orange',   color: '#FF8C00', price: 50 },
    skin_yellow:   { name: 'Yellow',   color: '#FFD700', price: 50 },
    skin_green:    { name: 'Green',    color: '#44CC44', price: 50 },
    skin_blue:     { name: 'Blue',     color: '#4488FF', price: 50 },
    skin_indigo:   { name: 'Indigo',   color: '#6A0DAD', price: 50 },
    skin_violet:   { name: 'Violet',   color: '#9B59B6', price: 50 }
  };

  // ── Nametag Catalog ───────────────────────────────────────────────────
  var NAMETAGS = {
    // Colors
    nt_red:     { name: 'Red',     type: 'color',    css: 'color:#ff4444', price: 50 },
    nt_blue:    { name: 'Blue',    type: 'color',    css: 'color:#4488ff', price: 50 },
    nt_green:   { name: 'Green',   type: 'color',    css: 'color:#44cc44', price: 50 },
    nt_gold:    { name: 'Gold',    type: 'color',    css: 'color:#ffd700', price: 100 },
    nt_pink:    { name: 'Pink',    type: 'color',    css: 'color:#ff69b4', price: 50 },
    nt_white:   { name: 'White',   type: 'color',    css: 'color:#ffffff', price: 30 },
    // Gradients
    nt_fire:    { name: 'Fire',    type: 'gradient', css: 'background:linear-gradient(90deg,#ff4400,#ffcc00);-webkit-background-clip:text;-webkit-text-fill-color:transparent', price: 150 },
    nt_ocean:   { name: 'Ocean',   type: 'gradient', css: 'background:linear-gradient(90deg,#0066ff,#00cccc);-webkit-background-clip:text;-webkit-text-fill-color:transparent', price: 150 },
    nt_sunset:  { name: 'Sunset',  type: 'gradient', css: 'background:linear-gradient(90deg,#ff6b35,#ff1493);-webkit-background-clip:text;-webkit-text-fill-color:transparent', price: 150 },
    nt_rainbow: { name: 'Rainbow', type: 'gradient', css: 'background:linear-gradient(90deg,#ff0000,#ff8800,#ffff00,#00cc00,#0066ff,#8800ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent', price: 300 },
    nt_neon:    { name: 'Neon',    type: 'gradient', css: 'background:linear-gradient(90deg,#39ff14,#00ffff);-webkit-background-clip:text;-webkit-text-fill-color:transparent', price: 200 },
    nt_galaxy:  { name: 'Galaxy',  type: 'gradient', css: 'background:linear-gradient(90deg,#7b2ff7,#ff69b4,#00d4ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent', price: 250 },
    nt_toxic:   { name: 'Toxic',   type: 'gradient', css: 'background:linear-gradient(90deg,#39ff14,#ccff00);-webkit-background-clip:text;-webkit-text-fill-color:transparent', price: 150 },
    // Fonts
    nt_bold:     { name: 'Bold',      type: 'font', css: 'font-weight:900', price: 50 },
    nt_italic:   { name: 'Italic',    type: 'font', css: 'font-style:italic', price: 50 },
    nt_mono:     { name: 'Monospace', type: 'font', css: 'font-family:monospace', price: 75 },
    nt_cursive:  { name: 'Cursive',   type: 'font', css: 'font-family:cursive', price: 100 },
    nt_smallcaps:{ name: 'Small Caps', type: 'font', css: 'font-variant:small-caps', price: 75 },
    nt_shadow:   { name: 'Shadow',    type: 'font', css: 'text-shadow:2px 2px 4px rgba(0,0,0,0.8)', price: 100 },
    nt_glow:     { name: 'Glow',      type: 'font', css: 'text-shadow:0 0 8px currentColor, 0 0 16px currentColor', price: 200 }
  };

  // ── Drawing helpers ───────────────────────────────────────────────────

  function getSkinColor(equipped) {
    if (equipped && equipped.skin && SKIN_COLORS[equipped.skin]) {
      return SKIN_COLORS[equipped.skin].color;
    }
    return '#FFD3B5'; // default light
  }

  function drawBase(svg, equipped) {
    var skinColor = getSkinColor(equipped);
    // Body / torso (default gray)
    el('rect', {
      x: 30, y: 68, width: 40, height: 55, rx: 12, ry: 12,
      fill: '#CCCCCC', 'class': 'av-body'
    }, svg);
    // Arms
    el('rect', {
      x: 18, y: 74, width: 14, height: 36, rx: 7, ry: 7,
      fill: '#CCCCCC', 'class': 'av-body av-arm'
    }, svg);
    el('rect', {
      x: 68, y: 74, width: 14, height: 36, rx: 7, ry: 7,
      fill: '#CCCCCC', 'class': 'av-body av-arm'
    }, svg);
    // Head
    el('circle', {
      cx: 50, cy: 40, r: 26, fill: skinColor, 'class': 'av-head'
    }, svg);
    // Default eyes (small dots)
    el('circle', { cx: 40, cy: 38, r: 2.5, fill: '#333' , 'class': 'av-default-eye' }, svg);
    el('circle', { cx: 60, cy: 38, r: 2.5, fill: '#333' , 'class': 'av-default-eye' }, svg);
  }

  // ── Shirt Renderers ───────────────────────────────────────────────────

  var shirtRenderers = {
    shirt_basic: function (svg) {
      svg.querySelectorAll('.av-body').forEach(function (e) { e.setAttribute('fill', '#4488CC'); });
    },
    shirt_striped: function (svg) {
      svg.querySelectorAll('.av-body').forEach(function (e) { e.setAttribute('fill', '#DD3333'); });
      // Horizontal white stripes on torso
      for (var sy = 74; sy < 118; sy += 8) {
        el('rect', { x: 31, y: sy, width: 38, height: 3, rx: 1, fill: '#ffffff', opacity: 0.85 }, svg);
      }
    },
    shirt_hoodie: function (svg) {
      svg.querySelectorAll('.av-body').forEach(function (e) { e.setAttribute('fill', '#555555'); });
      // Hood behind head — insert before the head element
      var headEl = svg.querySelector('.av-head');
      var hood = el('path', {
        d: 'M28,68 Q26,50 34,42 Q42,34 50,33 Q58,34 66,42 Q74,50 72,68 Z',
        fill: '#4A4A4A'
      });
      if (headEl) {
        svg.insertBefore(hood, headEl);
      } else {
        svg.appendChild(hood);
      }
      // Hood strings
      el('line', { x1: 42, y1: 64, x2: 40, y2: 78, stroke: '#888888', 'stroke-width': 1.5 }, svg);
      el('line', { x1: 58, y1: 64, x2: 60, y2: 78, stroke: '#888888', 'stroke-width': 1.5 }, svg);
    },
    shirt_jersey: function (svg) {
      svg.querySelectorAll('.av-body').forEach(function (e) { e.setAttribute('fill', '#33AA55'); });
      // Number 7
      var t = el('text', {
        x: 50, y: 102, 'text-anchor': 'middle',
        'font-size': '18', 'font-weight': 'bold', fill: '#ffffff', 'font-family': 'sans-serif'
      }, svg);
      t.textContent = '7';
    },
    shirt_suit: function (svg) {
      svg.querySelectorAll('.av-body').forEach(function (e) { e.setAttribute('fill', '#222222'); });
      // White collar
      el('path', { d: 'M40,68 L50,78 L60,68', fill: '#ffffff', stroke: '#ffffff', 'stroke-width': 1 }, svg);
      // Tie
      el('polygon', { points: '48,78 52,78 51,100 49,100', fill: '#cc2222' }, svg);
    },
    shirt_hawaiian: function (svg) {
      svg.querySelectorAll('.av-body').forEach(function (e) { e.setAttribute('fill', '#FF8833'); });
      // Leaf shapes
      el('ellipse', { cx: 40, cy: 85, rx: 5, ry: 8, fill: '#33AA44', opacity: 0.6, transform: 'rotate(-20 40 85)' }, svg);
      el('ellipse', { cx: 55, cy: 95, rx: 4, ry: 7, fill: '#33AA44', opacity: 0.6, transform: 'rotate(15 55 95)' }, svg);
      el('ellipse', { cx: 45, cy: 105, rx: 5, ry: 6, fill: '#33AA44', opacity: 0.6, transform: 'rotate(-10 45 105)' }, svg);
    },
    shirt_tank: function (svg, equipped) {
      var skinColor = getSkinColor(equipped);
      svg.querySelectorAll('.av-body').forEach(function (e) {
        if (e.classList.contains('av-arm')) {
          e.setAttribute('fill', skinColor);
        } else {
          e.setAttribute('fill', '#EEEEEE');
        }
      });
    },
    shirt_tuxedo: function (svg) {
      svg.querySelectorAll('.av-body').forEach(function (e) { e.setAttribute('fill', '#111111'); });
      // White front panel
      el('rect', { x: 42, y: 70, width: 16, height: 50, rx: 3, fill: '#ffffff' }, svg);
      // Bow tie
      el('polygon', { points: '44,72 50,76 56,72 56,78 50,74 44,78', fill: '#222222' }, svg);
    },
    shirt_varsity: function (svg) {
      // Purple body, white arms
      svg.querySelectorAll('.av-body').forEach(function (e) {
        if (parseFloat(e.getAttribute('x')) === 30) {
          e.setAttribute('fill', '#7744AA');
        } else {
          e.setAttribute('fill', '#EEEEEE');
        }
      });
    },
    shirt_space: function (svg) {
      svg.querySelectorAll('.av-body').forEach(function (e) { e.setAttribute('fill', '#1a1a44'); });
      // Star dots
      var starPositions = [[38,80],[55,90],[42,100],[60,82],[48,112]];
      starPositions.forEach(function (p) {
        el('circle', { cx: p[0], cy: p[1], r: 1.2, fill: '#ffffff', opacity: 0.9 }, svg);
      });
    }
  };

  // ── Hair Renderers ────────────────────────────────────────────────────

  var hairRenderers = {
    hair_short: function (svg) {
      el('path', {
        d: 'M26,35 Q26,14 50,14 Q74,14 74,35 L70,30 Q65,18 50,18 Q35,18 30,30 Z',
        fill: '#6B4226'
      }, svg);
    },
    hair_long: function (svg) {
      // Top hair
      el('path', {
        d: 'M24,40 Q24,12 50,12 Q76,12 76,40 L72,30 Q68,16 50,16 Q32,16 28,30 Z',
        fill: '#2C1810'
      }, svg);
      // Side hair flowing down
      el('path', { d: 'M24,40 Q22,60 24,80 Q26,85 30,80 L28,40 Z', fill: '#2C1810' }, svg);
      el('path', { d: 'M76,40 Q78,60 76,80 Q74,85 70,80 L72,40 Z', fill: '#2C1810' }, svg);
    },
    hair_curly: function (svg) {
      // Poofy curly hair wrapping top of head
      el('path', {
        d: 'M24,42 Q20,32 24,22 Q28,14 38,12 Q44,10 50,12 Q56,10 62,12 Q72,14 76,22 Q80,32 76,42 ' +
           'L72,36 Q70,20 50,16 Q30,20 28,36 Z',
        fill: '#7B5B3A'
      }, svg);
      // Curl bumps around the head
      el('circle', { cx: 26, cy: 36, r: 7, fill: '#7B5B3A' }, svg);
      el('circle', { cx: 74, cy: 36, r: 7, fill: '#7B5B3A' }, svg);
      el('circle', { cx: 34, cy: 20, r: 6, fill: '#7B5B3A' }, svg);
      el('circle', { cx: 66, cy: 20, r: 6, fill: '#7B5B3A' }, svg);
      el('circle', { cx: 50, cy: 16, r: 7, fill: '#7B5B3A' }, svg);
      el('circle', { cx: 42, cy: 17, r: 5, fill: '#7B5B3A' }, svg);
      el('circle', { cx: 58, cy: 17, r: 5, fill: '#7B5B3A' }, svg);
    },
    hair_spiky: function (svg) {
      el('polygon', { points: '30,30 35,8 40,28',  fill: '#F5D442' }, svg);
      el('polygon', { points: '38,26 45,4 50,24',  fill: '#F5D442' }, svg);
      el('polygon', { points: '48,24 55,6 60,26',  fill: '#F5D442' }, svg);
      el('polygon', { points: '58,28 65,10 70,30', fill: '#F5D442' }, svg);
      el('polygon', { points: '24,38 20,20 30,34', fill: '#F5D442' }, svg);
      el('polygon', { points: '70,34 80,20 76,38', fill: '#F5D442' }, svg);
    },
    hair_mohawk: function (svg) {
      el('path', {
        d: 'M42,30 Q42,4 50,2 Q58,4 58,30 Q55,20 50,18 Q45,20 42,30 Z',
        fill: '#33CC33'
      }, svg);
      el('rect', { x: 45, y: 14, width: 10, height: 18, rx: 3, fill: '#33CC33' }, svg);
    },
    hair_ponytail: function (svg) {
      // Base hair on top
      el('path', {
        d: 'M26,36 Q26,16 50,14 Q74,16 74,36 L70,30 Q65,20 50,18 Q35,20 30,30 Z',
        fill: '#CC4433'
      }, svg);
      // Ponytail flowing to the right
      el('path', {
        d: 'M68,32 Q82,34 84,50 Q85,62 78,70 Q76,66 78,54 Q80,42 68,36 Z',
        fill: '#CC4433'
      }, svg);
      // Hair tie
      el('circle', { cx: 70, cy: 34, r: 3, fill: '#CC4433', stroke: '#AA2222', 'stroke-width': 1.5 }, svg);
    },
    hair_afro: function (svg) {
      // Big poofy afro wrapping around head (head is at cx:50, cy:40, r:26)
      el('ellipse', { cx: 50, cy: 36, rx: 34, ry: 32, fill: '#1A1A1A' }, svg);
    },
    hair_buzz: function (svg) {
      el('path', {
        d: 'M26,38 Q26,16 50,14 Q74,16 74,38 Q72,20 50,17 Q28,20 26,38 Z',
        fill: '#333333'
      }, svg);
    },
    hair_wavy: function (svg) {
      el('path', {
        d: 'M24,40 Q24,14 50,12 Q76,14 76,40 L72,30 Q68,18 50,16 Q32,18 28,30 Z',
        fill: '#8B4513'
      }, svg);
      // Wavy side bits
      el('path', { d: 'M24,40 Q20,50 22,60 Q24,65 28,60 Q26,50 26,40 Z', fill: '#8B4513' }, svg);
      el('path', { d: 'M76,40 Q80,50 78,60 Q76,65 72,60 Q74,50 74,40 Z', fill: '#8B4513' }, svg);
    },
    hair_pigtails: function (svg) {
      // Top hair
      el('path', {
        d: 'M26,36 Q26,16 50,14 Q74,16 74,36 L70,30 Q65,20 50,18 Q35,20 30,30 Z',
        fill: '#FF69B4'
      }, svg);
      // Left pigtail
      el('ellipse', { cx: 22, cy: 48, rx: 7, ry: 14, fill: '#FF69B4' }, svg);
      // Right pigtail
      el('ellipse', { cx: 78, cy: 48, rx: 7, ry: 14, fill: '#FF69B4' }, svg);
      // Hair ties
      el('circle', { cx: 26, cy: 36, r: 3, fill: '#FF1493' }, svg);
      el('circle', { cx: 74, cy: 36, r: 3, fill: '#FF1493' }, svg);
    },
    hair_braids: function (svg) {
      // Top hair
      el('path', {
        d: 'M26,36 Q26,16 50,14 Q74,16 74,36 L70,30 Q65,20 50,18 Q35,20 30,30 Z',
        fill: '#2C1810'
      }, svg);
      // Left braid
      for (var i = 0; i < 5; i++) {
        el('ellipse', { cx: 28 + (i % 2 ? 2 : -2), cy: 42 + i * 10, rx: 5, ry: 4, fill: i % 2 ? '#3D2317' : '#2C1810' }, svg);
      }
      // Right braid
      for (var j = 0; j < 5; j++) {
        el('ellipse', { cx: 72 + (j % 2 ? -2 : 2), cy: 42 + j * 10, rx: 5, ry: 4, fill: j % 2 ? '#3D2317' : '#2C1810' }, svg);
      }
      // Hair ties at bottom
      el('circle', { cx: 28, cy: 88, r: 3, fill: '#FFD700' }, svg);
      el('circle', { cx: 72, cy: 88, r: 3, fill: '#FFD700' }, svg);
    },
    hair_mullet: function (svg) {
      // Short top
      el('path', {
        d: 'M26,36 Q26,16 50,14 Q74,16 74,36 L70,30 Q65,20 50,18 Q35,20 30,30 Z',
        fill: '#8B6914'
      }, svg);
      // Long back (the business in the back)
      el('path', {
        d: 'M30,36 Q28,50 30,70 Q32,80 38,85 Q44,88 50,86 Q56,88 62,85 Q68,80 70,70 Q72,50 70,36 Z',
        fill: '#8B6914'
      }, svg);
    },
    hair_bun: function (svg) {
      // Base hair pulled back
      el('path', {
        d: 'M26,36 Q26,16 50,14 Q74,16 74,36 L70,30 Q65,20 50,18 Q35,20 30,30 Z',
        fill: '#1A1A1A'
      }, svg);
      // Bun on top
      el('circle', { cx: 50, cy: 12, r: 10, fill: '#1A1A1A' }, svg);
    },
    hair_dreads: function (svg) {
      // Top hair mass
      el('path', {
        d: 'M24,40 Q24,14 50,12 Q76,14 76,40 L72,30 Q68,18 50,16 Q32,18 28,30 Z',
        fill: '#2C1810'
      }, svg);
      // Individual dreads hanging down
      var dreadX = [24, 30, 36, 64, 70, 76];
      dreadX.forEach(function(x) {
        el('rect', { x: x - 3, y: 36, width: 6, height: 40, rx: 3, fill: '#2C1810' }, svg);
      });
      // Front dreads
      el('rect', { x: 40, y: 14, width: 5, height: 20, rx: 2.5, fill: '#3D2317' }, svg);
      el('rect', { x: 55, y: 14, width: 5, height: 20, rx: 2.5, fill: '#3D2317' }, svg);
    },
    hair_emo: function (svg) {
      // Side-swept fringe covering one eye
      el('path', {
        d: 'M26,36 Q26,14 50,12 Q74,14 74,36 L70,30 Q65,18 50,16 Q35,18 30,30 Z',
        fill: '#1A1A1A'
      }, svg);
      // Long swooping fringe over right eye
      el('path', {
        d: 'M28,30 Q30,16 50,14 Q60,16 68,26 L64,46 Q56,44 48,42 Q38,38 30,36 Z',
        fill: '#1A1A1A'
      }, svg);
      // Side bits
      el('path', { d: 'M24,38 Q22,50 24,62 Q26,65 28,60 L26,38 Z', fill: '#1A1A1A' }, svg);
      el('path', { d: 'M76,38 Q78,50 76,62 Q74,65 72,60 L74,38 Z', fill: '#1A1A1A' }, svg);
    }
  };

  // ── Face Renderers ────────────────────────────────────────────────────

  var faceRenderers = {
    face_smile: function (svg) {
      // Remove default eyes
      removeDefaultEyes(svg);
      // ^_^ curved eyes
      el('path', { d: 'M35,37 Q40,33 45,37', fill: 'none', stroke: '#333', 'stroke-width': 2, 'stroke-linecap': 'round' }, svg);
      el('path', { d: 'M55,37 Q60,33 65,37', fill: 'none', stroke: '#333', 'stroke-width': 2, 'stroke-linecap': 'round' }, svg);
      // Smile
      el('path', { d: 'M38,48 Q50,56 62,48', fill: 'none', stroke: '#333', 'stroke-width': 2, 'stroke-linecap': 'round' }, svg);
    },
    face_grin: function (svg) {
      removeDefaultEyes(svg);
      // Eyes
      el('circle', { cx: 40, cy: 36, r: 3, fill: '#333' }, svg);
      el('circle', { cx: 60, cy: 36, r: 3, fill: '#333' }, svg);
      // Big open grin
      el('path', { d: 'M34,46 Q50,60 66,46 Z', fill: '#ffffff', stroke: '#333', 'stroke-width': 1.5 }, svg);
      // Teeth line
      el('line', { x1: 38, y1: 48, x2: 62, y2: 48, stroke: '#333', 'stroke-width': 0.8 }, svg);
    },
    face_cool: function (svg) {
      removeDefaultEyes(svg);
      // Sunglasses
      el('rect', { x: 32, y: 33, width: 14, height: 10, rx: 3, fill: '#222222' }, svg);
      el('rect', { x: 54, y: 33, width: 14, height: 10, rx: 3, fill: '#222222' }, svg);
      // Bridge
      el('line', { x1: 46, y1: 38, x2: 54, y2: 38, stroke: '#222222', 'stroke-width': 2 }, svg);
      // Slight smirk
      el('path', { d: 'M40,50 Q50,54 60,50', fill: 'none', stroke: '#333', 'stroke-width': 1.5, 'stroke-linecap': 'round' }, svg);
    },
    face_wink: function (svg) {
      removeDefaultEyes(svg);
      // Open eye (left)
      el('circle', { cx: 40, cy: 37, r: 3, fill: '#333' }, svg);
      // Wink eye (right) – curved line
      el('path', { d: 'M55,37 Q60,33 65,37', fill: 'none', stroke: '#333', 'stroke-width': 2, 'stroke-linecap': 'round' }, svg);
      // Smile
      el('path', { d: 'M38,48 Q50,54 62,48', fill: 'none', stroke: '#333', 'stroke-width': 2, 'stroke-linecap': 'round' }, svg);
    },
    face_surprised: function (svg) {
      removeDefaultEyes(svg);
      // Big round eyes
      el('circle', { cx: 40, cy: 36, r: 5, fill: '#ffffff', stroke: '#333', 'stroke-width': 1.5 }, svg);
      el('circle', { cx: 40, cy: 36, r: 2.5, fill: '#333' }, svg);
      el('circle', { cx: 60, cy: 36, r: 5, fill: '#ffffff', stroke: '#333', 'stroke-width': 1.5 }, svg);
      el('circle', { cx: 60, cy: 36, r: 2.5, fill: '#333' }, svg);
      // O mouth
      el('ellipse', { cx: 50, cy: 52, rx: 5, ry: 6, fill: '#ffffff', stroke: '#333', 'stroke-width': 1.5 }, svg);
    },
    face_sleepy: function (svg) {
      removeDefaultEyes(svg);
      // Droopy half-closed eyes (horizontal lines curving down)
      el('path', { d: 'M34,38 Q40,40 46,38', fill: 'none', stroke: '#333', 'stroke-width': 2, 'stroke-linecap': 'round' }, svg);
      el('path', { d: 'M54,38 Q60,40 66,38', fill: 'none', stroke: '#333', 'stroke-width': 2, 'stroke-linecap': 'round' }, svg);
      // Small open mouth
      el('ellipse', { cx: 50, cy: 50, rx: 3, ry: 2, fill: '#333' }, svg);
    },
    face_hearts: function (svg) {
      removeDefaultEyes(svg);
      // Heart-shaped eyes
      drawHeart(svg, 40, 36, '#FF69B4');
      drawHeart(svg, 60, 36, '#FF69B4');
      // Small smile
      el('path', { d: 'M42,50 Q50,54 58,50', fill: 'none', stroke: '#333', 'stroke-width': 1.5, 'stroke-linecap': 'round' }, svg);
    },
    face_stars: function (svg) {
      removeDefaultEyes(svg);
      // Star-shaped eyes
      drawStar(svg, 40, 37, 5, '#FFD700');
      drawStar(svg, 60, 37, 5, '#FFD700');
      // Small smile
      el('path', { d: 'M42,50 Q50,54 58,50', fill: 'none', stroke: '#333', 'stroke-width': 1.5, 'stroke-linecap': 'round' }, svg);
    },
    face_angry: function (svg) {
      removeDefaultEyes(svg);
      // Angry eyebrows
      el('line', { x1: 34, y1: 30, x2: 44, y2: 33, stroke: '#333', 'stroke-width': 2.5, 'stroke-linecap': 'round' }, svg);
      el('line', { x1: 66, y1: 30, x2: 56, y2: 33, stroke: '#333', 'stroke-width': 2.5, 'stroke-linecap': 'round' }, svg);
      // Angry eyes
      el('circle', { cx: 40, cy: 38, r: 2.5, fill: '#333' }, svg);
      el('circle', { cx: 60, cy: 38, r: 2.5, fill: '#333' }, svg);
      // Frown
      el('path', { d: 'M38,52 Q50,46 62,52', fill: 'none', stroke: '#333', 'stroke-width': 2, 'stroke-linecap': 'round' }, svg);
    },
    face_monocle: function (svg) {
      removeDefaultEyes(svg);
      // Left eye normal
      el('circle', { cx: 40, cy: 37, r: 2.5, fill: '#333' }, svg);
      // Right eye with monocle
      el('circle', { cx: 60, cy: 37, r: 7, fill: 'none', stroke: '#DAA520', 'stroke-width': 1.5 }, svg);
      el('circle', { cx: 60, cy: 37, r: 2.5, fill: '#333' }, svg);
      // Monocle chain
      el('path', { d: 'M66,41 Q70,55 62,65', fill: 'none', stroke: '#DAA520', 'stroke-width': 1, 'stroke-dasharray': '2,2' }, svg);
      // Raised eyebrow
      el('path', { d: 'M54,28 Q60,24 66,28', fill: 'none', stroke: '#333', 'stroke-width': 2, 'stroke-linecap': 'round' }, svg);
      // Slight smile
      el('path', { d: 'M40,50 Q50,54 60,50', fill: 'none', stroke: '#333', 'stroke-width': 1.5, 'stroke-linecap': 'round' }, svg);
    }
  };

  // ── Hat Renderers ─────────────────────────────────────────────────────

  var hatRenderers = {
    hat_cap: function (svg) {
      // Brim
      el('ellipse', { cx: 50, cy: 22, rx: 28, ry: 5, fill: '#3366CC' }, svg);
      // Cap dome
      el('path', { d: 'M26,22 Q26,6 50,6 Q74,6 74,22 Z', fill: '#4488FF' }, svg);
      // Brim visor extending forward
      el('path', { d: 'M26,22 Q24,26 22,24 Q20,20 26,20 Z', fill: '#3366CC' }, svg);
      el('ellipse', { cx: 42, cy: 24, rx: 20, ry: 4, fill: '#3366CC' }, svg);
    },
    hat_beanie: function (svg) {
      // Main beanie
      el('path', { d: 'M26,28 Q26,8 50,6 Q74,8 74,28 Z', fill: '#DD4444' }, svg);
      // Folded brim
      el('rect', { x: 26, y: 22, width: 48, height: 8, rx: 3, fill: '#CC3333' }, svg);
      // Pom-pom on top
      el('circle', { cx: 50, cy: 6, r: 4, fill: '#EE5555' }, svg);
    },
    hat_headband: function (svg) {
      el('path', {
        d: 'M26,28 Q26,24 50,22 Q74,24 74,28 Q74,32 50,30 Q26,32 26,28 Z',
        fill: '#FFFFFF', stroke: '#DDDDDD', 'stroke-width': 0.5
      }, svg);
    },
    hat_crown: function (svg) {
      el('polygon', {
        points: '28,28 30,10 38,22 44,6 50,22 56,6 62,22 70,10 72,28',
        fill: '#FFD700', stroke: '#DAA520', 'stroke-width': 1
      }, svg);
      // Jewels
      el('circle', { cx: 38, cy: 24, r: 2, fill: '#FF0000' }, svg);
      el('circle', { cx: 50, cy: 24, r: 2, fill: '#0066FF' }, svg);
      el('circle', { cx: 62, cy: 24, r: 2, fill: '#00CC00' }, svg);
    },
    hat_tophat: function (svg) {
      // Brim
      el('ellipse', { cx: 50, cy: 20, rx: 28, ry: 5, fill: '#222222' }, svg);
      // Tall cylinder
      el('rect', { x: 32, y: -10, width: 36, height: 32, rx: 4, fill: '#111111' }, svg);
      // Band
      el('rect', { x: 32, y: 14, width: 36, height: 5, fill: '#8B0000' }, svg);
    },
    hat_wizard: function (svg) {
      // Tall pointed hat
      el('polygon', { points: '28,28 50,-14 72,28', fill: '#6A0DAD' }, svg);
      // Brim
      el('ellipse', { cx: 50, cy: 26, rx: 30, ry: 6, fill: '#5A0C9D' }, svg);
      // Stars
      drawStar(svg, 42, 8, 3, '#FFD700');
      drawStar(svg, 56, 16, 2.5, '#FFD700');
      drawStar(svg, 48, 20, 2, '#FFD700');
    },
    hat_cowboy: function (svg) {
      // Wide brim
      el('ellipse', { cx: 50, cy: 24, rx: 36, ry: 7, fill: '#8B6914' }, svg);
      // Crown of hat
      el('path', { d: 'M32,24 Q32,6 50,8 Q68,6 68,24 Z', fill: '#A0782C' }, svg);
      // Dent in top
      el('path', { d: 'M38,10 Q50,14 62,10', fill: 'none', stroke: '#8B6914', 'stroke-width': 2 }, svg);
    },
    hat_party: function (svg) {
      // Cone
      el('polygon', { points: '34,28 50,-4 66,28', fill: '#FF6699' }, svg);
      // Stripes
      el('line', { x1: 40, y1: 18, x2: 60, y2: 18, stroke: '#FFCC00', 'stroke-width': 3 }, svg);
      el('line', { x1: 43, y1: 10, x2: 57, y2: 10, stroke: '#44CC44', 'stroke-width': 3 }, svg);
      // Pom-pom on top
      el('circle', { cx: 50, cy: -4, r: 4, fill: '#FF4444' }, svg);
    },
    hat_halo: function (svg) {
      el('ellipse', {
        cx: 50, cy: 6, rx: 20, ry: 5,
        fill: 'none', stroke: '#FFD700', 'stroke-width': 3, opacity: 0.9
      }, svg);
      // Inner glow
      el('ellipse', {
        cx: 50, cy: 6, rx: 18, ry: 4,
        fill: 'none', stroke: '#FFEC8B', 'stroke-width': 1, opacity: 0.6
      }, svg);
    },
    hat_devil: function (svg) {
      // Left horn
      el('polygon', { points: '30,28 26,4 38,24', fill: '#CC2222' }, svg);
      el('polygon', { points: '26,4 24,0 30,8', fill: '#FF4444' }, svg);
      // Right horn
      el('polygon', { points: '70,28 74,4 62,24', fill: '#CC2222' }, svg);
      el('polygon', { points: '74,4 76,0 70,8', fill: '#FF4444' }, svg);
    }
  };

  // ── Shape Helpers ─────────────────────────────────────────────────────

  function removeDefaultEyes(svg) {
    var eyes = svg.querySelectorAll('.av-default-eye');
    for (var i = 0; i < eyes.length; i++) {
      eyes[i].parentNode.removeChild(eyes[i]);
    }
  }

  function drawHeart(svg, cx, cy, color) {
    var s = 5;
    el('path', {
      d: 'M' + cx + ',' + (cy + s * 0.4) +
         ' Q' + cx + ',' + (cy - s * 0.6) + ' ' + (cx - s * 0.7) + ',' + (cy - s * 0.6) +
         ' Q' + (cx - s * 1.2) + ',' + (cy - s * 0.6) + ' ' + (cx - s * 1.2) + ',' + (cy - s * 0.1) +
         ' Q' + (cx - s * 1.2) + ',' + (cy + s * 0.4) + ' ' + cx + ',' + (cy + s * 1) +
         ' Q' + (cx + s * 1.2) + ',' + (cy + s * 0.4) + ' ' + (cx + s * 1.2) + ',' + (cy - s * 0.1) +
         ' Q' + (cx + s * 1.2) + ',' + (cy - s * 0.6) + ' ' + (cx + s * 0.7) + ',' + (cy - s * 0.6) +
         ' Q' + cx + ',' + (cy - s * 0.6) + ' ' + cx + ',' + (cy + s * 0.4) + ' Z',
      fill: color
    }, svg);
  }

  function drawStar(svg, cx, cy, r, color) {
    var points = [];
    for (var i = 0; i < 10; i++) {
      var angle = (Math.PI / 2 * -1) + (Math.PI / 5) * i;
      var rad = i % 2 === 0 ? r : r * 0.45;
      points.push((cx + rad * Math.cos(angle)).toFixed(1) + ',' + (cy + rad * Math.sin(angle)).toFixed(1));
    }
    el('polygon', { points: points.join(' '), fill: color }, svg);
  }

  // ── Main Render Function ──────────────────────────────────────────────

  function render(container, equipped, size) {
    equipped = equipped || {};
    size = size || 150;

    // Clear container
    container.innerHTML = '';

    var svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 100 140');
    svg.setAttribute('width', size);
    svg.setAttribute('height', size * 1.4);
    svg.setAttribute('xmlns', SVG_NS);
    svg.style.display = 'block';

    // Draw base body and head
    drawBase(svg, equipped);

    // Layer 1: Shirt (modifies body fill)
    if (equipped.shirt && shirtRenderers[equipped.shirt]) {
      shirtRenderers[equipped.shirt](svg, equipped);
    }

    // Layer 2: Hair
    if (equipped.hair && hairRenderers[equipped.hair]) {
      hairRenderers[equipped.hair](svg);
    }

    // Layer 3: Face (replaces default eyes)
    if (equipped.face && faceRenderers[equipped.face]) {
      faceRenderers[equipped.face](svg);
    }

    // Layer 4: Hat (on top)
    if (equipped.hat && hatRenderers[equipped.hat]) {
      hatRenderers[equipped.hat](svg);
    }

    container.appendChild(svg);
    return svg;
  }

  // ── Mini Render ───────────────────────────────────────────────────────

  function renderMini(container, equipped) {
    return render(container, equipped, 28);
  }

  // ── Style Name ────────────────────────────────────────────────────────

  function styleName(element, equipped) {
    if (!element || !equipped) return;

    // Reset previous styling
    element.style.color = '';
    element.style.background = '';
    element.style.webkitBackgroundClip = '';
    element.style.webkitTextFillColor = '';
    element.style.fontWeight = '';
    element.style.fontStyle = '';
    element.style.fontFamily = '';
    element.style.fontVariant = '';
    element.style.textShadow = '';

    // Apply color/gradient
    if (equipped.nametagColor && NAMETAGS[equipped.nametagColor]) {
      var colorEntry = NAMETAGS[equipped.nametagColor];
      applyCSS(element, colorEntry.css);
    }

    // Apply font
    if (equipped.nametagFont && NAMETAGS[equipped.nametagFont]) {
      var fontEntry = NAMETAGS[equipped.nametagFont];
      applyCSS(element, fontEntry.css);
    }
  }

  function applyCSS(element, cssString) {
    var declarations = cssString.split(';');
    declarations.forEach(function (decl) {
      decl = decl.trim();
      if (!decl) return;
      var colonIndex = decl.indexOf(':');
      if (colonIndex === -1) return;
      var prop = decl.substring(0, colonIndex).trim();
      var val = decl.substring(colonIndex + 1).trim();
      // Convert CSS property to camelCase for style assignment
      var camelProp = prop.replace(/-([a-z])/g, function (m, c) { return c.toUpperCase(); });
      element.style[camelProp] = val;
    });
  }

  // ── Expose API ────────────────────────────────────────────────────────

  window.ArcadeAvatar = {
    render: render,
    renderMini: renderMini,
    styleName: styleName,
    ITEMS: ITEMS,
    NAMETAGS: NAMETAGS,
    SKIN_COLORS: SKIN_COLORS
  };

})();
