import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GameState } from './game-state.model';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class GameBridgeService {
  private gameStateSubject = new BehaviorSubject<GameState | null>(null);
  gameState$ = this.gameStateSubject.asObservable();

  private phaserScene: any = null;

  constructor(private toastService: ToastService) {}

  public handleToast(msg: string, type: 'error' | 'system') {
    if (type === 'error') {
      this.toastService.showError(msg);
    } else {
      this.toastService.showSystem(msg);
    }
  }

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

  private dailyBriefingSubject = new BehaviorSubject<{ show: boolean, events: string[] }>({ show: false, events: [] });
  dailyBriefing$ = this.dailyBriefingSubject.asObservable();

  private isAdvancingDay = false;
  private currentDayEvents: string[] = [];

  public handleCosmicEvent(msg: string) {
    if (this.isAdvancingDay) {
      this.currentDayEvents.push(msg);
    }
  }

  public nextDay() {
    this.isAdvancingDay = true;
    this.currentDayEvents = [];
    if (this.phaserScene) {
      this.phaserScene.events.emit('end-day');
    }
    this.isAdvancingDay = false;
    
    // Trigger the Daily Briefing UI if there are events
    if (this.currentDayEvents.length > 0) {
      this.dailyBriefingSubject.next({ show: true, events: [...this.currentDayEvents] });
    }
  }

  public closeDailyBriefing() {
    this.dailyBriefingSubject.next({ show: false, events: [] });
  }

  public submitTrade(faction: string, product: string, payment: string, qty: number, bluff: boolean): string {
    if (this.phaserScene && this.phaserScene.handleTrade) {
      return this.phaserScene.handleTrade(faction, product, payment, qty, bluff);
    }
    return '';
  }

  public setTaxLevel(level: number) {
    if (this.phaserScene) {
      this.phaserScene.state.taxLevel = level;
      this.phaserScene.events.emit('state-updated', this.phaserScene.state);
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
