import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameBridgeService } from '../../../core/game-bridge.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-daily-summary',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="show" class="fixed inset-0 z-[100] bg-black/60 flex flex-col justify-end pointer-events-auto">
      <div class="w-full max-w-4xl mx-auto mb-8 bg-[#050505] border-t-2 border-l-2 border-r-2 border-b-2 border-sci-cyan text-sci-cyan p-6 shadow-[0_0_30px_rgba(0,240,255,0.2)] font-mono relative overflow-hidden" (click)="skipAnimation()">
        <!-- CRT Scanline Effect Overlay -->
        <div class="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-10 opacity-50"></div>
        
        <h2 class="text-xl font-bold mb-4 tracking-widest text-amber-500 border-b border-amber-500/50 pb-2 uppercase relative z-20">
          > SECURE LINK ESTABLISHED. DAILY BRIEFING FOR HIS MAJESTY.
        </h2>
        
        <div class="flex flex-col gap-2 min-h-[150px] relative z-20 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
          <div *ngFor="let line of printedLines; let i = index" 
               class="text-sm md:text-base whitespace-pre-wrap leading-relaxed animate-fade-in"
               [ngClass]="getLineColor(line)">
            {{ line }}
          </div>
          
          <div *ngIf="isAnimating" class="w-2 h-5 bg-sci-cyan animate-pulse mt-2 inline-block"></div>
        </div>

        <div class="mt-6 flex justify-end relative z-20 h-10">
          <button *ngIf="!isAnimating" 
                  class="bg-sci-cyan text-black px-6 py-2 font-bold hover:bg-white transition-colors shadow-[0_0_15px_rgba(0,240,255,0.5)] uppercase tracking-widest"
                  (click)="acknowledge($event)">
            [ ACKNOWLEDGE ]
          </button>
          <div *ngIf="isAnimating" class="text-xs text-gray-500 self-end animate-pulse">
            Click anywhere to skip...
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(5px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fade-in 0.2s ease-out forwards;
    }
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: rgba(0,0,0,0.3);
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #00F0FF;
    }
  `]
})
export class DailySummaryComponent implements OnInit, OnDestroy {
  show = false;
  events: string[] = [];
  printedLines: string[] = [];
  isAnimating = false;
  
  private sub: Subscription | null = null;
  private animInterval: any = null;

  constructor(private bridge: GameBridgeService) {}

  ngOnInit() {
    this.sub = this.bridge.dailyBriefing$.subscribe(data => {
      if (data.show) {
        this.show = true;
        this.events = data.events;
        this.startAnimation();
      } else {
        this.show = false;
        this.stopAnimation();
      }
    });
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
    this.stopAnimation();
  }

  startAnimation() {
    this.printedLines = [];
    this.isAnimating = true;
    let lineIndex = 0;

    this.stopAnimation(); // clear any existing

    this.animInterval = setInterval(() => {
      if (lineIndex < this.events.length) {
        let text = this.events[lineIndex];
        // Ensure log prefix if no emoji
        if (!text.startsWith('❌') && !text.startsWith('⚠️') && !text.startsWith('💀') && !text.startsWith('✅') && !text.startsWith('👶') && !text.startsWith('🏗️') && !text.startsWith('🔥') && !text.startsWith('🔴') && !text.startsWith('✊') && !text.startsWith('☢️') && !text.startsWith('📚') && !text.startsWith('🎓') && !text.startsWith('👨‍💼') && !text.startsWith('👨‍🔬')) {
           text = `[LOG] ${text}`;
        }
        this.printedLines.push(text);
        lineIndex++;
      } else {
        this.isAnimating = false;
        this.stopAnimation();
      }
    }, 400); // 400ms per line
  }

  stopAnimation() {
    if (this.animInterval) {
      clearInterval(this.animInterval);
      this.animInterval = null;
    }
  }

  skipAnimation() {
    if (!this.isAnimating) return;
    this.stopAnimation();
    
    // Fill remaining lines
    const remaining = this.events.slice(this.printedLines.length);
    remaining.forEach(text => {
      if (!text.startsWith('❌') && !text.startsWith('⚠️') && !text.startsWith('💀') && !text.startsWith('✅') && !text.startsWith('👶') && !text.startsWith('🏗️') && !text.startsWith('🔥') && !text.startsWith('🔴') && !text.startsWith('✊') && !text.startsWith('☢️') && !text.startsWith('📚') && !text.startsWith('🎓') && !text.startsWith('👨‍💼') && !text.startsWith('👨‍🔬')) {
         text = `[LOG] ${text}`;
      }
      this.printedLines.push(text);
    });
    
    this.isAnimating = false;
  }

  acknowledge(event: Event) {
    event.stopPropagation();
    this.bridge.closeDailyBriefing();
  }

  getLineColor(line: string): string {
    if (line.includes('CRITICAL') || line.includes('💀') || line.includes('🔥') || line.includes('🔴') || line.includes('☢️') || line.includes('❌') || line.includes('abandoned')) {
      return 'text-red-500';
    }
    if (line.includes('⚠️') || line.includes('✊') || line.includes('strike')) {
      return 'text-amber-400';
    }
    if (line.includes('✅') || line.includes('👶') || line.includes('🏗️') || line.includes('recovered') || line.includes('graduated')) {
      return 'text-green-400';
    }
    return 'text-sci-cyan';
  }
}
