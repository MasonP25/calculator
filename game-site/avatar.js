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

  // Insert element before the head circle (renders behind head but in front of body)
  function behindHead(svg, tag, attrs) {
    var head = svg.querySelector('.av-head');
    var e = document.createElementNS(SVG_NS, tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (head) svg.insertBefore(e, head);
    else svg.appendChild(e);
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
    shirt_space:    { name: 'Space',      category: 'shirt', price: 110 },
    // ── New Regular Items ──
    hat_pirate:     { name: 'Pirate',     category: 'hat', price: 130 },
    hat_viking:     { name: 'Viking',     category: 'hat', price: 160 },
    hat_chef:       { name: 'Chef',       category: 'hat', price: 90 },
    hat_beret:      { name: 'Beret',      category: 'hat', price: 70 },
    hat_santa:      { name: 'Santa',      category: 'hat', price: 140 },
    hair_sidepart:  { name: 'Side Part',  category: 'hair', price: 35 },
    hair_topknot:   { name: 'Top Knot',   category: 'hair', price: 55 },
    hair_bob:       { name: 'Bob',        category: 'hair', price: 40 },
    hair_faux:      { name: 'Faux Hawk',  category: 'hair', price: 65 },
    hair_twintail:  { name: 'Twin Tail',  category: 'hair', price: 50 },
    face_dizzy:     { name: 'Dizzy',      category: 'face', price: 45 },
    face_cat:       { name: 'Cat',        category: 'face', price: 80 },
    face_happy:     { name: 'Happy',      category: 'face', price: 35 },
    face_pirate:    { name: 'Pirate',     category: 'face', price: 90 },
    face_blush:     { name: 'Blush',      category: 'face', price: 55 },
    shirt_plaid:    { name: 'Plaid',      category: 'shirt', price: 60 },
    shirt_leather:  { name: 'Leather',    category: 'shirt', price: 120 },
    shirt_camo:     { name: 'Camo',       category: 'shirt', price: 85 },
    shirt_tie_dye:  { name: 'Tie Dye',    category: 'shirt', price: 95 },
    shirt_sailor:   { name: 'Sailor',     category: 'shirt', price: 75 },
    // ── New Regular Items (Wave 2) ──
    hat_bucket:     { name: 'Bucket Hat', category: 'hat', price: 80 },
    hat_backwards:  { name: 'Backwards Cap', category: 'hat', price: 90 },
    hat_headphones: { name: 'Headphones', category: 'hat', price: 110 },
    hat_nurse:      { name: 'Nurse',      category: 'hat', price: 100 },
    hat_fedora:     { name: 'Fedora',     category: 'hat', price: 130 },
    hair_curtains:  { name: 'Curtains',   category: 'hair', price: 45 },
    hair_undercut:  { name: 'Undercut',   category: 'hair', price: 55 },
    hair_pixie:     { name: 'Pixie',      category: 'hair', price: 40 },
    hair_cornrows:  { name: 'Cornrows',   category: 'hair', price: 70 },
    hair_messy:     { name: 'Messy',       category: 'hair', price: 35 },
    face_smirk:     { name: 'Smirk',      category: 'face', price: 45 },
    face_nerd:      { name: 'Nerd',       category: 'face', price: 85 },
    face_tongue:    { name: 'Tongue',     category: 'face', price: 50 },
    face_mask:      { name: 'Mask',       category: 'face', price: 60 },
    face_clown:     { name: 'Clown',      category: 'face', price: 75 },
    shirt_polo:     { name: 'Polo',       category: 'shirt', price: 65 },
    shirt_overalls: { name: 'Overalls',   category: 'shirt', price: 85 },
    shirt_crop:     { name: 'Crop Top',   category: 'shirt', price: 55 },
    shirt_armor:    { name: 'Armor',      category: 'shirt', price: 150 },
    shirt_christmas:{ name: 'Christmas',  category: 'shirt', price: 100 },
    // ── New Regular Items (Wave 3) ──
    hat_bandana:    { name: 'Bandana',   category: 'hat', price: 45 },
    hat_military:   { name: 'Military',  category: 'hat', price: 110 },
    hat_fez:        { name: 'Fez',       category: 'hat', price: 85 },
    hat_straw:      { name: 'Straw Hat', category: 'hat', price: 70 },
    hair_shaggy:    { name: 'Shaggy',    category: 'hair', price: 40 },
    hair_slickback: { name: 'Slick Back', category: 'hair', price: 55 },
    hair_bangs:     { name: 'Bangs',     category: 'hair', price: 35 },
    hair_flattop:   { name: 'Flat Top',  category: 'hair', price: 45 },
    face_freckles:  { name: 'Freckles',  category: 'face', price: 25 },
    face_scar:      { name: 'Scar',      category: 'face', price: 40 },
    face_mustache:  { name: 'Mustache',  category: 'face', price: 50 },
    shirt_denim:    { name: 'Denim',     category: 'shirt', price: 70 },
    shirt_cardigan: { name: 'Cardigan',  category: 'shirt', price: 65 },
    shirt_sports:   { name: 'Sports',    category: 'shirt', price: 80 },
    shirt_punk:     { name: 'Punk',      category: 'shirt', price: 95 },
    // ── Exclusive Items ──
    hat_astronaut:    { name: 'Astronaut',      category: 'hat',   price: 0, exclusive: true },
    hat_diamond_crown:{ name: 'Diamond Crown',  category: 'hat',   price: 0, exclusive: true },
    hat_glitch:       { name: 'Glitch',         category: 'hat',   price: 0, exclusive: true },
    hat_void:         { name: 'Void',           category: 'hat',   price: 0, exclusive: true },
    hat_hologram:     { name: 'Hologram',       category: 'hat',   price: 0, exclusive: true },
    hair_flame:       { name: 'Flame',          category: 'hair',  price: 0, exclusive: true },
    hair_galaxy:      { name: 'Galaxy',         category: 'hair',  price: 0, exclusive: true },
    hair_lightning:   { name: 'Lightning',      category: 'hair',  price: 0, exclusive: true },
    hair_crystal:     { name: 'Crystal',        category: 'hair',  price: 0, exclusive: true },
    hair_void:        { name: 'Void',           category: 'hair',  price: 0, exclusive: true },
    face_robot:       { name: 'Robot',          category: 'face',  price: 0, exclusive: true },
    face_demon:       { name: 'Demon',          category: 'face',  price: 0, exclusive: true },
    face_laser:       { name: 'Laser',          category: 'face',  price: 0, exclusive: true },
    face_void:        { name: 'Void',           category: 'face',  price: 0, exclusive: true },
    face_glitch:      { name: 'Glitch',         category: 'face',  price: 0, exclusive: true },
    shirt_flame:      { name: 'Flame',          category: 'shirt', price: 0, exclusive: true },
    shirt_galaxy:     { name: 'Galaxy',         category: 'shirt', price: 0, exclusive: true },
    shirt_hologram:   { name: 'Hologram',       category: 'shirt', price: 0, exclusive: true },
    shirt_void:       { name: 'Void',           category: 'shirt', price: 0, exclusive: true },
    shirt_glitch:     { name: 'Glitch',         category: 'shirt', price: 0, exclusive: true }
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
    nt_glow:     { name: 'Glow',      type: 'font', css: 'text-shadow:0 0 8px currentColor, 0 0 16px currentColor', price: 200 },
    // ── New Regular Nametags ──
    nt_purple:   { name: 'Purple',    type: 'color',    css: 'color:#9b59b6', price: 50 },
    nt_orange:   { name: 'Orange',    type: 'color',    css: 'color:#ff8c00', price: 50 },
    nt_cyan:     { name: 'Cyan',      type: 'color',    css: 'color:#00cccc', price: 50 },
    nt_lime:     { name: 'Lime',      type: 'color',    css: 'color:#39ff14', price: 75 },
    nt_cherry:   { name: 'Cherry',    type: 'gradient', css: 'background:linear-gradient(90deg,#ff1744,#ff6b6b);-webkit-background-clip:text;-webkit-text-fill-color:transparent', price: 125 },
    nt_mint:     { name: 'Mint',      type: 'gradient', css: 'background:linear-gradient(90deg,#00e5a0,#00d4ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent', price: 125 },
    nt_peach:    { name: 'Peach',     type: 'gradient', css: 'background:linear-gradient(90deg,#ffb347,#ff69b4);-webkit-background-clip:text;-webkit-text-fill-color:transparent', price: 125 },
    nt_storm:    { name: 'Storm',     type: 'gradient', css: 'background:linear-gradient(90deg,#4a4a8a,#8888cc,#4a4a8a);-webkit-background-clip:text;-webkit-text-fill-color:transparent', price: 175 },
    nt_forest:   { name: 'Forest',    type: 'gradient', css: 'background:linear-gradient(90deg,#228b22,#90ee90,#228b22);-webkit-background-clip:text;-webkit-text-fill-color:transparent', price: 150 },
    nt_underline:{ name: 'Underline', type: 'font', css: 'text-decoration:underline;text-underline-offset:3px', price: 40 },
    nt_wide:     { name: 'Wide',      type: 'font', css: 'letter-spacing:3px', price: 60 },
    nt_condensed:{ name: 'Condensed', type: 'font', css: 'letter-spacing:-1px;font-weight:700', price: 60 },
    // ── Exclusive Nametags ──
    nt_plasma:    { name: 'Plasma',     type: 'gradient', css: 'background:linear-gradient(90deg,#ff00ff,#00ffff,#ff00ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent', price: 0, exclusive: true },
    nt_aurora:    { name: 'Aurora',     type: 'gradient', css: 'background:linear-gradient(90deg,#00ff87,#60efff,#ff00ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent', price: 0, exclusive: true },
    nt_bloodmoon: { name: 'Blood Moon', type: 'gradient', css: 'background:linear-gradient(90deg,#8B0000,#FF4500,#8B0000);-webkit-background-clip:text;-webkit-text-fill-color:transparent', price: 0, exclusive: true },
    nt_ice:       { name: 'Ice',        type: 'gradient', css: 'background:linear-gradient(90deg,#a8edea,#ffffff,#a8edea);-webkit-background-clip:text;-webkit-text-fill-color:transparent', price: 0, exclusive: true },
    nt_lava:      { name: 'Lava',       type: 'gradient', css: 'background:linear-gradient(90deg,#ff0000,#ff6600,#ffcc00,#ff6600,#ff0000);-webkit-background-clip:text;-webkit-text-fill-color:transparent', price: 0, exclusive: true },
    nt_glitch:    { name: 'Glitch',     type: 'font', css: 'text-shadow:2px 0 #ff0000,-2px 0 #00ffff;letter-spacing:2px', price: 0, exclusive: true },
    nt_outline:   { name: 'Outline',    type: 'font', css: '-webkit-text-stroke:1px currentColor;-webkit-text-fill-color:transparent', price: 0, exclusive: true },
    nt_thick:     { name: 'Thick',      type: 'font', css: 'font-weight:900;font-size:1.2em;letter-spacing:1px', price: 0, exclusive: true },
    nt_void:      { name: 'Void',       type: 'gradient', css: 'background:linear-gradient(90deg,#000000,#4a0080,#000000);-webkit-background-clip:text;-webkit-text-fill-color:transparent', price: 0, exclusive: true },
    nt_electric:  { name: 'Electric',   type: 'gradient', css: 'background:linear-gradient(90deg,#ffff00,#00ffff,#ff00ff,#ffff00);-webkit-background-clip:text;-webkit-text-fill-color:transparent', price: 0, exclusive: true },
    nt_inferno:   { name: 'Inferno',    type: 'gradient', css: 'background:linear-gradient(90deg,#ff0000,#ff4400,#ffff00,#ff4400,#ff0000);-webkit-background-clip:text;-webkit-text-fill-color:transparent', price: 0, exclusive: true },
    nt_hacker:    { name: 'Hacker',     type: 'font', css: 'font-family:monospace;color:#39ff14;text-shadow:0 0 6px #39ff14', price: 0, exclusive: true },
    nt_glitchfont:{ name: 'Glitch+',    type: 'font', css: 'text-shadow:3px 0 #ff0000,-3px 0 #00ffff,0 3px #ff00ff;letter-spacing:3px;font-weight:900', price: 0, exclusive: true },
    nt_phantom:   { name: 'Phantom',    type: 'font', css: 'font-style:italic;letter-spacing:2px;text-shadow:0 0 8px currentColor', price: 0, exclusive: true }
  };

  // ── Chat Bubbles ────────────────────────────────────────────────────
  var CHAT_BUBBLES = {
    cb_dark:     { name: 'Dark',     css: 'background:#0d0d1a;border-left:3px solid #7b2ff7', price: 100 },
    cb_pixel:    { name: 'Pixel',    css: 'background:#111;border:2px dashed #555;border-radius:0;font-family:monospace', price: 150 },
    cb_gradient: { name: 'Gradient', css: 'background:linear-gradient(135deg,#1a1a3a,#2a1a3a);border-left:3px solid #a855f7', price: 175 },
    cb_neon:     { name: 'Neon',     css: 'background:#0a0a18;border:1px solid #7b2ff7;box-shadow:0 0 8px #7b2ff744,inset 0 0 8px #7b2ff711', price: 200 },
    cb_glass:    { name: 'Glass',    css: 'background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);backdrop-filter:blur(4px)', price: 250 },
    cb_fire:     { name: 'Fire',     css: 'background:linear-gradient(135deg,#1a0a0a,#2a1000);border-left:3px solid #ff4400;box-shadow:0 0 10px #ff440033', price: 300 },
    cb_ice:      { name: 'Ice',      css: 'background:linear-gradient(135deg,#0a0a1a,#0a1a2a);border-left:3px solid #00d4ff;box-shadow:0 0 10px #00d4ff33', price: 300 },
    cb_gold:     { name: 'Gold',     css: 'background:linear-gradient(135deg,#1a1500,#2a2000);border:1px solid #ffd70066;box-shadow:0 0 8px #ffd70022', price: 350 }
  };

  // ── Name Effects ────────────────────────────────────────────────────
  var NAME_EFFECTS = {
    ne_shadow:   { name: 'Long Shadow', css: 'animation:none;text-shadow:1px 1px 0 #7b2ff7,2px 2px 0 #7b2ff755,3px 3px 0 #7b2ff733', price: 150 },
    ne_sparkle:  { name: 'Sparkle',     css: 'animation:neSparkle 2s ease-in-out infinite', price: 200 },
    ne_flicker:  { name: 'Flicker',     css: 'animation:neFlicker 3s linear infinite', price: 200 },
    ne_glitch:   { name: 'Glitch',      css: 'animation:neGlitch 2.5s steps(1) infinite', price: 250 },
    ne_rainbow:  { name: 'Rainbow',     css: 'animation:neRainbow 3s linear infinite', price: 300 },
    ne_wave:     { name: 'Wave',        css: 'animation:neWave 2s ease-in-out infinite', price: 350 }
  };

  // Inject keyframes for name effects
  var _neCss = document.createElement('style');
  _neCss.textContent =
    '@keyframes neSparkle{0%,100%{text-shadow:0 0 4px currentColor,0 0 8px currentColor}50%{text-shadow:0 0 12px currentColor,0 0 24px currentColor,0 0 36px currentColor}}' +
    '@keyframes neFlicker{0%,19%,21%,53%,55%,100%{opacity:1}20%,54%{opacity:0.4}}' +
    '@keyframes neGlitch{0%{text-shadow:2px 0 #ff0000,-2px 0 #00ffff}25%{text-shadow:-2px -1px #ff0000,2px 1px #00ffff}50%{text-shadow:1px 2px #ff0000,-1px -2px #00ffff}75%{text-shadow:-1px 0 #ff0000,1px 0 #00ffff}100%{text-shadow:2px 0 #ff0000,-2px 0 #00ffff}}' +
    '@keyframes neRainbow{0%{filter:hue-rotate(0deg)}100%{filter:hue-rotate(360deg)}}' +
    '@keyframes neWave{0%,100%{transform:translateY(0)}25%{transform:translateY(-2px)}75%{transform:translateY(2px)}}';
  document.head.appendChild(_neCss);

  // ── Drawing helpers ───────────────────────────────────────────────────

  function getSkinColor(equipped) {
    if (equipped && equipped.skin) {
      // Support custom hex colors (admin feature)
      if (equipped.skin.charAt(0) === '#') return equipped.skin;
      if (SKIN_COLORS[equipped.skin]) return SKIN_COLORS[equipped.skin].color;
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
    },
    // ── New Regular Shirts ──
    shirt_plaid: function (svg) {
      svg.querySelectorAll('.av-body').forEach(function (e) { e.setAttribute('fill', '#CC3333'); });
      for (var py = 72; py < 120; py += 10) {
        el('rect', { x: 31, y: py, width: 38, height: 2, fill: '#228B22', opacity: 0.6 }, svg);
      }
      for (var px = 34; px < 68; px += 10) {
        el('rect', { x: px, y: 69, width: 2, height: 52, fill: '#228B22', opacity: 0.6 }, svg);
      }
    },
    shirt_leather: function (svg) {
      svg.querySelectorAll('.av-body').forEach(function (e) { e.setAttribute('fill', '#3D2B1F'); });
      el('path', { d: 'M40,68 L50,72 L60,68', fill: 'none', stroke: '#5C4033', 'stroke-width': 2 }, svg);
      el('line', { x1: 50, y1: 72, x2: 50, y2: 120, stroke: '#5C4033', 'stroke-width': 1.5 }, svg);
      el('circle', { cx: 50, cy: 80, r: 1.5, fill: '#888' }, svg);
      el('circle', { cx: 50, cy: 90, r: 1.5, fill: '#888' }, svg);
      el('circle', { cx: 50, cy: 100, r: 1.5, fill: '#888' }, svg);
    },
    shirt_camo: function (svg) {
      svg.querySelectorAll('.av-body').forEach(function (e) { e.setAttribute('fill', '#4B5320'); });
      var camo = [[36,76,6,4],[44,84,8,5],[55,78,5,6],[38,96,7,4],[52,92,6,5],[60,104,5,4],[42,108,6,3]];
      camo.forEach(function (c) {
        el('ellipse', { cx: c[0], cy: c[1], rx: c[2], ry: c[3], fill: c[0] % 2 ? '#3B4219' : '#6B8E23', opacity: 0.7 }, svg);
      });
    },
    shirt_tie_dye: function (svg) {
      svg.querySelectorAll('.av-body').forEach(function (e) { e.setAttribute('fill', '#FF69B4'); });
      el('circle', { cx: 44, cy: 85, r: 10, fill: '#FFD700', opacity: 0.5 }, svg);
      el('circle', { cx: 56, cy: 95, r: 8, fill: '#00CED1', opacity: 0.5 }, svg);
      el('circle', { cx: 50, cy: 105, r: 9, fill: '#9370DB', opacity: 0.5 }, svg);
      el('circle', { cx: 40, cy: 100, r: 7, fill: '#FF4500', opacity: 0.4 }, svg);
    },
    shirt_sailor: function (svg) {
      svg.querySelectorAll('.av-body').forEach(function (e) { e.setAttribute('fill', '#FFFFFF'); });
      for (var sy = 72; sy < 120; sy += 8) {
        el('rect', { x: 31, y: sy, width: 38, height: 3, fill: '#000080', opacity: 0.9 }, svg);
      }
      el('path', { d: 'M38,68 Q50,78 62,68', fill: '#000080' }, svg);
    },
    // ── New Regular Shirts (Wave 2) ──
    shirt_polo: function (svg) {
      svg.querySelectorAll('.av-body').forEach(function (e) { e.setAttribute('fill', '#2266AA'); });
      el('path', { d: 'M42,68 L50,76 L58,68', fill: '#2266AA', stroke: '#fff', 'stroke-width': 1.5 }, svg);
      el('circle', { cx: 50, cy: 74, r: 1.2, fill: '#fff' }, svg);
      el('circle', { cx: 50, cy: 78, r: 1.2, fill: '#fff' }, svg);
    },
    shirt_overalls: function (svg) {
      svg.querySelectorAll('.av-body').forEach(function (e) { e.setAttribute('fill', '#FFFFFF'); });
      el('rect', { x: 34, y: 80, width: 32, height: 40, rx: 4, fill: '#4488CC' }, svg);
      el('line', { x1: 38, y1: 68, x2: 38, y2: 84, stroke: '#4488CC', 'stroke-width': 4 }, svg);
      el('line', { x1: 62, y1: 68, x2: 62, y2: 84, stroke: '#4488CC', 'stroke-width': 4 }, svg);
      el('rect', { x: 44, y: 96, width: 12, height: 8, rx: 2, fill: '#3377BB' }, svg);
    },
    shirt_crop: function (svg, equipped) {
      var skinColor = getSkinColor(equipped);
      svg.querySelectorAll('.av-body').forEach(function (e) {
        e.setAttribute('fill', '#FF69B4');
      });
      el('rect', { x: 30, y: 100, width: 40, height: 24, rx: 6, fill: skinColor }, svg);
    },
    shirt_armor: function (svg) {
      svg.querySelectorAll('.av-body').forEach(function (e) { e.setAttribute('fill', '#888888'); });
      el('rect', { x: 36, y: 72, width: 28, height: 40, rx: 4, fill: '#AAAAAA' }, svg);
      el('rect', { x: 38, y: 74, width: 24, height: 36, rx: 3, fill: '#999999' }, svg);
      el('line', { x1: 50, y1: 74, x2: 50, y2: 110, stroke: '#777', 'stroke-width': 1 }, svg);
      el('line', { x1: 38, y1: 86, x2: 62, y2: 86, stroke: '#777', 'stroke-width': 1 }, svg);
      el('line', { x1: 38, y1: 98, x2: 62, y2: 98, stroke: '#777', 'stroke-width': 1 }, svg);
      el('rect', { x: 16, y: 74, width: 16, height: 10, rx: 3, fill: '#AAAAAA' }, svg);
      el('rect', { x: 68, y: 74, width: 16, height: 10, rx: 3, fill: '#AAAAAA' }, svg);
    },
    shirt_christmas: function (svg) {
      svg.querySelectorAll('.av-body').forEach(function (e) { e.setAttribute('fill', '#CC0000'); });
      el('rect', { x: 40, y: 70, width: 20, height: 48, rx: 2, fill: '#008800' }, svg);
      el('circle', { cx: 50, cy: 78, r: 2, fill: '#FFD700' }, svg);
      el('circle', { cx: 50, cy: 88, r: 2, fill: '#FFD700' }, svg);
      el('circle', { cx: 50, cy: 98, r: 2, fill: '#FFD700' }, svg);
      el('rect', { x: 30, y: 112, width: 40, height: 6, rx: 3, fill: '#FFFFFF' }, svg);
    },
    // ── New Regular Shirts (Wave 3) ──
    shirt_denim: function (svg) {
      svg.querySelectorAll('.av-body').forEach(function (e) { e.setAttribute('fill', '#4A6FA5'); });
      // Collar
      el('path', { d: 'M40,68 L46,74 L50,70 L54,74 L60,68', fill: 'none', stroke: '#3A5F95', 'stroke-width': 2 }, svg);
      // Button line
      el('line', { x1: 50, y1: 74, x2: 50, y2: 118, stroke: '#3A5F95', 'stroke-width': 1.5 }, svg);
      el('circle', { cx: 50, cy: 82, r: 1.2, fill: '#DAA520' }, svg);
      el('circle', { cx: 50, cy: 92, r: 1.2, fill: '#DAA520' }, svg);
      el('circle', { cx: 50, cy: 102, r: 1.2, fill: '#DAA520' }, svg);
      // Chest pockets
      el('rect', { x: 36, y: 78, width: 10, height: 8, rx: 1, fill: 'none', stroke: '#3A5F95', 'stroke-width': 1 }, svg);
      el('rect', { x: 54, y: 78, width: 10, height: 8, rx: 1, fill: 'none', stroke: '#3A5F95', 'stroke-width': 1 }, svg);
    },
    shirt_cardigan: function (svg) {
      svg.querySelectorAll('.av-body').forEach(function (e) { e.setAttribute('fill', '#8B6E5A'); });
      // Open front showing inner tee
      el('rect', { x: 42, y: 70, width: 16, height: 48, rx: 2, fill: '#EEEEEE' }, svg);
      // Button side
      el('circle', { cx: 42, cy: 80, r: 1.2, fill: '#5C4033' }, svg);
      el('circle', { cx: 42, cy: 90, r: 1.2, fill: '#5C4033' }, svg);
      el('circle', { cx: 42, cy: 100, r: 1.2, fill: '#5C4033' }, svg);
    },
    shirt_sports: function (svg) {
      svg.querySelectorAll('.av-body').forEach(function (e) { e.setAttribute('fill', '#CC0000'); });
      // Number 23
      var t = el('text', { x: 50, y: 100, 'text-anchor': 'middle', 'font-size': '16', 'font-weight': 'bold', fill: '#fff', 'font-family': 'sans-serif' }, svg);
      t.textContent = '23';
      // White side stripes on arms
      el('rect', { x: 18, y: 76, width: 14, height: 2, fill: '#fff', opacity: 0.8 }, svg);
      el('rect', { x: 68, y: 76, width: 14, height: 2, fill: '#fff', opacity: 0.8 }, svg);
      el('rect', { x: 18, y: 80, width: 14, height: 2, fill: '#fff', opacity: 0.8 }, svg);
      el('rect', { x: 68, y: 80, width: 14, height: 2, fill: '#fff', opacity: 0.8 }, svg);
    },
    shirt_punk: function (svg) {
      svg.querySelectorAll('.av-body').forEach(function (e) { e.setAttribute('fill', '#111111'); });
      // Skull graphic
      el('circle', { cx: 50, cy: 88, r: 7, fill: '#DDDDDD' }, svg);
      el('circle', { cx: 47, cy: 86, r: 2, fill: '#111' }, svg);
      el('circle', { cx: 53, cy: 86, r: 2, fill: '#111' }, svg);
      el('rect', { x: 47, y: 92, width: 6, height: 2, rx: 1, fill: '#111' }, svg);
      // Studs on shoulders
      el('circle', { cx: 22, cy: 76, r: 1.5, fill: '#C0C0C0' }, svg);
      el('circle', { cx: 26, cy: 76, r: 1.5, fill: '#C0C0C0' }, svg);
      el('circle', { cx: 74, cy: 76, r: 1.5, fill: '#C0C0C0' }, svg);
      el('circle', { cx: 78, cy: 76, r: 1.5, fill: '#C0C0C0' }, svg);
    },
    // ── Exclusive Shirts ──
    shirt_flame: function (svg) {
      svg.querySelectorAll('.av-body').forEach(function (e) { e.setAttribute('fill', '#222222'); });
      // Flame pattern rising from bottom
      el('path', { d: 'M30,120 Q34,108 38,114 Q42,106 46,112 Q50,104 54,112 Q58,106 62,114 Q66,108 70,120 Z', fill: '#FF4400' }, svg);
      el('path', { d: 'M32,120 Q36,112 40,116 Q44,110 48,115 Q52,108 56,115 Q60,110 64,116 Q68,112 70,120 Z', fill: '#FF6600' }, svg);
      el('path', { d: 'M34,120 Q38,114 42,118 Q46,112 50,117 Q54,112 58,118 Q62,114 66,120 Z', fill: '#FFAA00' }, svg);
    },
    shirt_galaxy: function (svg) {
      svg.querySelectorAll('.av-body').forEach(function (e) { e.setAttribute('fill', '#0a0020'); });
      // Nebula swirls
      el('ellipse', { cx: 45, cy: 88, rx: 8, ry: 5, fill: '#7b2ff7', opacity: 0.4, transform: 'rotate(-20 45 88)' }, svg);
      el('ellipse', { cx: 55, cy: 100, rx: 6, ry: 4, fill: '#ff69b4', opacity: 0.3, transform: 'rotate(15 55 100)' }, svg);
      // Stars
      el('circle', { cx: 38, cy: 80, r: 1, fill: '#fff', opacity: 0.9 }, svg);
      el('circle', { cx: 55, cy: 85, r: 1.2, fill: '#aaddff', opacity: 0.9 }, svg);
      el('circle', { cx: 42, cy: 95, r: 0.8, fill: '#fff', opacity: 0.8 }, svg);
      el('circle', { cx: 60, cy: 105, r: 1, fill: '#ffaaff', opacity: 0.8 }, svg);
      el('circle', { cx: 48, cy: 110, r: 1.2, fill: '#fff', opacity: 0.9 }, svg);
    },
    shirt_hologram: function (svg) {
      svg.querySelectorAll('.av-body').forEach(function (e) { e.setAttribute('fill', '#1a1a3e'); });
      el('rect', { x: 34, y: 72, width: 32, height: 46, rx: 6, fill: 'none', stroke: '#00ffff', 'stroke-width': 1, opacity: 0.6 }, svg);
      el('rect', { x: 38, y: 78, width: 24, height: 34, rx: 4, fill: 'none', stroke: '#ff00ff', 'stroke-width': 0.8, opacity: 0.4 }, svg);
      for (var hy = 76; hy < 116; hy += 6) {
        el('line', { x1: 34, y1: hy, x2: 66, y2: hy, stroke: '#00ffff', 'stroke-width': 0.5, opacity: 0.3 }, svg);
      }
    },
    shirt_void: function (svg) {
      svg.querySelectorAll('.av-body').forEach(function (e) { e.setAttribute('fill', '#000000'); });
      el('ellipse', { cx: 50, cy: 92, rx: 12, ry: 14, fill: '#1a003a', opacity: 0.8 }, svg);
      el('ellipse', { cx: 50, cy: 92, rx: 6, ry: 8, fill: '#2a0060', opacity: 0.6 }, svg);
      el('circle', { cx: 50, cy: 92, r: 2, fill: '#6a0dad', opacity: 0.8 }, svg);
    },
    shirt_glitch: function (svg) {
      svg.querySelectorAll('.av-body').forEach(function (e) { e.setAttribute('fill', '#222'); });
      var gy = [74, 82, 90, 98, 106, 114];
      gy.forEach(function (y, i) {
        var offset = (i % 3 - 1) * 3;
        el('rect', { x: 33 + offset, y: y, width: 34, height: 4, fill: i % 2 ? '#ff0000' : '#00ffff', opacity: 0.5 }, svg);
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
      // Side hair behind head
      behindHead(svg, 'path', { d: 'M24,40 Q22,60 24,80 Q26,85 30,80 L28,40 Z', fill: '#2C1810' });
      behindHead(svg, 'path', { d: 'M76,40 Q78,60 76,80 Q74,85 70,80 L72,40 Z', fill: '#2C1810' });
      // Top hair on top of head
      el('path', {
        d: 'M24,40 Q24,12 50,12 Q76,12 76,40 L72,30 Q68,16 50,16 Q32,16 28,30 Z',
        fill: '#2C1810'
      }, svg);
    },
    hair_curly: function (svg) {
      // Side curls behind head
      behindHead(svg, 'circle', { cx: 26, cy: 36, r: 7, fill: '#7B5B3A' });
      behindHead(svg, 'circle', { cx: 74, cy: 36, r: 7, fill: '#7B5B3A' });
      // Top hair on top of head
      el('path', {
        d: 'M24,42 Q20,32 24,22 Q28,14 38,12 Q44,10 50,12 Q56,10 62,12 Q72,14 76,22 Q80,32 76,42 ' +
           'L72,36 Q70,20 50,16 Q30,20 28,36 Z',
        fill: '#7B5B3A'
      }, svg);
      // Top curl bumps
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
      // Ponytail behind head
      behindHead(svg, 'path', {
        d: 'M68,32 Q82,34 84,50 Q85,62 78,70 Q76,66 78,54 Q80,42 68,36 Z',
        fill: '#CC4433'
      });
      // Top hair
      el('path', {
        d: 'M26,36 Q26,16 50,14 Q74,16 74,36 L70,30 Q65,20 50,18 Q35,20 30,30 Z',
        fill: '#CC4433'
      }, svg);
      // Hair tie
      el('circle', { cx: 70, cy: 34, r: 3, fill: '#CC4433', stroke: '#AA2222', 'stroke-width': 1.5 }, svg);
    },
    hair_afro: function (svg) {
      // Big afro behind head (head circle will show face through center)
      behindHead(svg, 'ellipse', { cx: 50, cy: 36, rx: 34, ry: 32, fill: '#1A1A1A' });
      // Top crown on top of head
      el('path', { d: 'M20,30 Q20,6 50,4 Q80,6 80,30', fill: '#1A1A1A' }, svg);
    },
    hair_buzz: function (svg) {
      el('path', {
        d: 'M26,38 Q26,16 50,14 Q74,16 74,38 Q72,20 50,17 Q28,20 26,38 Z',
        fill: '#333333'
      }, svg);
    },
    hair_wavy: function (svg) {
      // Side bits behind head
      behindHead(svg, 'path', { d: 'M24,40 Q20,50 22,60 Q24,65 28,60 Q26,50 26,40 Z', fill: '#8B4513' });
      behindHead(svg, 'path', { d: 'M76,40 Q80,50 78,60 Q76,65 72,60 Q74,50 74,40 Z', fill: '#8B4513' });
      // Top hair
      el('path', {
        d: 'M24,40 Q24,14 50,12 Q76,14 76,40 L72,30 Q68,18 50,16 Q32,18 28,30 Z',
        fill: '#8B4513'
      }, svg);
    },
    hair_pigtails: function (svg) {
      // Pigtails behind head
      behindHead(svg, 'ellipse', { cx: 22, cy: 48, rx: 7, ry: 14, fill: '#FF69B4' });
      behindHead(svg, 'ellipse', { cx: 78, cy: 48, rx: 7, ry: 14, fill: '#FF69B4' });
      // Top hair
      el('path', {
        d: 'M26,36 Q26,16 50,14 Q74,16 74,36 L70,30 Q65,20 50,18 Q35,20 30,30 Z',
        fill: '#FF69B4'
      }, svg);
      // Hair ties
      el('circle', { cx: 26, cy: 36, r: 3, fill: '#FF1493' }, svg);
      el('circle', { cx: 74, cy: 36, r: 3, fill: '#FF1493' }, svg);
    },
    hair_braids: function (svg) {
      // Braids behind head
      for (var i = 0; i < 5; i++) {
        behindHead(svg, 'ellipse', { cx: 28 + (i % 2 ? 2 : -2), cy: 42 + i * 10, rx: 5, ry: 4, fill: i % 2 ? '#3D2317' : '#2C1810' });
      }
      for (var j = 0; j < 5; j++) {
        behindHead(svg, 'ellipse', { cx: 72 + (j % 2 ? -2 : 2), cy: 42 + j * 10, rx: 5, ry: 4, fill: j % 2 ? '#3D2317' : '#2C1810' });
      }
      // Hair tie beads behind head
      behindHead(svg, 'circle', { cx: 28, cy: 88, r: 3, fill: '#FFD700' });
      behindHead(svg, 'circle', { cx: 72, cy: 88, r: 3, fill: '#FFD700' });
      // Top hair on top
      el('path', {
        d: 'M26,36 Q26,16 50,14 Q74,16 74,36 L70,30 Q65,20 50,18 Q35,20 30,30 Z',
        fill: '#2C1810'
      }, svg);
    },
    hair_mullet: function (svg) {
      // Long back behind head
      behindHead(svg, 'path', {
        d: 'M30,36 Q28,50 30,70 Q32,80 38,85 Q44,88 50,86 Q56,88 62,85 Q68,80 70,70 Q72,50 70,36 Z',
        fill: '#8B6914'
      });
      // Short top on top
      el('path', {
        d: 'M26,36 Q26,16 50,14 Q74,16 74,36 L70,30 Q65,20 50,18 Q35,20 30,30 Z',
        fill: '#8B6914'
      }, svg);
    },
    hair_bun: function (svg) {
      // Base hair on top
      el('path', {
        d: 'M26,36 Q26,16 50,14 Q74,16 74,36 L70,30 Q65,20 50,18 Q35,20 30,30 Z',
        fill: '#1A1A1A'
      }, svg);
      // Bun on top
      el('circle', { cx: 50, cy: 12, r: 10, fill: '#1A1A1A' }, svg);
    },
    hair_dreads: function (svg) {
      // Hanging dreads behind head (sides only)
      var dreadPositions = [22, 28, 34, 66, 72, 78];
      dreadPositions.forEach(function (x) {
        behindHead(svg, 'rect', { x: x - 3, y: 34, width: 6, height: 44, rx: 3, fill: '#2C1810' });
      });
      // Top hair mass on top of head
      el('path', {
        d: 'M24,40 Q24,14 50,12 Q76,14 76,40 L72,30 Q68,18 50,16 Q32,18 28,30 Z',
        fill: '#2C1810'
      }, svg);
      // Visible front edge dreads (don't cover face)
      el('rect', { x: 22, y: 36, width: 5, height: 35, rx: 2.5, fill: '#3D2317' }, svg);
      el('rect', { x: 73, y: 36, width: 5, height: 35, rx: 2.5, fill: '#3D2317' }, svg);
    },
    hair_emo: function (svg) {
      // Side bits behind head
      behindHead(svg, 'path', { d: 'M24,38 Q22,50 24,62 Q26,65 28,60 L26,38 Z', fill: '#1A1A1A' });
      behindHead(svg, 'path', { d: 'M76,38 Q78,50 76,62 Q74,65 72,60 L74,38 Z', fill: '#1A1A1A' });
      // Base top hair
      el('path', {
        d: 'M26,36 Q26,14 50,12 Q74,14 74,36 L70,30 Q65,18 50,16 Q35,18 30,30 Z',
        fill: '#1A1A1A'
      }, svg);
      // Long swooping fringe over right eye (intentionally covers one eye)
      el('path', {
        d: 'M28,30 Q30,16 50,14 Q60,16 68,26 L64,46 Q56,44 48,42 Q38,38 30,36 Z',
        fill: '#1A1A1A'
      }, svg);
    },
    // ── Exclusive Hair ──
    hair_flame: function (svg) {
      // Flame tendrils behind head
      behindHead(svg, 'path', { d: 'M22,38 Q18,20 26,8 Q30,14 28,30 Z', fill: '#FF4400' });
      behindHead(svg, 'path', { d: 'M78,38 Q82,20 74,8 Q70,14 72,30 Z', fill: '#FF4400' });
      // Main flame mass
      el('path', { d: 'M26,36 Q24,20 30,8 Q36,0 42,4 Q46,-4 50,-2 Q54,-4 58,4 Q64,0 70,8 Q76,20 74,36 L70,28 Q65,16 50,14 Q35,16 30,28 Z', fill: '#FF6600' }, svg);
      // Inner flame highlights
      el('path', { d: 'M32,30 Q34,16 42,8 Q46,2 50,6 Q54,2 58,8 Q66,16 68,30 L64,24 Q60,14 50,12 Q40,14 36,24 Z', fill: '#FFAA00' }, svg);
      // Flame tips
      el('path', { d: 'M38,20 Q40,10 44,6 Q46,14 42,22 Z', fill: '#FFDD44' }, svg);
      el('path', { d: 'M56,20 Q58,8 62,4 Q62,14 58,22 Z', fill: '#FFDD44' }, svg);
      el('path', { d: 'M46,16 Q48,-2 52,0 Q52,12 50,18 Z', fill: '#FFDD44' }, svg);
    },
    hair_galaxy: function (svg) {
      // Cosmic hair behind head
      behindHead(svg, 'path', { d: 'M22,42 Q20,54 22,66 Q24,70 28,66 L26,42 Z', fill: '#1a0533' });
      behindHead(svg, 'path', { d: 'M78,42 Q80,54 78,66 Q76,70 72,66 L74,42 Z', fill: '#1a0533' });
      // Main galaxy hair
      el('path', { d: 'M24,40 Q24,12 50,10 Q76,12 76,40 L72,30 Q68,16 50,14 Q32,16 28,30 Z', fill: '#1a0533' }, svg);
      // Star sparkles
      el('circle', { cx: 34, cy: 22, r: 1.5, fill: '#ffffff', opacity: 0.9 }, svg);
      el('circle', { cx: 58, cy: 18, r: 1, fill: '#ffffff', opacity: 0.8 }, svg);
      el('circle', { cx: 44, cy: 16, r: 1.2, fill: '#aaddff', opacity: 0.9 }, svg);
      el('circle', { cx: 66, cy: 24, r: 1, fill: '#ffaaff', opacity: 0.8 }, svg);
      el('circle', { cx: 50, cy: 14, r: 1.5, fill: '#ffddaa', opacity: 0.9 }, svg);
      // Nebula swirl
      el('path', { d: 'M30,26 Q40,20 50,24 Q60,28 70,22', fill: 'none', stroke: '#7b2ff7', 'stroke-width': 2, opacity: 0.6 }, svg);
      el('path', { d: 'M34,30 Q44,24 54,28 Q64,32 72,28', fill: 'none', stroke: '#ff69b4', 'stroke-width': 1.5, opacity: 0.5 }, svg);
    },
    hair_lightning: function (svg) {
      behindHead(svg, 'path', { d: 'M24,38 Q22,48 24,58 Q26,62 28,58 L26,38 Z', fill: '#FFD700' });
      behindHead(svg, 'path', { d: 'M76,38 Q78,48 76,58 Q74,62 72,58 L74,38 Z', fill: '#FFD700' });
      el('path', { d: 'M26,36 Q26,14 50,12 Q74,14 74,36 L70,28 Q65,18 50,16 Q35,18 30,28 Z', fill: '#FFD700' }, svg);
      el('polygon', { points: '34,20 28,6 38,16', fill: '#FFFF00' }, svg);
      el('polygon', { points: '50,16 48,0 52,0', fill: '#FFFF00' }, svg);
      el('polygon', { points: '66,20 72,6 62,16', fill: '#FFFF00' }, svg);
    },
    hair_crystal: function (svg) {
      el('polygon', { points: '32,30 36,8 40,28', fill: '#00ddff', opacity: 0.8 }, svg);
      el('polygon', { points: '40,26 46,4 50,24', fill: '#88eeff', opacity: 0.7 }, svg);
      el('polygon', { points: '50,24 54,2 58,24', fill: '#00ddff', opacity: 0.8 }, svg);
      el('polygon', { points: '58,26 64,6 68,28', fill: '#88eeff', opacity: 0.7 }, svg);
      el('polygon', { points: '26,36 22,18 32,32', fill: '#00ddff', opacity: 0.6 }, svg);
      el('polygon', { points: '68,32 78,18 74,36', fill: '#00ddff', opacity: 0.6 }, svg);
    },
    hair_void: function (svg) {
      behindHead(svg, 'path', { d: 'M22,42 Q20,56 22,68 Q24,72 28,68 L26,42 Z', fill: '#0a0020' });
      behindHead(svg, 'path', { d: 'M78,42 Q80,56 78,68 Q76,72 72,68 L74,42 Z', fill: '#0a0020' });
      el('path', { d: 'M24,40 Q24,12 50,10 Q76,12 76,40 L72,30 Q68,16 50,14 Q32,16 28,30 Z', fill: '#0a0020' }, svg);
      el('circle', { cx: 36, cy: 22, r: 1.5, fill: '#6a0dad', opacity: 0.7 }, svg);
      el('circle', { cx: 56, cy: 18, r: 1, fill: '#6a0dad', opacity: 0.5 }, svg);
      el('circle', { cx: 64, cy: 26, r: 1.2, fill: '#6a0dad', opacity: 0.6 }, svg);
    },
    // ── New Regular Hair ──
    hair_sidepart: function (svg) {
      el('path', { d: 'M26,36 Q26,16 50,14 Q74,16 74,36 L70,30 Q65,20 50,18 Q35,20 30,30 Z', fill: '#5C3317' }, svg);
      el('path', { d: 'M26,36 Q28,28 36,24 L40,30 Q34,28 30,34 Z', fill: '#4A2810' }, svg);
    },
    hair_topknot: function (svg) {
      el('path', { d: 'M30,38 Q30,22 50,20 Q70,22 70,38 Q68,26 50,24 Q32,26 30,38 Z', fill: '#1A1A1A' }, svg);
      el('ellipse', { cx: 50, cy: 10, rx: 8, ry: 10, fill: '#1A1A1A' }, svg);
      el('rect', { x: 47, y: 14, width: 6, height: 8, fill: '#1A1A1A' }, svg);
    },
    hair_bob: function (svg) {
      behindHead(svg, 'path', { d: 'M24,36 Q22,48 26,56 Q28,58 32,56 L28,36 Z', fill: '#8B4513' });
      behindHead(svg, 'path', { d: 'M76,36 Q78,48 74,56 Q72,58 68,56 L72,36 Z', fill: '#8B4513' });
      el('path', { d: 'M24,36 Q24,14 50,12 Q76,14 76,36 L72,28 Q65,18 50,16 Q35,18 28,28 Z', fill: '#8B4513' }, svg);
    },
    hair_faux: function (svg) {
      el('path', { d: 'M30,34 Q30,18 50,16 Q70,18 70,34 Q68,22 50,20 Q32,22 30,34 Z', fill: '#333' }, svg);
      el('path', { d: 'M38,28 Q38,8 50,6 Q62,8 62,28 Q58,16 50,14 Q42,16 38,28 Z', fill: '#333' }, svg);
    },
    hair_twintail: function (svg) {
      behindHead(svg, 'path', { d: 'M22,34 Q18,50 20,70 Q22,75 26,70 L24,34 Z', fill: '#FF8C00' });
      behindHead(svg, 'path', { d: 'M78,34 Q82,50 80,70 Q78,75 74,70 L76,34 Z', fill: '#FF8C00' });
      el('path', { d: 'M26,36 Q26,16 50,14 Q74,16 74,36 L70,30 Q65,20 50,18 Q35,20 30,30 Z', fill: '#FF8C00' }, svg);
      el('circle', { cx: 24, cy: 34, r: 3, fill: '#FF4500' }, svg);
      el('circle', { cx: 76, cy: 34, r: 3, fill: '#FF4500' }, svg);
    },
    // ── New Regular Hair (Wave 2) ──
    hair_curtains: function (svg) {
      behindHead(svg, 'path', { d: 'M24,36 Q22,50 24,60 Q26,64 30,58 L28,36 Z', fill: '#7B5B3A' });
      behindHead(svg, 'path', { d: 'M76,36 Q78,50 76,60 Q74,64 70,58 L72,36 Z', fill: '#7B5B3A' });
      el('path', { d: 'M26,36 Q26,14 50,12 Q74,14 74,36 L70,28 Q65,18 50,16 Q35,18 30,28 Z', fill: '#7B5B3A' }, svg);
      el('path', { d: 'M50,14 Q40,16 32,28 L36,30 Q42,20 50,18 Z', fill: '#6A4F33' }, svg);
      el('path', { d: 'M50,14 Q60,16 68,28 L64,30 Q58,20 50,18 Z', fill: '#6A4F33' }, svg);
    },
    hair_undercut: function (svg) {
      el('path', { d: 'M26,38 Q26,32 34,30 Q42,28 50,28 Q58,28 66,30 Q74,32 74,38 Q72,34 50,32 Q28,34 26,38 Z', fill: '#333' }, svg);
      el('path', { d: 'M30,30 Q32,10 50,8 Q68,10 70,30 Q66,16 50,14 Q34,16 30,30 Z', fill: '#555' }, svg);
      el('path', { d: 'M32,28 Q40,12 56,10 Q64,12 68,28 Q62,14 50,12 Q36,14 32,28 Z', fill: '#666' }, svg);
    },
    hair_pixie: function (svg) {
      el('path', { d: 'M28,36 Q28,18 50,16 Q72,18 72,36 L68,28 Q62,20 50,18 Q38,20 32,28 Z', fill: '#CC6633' }, svg);
      el('path', { d: 'M28,36 Q26,30 30,24 Q34,18 42,16 L38,28 Z', fill: '#BB5522' }, svg);
    },
    hair_cornrows: function (svg) {
      el('path', { d: 'M26,36 Q26,14 50,12 Q74,14 74,36 L70,28 Q65,18 50,16 Q35,18 30,28 Z', fill: '#1A1A1A' }, svg);
      for (var cx = 34; cx <= 66; cx += 8) {
        el('line', { x1: cx, y1: 14, x2: cx, y2: 34, stroke: '#333', 'stroke-width': 2 }, svg);
      }
      behindHead(svg, 'path', { d: 'M28,36 Q26,50 28,65 Q30,68 34,64 L32,36 Z', fill: '#1A1A1A' });
      behindHead(svg, 'path', { d: 'M72,36 Q74,50 72,65 Q70,68 66,64 L68,36 Z', fill: '#1A1A1A' });
    },
    hair_messy: function (svg) {
      behindHead(svg, 'path', { d: 'M22,38 Q20,48 24,56 Q26,58 28,54 L26,38 Z', fill: '#8B6914' });
      behindHead(svg, 'path', { d: 'M78,38 Q80,48 76,56 Q74,58 72,54 L74,38 Z', fill: '#8B6914' });
      el('path', { d: 'M24,38 Q24,12 50,10 Q76,12 76,38 L72,28 Q65,16 50,14 Q35,16 28,28 Z', fill: '#8B6914' }, svg);
      el('polygon', { points: '28,26 24,14 34,24', fill: '#9B7924' }, svg);
      el('polygon', { points: '42,18 38,8 46,16', fill: '#9B7924' }, svg);
      el('polygon', { points: '58,16 62,6 56,18', fill: '#9B7924' }, svg);
      el('polygon', { points: '72,26 76,14 66,24', fill: '#9B7924' }, svg);
    },
    // ── New Regular Hair (Wave 3) ──
    hair_shaggy: function (svg) {
      behindHead(svg, 'path', { d: 'M22,38 Q18,52 22,66 Q26,70 30,64 L26,38 Z', fill: '#7B5B3A' });
      behindHead(svg, 'path', { d: 'M78,38 Q82,52 78,66 Q74,70 70,64 L74,38 Z', fill: '#7B5B3A' });
      el('path', { d: 'M24,38 Q24,12 50,10 Q76,12 76,38 L72,28 Q65,16 50,14 Q35,16 28,28 Z', fill: '#7B5B3A' }, svg);
      // Messy fringe strands
      el('path', { d: 'M28,30 Q30,22 36,26', fill: '#6A4A2A' }, svg);
      el('path', { d: 'M36,24 Q40,16 46,22', fill: '#6A4A2A' }, svg);
      el('path', { d: 'M54,22 Q60,16 64,24', fill: '#6A4A2A' }, svg);
      el('path', { d: 'M64,26 Q70,22 72,30', fill: '#6A4A2A' }, svg);
    },
    hair_slickback: function (svg) {
      el('path', { d: 'M26,38 Q26,14 50,12 Q74,14 74,38 L70,30 Q65,18 50,16 Q35,18 30,30 Z', fill: '#1A1A1A' }, svg);
      // Slick shine highlights
      el('path', { d: 'M34,26 Q40,18 50,16 L48,20 Q40,22 36,28 Z', fill: '#2A2A2A' }, svg);
      el('path', { d: 'M64,28 Q60,22 52,20 L54,16 Q62,18 66,26 Z', fill: '#2A2A2A' }, svg);
    },
    hair_bangs: function (svg) {
      behindHead(svg, 'path', { d: 'M24,36 Q22,50 26,58 Q28,60 32,56 L28,36 Z', fill: '#A0522D' });
      behindHead(svg, 'path', { d: 'M76,36 Q78,50 74,58 Q72,60 68,56 L72,36 Z', fill: '#A0522D' });
      el('path', { d: 'M24,36 Q24,14 50,12 Q76,14 76,36 L72,28 Q65,18 50,16 Q35,18 28,28 Z', fill: '#A0522D' }, svg);
      // Straight bangs across forehead
      el('rect', { x: 28, y: 24, width: 44, height: 8, rx: 2, fill: '#8B4226' }, svg);
    },
    hair_flattop: function (svg) {
      el('rect', { x: 28, y: 14, width: 44, height: 18, rx: 4, fill: '#333' }, svg);
      el('rect', { x: 30, y: 12, width: 40, height: 6, rx: 1, fill: '#333' }, svg);
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
    },
    // ── Exclusive Faces ──
    face_robot: function (svg) {
      removeDefaultEyes(svg);
      // Digital square eyes
      el('rect', { x: 35, y: 33, width: 10, height: 7, rx: 1, fill: '#00FF00' }, svg);
      el('rect', { x: 55, y: 33, width: 10, height: 7, rx: 1, fill: '#00FF00' }, svg);
      // Pixel pupils
      el('rect', { x: 38, y: 35, width: 4, height: 3, fill: '#003300' }, svg);
      el('rect', { x: 58, y: 35, width: 4, height: 3, fill: '#003300' }, svg);
      // Grid mouth
      el('rect', { x: 38, y: 48, width: 24, height: 6, rx: 1, fill: '#333' }, svg);
      for (var rx = 40; rx < 62; rx += 4) {
        el('line', { x1: rx, y1: 48, x2: rx, y2: 54, stroke: '#00FF00', 'stroke-width': 1 }, svg);
      }
      // Antenna dot
      el('circle', { cx: 50, cy: 14, r: 2, fill: '#FF0000' }, svg);
      el('line', { x1: 50, y1: 14, x2: 50, y2: 18, stroke: '#888', 'stroke-width': 1.5 }, svg);
    },
    face_demon: function (svg) {
      removeDefaultEyes(svg);
      // Glowing red eyes
      el('circle', { cx: 40, cy: 36, r: 4, fill: '#FF0000', opacity: 0.3 }, svg);
      el('circle', { cx: 60, cy: 36, r: 4, fill: '#FF0000', opacity: 0.3 }, svg);
      el('path', { d: 'M36,36 L40,33 L44,36 L40,37 Z', fill: '#FF0000' }, svg);
      el('path', { d: 'M56,36 L60,33 L64,36 L60,37 Z', fill: '#FF0000' }, svg);
      // Evil grin
      el('path', { d: 'M34,48 Q40,56 50,54 Q60,56 66,48', fill: 'none', stroke: '#CC0000', 'stroke-width': 2, 'stroke-linecap': 'round' }, svg);
      // Fangs
      el('polygon', { points: '40,50 42,56 44,50', fill: '#ffffff' }, svg);
      el('polygon', { points: '56,50 58,56 60,50', fill: '#ffffff' }, svg);
    },
    face_laser: function (svg) {
      removeDefaultEyes(svg);
      el('rect', { x: 32, y: 34, width: 14, height: 6, rx: 2, fill: '#ff0000' }, svg);
      el('rect', { x: 54, y: 34, width: 14, height: 6, rx: 2, fill: '#ff0000' }, svg);
      el('line', { x1: 32, y1: 37, x2: 10, y2: 37, stroke: '#ff0000', 'stroke-width': 2, opacity: 0.6 }, svg);
      el('line', { x1: 68, y1: 37, x2: 90, y2: 37, stroke: '#ff0000', 'stroke-width': 2, opacity: 0.6 }, svg);
      el('path', { d: 'M40,50 Q50,54 60,50', fill: 'none', stroke: '#333', 'stroke-width': 1.5, 'stroke-linecap': 'round' }, svg);
    },
    face_void: function (svg) {
      removeDefaultEyes(svg);
      el('circle', { cx: 40, cy: 37, r: 5, fill: '#000000' }, svg);
      el('circle', { cx: 60, cy: 37, r: 5, fill: '#000000' }, svg);
      el('circle', { cx: 40, cy: 37, r: 2, fill: '#6a0dad' }, svg);
      el('circle', { cx: 60, cy: 37, r: 2, fill: '#6a0dad' }, svg);
      el('ellipse', { cx: 50, cy: 52, rx: 4, ry: 5, fill: '#000000' }, svg);
    },
    face_glitch: function (svg) {
      removeDefaultEyes(svg);
      el('rect', { x: 35, y: 33, width: 10, height: 7, fill: '#00ffff', opacity: 0.8 }, svg);
      el('rect', { x: 37, y: 35, width: 6, height: 3, fill: '#ff0000', opacity: 0.6 }, svg);
      el('rect', { x: 55, y: 34, width: 10, height: 7, fill: '#ff00ff', opacity: 0.8 }, svg);
      el('rect', { x: 57, y: 36, width: 6, height: 3, fill: '#00ff00', opacity: 0.6 }, svg);
      el('rect', { x: 38, y: 48, width: 24, height: 4, fill: '#333' }, svg);
      el('rect', { x: 40, y: 49, width: 8, height: 2, fill: '#ff0000', opacity: 0.5 }, svg);
      el('rect', { x: 52, y: 49, width: 8, height: 2, fill: '#00ffff', opacity: 0.5 }, svg);
    },
    // ── New Regular Faces ──
    face_dizzy: function (svg) {
      removeDefaultEyes(svg);
      el('path', { d: 'M36,34 L44,40 M36,40 L44,34', fill: 'none', stroke: '#333', 'stroke-width': 2, 'stroke-linecap': 'round' }, svg);
      el('path', { d: 'M56,34 L64,40 M56,40 L64,34', fill: 'none', stroke: '#333', 'stroke-width': 2, 'stroke-linecap': 'round' }, svg);
      el('path', { d: 'M42,52 Q50,48 58,52', fill: 'none', stroke: '#333', 'stroke-width': 2, 'stroke-linecap': 'round' }, svg);
    },
    face_cat: function (svg) {
      removeDefaultEyes(svg);
      el('path', { d: 'M36,37 L40,34 L44,37', fill: 'none', stroke: '#333', 'stroke-width': 2, 'stroke-linecap': 'round' }, svg);
      el('path', { d: 'M56,37 L60,34 L64,37', fill: 'none', stroke: '#333', 'stroke-width': 2, 'stroke-linecap': 'round' }, svg);
      el('circle', { cx: 50, cy: 46, r: 2.5, fill: '#FF69B4' }, svg);
      el('path', { d: 'M50,48 L46,52', fill: 'none', stroke: '#333', 'stroke-width': 1.5, 'stroke-linecap': 'round' }, svg);
      el('path', { d: 'M50,48 L54,52', fill: 'none', stroke: '#333', 'stroke-width': 1.5, 'stroke-linecap': 'round' }, svg);
      el('line', { x1: 28, y1: 44, x2: 38, y2: 46, stroke: '#333', 'stroke-width': 1 }, svg);
      el('line', { x1: 28, y1: 48, x2: 38, y2: 48, stroke: '#333', 'stroke-width': 1 }, svg);
      el('line', { x1: 72, y1: 44, x2: 62, y2: 46, stroke: '#333', 'stroke-width': 1 }, svg);
      el('line', { x1: 72, y1: 48, x2: 62, y2: 48, stroke: '#333', 'stroke-width': 1 }, svg);
    },
    face_happy: function (svg) {
      removeDefaultEyes(svg);
      el('path', { d: 'M35,35 Q40,30 45,35', fill: 'none', stroke: '#333', 'stroke-width': 2, 'stroke-linecap': 'round' }, svg);
      el('path', { d: 'M55,35 Q60,30 65,35', fill: 'none', stroke: '#333', 'stroke-width': 2, 'stroke-linecap': 'round' }, svg);
      el('path', { d: 'M36,46 Q50,58 64,46 Z', fill: '#ffffff', stroke: '#333', 'stroke-width': 1.5 }, svg);
      el('circle', { cx: 42, cy: 34, r: 3, fill: '#FFB7C5', opacity: 0.5 }, svg);
      el('circle', { cx: 58, cy: 34, r: 3, fill: '#FFB7C5', opacity: 0.5 }, svg);
    },
    face_pirate: function (svg) {
      removeDefaultEyes(svg);
      el('circle', { cx: 40, cy: 37, r: 3, fill: '#333' }, svg);
      el('ellipse', { cx: 60, cy: 37, rx: 7, ry: 6, fill: '#222' }, svg);
      el('line', { x1: 54, y1: 32, x2: 66, y2: 32, stroke: '#333', 'stroke-width': 2 }, svg);
      el('path', { d: 'M40,50 Q50,56 60,50', fill: 'none', stroke: '#333', 'stroke-width': 2, 'stroke-linecap': 'round' }, svg);
    },
    face_blush: function (svg) {
      removeDefaultEyes(svg);
      el('circle', { cx: 40, cy: 36, r: 2.5, fill: '#333' }, svg);
      el('circle', { cx: 60, cy: 36, r: 2.5, fill: '#333' }, svg);
      el('path', { d: 'M42,50 Q50,54 58,50', fill: 'none', stroke: '#333', 'stroke-width': 1.5, 'stroke-linecap': 'round' }, svg);
      el('ellipse', { cx: 34, cy: 44, rx: 5, ry: 3, fill: '#FF69B4', opacity: 0.4 }, svg);
      el('ellipse', { cx: 66, cy: 44, rx: 5, ry: 3, fill: '#FF69B4', opacity: 0.4 }, svg);
    },
    // ── New Regular Faces (Wave 2) ──
    face_smirk: function (svg) {
      removeDefaultEyes(svg);
      el('circle', { cx: 40, cy: 36, r: 2.5, fill: '#333' }, svg);
      el('path', { d: 'M55,37 Q60,33 65,37', fill: 'none', stroke: '#333', 'stroke-width': 2, 'stroke-linecap': 'round' }, svg);
      el('path', { d: 'M44,50 Q54,54 62,48', fill: 'none', stroke: '#333', 'stroke-width': 2, 'stroke-linecap': 'round' }, svg);
      el('line', { x1: 34, y1: 30, x2: 44, y2: 32, stroke: '#333', 'stroke-width': 1.5, 'stroke-linecap': 'round' }, svg);
    },
    face_nerd: function (svg) {
      removeDefaultEyes(svg);
      el('circle', { cx: 40, cy: 37, r: 7, fill: 'none', stroke: '#555', 'stroke-width': 1.5 }, svg);
      el('circle', { cx: 60, cy: 37, r: 7, fill: 'none', stroke: '#555', 'stroke-width': 1.5 }, svg);
      el('line', { x1: 47, y1: 37, x2: 53, y2: 37, stroke: '#555', 'stroke-width': 1.5 }, svg);
      el('circle', { cx: 40, cy: 37, r: 2, fill: '#333' }, svg);
      el('circle', { cx: 60, cy: 37, r: 2, fill: '#333' }, svg);
      el('circle', { cx: 41, cy: 36, r: 0.8, fill: '#fff' }, svg);
      el('circle', { cx: 61, cy: 36, r: 0.8, fill: '#fff' }, svg);
      el('path', { d: 'M42,50 Q50,54 58,50', fill: 'none', stroke: '#333', 'stroke-width': 1.5, 'stroke-linecap': 'round' }, svg);
    },
    face_tongue: function (svg) {
      removeDefaultEyes(svg);
      el('circle', { cx: 40, cy: 36, r: 2.5, fill: '#333' }, svg);
      el('circle', { cx: 60, cy: 36, r: 2.5, fill: '#333' }, svg);
      el('path', { d: 'M38,48 Q50,56 62,48', fill: 'none', stroke: '#333', 'stroke-width': 2, 'stroke-linecap': 'round' }, svg);
      el('ellipse', { cx: 50, cy: 56, rx: 5, ry: 6, fill: '#FF6B8A' }, svg);
    },
    face_mask: function (svg) {
      removeDefaultEyes(svg);
      el('circle', { cx: 40, cy: 36, r: 2.5, fill: '#333' }, svg);
      el('circle', { cx: 60, cy: 36, r: 2.5, fill: '#333' }, svg);
      el('path', { d: 'M30,44 Q30,40 50,38 Q70,40 70,44 L70,56 Q70,62 50,64 Q30,62 30,56 Z', fill: '#88BBDD' }, svg);
      el('line', { x1: 30, y1: 44, x2: 22, y2: 40, stroke: '#88BBDD', 'stroke-width': 1.5 }, svg);
      el('line', { x1: 70, y1: 44, x2: 78, y2: 40, stroke: '#88BBDD', 'stroke-width': 1.5 }, svg);
    },
    face_clown: function (svg) {
      removeDefaultEyes(svg);
      el('circle', { cx: 40, cy: 36, r: 3, fill: '#333' }, svg);
      el('circle', { cx: 60, cy: 36, r: 3, fill: '#333' }, svg);
      el('circle', { cx: 50, cy: 46, r: 5, fill: '#FF0000' }, svg);
      el('path', { d: 'M34,52 Q50,62 66,52', fill: 'none', stroke: '#CC0000', 'stroke-width': 2.5, 'stroke-linecap': 'round' }, svg);
      el('path', { d: 'M32,32 Q36,28 44,32', fill: 'none', stroke: '#4488FF', 'stroke-width': 2, 'stroke-linecap': 'round' }, svg);
      el('path', { d: 'M56,32 Q64,28 68,32', fill: 'none', stroke: '#4488FF', 'stroke-width': 2, 'stroke-linecap': 'round' }, svg);
    },
    // ── New Regular Faces (Wave 3) ──
    face_freckles: function (svg) {
      // Keep default eyes, just add freckles + smile
      el('circle', { cx: 34, cy: 44, r: 1.2, fill: '#AA7744', opacity: 0.6 }, svg);
      el('circle', { cx: 38, cy: 46, r: 1, fill: '#AA7744', opacity: 0.5 }, svg);
      el('circle', { cx: 36, cy: 42, r: 0.8, fill: '#AA7744', opacity: 0.5 }, svg);
      el('circle', { cx: 62, cy: 42, r: 1.2, fill: '#AA7744', opacity: 0.6 }, svg);
      el('circle', { cx: 66, cy: 44, r: 1, fill: '#AA7744', opacity: 0.5 }, svg);
      el('circle', { cx: 64, cy: 46, r: 0.8, fill: '#AA7744', opacity: 0.5 }, svg);
      el('path', { d: 'M40,50 Q50,54 60,50', fill: 'none', stroke: '#333', 'stroke-width': 1.5, 'stroke-linecap': 'round' }, svg);
    },
    face_scar: function (svg) {
      // Keep default eyes, add scar on left cheek
      el('path', { d: 'M32,36 L28,48', fill: 'none', stroke: '#AA6644', 'stroke-width': 1.5, 'stroke-linecap': 'round' }, svg);
      el('path', { d: 'M26,40 L34,44', fill: 'none', stroke: '#AA6644', 'stroke-width': 1, 'stroke-linecap': 'round' }, svg);
      el('path', { d: 'M40,50 Q50,54 60,50', fill: 'none', stroke: '#333', 'stroke-width': 1.5, 'stroke-linecap': 'round' }, svg);
    },
    face_mustache: function (svg) {
      // Keep default eyes, add mustache
      el('path', { d: 'M38,48 Q42,44 50,46 Q58,44 62,48 Q58,50 50,48 Q42,50 38,48 Z', fill: '#3D2B1F' }, svg);
      el('path', { d: 'M42,50 Q50,54 58,50', fill: 'none', stroke: '#333', 'stroke-width': 1.5, 'stroke-linecap': 'round' }, svg);
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
    },
    // ── Exclusive Hats ──
    hat_astronaut: function (svg) {
      // Glass dome helmet
      el('ellipse', { cx: 50, cy: 32, rx: 30, ry: 28, fill: 'none', stroke: '#AAAAAA', 'stroke-width': 2.5 }, svg);
      el('ellipse', { cx: 50, cy: 32, rx: 28, ry: 26, fill: 'rgba(180,220,255,0.25)' }, svg);
      // Visor reflection
      el('path', { d: 'M32,24 Q38,18 48,20', fill: 'none', stroke: 'rgba(255,255,255,0.5)', 'stroke-width': 2, 'stroke-linecap': 'round' }, svg);
      // Antenna on top
      el('line', { x1: 50, y1: 4, x2: 50, y2: -6, stroke: '#888', 'stroke-width': 2 }, svg);
      el('circle', { cx: 50, cy: -8, r: 3, fill: '#FF0000' }, svg);
    },
    hat_diamond_crown: function (svg) {
      // Crown base
      el('polygon', { points: '28,28 30,10 38,22 44,6 50,22 56,6 62,22 70,10 72,28', fill: '#E0E0E0', stroke: '#C0C0C0', 'stroke-width': 1 }, svg);
      // Diamond gems
      el('polygon', { points: '38,20 40,16 42,20 40,24', fill: '#00DDFF' }, svg);
      el('polygon', { points: '50,18 52,14 54,18 52,22', fill: '#FF69B4' }, svg);
      el('polygon', { points: '62,20 64,16 66,20 64,24', fill: '#00FF88' }, svg);
      // Sparkles
      drawStar(svg, 34, 14, 2, '#ffffff');
      drawStar(svg, 56, 10, 2, '#ffffff');
      drawStar(svg, 66, 14, 1.5, '#ffffff');
    },
    hat_glitch: function (svg) {
      el('rect', { x: 28, y: 14, width: 44, height: 14, rx: 3, fill: '#222' }, svg);
      el('rect', { x: 30, y: 16, width: 14, height: 4, fill: '#ff0000', opacity: 0.7 }, svg);
      el('rect', { x: 48, y: 18, width: 10, height: 3, fill: '#00ffff', opacity: 0.7 }, svg);
      el('rect', { x: 36, y: 22, width: 18, height: 3, fill: '#ff00ff', opacity: 0.6 }, svg);
      el('rect', { x: 60, y: 16, width: 10, height: 5, fill: '#00ff00', opacity: 0.5 }, svg);
    },
    hat_void: function (svg) {
      el('ellipse', { cx: 50, cy: 16, rx: 26, ry: 14, fill: '#000000' }, svg);
      el('ellipse', { cx: 50, cy: 16, rx: 16, ry: 8, fill: '#1a003a' }, svg);
      el('ellipse', { cx: 50, cy: 16, rx: 6, ry: 4, fill: '#3a0080' }, svg);
      el('circle', { cx: 50, cy: 16, r: 1.5, fill: '#6a0dad' }, svg);
    },
    hat_hologram: function (svg) {
      el('path', { d: 'M28,24 Q28,4 50,2 Q72,4 72,24 Z', fill: 'rgba(0,255,255,0.15)', stroke: '#00ffff', 'stroke-width': 1 }, svg);
      el('path', { d: 'M32,22 Q32,8 50,6 Q68,8 68,22 Z', fill: 'rgba(255,0,255,0.1)', stroke: '#ff00ff', 'stroke-width': 0.5 }, svg);
      for (var hy = 8; hy < 24; hy += 4) {
        el('line', { x1: 30, y1: hy, x2: 70, y2: hy, stroke: '#00ffff', 'stroke-width': 0.4, opacity: 0.4 }, svg);
      }
    },
    // ── New Regular Hats ──
    hat_pirate: function (svg) {
      el('ellipse', { cx: 50, cy: 22, rx: 30, ry: 5, fill: '#111' }, svg);
      el('path', { d: 'M24,22 Q24,4 50,0 Q76,4 76,22 Z', fill: '#222' }, svg);
      drawStar(svg, 50, 12, 4, '#FFD700');
    },
    hat_viking: function (svg) {
      el('path', { d: 'M26,26 Q26,10 50,8 Q74,10 74,26 Z', fill: '#8B6914' }, svg);
      el('rect', { x: 26, y: 22, width: 48, height: 6, rx: 2, fill: '#A0782C' }, svg);
      el('polygon', { points: '22,24 18,4 26,20', fill: '#DDDDDD' }, svg);
      el('polygon', { points: '78,24 82,4 74,20', fill: '#DDDDDD' }, svg);
    },
    hat_chef: function (svg) {
      el('rect', { x: 28, y: 18, width: 44, height: 8, rx: 2, fill: '#fff' }, svg);
      el('ellipse', { cx: 50, cy: 12, rx: 18, ry: 12, fill: '#fff' }, svg);
      el('circle', { cx: 38, cy: 8, r: 6, fill: '#fff' }, svg);
      el('circle', { cx: 62, cy: 8, r: 6, fill: '#fff' }, svg);
      el('circle', { cx: 50, cy: 4, r: 7, fill: '#fff' }, svg);
    },
    hat_beret: function (svg) {
      el('ellipse', { cx: 46, cy: 20, rx: 22, ry: 10, fill: '#8B0000' }, svg);
      el('path', { d: 'M28,22 Q30,12 50,10 Q66,12 68,22 Z', fill: '#AA0000' }, svg);
      el('circle', { cx: 46, cy: 8, r: 3, fill: '#CC0000' }, svg);
    },
    hat_santa: function (svg) {
      el('path', { d: 'M26,28 Q26,8 50,6 Q74,8 74,28 Z', fill: '#CC0000' }, svg);
      el('path', { d: 'M74,16 Q80,8 82,0 Q84,4 86,2', fill: 'none', stroke: '#CC0000', 'stroke-width': 6, 'stroke-linecap': 'round' }, svg);
      el('rect', { x: 24, y: 24, width: 52, height: 8, rx: 4, fill: '#fff' }, svg);
      el('circle', { cx: 86, cy: 2, r: 5, fill: '#fff' }, svg);
    },
    // ── New Regular Hats (Wave 2) ──
    hat_bucket: function (svg) {
      el('path', { d: 'M22,26 Q24,10 50,8 Q76,10 78,26 Z', fill: '#D2B48C' }, svg);
      el('ellipse', { cx: 50, cy: 26, rx: 32, ry: 6, fill: '#C4A882' }, svg);
    },
    hat_backwards: function (svg) {
      el('path', { d: 'M26,24 Q26,8 50,6 Q74,8 74,24 Z', fill: '#CC3333' }, svg);
      el('ellipse', { cx: 50, cy: 22, rx: 26, ry: 4, fill: '#AA2222' }, svg);
      el('ellipse', { cx: 58, cy: 24, rx: 16, ry: 3, fill: '#AA2222' }, svg);
    },
    hat_headphones: function (svg) {
      el('path', { d: 'M24,38 Q22,20 50,16 Q78,20 76,38', fill: 'none', stroke: '#333', 'stroke-width': 4 }, svg);
      el('rect', { x: 18, y: 32, width: 10, height: 16, rx: 4, fill: '#444' }, svg);
      el('rect', { x: 72, y: 32, width: 10, height: 16, rx: 4, fill: '#444' }, svg);
      el('rect', { x: 20, y: 34, width: 6, height: 12, rx: 3, fill: '#666' }, svg);
      el('rect', { x: 74, y: 34, width: 6, height: 12, rx: 3, fill: '#666' }, svg);
    },
    hat_nurse: function (svg) {
      el('rect', { x: 30, y: 12, width: 40, height: 16, rx: 3, fill: '#fff' }, svg);
      el('rect', { x: 46, y: 14, width: 8, height: 12, rx: 1, fill: '#FF0000' }, svg);
      el('rect', { x: 42, y: 18, width: 16, height: 4, rx: 1, fill: '#FF0000' }, svg);
    },
    hat_fedora: function (svg) {
      el('ellipse', { cx: 50, cy: 22, rx: 30, ry: 5, fill: '#3D3D3D' }, svg);
      el('path', { d: 'M28,22 Q30,6 50,4 Q70,6 72,22 Z', fill: '#4A4A4A' }, svg);
      el('rect', { x: 30, y: 18, width: 40, height: 4, rx: 1, fill: '#8B4513' }, svg);
    },
    // ── New Regular Hats (Wave 3) ──
    hat_bandana: function (svg) {
      el('path', { d: 'M26,28 Q26,18 50,16 Q74,18 74,28 Z', fill: '#CC2222' }, svg);
      el('path', { d: 'M28,28 Q30,24 50,22 Q70,24 72,28', fill: 'none', stroke: '#FFD700', 'stroke-width': 1.5 }, svg);
      // Tied knot at back
      el('path', { d: 'M72,26 Q78,24 80,28 Q78,32 72,30', fill: '#CC2222' }, svg);
      el('path', { d: 'M80,28 Q84,30 82,34', fill: 'none', stroke: '#CC2222', 'stroke-width': 3, 'stroke-linecap': 'round' }, svg);
    },
    hat_military: function (svg) {
      el('ellipse', { cx: 50, cy: 22, rx: 28, ry: 4, fill: '#2F4F2F' }, svg);
      el('path', { d: 'M26,22 Q28,8 50,6 Q72,8 74,22 Z', fill: '#3B5B3B' }, svg);
      el('ellipse', { cx: 50, cy: 22, rx: 26, ry: 3, fill: '#2F4F2F' }, svg);
      // Brim
      el('path', { d: 'M26,22 Q24,26 22,24 Q20,20 26,20 Z', fill: '#2F4F2F' }, svg);
      el('ellipse', { cx: 42, cy: 24, rx: 20, ry: 3.5, fill: '#2F4F2F' }, svg);
      // Badge
      drawStar(svg, 50, 14, 3, '#FFD700');
    },
    hat_fez: function (svg) {
      el('path', { d: 'M34,26 Q36,6 50,4 Q64,6 66,26 Z', fill: '#8B0000' }, svg);
      el('rect', { x: 34, y: 22, width: 32, height: 5, rx: 1, fill: '#6B0000' }, svg);
      // Tassel
      el('circle', { cx: 50, cy: 4, r: 2, fill: '#111' }, svg);
      el('path', { d: 'M50,6 Q56,8 58,14', fill: 'none', stroke: '#111', 'stroke-width': 1.5, 'stroke-linecap': 'round' }, svg);
      el('path', { d: 'M58,14 L56,20 L60,18', fill: 'none', stroke: '#111', 'stroke-width': 1.5, 'stroke-linecap': 'round' }, svg);
    },
    hat_straw: function (svg) {
      el('ellipse', { cx: 50, cy: 24, rx: 36, ry: 6, fill: '#E8D478' }, svg);
      el('path', { d: 'M30,24 Q30,8 50,6 Q70,8 70,24 Z', fill: '#F0E080' }, svg);
      el('rect', { x: 30, y: 18, width: 40, height: 4, rx: 1, fill: '#CC9944' }, svg);
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
    if (equipped.nametagColor) {
      if (equipped.nametagColor.charAt(0) === '#') {
        element.style.color = equipped.nametagColor;
      } else if (NAMETAGS[equipped.nametagColor]) {
        var colorEntry = NAMETAGS[equipped.nametagColor];
        applyCSS(element, colorEntry.css);
      }
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

  function styleBubble(msgElement, equipped) {
    if (!msgElement || !equipped || !equipped.chatBubble) return;
    var bubble = CHAT_BUBBLES[equipped.chatBubble];
    if (!bubble) return;
    applyCSS(msgElement, bubble.css);
  }

  function styleNameEffect(nameElement, equipped) {
    if (!nameElement || !equipped || !equipped.nameEffect) return;
    var effect = NAME_EFFECTS[equipped.nameEffect];
    if (!effect) return;
    applyCSS(nameElement, effect.css);
  }

  // ── Expose API ────────────────────────────────────────────────────────

  window.ArcadeAvatar = {
    render: render,
    renderMini: renderMini,
    styleName: styleName,
    styleBubble: styleBubble,
    styleNameEffect: styleNameEffect,
    ITEMS: ITEMS,
    NAMETAGS: NAMETAGS,
    SKIN_COLORS: SKIN_COLORS,
    CHAT_BUBBLES: CHAT_BUBBLES,
    NAME_EFFECTS: NAME_EFFECTS
  };

})();
