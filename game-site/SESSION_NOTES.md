# Session Notes - Feb 20, 2026 (Evening, continued)

## What was done (latest session)
- **Deep leaderboard fix**: Root cause found — old 2P bug in pong/tron/racer created inflated streak entries (e.g. 80). New legitimate bot-mode streaks couldn't overwrite them. Added one-time migrations in both fame.js (localStorage cleanup) and firebase-lb.js (Firebase doc reset for scores > 20).
- **Imposter leaderboard**: Added HallOfFame.submit call in renderScoreboard() + added imposter to fame.html GAMES array
- **Color Switch**: Increased color switcher distance from obstacles (gap * 0.28 → 0.50)
- **Duck Hunt**: Slowed ducks (baseSpeed 2+round*0.5 → 1.2+round*0.3), fixed HUD overlap
- **Bullet Dodge**: Reduced bullet spawn rate dramatically (0.8+diff*0.25 → 0.25+diff*0.08)
- **Idle Miner**: Added back button, periodic leaderboard submit (every 10 min + beforeunload), 4 new upgrades (Explosives, Drill, Conveyor Belt, Gem Magnet)
- **Tower Defense**: Reduced first wave (5+w*2 → 3+w), added 3 new towers (Mortar, Tesla, Flame), 2 new enemies (Stealth, Swarm), max upgrade level 2→4
- Cache bumps: fame.js v=4, firebase-lb.js v=3 across all HTML files
- Added 3 new solo games: Match-3, Nonogram, Fruit Slicer
- Added game cards to index.html and entries to fame.html for new games
- Game count: 65

## Previous session work
- Fixed leaderboard bugs: Simon Says (non-strict mode), Space Race (2P streak), Tetris/Breakout/Asteroids (zero score guard)
- Fixed UNO play again button for all players (not just host)
- Added 9 new themes (Blood Moon, Coffee, Neon, Lavender, Candy, Stealth, Tropical, Ice) - 22 total
- Added custom theme with 3 color pickers (background, accent, highlight)
- Expanded theme CSS coverage (scrollbars, placeholders, modals, inputs, focus states)
- Created Snake.io (2P/AI/Online, 1813 lines)
- Created Hole.io (2P/AI/Online, 1430 lines)
- Added LICENSE (All Rights Reserved) and README
- Created 5 new singleplayer games: Idle Miner, Color Switch, Duck Hunt, Tower Defense, Bullet Dodge
- Comprehensive leaderboard audit — found and fixed 8 bugs across flood, bubbles, penguin, tron, pong, racer, rps

## Key info
- Dev dir: /mnt/c/Users/Mason/game-site/
- Git dir: /mnt/c/Users/Mason/Calculator/
- Firebase: calculator-81d08
- Site: https://masonp25.github.io/calculator/game-site/index.html
- LOWER_BETTER: reaction, minesweeper, memory, sudoku, nonogram, maze, 20q, huesort, lightsout, pipes, ballsort, wordsearch, sliding, aim_classic
- Script order: sound.js?v=2, fame.js?v=4, firebase-lb.js?v=3, auth.js, theme.js?v=4
- SFX methods (lowercase): click, select, coin, powerup, win, levelup, correct, combo, bounce, death, fail, swoosh
- Game count: 65
