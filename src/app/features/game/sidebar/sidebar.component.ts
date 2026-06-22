import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameBridgeService } from '../../../core/game-bridge.service';
import { GameState } from '../../../core/game-state.model';
import { ModalService } from '../../../core/modal.service';

interface BuildOption {
  id: string;
  label: string;
  req: string;
  isSpecial?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside class="absolute right-0 top-0 h-full w-72 bg-sci-dark border-l-2 border-sci-cyan text-sci-cyan p-4 flex flex-col gap-4 font-mono z-10 pointer-events-auto" *ngIf="state">
      
      <!-- Top Actions -->
      <div class="flex justify-between items-center pb-2 border-b border-sci-violet">
        <button class="bg-sci-violet hover:bg-purple-700 text-white font-bold py-2 px-4 rounded w-full shadow-neon-violet transition-colors duration-200"
                (click)="nextDay()">
          NEXT DAY
        </button>
      </div>

      <!-- Navigation Tabs -->
      <nav class="flex flex-col gap-2 text-sm">
        <button class="text-left py-1 px-2 border border-gray-600 text-gray-400 hover:bg-sci-navy hover:text-sci-cyan transition-colors"
                (click)="openModal('ministries')">
          [1] MINISTRIES
        </button>
        <button class="text-left py-1 px-2 border border-gray-600 text-gray-400 hover:bg-sci-navy hover:text-sci-cyan transition-colors"
                (click)="openModal('geopolitics')">
          [2] GEOPOLITICS
        </button>
        <button class="text-left py-1 px-2 border border-gray-600 text-gray-400 hover:bg-sci-navy hover:text-sci-cyan transition-colors"
                (click)="openModal('tech')">
          [3] ROYAL ACADEMY
        </button>
      </nav>

      <!-- Build Menu -->
      <div class="flex-1 overflow-y-auto pr-2 mt-2 custom-scrollbar">
        <h3 class="font-bold text-lg mb-4 text-white">CONSTRUCT</h3>
        
