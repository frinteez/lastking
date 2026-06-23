import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-construction-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="construction-indicator">
      <div class="construction-badge">
        <span class="days-text">
          {{ displayDays }}<span class="blink-cursor">|</span> {{ displayLabel }}
        </span>
        <br>
        <span class="progress-bar">
          [<span class="filled-blocks">{{ filledChars }}</span><span class="empty-blocks">{{ emptyChars }}</span>]
        </span>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      position: absolute;
      left: 0; top: 0;
      transform-origin: top left;
      pointer-events: none;
      z-index: 5;
      /* Box sizing and dimensions handled by game-canvas bindings */
    }
    
    .construction-indicator {
      width: 100%; height: 100%;
      background: repeating-linear-gradient(
        45deg,
        rgba(5, 5, 5, 0.8),
        rgba(5, 5, 5, 0.8) 10px,
        rgba(0, 229, 255, 0.15) 10px,
        rgba(0, 229, 255, 0.15) 20px
      );
      border: 2px solid var(--accent-cyan);
      box-shadow: inset 0 0 20px rgba(0, 229, 255, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: monospace;
      color: var(--accent-cyan);
      box-sizing: border-box;
      background-size: 56.568px 56.568px; /* 2 periods of 20px * sqrt(2) */
      animation: stripe-flow 3s linear infinite;
    }

    @keyframes stripe-flow {
      0% { background-position: 0 0; }
      100% { background-position: 56.568px -56.568px; }
    }

    .construction-badge {
      background: transparent;
      padding: 0;
      text-align: center;
      text-shadow: 0 0 5px var(--accent-cyan);
      line-height: 1.2;
    }

    .days-text {
      font-size: 14px;
      font-weight: bold;
      display: inline-block;
      letter-spacing: 1px;
    }

    .blink-cursor {
      animation: blink 1s step-end infinite;
      display: inline-block;
      margin: 0 -2px;
    }

    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }

    .progress-bar {
      font-size: 10px;
      letter-spacing: 2px;
      display: inline-block;
      margin-top: 4px;
    }

    .filled-blocks {
      color: var(--accent-cyan);
      text-shadow: 0 0 8px var(--accent-cyan), 0 0 12px var(--accent-cyan);
      animation: text-pulse 1.5s infinite alternate;
    }

    .empty-blocks {
      color: rgba(0, 229, 255, 0.3);
      text-shadow: none;
    }

    @keyframes text-pulse {
      0% { opacity: 0.7; text-shadow: 0 0 4px var(--accent-cyan); }
      100% { opacity: 1; text-shadow: 0 0 12px var(--accent-cyan), 0 0 18px var(--accent-cyan); }
    }
  `]
})
export class ConstructionOverlayComponent implements OnChanges {
  @Input() daysRemaining: number = 0;
  @Input() totalDays: number = 3;
  
  displayDays: string = '';
  displayLabel: string = '';
  filledChars: string = '';
  emptyChars: string = '';
  
  private isAnimating: boolean = false;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['daysRemaining'] && !changes['daysRemaining'].isFirstChange()) {
      const prev = changes['daysRemaining'].previousValue;
      const curr = changes['daysRemaining'].currentValue;
      this.animateTextChange(prev, curr);
    } else {
      this.displayDays = this.daysRemaining.toString();
      this.displayLabel = this.daysRemaining === 1 ? 'DAY' : 'DAYS';
      this.updateProgressChars(this.daysRemaining);
    }
  }

  private animateTextChange(prev: number, curr: number) {
    if (this.isAnimating) return;
    this.isAnimating = true;
    
    // Simulate backspace: delete the number
    this.displayDays = '';
    
    setTimeout(() => {
      // Simulate typing: update label and type new number
      this.displayDays = curr.toString();
      this.displayLabel = curr === 1 ? 'DAY' : 'DAYS';
      this.updateProgressChars(curr);
      this.isAnimating = false;
    }, 250);
  }

  private updateProgressChars(days: number) {
    const total = this.totalDays > 0 ? this.totalDays : 3;
    const remaining = Math.max(0, days);
    const filledCount = Math.max(0, total - remaining);
    
    this.filledChars = '█'.repeat(filledCount);
    this.emptyChars = '░'.repeat(remaining);
  }
}
