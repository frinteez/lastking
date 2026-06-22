import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameBridgeService } from '../../../core/game-bridge.service';

@Component({
  selector: 'app-start-menu',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" *ngIf="visible">
      <div class="bg-sci-dark border-2 border-sci-cyan text-white p-8 max-w-2xl w-full shadow-[0_0_20px_rgba(0,240,255,0.3)]">
        <h1 class="text-3xl font-bold text-center text-sci-cyan mb-6 tracking-widest font-mono border-b border-sci-cyan pb-4">
          DER LETZTE KÖNIG
        </h1>
        
        <div class="flex gap-4 mb-6 font-mono text-sm border-b border-gray-700 pb-2">
          <button (click)="activeTab = 'presets'" [ngClass]="{'text-sci-cyan border-b border-sci-cyan': activeTab === 'presets', 'text-gray-500': activeTab !== 'presets'}">PRESETS</button>
          <button (click)="activeTab = 'howtoplay'" [ngClass]="{'text-sci-cyan border-b border-sci-cyan': activeTab === 'howtoplay', 'text-gray-500': activeTab !== 'howtoplay'}">HOW TO PLAY</button>
          <button (click)="activeTab = 'lore'" [ngClass]="{'text-sci-cyan border-b border-sci-cyan': activeTab === 'lore', 'text-gray-500': activeTab !== 'lore'}">LORE</button>
        </div>

        <div *ngIf="activeTab === 'presets'" class="font-mono h-[28rem] overflow-y-auto pr-2 custom-scrollbar">
          <h2 class="text-xl mb-2 text-sci-violet">STARTER PRESETS</h2>
          <p class="text-gray-400 text-sm mb-4">Choose your starting conditions and begin your reign.</p>
          
          <div class="flex flex-col gap-3">
            <button class="bg-sci-navy hover:bg-sci-cyan hover:text-sci-dark border border-sci-cyan p-4 text-left transition-colors"
                    (click)="startGame('wealthy')">
              <div class="font-bold text-lg">Wealthy Heir</div>
              <div class="text-sm opacity-80">5000 Money, 15 Workers, 2 Engineers</div>
            </button>
            <button class="bg-sci-navy hover:bg-sci-cyan hover:text-sci-dark border border-sci-cyan p-4 text-left transition-colors"
                    (click)="startGame('scientific')">
              <div class="font-bold text-lg">Scientific Expedition</div>
              <div class="text-sm opacity-80">500 Money, 150 Food/O2, 60 Knowledge, 10 Engineers, Hydroponics + Academy</div>
            </button>
            <button class="bg-sci-navy hover:bg-sci-cyan hover:text-sci-dark border border-sci-cyan p-4 text-left transition-colors"
                    (click)="startGame('dictator')">
              <div class="font-bold text-lg">Iron Dictator</div>
              <div class="text-sm opacity-80">300 Money, 100 Minerals, 200 Food/O2, 20 Workers, 50 Fear, All Factions at 0</div>
            </button>
          </div>
        </div>

        <div *ngIf="activeTab === 'howtoplay'" class="font-mono text-sm text-gray-300 h-[28rem] overflow-y-auto pr-4 custom-scrollbar">
          <h2 class="text-xl mb-4 text-sci-violet">HOW TO PLAY</h2>
          
          <div class="mb-4">
            <h3 class="text-sci-cyan mb-1 font-bold">Resource Consumption</h3>
            <p>Your population consumes resources each day:<br>
            <strong>Children</strong>: -1 Food, -1 O2 per day<br>
            <strong>Workers</strong>: -2 Food, -2 O2 per day<br>
            <strong>Engineers</strong>: -3 Food, -3 O2 per day</p>
          </div>
          
          <div class="mb-4">
            <h3 class="text-sci-cyan mb-1 font-bold">Drones & Industry</h3>
            <p>Build Drone Hubs to automate resource gathering from Farms, O2 Generators, and Mines. Drones require Engineer oversight and take 3 days to assemble.</p>
          </div>

          <div class="mb-4">
            <h3 class="text-sci-cyan mb-1 font-bold">Taxes & Happiness</h3>
            <p>Higher tax levels increase Geld but reduce Happiness. At Tax Level 3+, Happiness drops by 3 per day. Monitor morale carefully.</p>
          </div>
          
          <div class="mb-4">
            <h3 class="text-sci-cyan mb-1 font-bold">Geopolitics & Loyalty</h3>
            <p>Trade with three factions: Rust Syndicate, Pure Breath Order, and Obsidian Guild. Build loyalty to unlock trade discounts up to 40%.</p>
          </div>
          
          <div class="mb-4">
            <h3 class="text-sci-cyan mb-1 font-bold">Ecology & Planet Collapse</h3>
            <p>The Planetary Cracker boosts minerals but damages the world. Planet health below 50% triggers unrest. Use the Stabilizer to heal.</p>
          </div>
          
          <div class="mb-4">
            <h3 class="text-sci-cyan mb-1 font-bold">Knowledge & Rebellion</h3>
            <p><strong>Warning:</strong> High Knowledge is dangerous. When Knowledge exceeds 80, your population becomes aware of the truth and unrest grows. Balance scientific progress with control.</p>
          </div>
          
          <div class="mb-4">
            <h3 class="text-sci-cyan mb-1 font-bold">Citizen Upgrades</h3>
            <p>Build <strong>Schools</strong> to upgrade Children into Workers (5 days). Build <strong>Academies</strong> to upgrade Workers into Engineers (7 days). Click on Schools/Academies to enroll citizens.</p>
          </div>

          <div class="mb-4">
            <h3 class="text-sci-cyan mb-1 font-bold">Efficiency & Morale</h3>
            <p><strong>Global Efficiency = (Happiness × 0.7 + Fear × 0.3) / 100</strong></p>
            <p>Efficiency multiplies ALL production (Food, O2, Minerals, Knowledge).</p>
            <p><strong>Warning:</strong> Pure tyranny (0% Happiness, 100% Fear) = only 30% efficiency. Balance is key.</p>
          </div>
        </div>

        <div *ngIf="activeTab === 'lore'" class="font-mono text-sm text-gray-300 h-[28rem] overflow-y-auto pr-4 custom-scrollbar">
          <h2 class="text-xl mb-4 text-sci-violet">LORE</h2>
          <p class="mb-4 text-base italic text-sci-cyan">"The last king of a dying world must make impossible choices. Your colony teeters on the brink of extinction. Stabilize the planet, or escape before the end."</p>
          
          <h3 class="text-green-400 mb-1 font-bold text-base mt-6">VICTORY CONDITIONS</h3>
          <ul class="list-disc pl-5 mb-6 space-y-2">
            <li><strong>Ascension</strong>: Survive to Day 100+, Happiness > 80%, Planet Health > 80%, Planet Stabilizer built. Transcend through technology.</li>
            <li><strong>Royal Ark (Escape)</strong>: Build the Royal Ark AND accumulate 30,000 Geld. Flee to the stars.</li>
          </ul>

          <h3 class="text-red-400 mb-1 font-bold text-base">DEFEAT CONDITIONS</h3>
          <ul class="list-disc pl-5 mb-6 space-y-2">
            <li><strong>Collapse</strong>: Population reaches 0 or Planet Health reaches 0%.</li>
            <li><strong>Uprising</strong>: Happiness reaches 0% while Fear remains below 40%. The people overthrow you.</li>
            <li><strong>Extinction</strong>: All citizens perish from starvation or environmental collapse.</li>
          </ul>

          <h3 class="text-sci-violet mb-1 font-bold text-base mt-6">THE EFFICIENCY DOCTRINE</h3>
          <p class="mb-2">Fear keeps them working. Happiness keeps them productive. A tyrant who rules only through terror will watch their factories grind to a halt as exhausted workers sabotage production.</p>
          <p>A leader who relies only on goodwill risks riots when resources run dry. The last king must walk the razor's edge.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #0A1128; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #00F0FF; }
  `]
})
export class StartMenuComponent implements OnInit {
  visible = true;
  activeTab = 'presets';

  constructor(private bridge: GameBridgeService) {}

  ngOnInit() {}

  startGame(preset: string) {
    this.bridge.startWithPreset(preset);
    this.visible = false;
  }
}