        <!-- Category: Life Support & Housing -->
        <div class="mb-6">
          <h4 class="text-xs text-sci-violet mb-2 uppercase tracking-widest">Life Support</h4>
          <div class="flex flex-col gap-2">
            <button *ngFor="let b of lifeSupport" 
                    [disabled]="!hasTech(b.req)"
                    (click)="enterBuildMode(b.id)"
                    [ngClass]="{
                      'border-sci-cyan text-sci-cyan hover:bg-sci-navy': hasTech(b.req),
                      'border-gray-700 text-gray-600 cursor-not-allowed': !hasTech(b.req),
                      'bg-sci-cyan text-sci-dark': activeBuild === b.id
                    }"
                    class="text-left py-2 px-3 border transition-colors duration-150 relative group">
              {{ b.label }}
              <span *ngIf="!hasTech(b.req)" class="absolute right-2 top-2 text-[10px] text-red-500">LOCKED</span>
            </button>
          </div>
        </div>

        <!-- Category: Industry & Logistics -->
        <div class="mb-6">
          <h4 class="text-xs text-sci-violet mb-2 uppercase tracking-widest">Industry</h4>
          <div class="flex flex-col gap-2">
            <button *ngFor="let b of industry" 
                    [disabled]="!hasTech(b.req)"
                    (click)="enterBuildMode(b.id)"
                    [ngClass]="{
                      'border-sci-cyan text-sci-cyan hover:bg-sci-navy': hasTech(b.req),
                      'border-gray-700 text-gray-600 cursor-not-allowed': !hasTech(b.req),
                      'bg-sci-cyan text-sci-dark': activeBuild === b.id
                    }"
                    class="text-left py-2 px-3 border transition-colors duration-150 relative group">
              {{ b.label }}
              <span *ngIf="!hasTech(b.req)" class="absolute right-2 top-2 text-[10px] text-red-500">LOCKED</span>
            </button>
          </div>
        </div>

        <!-- Category: Institutions -->
        <div class="mb-6">
          <h4 class="text-xs text-sci-violet mb-2 uppercase tracking-widest">Institutions</h4>
          <div class="flex flex-col gap-2">
            <button *ngFor="let b of institutions" 
                    [disabled]="!hasTech(b.req)"
                    (click)="enterBuildMode(b.id)"
                    [ngClass]="{
                      'border-sci-cyan text-sci-cyan hover:bg-sci-navy': hasTech(b.req),
                      'border-gray-700 text-gray-600 cursor-not-allowed': !hasTech(b.req),
                      'bg-sci-cyan text-sci-dark': activeBuild === b.id
                    }"
                    class="text-left py-2 px-3 border transition-colors duration-150 relative group">
              {{ b.label }}
              <span *ngIf="!hasTech(b.req)" class="absolute right-2 top-2 text-[10px] text-red-500">LOCKED</span>
            </button>
          </div>
        </div>

        <!-- Category: Megastructures (2x2) -->
        <div class="mb-6">
          <h4 class="text-xs text-sci-violet mb-2 uppercase tracking-widest">Megastructures</h4>
          <div class="flex flex-col gap-2">
            <button *ngFor="let b of megastructures" 
                    [disabled]="!hasTech(b.req)"
                    (click)="enterBuildMode(b.id)"
                    [ngClass]="{
                      'border-sci-cyan text-sci-cyan hover:bg-sci-navy': hasTech(b.req),
                      'border-gray-700 text-gray-600 cursor-not-allowed': !hasTech(b.req),
                      'bg-sci-cyan text-sci-dark': activeBuild === b.id
                    }"
                    class="text-left py-2 px-3 border transition-colors duration-150 relative group">
              {{ b.label }}
              <span *ngIf="!hasTech(b.req)" class="absolute right-2 top-2 text-[10px] text-red-500">LOCKED</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #0A1128; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #00F0FF; }
  `]
})
export class SidebarComponent implements OnInit {
  state: GameState | null = null;
  activeBuild: string | null = null;

  lifeSupport: BuildOption[] = [
    { id: 'tile_farm', label: 'Agri-Farm', req: 'hydroponics' },
    { id: 'tile_o2', label: 'O2 Generator', req: 'advO2' },
    { id: 'tile_housing', label: 'Housing Block', req: 'none' }
  ];

  industry: BuildOption[] = [
    { id: 'tile_mine', label: 'Mine', req: 'deepExcavation' },
    { id: 'tile_dronehub', label: 'Drone Hub', req: 'droneRouting' }
  ];

  institutions: BuildOption[] = [
    { id: 'tile_school', label: 'School', req: 'none' },
    { id: 'tile_uni', label: 'Academy', req: 'basicSchooling' }
  ];

  megastructures: BuildOption[] = [
    { id: 'atmo_synthesizer', label: 'Atmo-Synth', req: 'advO2' },
    { id: 'planetary_cracker', label: 'Planetary Cracker', req: 'deepExcavation' },
    { id: 'planet_stabilizer', label: 'Stabilizer', req: 'planetStabilizer' },
    { id: 'ark_ship', label: 'Royal Ark', req: 'arkBlueprint' }
  ];

  constructor(private bridge: GameBridgeService, private modalService: ModalService) {}

  ngOnInit() {
    this.bridge.gameState$.subscribe((s: GameState | null) => this.state = s);
  }

  hasTech(req: string): boolean {
    if (req === 'none') return true;
    return !!(this.state?.techs && this.state.techs[req]);
  }

  enterBuildMode(buildId: string) {
    if (this.activeBuild === buildId) {
      this.cancelBuildMode();
    } else {
      this.activeBuild = buildId;
      this.bridge.enterBuildMode(buildId);
    }
  }

  cancelBuildMode() {
    this.activeBuild = null;
    this.bridge.cancelBuildMode();
  }

  nextDay() {
    this.bridge.nextDay();
  }

  openModal(modal: any) {
    this.modalService.open(modal);
  }
}
