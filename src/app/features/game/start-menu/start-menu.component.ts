import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameBridgeService } from '../../../core/game-bridge.service';

@Component({
  selector: 'app-start-menu',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" *ngIf="visible">
      <div class="bg-sci-dark border-2 border-sci-cyan text-white p-8 max-w-4xl w-full shadow-[0_0_20px_rgba(0,240,255,0.3)]">
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
          <h2 class="text-xl mb-1 text-sci-violet">HOW TO PLAY</h2>
          <p class="text-gray-400 mb-5 text-xs">You are the last king of a dying world. Build your colony, manage your people, and survive. Press <span class="text-sci-cyan">NEXT DAY</span> to advance time.</p>

          <div class="grid grid-cols-2 gap-x-8 gap-y-5">

            <!-- Resource Consumption -->
            <div>
              <h3 class="text-sci-cyan mb-2 font-bold flex items-center gap-2">🍞 Resource Consumption</h3>
              <p class="leading-relaxed">Every citizen eats food and breathes O2 every day. If you run out, they starve or suffocate.</p>
              <ul class="mt-2 space-y-1 pl-2 border-l border-gray-700">
                <li><span class="text-yellow-300">Children</span>: −1 Food, −1 O2 / day</li>
                <li><span class="text-blue-300">Workers</span>: −2 Food, −2 O2 / day</li>
                <li><span class="text-purple-300">Engineers</span>: −3 Food, −3 O2 / day</li>
              </ul>
              <p class="mt-2 text-gray-400 text-xs">Build <strong class="text-white">Agri-Farms</strong> and <strong class="text-white">O2 Generators</strong> to keep up with demand.</p>
            </div>

            <!-- Citizen Upgrades -->
            <div>
              <h3 class="text-sci-cyan mb-2 font-bold flex items-center gap-2">🎓 Citizen Upgrades</h3>
              <p class="leading-relaxed">Children are born unskilled. Train them to unlock their productive potential.</p>
              <ul class="mt-2 space-y-1 pl-2 border-l border-gray-700">
                <li>🏫 <strong class="text-white">School</strong>: Child → Worker (5 days)</li>
                <li>🏛️ <strong class="text-white">Academy</strong>: Worker → Engineer (7 days)</li>
              </ul>
              <p class="mt-2 text-gray-400 text-xs">Click on a built School or Academy to open the enrollment panel and assign citizens.</p>
            </div>

            <!-- Drones & Industry -->
            <div>
              <h3 class="text-sci-cyan mb-2 font-bold flex items-center gap-2">🤖 Drones & Industry</h3>
              <p class="leading-relaxed">Drones automate resource production so your Engineers are free for other work.</p>
              <ul class="mt-2 space-y-1 pl-2 border-l border-gray-700">
                <li>Build a <strong class="text-white">Drone Hub</strong> to unlock drone production.</li>
                <li>Each drone needs <strong class="text-white">Engineer oversight</strong> and takes <strong class="text-white">3 days</strong> to build.</li>
                <li>Assign drones to Farms, O2 Generators, and Mines.</li>
              </ul>
              <p class="mt-2 text-gray-400 text-xs">Drones don't eat food or breathe O2 — a critical advantage at scale.</p>
            </div>

            <!-- Taxes & Happiness -->
            <div>
              <h3 class="text-sci-cyan mb-2 font-bold flex items-center gap-2">💰 Taxes & Happiness</h3>
              <p class="leading-relaxed">Taxes generate Geld (money) but hurt morale. Push too hard and your people will revolt.</p>
              <ul class="mt-2 space-y-1 pl-2 border-l border-gray-700">
                <li>Tax Level 1–2: Safe, mild morale penalty.</li>
                <li>Tax Level 3+: <span class="text-red-400">−3 Happiness/day</span>. Unsustainable long-term.</li>
              </ul>
              <p class="mt-2 text-gray-400 text-xs">Monitor Happiness in the top bar. If it hits 0% while Fear is low, it's game over.</p>
            </div>

            <!-- Geopolitics & Loyalty -->
            <div>
              <h3 class="text-sci-cyan mb-2 font-bold flex items-center gap-2">🌐 Geopolitics & Loyalty</h3>
              <p class="leading-relaxed">Three factions control trade. Build loyalty to get better deals.</p>
              <ul class="mt-2 space-y-1 pl-2 border-l border-gray-700">
                <li>⚙️ <strong class="text-white">Rust Syndicate</strong> — Minerals & industry</li>
                <li>💨 <strong class="text-white">Pure Breath Order</strong> — O2 & medicine</li>
                <li>💎 <strong class="text-white">Obsidian Guild</strong> — Credits & luxury</li>
              </ul>
              <p class="mt-2 text-gray-400 text-xs">High loyalty unlocks up to <strong class="text-white">40% trade discounts</strong>. Visit [2] Geopolitics to trade.</p>
            </div>

            <!-- Ecology & Planet Collapse -->
            <div>
              <h3 class="text-sci-cyan mb-2 font-bold flex items-center gap-2">🌍 Ecology & Planet Collapse</h3>
              <p class="leading-relaxed">Planet Health tracks the world's stability. Damage it too much and your colony crumbles.</p>
              <ul class="mt-2 space-y-1 pl-2 border-l border-gray-700">
                <li>The <strong class="text-white">Planetary Cracker</strong> boosts minerals but damages the planet.</li>
                <li>Planet Health &lt; 50%: Buildings become <span class="text-red-400">damaged</span>, production halts.</li>
                <li>Build the <strong class="text-white">Planet Stabilizer</strong> to restore health over time.</li>
              </ul>
            </div>

            <!-- Knowledge & Rebellion -->
            <div class="col-span-2 border-t border-gray-700 pt-4">
              <h3 class="text-sci-cyan mb-2 font-bold flex items-center gap-2">⚠️ Knowledge & Rebellion</h3>
              <p class="leading-relaxed"><strong class="text-red-400">Warning:</strong> The more your citizens know, the more dangerous they become. When <strong class="text-white">Knowledge exceeds 80</strong>, the population becomes aware of the true state of the world. Unrest grows rapidly. Use decrees, propaganda, and fear to maintain control — or keep your people in the dark.</p>
            </div>

          </div>
        </div>

        <div *ngIf="activeTab === 'lore'" class="font-mono text-sm text-gray-300 h-[28rem] overflow-y-auto pr-4 custom-scrollbar">
          <h2 class="text-xl mb-3 text-sci-violet">LORE & STORY</h2>

          <!-- WHO ARE YOU -->
          <div class="mb-5 border-l-2 border-sci-cyan pl-4">
            <h3 class="text-sci-cyan font-bold mb-2 text-base">👑 Who Are You?</h3>
            <p class="leading-relaxed mb-2">You are <strong class="text-white">the last king</strong> of a civilization clinging to survival on a crumbling world. Your planet is dying — its atmosphere thinning, its ground cracking, its people desperate and afraid.</p>
            <p class="leading-relaxed">Generations of exploitation have poisoned the soil and broken the sky. The old empire has collapsed. You alone remain with the authority, the resources, and the burden to lead what is left of your people. Every decision you make will shape their fate — and yours.</p>
          </div>

          <!-- YOUR MISSION -->
          <div class="mb-5 border-l-2 border-yellow-500 pl-4">
            <h3 class="text-yellow-400 font-bold mb-2 text-base">🎯 Your Mission</h3>
            <p class="leading-relaxed mb-2">Build a functioning colony on the ruins of your world. Keep your people <strong class="text-white">fed, breathing, and alive</strong>. Manage the economy, train your workforce, forge alliances with powerful factions, and make the hard decisions that no one else will.</p>
            <p class="leading-relaxed">You must choose: <em class="text-sci-cyan">do you heal this broken world and redeem your civilization?</em> Or do you <em class="text-sci-cyan">drain it of everything it has left and escape before it dies?</em></p>
            <p class="mt-2 text-gray-400 text-xs">⚡ Press <strong class="text-white">NEXT DAY</strong> to advance time. The clock never stops — resources deplete every day whether you act or not.</p>
          </div>

          <!-- ENDINGS -->
          <div class="mb-5">
            <h3 class="text-white font-bold mb-3 text-base">📖 The Four Possible Endings</h3>

            <div class="grid grid-cols-2 gap-3">
              <div class="bg-green-900/30 border border-green-600 p-3">
                <div class="text-green-400 font-bold mb-1">✨ Ascension <span class="text-xs text-green-600 font-normal">(Best Victory)</span></div>
                <p class="text-xs leading-relaxed">Survive to Day 100+. Keep your people happy (Happiness &gt; 80%), heal the world (Planet &gt; 80%), and build the <strong>Planet Stabilizer</strong>. Your civilization transcends its crisis and enters a new golden age. The hardest ending — but the most rewarding.</p>
              </div>

              <div class="bg-blue-900/30 border border-blue-500 p-3">
                <div class="text-blue-400 font-bold mb-1">🚀 Royal Ark <span class="text-xs text-blue-600 font-normal">(Escape Victory)</span></div>
                <p class="text-xs leading-relaxed">Build the <strong>Royal Ark</strong> and accumulate <strong>30,000 Geld</strong>. Abandon the dying planet and flee to the stars. You save yourself and your elite — but leave the rest behind. A selfish victory, but a victory nonetheless.</p>
              </div>

              <div class="bg-red-900/30 border border-red-700 p-3">
                <div class="text-red-400 font-bold mb-1">💀 Collapse <span class="text-xs text-red-700 font-normal">(Defeat)</span></div>
                <p class="text-xs leading-relaxed">Your population reaches zero, or the planet's health hits 0%. You ran out of food, air, or pushed the world too far. The last light of your civilization goes dark. There is no one left to remember you.</p>
              </div>

              <div class="bg-orange-900/30 border border-orange-600 p-3">
                <div class="text-orange-400 font-bold mb-1">✊ Uprising <span class="text-xs text-orange-700 font-normal">(Defeat)</span></div>
                <p class="text-xs leading-relaxed">Happiness hits 0% while Fear stays below 40%. The people have had enough. They rise up, drag you from your throne, and take matters into their own hands. You are remembered as a tyrant who failed even at oppression.</p>
              </div>
            </div>
          </div>

          <!-- MOTIVATION -->
          <div class="border-t border-gray-700 pt-4">
            <h3 class="text-sci-violet font-bold mb-2 text-base">⚖️ The Razor's Edge</h3>
            <p class="leading-relaxed mb-2">This is not a game where there is always a right answer. Every choice costs something. Raise taxes to fund expansion — and watch morale crack. Build Academies to train Engineers — but Engineers eat more and cost more. Use the Planetary Cracker for minerals — and poison the world your people live on.</p>
            <p class="leading-relaxed text-gray-400">The question is not <em>what is the best choice</em>. The question is <em>what kind of king do you want to be?</em> A savior, a tyrant, a refugee, or a ghost?</p>
          </div>
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
