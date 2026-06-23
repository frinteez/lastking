import { Component, HostListener, OnInit, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  type: 'dot' | 'cross' | 'sparkle';
  driftX: number;
  driftY: number;
}

@Component({
  selector: 'app-cursor-trail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cursor-trail-container">
      <div *ngFor="let star of stars; trackBy: trackByStar"
           class="cosmic-star"
           [class.cross]="star.type === 'cross'"
           [class.sparkle]="star.type === 'sparkle'"
           [style.left.px]="star.x"
           [style.top.px]="star.y"
           [style.width.px]="star.size"
           [style.height.px]="star.size"
           [style.setProperty]="'--drift-x, ' + star.driftX + 'px'"
           [style.--drift-x]="star.driftX + 'px'"
           [style.--drift-y]="star.driftY + 'px'"
           [style.background-color]="star.type === 'dot' ? star.color : 'transparent'"
           [style.color]="star.color"
           [style.box-shadow]="star.type === 'dot' ? '0 0 ' + (star.size * 3) + 'px ' + star.color + ', 0 0 ' + (star.size * 6) + 'px ' + star.color + '44' : 'none'">
        <span *ngIf="star.type === 'cross'" class="cross-h"></span>
        <span *ngIf="star.type === 'cross'" class="cross-v"></span>
        <span *ngIf="star.type === 'sparkle'" class="sparkle-inner">✦</span>
      </div>
    </div>
  `,
  styleUrl: './cursor-trail.component.css'
})
export class CursorTrailComponent implements OnInit, OnDestroy {
  stars: Star[] = [];
  private starId = 0;
  private lastSpawnTime = 0;
  private colors = ['#00e5ff', '#b57aff', '#ffffff', '#ff6bff', '#7af7ff'];

  ngOnInit() {}
  ngOnDestroy() { this.stars = []; }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    // Only spawn stars when the cursor is over the nebula (NOT over the map/planet)
    if (this.isOverMap(e.clientX, e.clientY)) return;

    const now = performance.now();
    if (now - this.lastSpawnTime < 40) return; // throttle ~25fps
    this.lastSpawnTime = now;

    // Spawn 1-3 particles per move
    const count = Math.random() < 0.3 ? 2 : 1;
    for (let i = 0; i < count; i++) {
      this.spawnStar(e.clientX, e.clientY);
    }
  }

  private isOverMap(clientX: number, clientY: number): boolean {
    const canvas = document.querySelector('#game-container canvas') as HTMLCanvasElement;
    if (!canvas) return false;

    // window.game is the GameScene instance directly (set via window.game = this in create())
    const scene = (window as any).game;
    if (!scene || !scene.cameras || !scene.cameras.main) return false;

    try {
      const cam = scene.cameras.main;
      const tileSize = scene.TILE_SIZE;
      const mapW = scene.MAP_W * tileSize;
      const mapH = scene.MAP_H * tileSize;

      const canvasRect = canvas.getBoundingClientRect();

      // Map world coords start at (0,0) - convert to screen
      const mapScreenX = (0 - cam.worldView.x) * cam.zoom + canvasRect.left;
      const mapScreenY = (0 - cam.worldView.y) * cam.zoom + canvasRect.top;
      const mapScreenW = mapW * cam.zoom;
      const mapScreenH = mapH * cam.zoom;

      return (
        clientX >= mapScreenX &&
        clientX <= mapScreenX + mapScreenW &&
        clientY >= mapScreenY &&
        clientY <= mapScreenY + mapScreenH
      );
    } catch {
      return false;
    }
  }

  spawnStar(x: number, y: number) {
    const id = this.starId++;
    const types: ('dot' | 'cross' | 'sparkle')[] = ['dot', 'dot', 'dot', 'cross', 'sparkle'];
    const type = types[Math.floor(Math.random() * types.length)];
    const size = type === 'dot' ? Math.random() * 3 + 2
                : type === 'cross' ? Math.random() * 6 + 4
                : Math.random() * 10 + 6;
    const color = this.colors[Math.floor(Math.random() * this.colors.length)];
    const offsetX = (Math.random() - 0.5) * 20;
    const offsetY = (Math.random() - 0.5) * 20;
    const driftX = (Math.random() - 0.5) * 30;
    const driftY = -(Math.random() * 20 + 10);

    const star: Star = { id, x: x + offsetX, y: y + offsetY, size, color, type, driftX, driftY };
    this.stars.push(star);

    setTimeout(() => {
      this.stars = this.stars.filter(s => s.id !== id);
    }, 900);
  }

  trackByStar(_: number, star: Star) { return star.id; }
}
