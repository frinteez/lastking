# Der Letzte König

**Der Letzte König** is a 2D Sci-Fi Colony Survival Simulator focused on balancing a precarious economy, managing citizen morale, and overcoming extreme planetary conditions. You step into the role of the colony's overarching authority, guiding the remnants of humanity through a harsh, unforgiving void. Success hinges on a delicate balance between absolute authority (Fear) and citizen well-being (Happiness).

## 🚀 Setup & Run Instructions

To run the game locally, follow these steps:

1. **Install Dependencies:**
   Make sure you have Node.js and npm installed. Run the following command in the root directory:
   ```bash
   npm install
   ```

2. **Run the Development Server:**
   Start the Angular application along with the integrated Phaser 3 engine:
   ```bash
   npm run start
   ```
   *Alternatively, if your environment uses `ng serve`, that works too.*

3. **Play:**
   Open your browser and navigate to `http://localhost:4200` to start the game!

## 🌟 Key Features

* **Morale System (Happiness vs Fear):** A dual-axis morale system governs the colony. High Happiness increases birth rates and prevents strikes, while high Fear enables forced labor but suppresses natural growth.
* **Tech Tree & Education (Royal Academy):** Evolve your population dynamically. Children must be trained in Schools to become Workers, and Workers must attend the Royal Academy to become highly skilled Engineers.
* **Drone Automation:** Alleviate the burden on human workers by constructing Drone Hubs. Produce and deploy autonomous drones to manage resource extraction safely.
* **Save/Load via LocalStorage:** Fully persistent state tracking across 3 dedicated save slots, allowing you to seamlessly pause and resume your struggle for survival.
* **Dynamic Scenarios & Events:** Deal with strikes, ecological protests, food riots, and random cosmic events. Respond using powerful Decrees (Propaganda, Martial Law, etc.) that have cooldowns and lasting impacts.

## 🏗️ Architecture Highlight

The architecture of **Der Letzte König** strictly separates concerns between the presentation layer and game logic, resulting in a highly maintainable and clean codebase:

* **Engine Isolation:** The game logic and rendering are handled natively by **Phaser 3** (`GameScene.js`), while the entire User Interface (HUD, menus, tooltips, dialogs) is built entirely outside the canvas using **Angular (HTML/CSS)**. 
* **State Management & Bridge:** A dedicated `GameBridgeService` coordinates communication between the Angular UI and the Phaser engine via an event-driven architecture and state polling.
* **Deterministic Side-Effects:** Mathematical resource generation and state evaluations (such as computing Net Income) are implemented as pure, side-effect-free calculations. These calculations are strictly separated from actual end-of-day mutations and visual effects, ensuring the UI can poll accurate predictions without causing unintended state changes.
