import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { GameBridgeService } from '../../../core/game-bridge.service';
import { ModalService } from '../../../core/modal.service';
import { createGame } from '../../../game-engine/phaser-main.js';
import { getEnrollmentCount, getTotalPopulation } from '../../../game-engine/educationHelpers.js';

@Component({
  selector: 'app-game-canvas',
  standalone: true,
  template: `<div id="game-container" class="absolute inset-0 z-0"></div>`,
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

  constructor(private bridge: GameBridgeService, private modalService: ModalService) {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.gameInstance = createGame('game-container');
    
    // Allow Phaser to initialize before starting the bridge
    setTimeout(() => {
      const scene = this.gameInstance.scene.getScene('GameScene');
      if (scene) {
        this.bridge.registerScene(scene);
        this.startStatePolling(scene);
      }
    }, 500);
  }

  ngOnDestroy() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
    if (this.gameInstance) {
      this.gameInstance.destroy(true);
    }
  }

  private startStatePolling(scene: any) {
    this.pollInterval = setInterval(() => {
      const s = scene.state;
      if (!s) return;
      
      const popChildren = typeof s.popChildren === 'function' ? s.popChildren() : s.popChildren || 0;
      const popWorkers = typeof s.popWorkers === 'function' ? s.popWorkers() : s.popWorkers || 0;
      const popEngineers = typeof s.popEngineers === 'function' ? s.popEngineers() : s.popEngineers || 0;
      const popDrones = typeof s.popDrones === 'function' ? s.popDrones() : s.popDrones || 0;

      const totalPop = getTotalPopulation(s);
      const eff = (s.zufriedenheit * 0.7 + s.angst * 0.3) / 100;

      this.bridge.updateState({
        geld: s.geld,
        nahrung: s.nahrung,
        sauerstoff: s.sauerstoff,
        mineralien: s.mineralien,
        gesundheit: s.gesundheit,
        wissen: s.wissen,
        zufriedenheit: s.zufriedenheit,
        angst: s.angst,
        planetZustand: s.planetZustand,
        tag: s.tag,
        fct: s.fct,
        population: totalPop,
        engineers: popEngineers,
        children: popChildren,
        drones: popDrones,
        efficiency: eff,
        netIncome: scene.getNetIncome ? scene.getNetIncome() : 0,
        techs: s.techs || {}
      });
    }, 100);

    // Bind Modals to Phaser Events
    scene.events.on('open-education-modal', () => {
      this.modalService.open('academy');
    });

    scene.events.on('open-drone-modal', () => {
      this.modalService.open('drone');
    });

    scene.events.on('trigger-ending', (type: string) => {
      this.modalService.open('endgame', type);
    });
  }
}
