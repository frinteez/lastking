import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameBridgeService } from '../../../core/game-bridge.service';
import { ModalService } from '../../../core/modal.service';
import { createGame } from '../../../game-engine/phaser-main.js';
import { getEnrollmentCount, getTotalPopulation } from '../../../game-engine/educationHelpers.js';
import { ConstructionOverlayComponent } from './construction-overlay.component';

export interface ConstructionSite {
  id: string;
  x: number;
  y: number;
  scale: number;
  w: number;
  daysRemaining: number;
  totalDays: number;
}

@Component({
  selector: 'app-game-canvas',
  standalone: true,
  imports: [CommonModule, ConstructionOverlayComponent],
  template: `
    <div id="game-container" class="absolute inset-0 z-0"></div>
    <ng-container *ngFor="let c of activeConstructions; trackBy: trackById">
      <app-construction-overlay
        [style.transform]="'translate(' + c.x + 'px, ' + c.y + 'px) scale(' + c.scale + ')'"
        [style.width.px]="c.w"
        [style.height.px]="c.w"
        [daysRemaining]="c.daysRemaining"
        [totalDays]="c.totalDays"
      ></app-construction-overlay>
    </ng-container>
  `,
  styles: [`
    #game-container {
      width: 100%;
      height: 100%;
    }
  `]
})
export class GameCanvasComponent implements OnInit, AfterViewInit, OnDestroy {
  private gameInstance: any;
  private pollInterval: any;
  private rafId: number = 0;
  activeConstructions: ConstructionSite[] = [];

  private modalSub: any;

  constructor(private bridge: GameBridgeService, private modalService: ModalService, private cdr: ChangeDetectorRef) {}

  trackById(index: number, item: ConstructionSite) {
    return item.id;
  }

  ngOnInit() {
    this.modalSub = this.modalService.activeModal$.subscribe(modal => {
      if (this.gameInstance && this.gameInstance.scene) {
        const scene = this.gameInstance.scene.getScene('GameScene');
        if (scene && scene.setModalOpen) {
          scene.setModalOpen(!!modal.type);
        }
      }
    });
  }

  ngAfterViewInit() {
    this.gameInstance = createGame('game-container');
    
    // Poll until Phaser scene is ready
    const checkInterval = setInterval(() => {
      if (this.gameInstance && this.gameInstance.scene) {
        const scene = this.gameInstance.scene.getScene('GameScene');
        if (scene) {
          clearInterval(checkInterval);
          this.bridge.registerScene(scene);
          this.startStatePolling(scene);
          this.startOverlaySync(scene);
        }
      }
    }, 100);
  }

  ngOnDestroy() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    if (this.gameInstance) {
      this.gameInstance.destroy(true);
    }
    if (this.modalSub) {
      this.modalSub.unsubscribe();
    }
  }

  private startStatePolling(scene: any) {
    this.pollInterval = setInterval(() => {
      const s = scene.state;
      if (!s) return;
      
      const popChildren = typeof s.popChildren === 'function' ? s.popChildren() : s.popChildren || 0;
      const popWorkers = typeof s.popWorkers === 'function' ? s.popWorkers() : s.popWorkers || 0;
      const popEngineers = typeof s.popEngineers === 'function' ? s.popEngineers() : s.popEngineers || 0;
      const popDrones = s.drones?.owned || 0;

      const totalPop = getTotalPopulation(s);
      const eff = (s.zufriedenheit * 0.7 + s.angst * 0.3) / 100;

      this.bridge.updateState({
        geld: s.geld,
        nahrung: s.nahrung,
        sauerstoff: s.sauerstoff,
        mineralien: s.minerals,
        gesundheit: s.gesundheit,
        wissen: s.wissen,
        zufriedenheit: s.zufriedenheit,
        angst: s.angst,
        planetZustand: s.planet,
        tag: s.day,
        population: totalPop,
        workers: popWorkers,
        engineers: popEngineers,
        children: popChildren,
        popWorkers: s.popWorkers || 0,
        popEngineers: s.popEngineers || 0,
        popChildren: s.popChildren || 0,
        workersLocked: s.workersLocked || 0,
        constructionEngineersLocked: s.constructionEngineersLocked || 0,
        dronesEngineersLocked: s.dronesEngineersLocked || 0,
        schoolEnrollments: s.schoolEnrollments || [],
        academyEnrollments: s.academyEnrollments || [],
        drones: s.drones?.owned || 0,
        dronesCapacity: s.drones?.capacity || 5,
        efficiency: eff,
        netIncome: scene.getNetIncome ? scene.getNetIncome() : 0,
        netIncomeDetails: s.netIncome || { food: 0, o2: 0, foodProduced: 0, o2Produced: 0, mineralsProduced: 0, consumed: 0 },
        taxLevel: s.taxLevel || 1,
        cooldowns: s.cooldowns || {},
        factions: {
          rust: { loyalty: s.factionLoyalty?.rust || 0 },
          order: { loyalty: s.factionLoyalty?.order || 0 },
          guild: { loyalty: s.factionLoyalty?.guild || 0 }
        },
        techs: s.techs || {}
      });
    }, 100);

    // Bind Modals to Phaser Events
    scene.events.on('open-education-modal', (type: string) => {
      this.modalService.open(type === 'academy' ? 'uni' : 'school');
    });

    scene.events.on('open-drone-modal', () => {
      this.modalService.open('drone');
    });

    scene.events.on('trigger-ending', (type: string) => {
      this.modalService.open('endgame', type);
    });

    scene.events.on('cosmic-event', (msg: string) => {
      this.bridge.handleCosmicEvent(msg);
    });

    scene.events.on('toast-event', (data: {msg: string, type: 'error'|'system'}) => {
      this.bridge.handleToast(data.msg, data.type);
    });
  }

  private startOverlaySync(scene: any) {
    const sync = () => {
      if (!scene || !scene.cameras || !scene.cameras.main || !Array.isArray(scene.tiles)) {
        this.rafId = requestAnimationFrame(sync);
        return;
      }
      const cam = scene.cameras.main;
      
      const newConstructions: ConstructionSite[] = [];
      const tileSize = scene.TILE_SIZE;

      for (const t of scene.tiles) {
        if (t.building && t.building.daysRemaining > 0 && !t.destroyed) {
          const config = scene.getBuildConfig(t.building.key);
          const is2x2 = config ? config.size === 2 : false;
          
          const bldW = tileSize * (is2x2 ? 2 : 1);
          
          const worldX = t.x * tileSize;
          const worldY = t.y * tileSize;
          
          const screenX = (worldX - cam.worldView.x) * cam.zoom;
          const screenY = (worldY - cam.worldView.y) * cam.zoom;

          newConstructions.push({
            id: `${t.x}-${t.y}`,
            x: screenX,
            y: screenY,
            scale: cam.zoom,
            w: bldW,
            daysRemaining: t.building.daysRemaining,
            totalDays: t.building.totalDays || 3
          });
        }
      }
      
      this.activeConstructions = newConstructions;
      this.cdr.detectChanges();
      this.rafId = requestAnimationFrame(sync);
    };
    this.rafId = requestAnimationFrame(sync);
  }
}
