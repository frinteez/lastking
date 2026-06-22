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
        </div>

        <div *ngIf="activeTab === 'presets'" class="font-mono">
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

        <div *ngIf="activeTab === 'howtoplay'" class="font-mono text-sm text-gray-300 h-64 overflow-y-auto pr-2 custom-scrollbar">
          <h2 class="text-xl mb-4 text-sci-violet">HOW TO PLAY</h2>
          <div class="mb-4">
            <h3 class="text-sci-cyan mb-1">Resource Consumption</h3>
            <p>Your population consumes resources each day:<br>
            <strong>Children</strong>: -1 Food, -1 O2 per day<br>
            <strong>Workers</strong>: -2 Food, -2 O2 per day<br>
            <strong>Engineers</strong>: -3 Food, -3 O2 per day</p>
          </div>
          <div class="mb-4">
            <h3 class="text-sci-cyan mb-1">Drones & Industry</h3>
            <p>Build Drone Hubs to automate resource gathering. Drones require Engineer oversight.</p>
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
