# Project Context: Der letzte König (lastking)

## Project Overview
"Der letzte König" is a 2D web-based resource management and strategy game set in a dystopian space colony. The player acts as the new king of a colony founded on lies and exploitation by their father. The gameplay revolves around managing resources, issuing decrees, handling geopolitical relations, and balancing the colony's development against the citizens' happiness, fear, and knowledge.

## Technology Stack
- **Engine**: Phaser 3 (v3.55.2)
- **Frontend**: Vanilla JavaScript (ES Modules), HTML5, CSS3
- **Build Tool**: Vite (v4.5.0)

## Architecture & Key Files
- `index.html`: The main entry point, containing the game container and extensive UI overlays (decrees, geopolitics trade windows, lore tabs).
- `style.css`: Contains all styling for the HTML-based UI.
- `src/game/GameScene.js`: The core Phaser scene containing game state, loop logic, economy calculations, citizen animations, and mechanics (Martial Law, starvation grace periods, etc.).
- `src/ui/UIManager.js`: Handles UI interactions, updates the top bar resources, tooltips (e.g., Efficiency formula), and integrates HTML elements with the Phaser game state.
- `package.json` & `vite.config.js`: Project configuration and dependencies.

## Game Mechanics & State
- **Resources**: Money, Population, Drones, Food, Oxygen (O2), Minerals.
- **Metrics**: Health, Knowledge, Happiness, Fear, Planet Condition, Day.
- **Efficiency Doctrine**: Production is multiplied by an efficiency factor calculated as `(Happiness * 0.7 + Fear * 0.3) / 100`.
- **Decrees**: Special actions like "Martial Law", "Child Labor", "Planet Stabilizer" with specific cooldowns and effects.
- **Geopolitics**: Trade offers and acceptance bars for dealing with different factions (Rust, Order, Guild).

## Development Status
Based on `PROJECT_PLAN.md` and `DEV_LOG.md`:
- **Sprint 1-3**: ✅ Completed.
- Recent features include UI grouping in the top bar, floating text limits, drone prioritization (O2 > Food > Minerals), child labor production bonuses, a starvation grace period (3 days), UI tooltips for efficiency, and the "Martial Law" decree. Visual polish such as planet rotation and health desaturation have also been added.

## Agent Guidelines for this Project
1. **HTML/Phaser Integration**: The UI is largely HTML/CSS layered over the Phaser canvas. When modifying UI, check if it belongs in `index.html`/`style.css` or if it's rendered by Phaser.
2. **State Management**: Game state variables are primarily located in `GameScene.js`. When adding new state, ensure it is properly initialized in the `create()` method.
3. **Russian/English/German Mixed Context**: Be aware that development logs (`DEV_LOG.md`, `PROJECT_PLAN.md`) contain Russian notes, the game concepts are written in German (`Spielkonzept.md`), and the code/UI uses English. Maintain consistency with the existing language used in each specific area (e.g., English for code and UI).
