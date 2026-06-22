import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameBridgeService } from '../../../core/game-bridge.service';
import { GameState } from '../../../core/game-state.model';

@Component({
  selector: 'app-hud',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="absolute top-0 left-0 w-full z-10 pointer-events-none p-2 font-mono" *ngIf="state">
      <div class="bg-sci-dark border-2 border-sci-cyan text-sci-cyan p-2 shadow-neon-cyan flex flex-col gap-2 max-w-4xl mx-auto pointer-events-auto">
        
        <!-- Row 1: Primary Resources -->
        <div class="flex justify-between items-center text-sm md:text-base font-bold">
          <div class="flex gap-4">
            <div class="flex items-center gap-1 group relative cursor-help">
              <img src="/assets/icon_money.png" class="h-5 w-5 drop-shadow-[0_0_2px_#4ade80]" alt="Money">
              <span>{{ state.geld | number:'1.0-0' }}</span>
              <span class="text-xs px-1 rounded" [ngClass]="{'bg-red-900 text-red-100': state.netIncome < 0, 'bg-green-900 text-green-100': state.netIncome > 0}">
                {{ state.netIncome > 0 ? '+' : '' }}{{ state.netIncome }}
              </span>
              <!-- Tooltip -->
              <div class="absolute top-full left-0 mt-1 hidden group-hover:block bg-black border border-green-400 p-2 text-xs w-48 z-50 text-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]">
                <strong>Credits (Geld)</strong><br>
                Required for building, drones, and decrees.
              </div>
            </div>
            
            <div class="flex items-center gap-1 group relative cursor-help">
              <img src="/assets/icon_pop.png" class="h-5 w-5 drop-shadow-[0_0_2px_#60a5fa]" alt="Population">
              <span>{{ state.population }}</span>
              <div class="absolute top-full left-0 mt-1 hidden group-hover:block bg-black border border-blue-400 p-2 text-xs w-48 z-50 text-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]">
                <strong>Population</strong><br>
                Total citizens (Children, Workers, Engineers).
              </div>
            </div>
            
            <div class="flex items-center gap-1 group relative cursor-help">
              <img src="/assets/icon_drone.png" class="h-5 w-5 drop-shadow-[0_0_2px_#9ca3af]" alt="Drones">
              <span>{{ state.drones }}</span>
              <div class="absolute top-full left-0 mt-1 hidden group-hover:block bg-black border border-gray-400 p-2 text-xs w-48 z-50 text-gray-400 shadow-[0_0_10px_rgba(156,163,175,0.5)]">
                <strong>Drones</strong><br>
                Automates resource production. Built in Drone Hubs.
              </div>
            </div>
          </div>
          
          <div class="flex gap-4">
            <div class="flex items-center gap-1 group relative cursor-help">
              <img src="/assets/icon_food.png" class="h-5 w-5 drop-shadow-[0_0_2px_#fb923c]" alt="Food">
              <span>{{ Math.floor(state.nahrung) }}</span>
              <div class="absolute top-full right-0 mt-1 hidden group-hover:block bg-black border border-orange-400 p-2 text-xs w-48 z-50 text-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.5)]">
                <strong>Food (Nahrung)</strong><br>
                Consumed daily by population. Produced by Farms.
              </div>
            </div>
            
            <div class="flex items-center gap-1 group relative cursor-help">
              <img src="/assets/icon_o2.png" class="h-5 w-5 drop-shadow-[0_0_2px_#bfdbfe]" alt="Oxygen">
              <span>{{ Math.floor(state.sauerstoff) }}</span>
              <div class="absolute top-full right-0 mt-1 hidden group-hover:block bg-black border border-blue-200 p-2 text-xs w-48 z-50 text-blue-200 shadow-[0_0_10px_rgba(191,219,254,0.5)]">
                <strong>Oxygen (O2)</strong><br>
                Consumed daily by population. Produced by O2 Gens.
              </div>
            </div>
            
            <div class="flex items-center gap-1 group relative cursor-help">
              <img src="/assets/icon_min.png" class="h-5 w-5 drop-shadow-[0_0_2px_#c084fc]" alt="Minerals">
              <span>{{ Math.floor(state.mineralien) }}</span>
              <div class="absolute top-full right-0 mt-1 hidden group-hover:block bg-black border border-purple-400 p-2 text-xs w-48 z-50 text-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.5)]">
                <strong>Minerals</strong><br>
                Used for construction. Extracted by Mines.
              </div>
            </div>
          </div>
        </div>

        <!-- Row 2: Metrics -->
        <div class="flex justify-between items-center text-xs text-gray-300 mt-2">
          <div class="flex gap-4">
            <div class="flex items-center gap-1 group relative cursor-help">
              <img src="/assets/icon_health.png" class="h-4 w-4" alt="Health">
              <span class="text-white">{{ Math.floor(state.gesundheit) }}%</span>
              <div class="absolute top-full left-0 mt-1 hidden group-hover:block bg-black border border-pink-400 p-2 text-xs w-48 z-50 text-pink-400 shadow-[0_0_10px_rgba(244,114,182,0.5)]">
                <strong>Health</strong><br>
                Overall physical state. Drops when starving.
              </div>
            </div>
            
            <div class="flex items-center gap-1 group relative cursor-help">
              <img src="/assets/icon_knowledge.png" class="h-4 w-4" alt="Knowledge">
              <span class="text-white">{{ Math.floor(state.wissen) }}</span>
              <div class="absolute top-full left-0 mt-1 hidden group-hover:block bg-black border border-yellow-400 p-2 text-xs w-48 z-50 text-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]">
                <strong>Knowledge</strong><br>
                Dangerous if high without high Happiness. Leads to uprisings!
              </div>
            </div>
            
            <div class="flex items-center gap-1 group relative cursor-help">
              <img src="/assets/icon_happiness.png" class="h-4 w-4" alt="Happiness">
              <span class="text-white">{{ Math.floor(state.zufriedenheit) }}%</span>
              <div class="absolute top-full left-0 mt-1 hidden group-hover:block bg-black border border-yellow-200 p-2 text-xs w-48 z-50 text-yellow-200 shadow-[0_0_10px_rgba(253,230,138,0.5)]">
                <strong>Happiness</strong><br>
                Increases global efficiency along with Fear.
              </div>
            </div>
            
            <div class="flex items-center gap-1 group relative cursor-help">
              <img src="/assets/fear.png" class="h-4 w-4" alt="Fear">
              <span class="text-white">{{ Math.floor(state.angst) }}%</span>
              <div class="absolute top-full left-0 mt-1 hidden group-hover:block bg-black border border-red-500 p-2 text-xs w-48 z-50 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                <strong>Fear</strong><br>
                Dictator's tool. Also increases efficiency, but ruins lives.
              </div>
            </div>
            
            <div class="flex items-center gap-1 group relative cursor-help">
              <img src="/assets/icon_planet.png" class="h-4 w-4" alt="Planet">
              <span class="text-white">{{ Math.floor(state.planetZustand) }}%</span>
              <div class="absolute top-full left-0 mt-1 hidden group-hover:block bg-black border border-teal-400 p-2 text-xs w-48 z-50 text-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.5)]">
                <strong>Planet Integrity</strong><br>
                If this hits 0%, game over. Use Stabilizer to heal it.
              </div>
            </div>
          </div>
          <div class="font-bold text-sci-cyan text-sm drop-shadow-[0_0_5px_#22d3ee]">
            DAY {{ state.tag }}
          </div>
        </div>
      </div>
    </div>
  `
})
export class HudComponent implements OnInit {
  state: GameState | null = null;
  Math = Math;

  constructor(private bridge: GameBridgeService) {}

  ngOnInit() {
    this.bridge.gameState$.subscribe(state => {
      this.state = state;
    });
  }
}
