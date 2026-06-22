import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GameState } from './game-state.model';

@Injectable({
  providedIn: 'root'
})
export class GameBridgeService {
  private gameStateSubject = new BehaviorSubject<GameState | null>(null);
  gameState$ = this.gameStateSubject.asObservable();

  private phaserScene: any = null;

  constructor() {}

  // Called by GameScene or GameCanvasComponent to register the scene
  public registerScene(scene: any) {
    this.phaserScene = scene;
  }

  // Called by GameScene's update loop or when state changes
  public updateState(state: GameState) {
    this.gameStateSubject.next({ ...state });
  }

  // --- Actions from Angular to Phaser ---

  public executeDecree(decreeId: string) {
    if (this.phaserScene && this.phaserScene.executeDecree) {
      this.phaserScene.executeDecree(decreeId);
    }
  }

  public enterBuildMode(buildingType: string) {
    if (this.phaserScene) {
      this.phaserScene.events.emit('enter-build-mode', buildingType);
    }
  }

  public cancelBuildMode() {
    if (this.phaserScene) {
      this.phaserScene.events.emit('cancel-build-mode');
    }
  }

  public nextDay() {
    if (this.phaserScene) {
      this.phaserScene.events.emit('end-day');
    }
  }

  public setTradeOffer(faction: string, offer: number) {
    // future integration
  }

  public submitTrade(faction: string, qty: number, bluff: boolean) {
    if (this.phaserScene && this.phaserScene.handleTrade) {
      this.phaserScene.handleTrade(faction, qty, bluff);
    }
  }

  public setTaxLevel(level: number) {
    if (this.phaserScene) {
      this.phaserScene.state.steuerStufe = level;
      this.phaserScene.updateUI();
    }
  }

  public researchTech(techId: string) {
    if (this.phaserScene && this.phaserScene.researchTech) {
      this.phaserScene.researchTech(techId);
    }
  }

  public startWithPreset(preset: string) {
    if (this.phaserScene && this.phaserScene.startWithPreset) {
      this.phaserScene.startWithPreset(preset);
    }
  }

  public enqueueEducation(type: string, qty: number): number {
    if (this.phaserScene && this.phaserScene.enqueueEducation) {
      return this.phaserScene.enqueueEducation(type, qty);
    }
    return 0;
  }

  public enqueueDroneProduction(qty: number): number {
    if (this.phaserScene) {
      this.phaserScene.events.emit('produce-drones', qty);
      return 1;
    }
    return 0;
  }
}
