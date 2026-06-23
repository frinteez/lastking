import { Component, OnInit, AfterViewInit } from '@angular/core';
import { GameCanvasComponent } from './features/game/game-canvas/game-canvas.component';
import { HudComponent } from './features/game/hud/hud.component';
import { SidebarComponent } from './features/game/sidebar/sidebar.component';
import { StartMenuComponent } from './features/game/start-menu/start-menu.component';
import { ModalsContainerComponent } from './features/game/modals/modals-container.component';
import { DailySummaryComponent } from './features/game/daily-summary/daily-summary.component';
import { ToastContainerComponent } from './features/game/toast/toast-container.component';
import { CursorTrailComponent } from './features/game/cursor-trail/cursor-trail.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [GameCanvasComponent, HudComponent, SidebarComponent, StartMenuComponent, ModalsContainerComponent, DailySummaryComponent, ToastContainerComponent, CursorTrailComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'frontend';

  ngOnInit() {}

  ngAfterViewInit() {
    // Legacy UIManager removed
  }
}
