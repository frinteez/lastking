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
            <div class="flex items-center gap-1" title="Credits (Money)">
              <span class="text-green-400">[$]</span>
              <span>{{ state.geld | number:'1.0-0' }}</span>
              <span class="text-xs px-1 rounded" [ngClass]="{'bg-red-900 text-red-100': state.netIncome < 0, 'bg-green-900 text-green-100': state.netIncome > 0}">
                {{ state.netIncome > 0 ? '+' : '' }}{{ state.netIncome }}
              </span>
            </div>
            <div class="flex items-center gap-1" title="Population">
              <span class="text-blue-400">[P]</span>
              <span>{{ state.population }}</span>
            </div>
            <div class="flex items-center gap-1" title="Drones">
              <span class="text-gray-400">[D]</span>
              <span>{{ state.drones }}</span>
            </div>
          </div>
          
          <div class="flex gap-4">
            <div class="flex items-center gap-1" title="Food">
              <span class="text-orange-400">[F]</span>
              <span>{{ Math.floor(state.nahrung) }}</span>
            </div>
            <div class="flex items-center gap-1" title="Oxygen">
              <span class="text-blue-200">[O2]</span>
              <span>{{ Math.floor(state.sauerstoff) }}</span>
            </div>
            <div class="flex items-center gap-1" title="Minerals">
              <span class="text-purple-400">[M]</span>
              <span>{{ Math.floor(state.mineralien) }}</span>
            </div>
          </div>
        </div>

        <!-- Row 2: Metrics -->
        <div class="flex justify-between items-center text-xs text-gray-300">
          <div class="flex gap-3">
            <div title="Health">HLT: <span class="text-white">{{ Math.floor(state.gesundheit) }}%</span></div>
            <div title="Knowledge">KNW: <span class="text-white">{{ Math.floor(state.wissen) }}</span></div>
            <div title="Happiness">HAP: <span class="text-white">{{ Math.floor(state.zufriedenheit) }}%</span></div>
            <div title="Fear">FER: <span class="text-white">{{ Math.floor(state.angst) }}%</span></div>
            <div title="Planet Integrity">PLN: <span class="text-white">{{ Math.floor(state.planetZustand) }}%</span></div>
          </div>
          <div class="font-bold text-sci-cyan">
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
