import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalService, ModalType } from '../../../core/modal.service';
import { GameBridgeService } from '../../../core/game-bridge.service';
import { GameState } from '../../../core/game-state.model';

@Component({
  selector: 'app-modals-container',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="activeModal !== null" class="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      
      <!-- Academy / Education Modal -->
      <div *ngIf="activeModal === 'academy'" class="bg-sci-dark border-2 border-sci-cyan text-white p-8 max-w-2xl w-full shadow-[0_0_20px_rgba(0,240,255,0.3)] relative font-mono">
        <button class="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors font-bold" (click)="close()">[X] CLOSE</button>
        <h2 class="text-2xl text-sci-cyan border-b border-sci-cyan pb-2 mb-4 tracking-widest">EDUCATION MANAGEMENT</h2>
        <p class="text-gray-400 mb-6">Invest in the next generation. Forge the future through science and sacrifice.</p>
        
        <div class="bg-sci-navy border border-sci-cyan p-4 mb-4 shadow-neon-cyan">
          <h3 class="text-sci-cyan mb-2 font-bold uppercase">School (Children to Workers)</h3>
          <p class="text-sm mb-4 text-gray-300">Requires 5 days. Current idle children: <span class="text-sci-cyan">{{ state?.children }} (Total)</span></p>
          <div class="flex items-center gap-4">
            <input type="number" min="0" [(ngModel)]="schoolQty" class="bg-black border border-sci-cyan text-sci-cyan px-3 py-2 w-24 outline-none focus:shadow-neon-cyan">
            <button class="bg-sci-cyan text-sci-dark hover:bg-white px-6 py-2 font-bold transition-colors" (click)="trainSchool()">ENROLL</button>
          </div>
        </div>

        <div class="bg-sci-navy border border-sci-violet p-4 mb-4 shadow-neon-violet">
          <h3 class="text-sci-violet mb-2 font-bold uppercase">Academy (Workers to Engineers)</h3>
          <p class="text-sm mb-4 text-gray-300">Training engineers takes 7 days. Current idle workers: <span class="text-sci-cyan">{{ state?.population }} (Total)</span></p>
          <div class="flex items-center gap-4">
            <input type="number" min="0" [(ngModel)]="academyQty" class="bg-black border border-sci-cyan text-sci-cyan px-3 py-2 w-24 outline-none focus:shadow-neon-cyan">
            <button class="bg-sci-cyan text-sci-dark hover:bg-white px-6 py-2 font-bold transition-colors" (click)="trainEngineers()">ENROLL</button>
          </div>
        </div>
      </div>

      <!-- Drone Modal -->
      <div *ngIf="activeModal === 'drone'" class="bg-sci-dark border-2 border-sci-cyan text-white p-8 max-w-2xl w-full shadow-[0_0_20px_rgba(0,240,255,0.3)] relative font-mono">
        <button class="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors font-bold" (click)="close()">[X] CLOSE</button>
        <h2 class="text-2xl text-sci-cyan border-b border-sci-cyan pb-2 mb-4 tracking-widest">DRONE ASSEMBLY</h2>
        <p class="text-gray-400 mb-6">Command your automated fleet. Requires 3 days per batch.</p>
        
        <div class="bg-sci-navy border border-sci-violet p-4 mb-4 shadow-neon-violet">
          <h3 class="text-sci-violet mb-2 font-bold uppercase">Production Batch</h3>
          <p class="text-sm mb-4 text-gray-300">Cost per drone: 50 Minerals, 50 Geld. Requires 2 idle engineers.</p>
          <p class="text-sm mb-4 text-sci-cyan">Available: {{ state?.mineralien }} Minerals, {{ state?.geld }} Geld, {{ state?.engineers }} Engineers.</p>
          <div class="flex items-center gap-4">
            <input type="number" min="0" max="5" [(ngModel)]="droneQty" class="bg-black border border-sci-cyan text-sci-cyan px-3 py-2 w-24 outline-none focus:shadow-neon-cyan">
            <button class="bg-sci-cyan text-sci-dark hover:bg-white px-6 py-2 font-bold transition-colors" (click)="buildDrones()">ASSEMBLE</button>
          </div>
        </div>
      </div>

      <!-- Ministries Modal -->
      <div *ngIf="activeModal === 'ministries'" class="bg-sci-dark border-2 border-sci-cyan text-white p-8 max-w-3xl w-full max-h-[80vh] overflow-y-auto custom-scrollbar relative font-mono shadow-[0_0_20px_rgba(0,240,255,0.3)]">
        <button class="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors font-bold" (click)="close()">[X] CLOSE</button>
        <h2 class="text-2xl text-sci-cyan border-b border-sci-cyan pb-2 mb-4 tracking-widest">MINISTRIES & DECREES</h2>
        <p class="text-gray-400 mb-6">Issue decrees to manage the population, at the cost of Fear or Geld.</p>
        
        <div class="grid grid-cols-2 gap-4">
          <button class="bg-sci-navy border border-sci-cyan text-left p-4 hover:bg-sci-cyan hover:text-sci-dark transition-colors"
                  (click)="executeDecree('propaganda')">
            <div class="font-bold text-lg mb-1">State Propaganda</div>
            <div class="text-xs opacity-80 mb-2">Cost: 100 Geld</div>
            <div class="text-sm">Increases Happiness by 10%.</div>
          </button>
          <button class="bg-sci-navy border border-sci-cyan text-left p-4 hover:bg-sci-cyan hover:text-sci-dark transition-colors"
                  (click)="executeDecree('martial_law')">
            <div class="font-bold text-lg mb-1">Martial Law</div>
            <div class="text-xs opacity-80 mb-2">Cost: 50 Geld</div>
            <div class="text-sm">Increases Fear by 20%, lowers Happiness.</div>
          </button>
          <button class="bg-sci-navy border border-sci-cyan text-left p-4 hover:bg-sci-cyan hover:text-sci-dark transition-colors"
                  (click)="executeDecree('rationing')">
            <div class="font-bold text-lg mb-1">Strict Rationing</div>
            <div class="text-xs opacity-80 mb-2">Cost: Free</div>
            <div class="text-sm">Reduces food consumption by 50% for 3 days.</div>
          </button>
        </div>
      </div>

      <!-- Geopolitics Modal -->
      <div *ngIf="activeModal === 'geopolitics'" class="bg-sci-dark border-2 border-sci-cyan text-white p-8 max-w-3xl w-full shadow-[0_0_20px_rgba(0,240,255,0.3)] relative font-mono">
        <button class="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors font-bold" (click)="close()">[X] CLOSE</button>
        <h2 class="text-2xl text-sci-cyan border-b border-sci-cyan pb-2 mb-4 tracking-widest">GEOPOLITICS</h2>
        <p class="text-gray-400 mb-6">Trade with off-world factions.</p>
        
        <div class="grid grid-cols-3 gap-4">
          <div class="bg-sci-navy border border-gray-600 p-4 text-center">
            <h3 class="text-sci-cyan font-bold mb-2">Rust Syndicate</h3>
            <p class="text-xs text-gray-400 mb-4">Scavengers & Miners</p>
            <button class="w-full bg-transparent border border-sci-cyan text-sci-cyan py-1 hover:bg-sci-cyan hover:text-sci-dark transition-colors text-sm">TRADE (WIP)</button>
          </div>
          <div class="bg-sci-navy border border-gray-600 p-4 text-center">
            <h3 class="text-sci-violet font-bold mb-2">Order of the Filter</h3>
            <p class="text-xs text-gray-400 mb-4">Water Zealots</p>
            <button class="w-full bg-transparent border border-sci-violet text-sci-violet py-1 hover:bg-sci-violet hover:text-white transition-colors text-sm">TRADE (WIP)</button>
          </div>
          <div class="bg-sci-navy border border-gray-600 p-4 text-center">
            <h3 class="text-yellow-400 font-bold mb-2">The Guild</h3>
            <p class="text-xs text-gray-400 mb-4">Merchants</p>
            <button class="w-full bg-transparent border border-yellow-400 text-yellow-400 py-1 hover:bg-yellow-400 hover:text-black transition-colors text-sm">TRADE (WIP)</button>
          </div>
        </div>
      </div>

      <!-- End Game Modal -->
      <div *ngIf="activeModal === 'endgame'" class="bg-black border-4 border-red-600 text-white p-12 max-w-3xl w-full shadow-[0_0_50px_rgba(255,0,0,0.5)] relative font-mono text-center">
        <h1 class="text-5xl text-red-500 mb-6 font-bold tracking-widest uppercase">{{ getEndgameTitle() }}</h1>
        <p class="text-xl text-gray-300 mb-8">{{ getEndgameDesc() }}</p>
        <button class="bg-red-600 text-white hover:bg-white hover:text-red-600 px-8 py-3 font-bold text-xl transition-colors shadow-neon-red" (click)="reloadGame()">RESTART SYSTEM</button>
      </div>

    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #0A1128; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #00F0FF; }
  `]
})
export class ModalsContainerComponent implements OnInit {
  activeModal: ModalType = null;
  modalData: any = null;
  state: GameState | null = null;
  
  schoolQty = 0;
  academyQty = 0;
  droneQty = 0;

  constructor(private modalService: ModalService, private bridge: GameBridgeService) {}

  ngOnInit() {
    this.modalService.activeModal$.subscribe(m => {
      this.activeModal = m.type;
      this.modalData = m.data;
      if (m.type === 'academy') {
        this.schoolQty = 0;
        this.academyQty = 0;
      }
      if (m.type === 'drone') this.droneQty = 0;
    });
    this.bridge.gameState$.subscribe(s => this.state = s);
  }

  close() {
    this.modalService.close();
  }

  trainSchool() {
    if (this.schoolQty > 0) {
      this.bridge.enqueueEducation('school', this.schoolQty);
      this.close();
    }
  }

  trainEngineers() {
    if (this.academyQty > 0) {
      this.bridge.enqueueEducation('academy', this.academyQty);
      this.close();
    }
  }

  buildDrones() {
    if (this.droneQty > 0) {
      this.bridge.enqueueDroneProduction(this.droneQty);
      this.close();
    }
  }

  executeDecree(decreeId: string) {
    this.bridge.executeDecree(decreeId);
    // don't close, user might want to click more
  }

  getEndgameTitle(): string {
    if (this.modalData === 'victory_ascension') return 'ASCENSION ACHIEVED';
    if (this.modalData === 'victory_ark') return 'ROYAL ARK LAUNCHED';
    if (this.modalData === 'defeat_uprising') return 'UPRISING';
    if (this.modalData === 'defeat_extinction') return 'EXTINCTION';
    if (this.modalData === 'defeat_collapse') return 'PLANETARY COLLAPSE';
    return 'SYSTEM FAILURE';
  }

  getEndgameDesc(): string {
    if (this.modalData === 'victory_ascension') return 'Your people have transcended their mortal limits through technology and stabilization. The planet is healed, and a new era begins.';
    if (this.modalData === 'victory_ark') return 'The Royal Ark has broken atmosphere. The planet is left behind to burn, but the kingdom survives among the stars.';
    if (this.modalData === 'defeat_uprising') return 'The citizens could no longer bear your rule. The palace has fallen. Your reign ends in blood.';
    if (this.modalData === 'defeat_extinction') return 'The last of your people have perished. The colony is a tomb.';
    if (this.modalData === 'defeat_collapse') return 'The planet\'s core has destabilized. Everything has been swallowed by fire and ash.';
    return 'The colony has fallen.';
  }

  reloadGame() {
    window.location.reload();
  }
}
