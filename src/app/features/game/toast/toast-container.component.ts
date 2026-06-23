import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';
import { Toast, ToastService } from '../../../core/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-4 right-4 z-[10000] flex flex-col-reverse gap-2 pointer-events-none w-80 font-mono">
      <div *ngFor="let toast of toasts" 
           class="toast-item pointer-events-auto shadow-lg"
           [ngClass]="toast.type === 'error' ? 'border-red-500 bg-red-950/90 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.5)] error-glitch' : 'border-amber-400 bg-amber-950/90 text-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]'"
           style="border-width: 2px; padding: 12px; backdrop-filter: blur(4px);">
        
        <div class="flex justify-between items-start">
          <div class="flex items-start gap-2">
            <span *ngIf="toast.type === 'error'" class="text-lg leading-none">❌</span>
            <span *ngIf="toast.type === 'system'" class="text-lg leading-none">📜</span>
            <div class="text-sm font-bold uppercase tracking-wider">{{ toast.msg }}</div>
          </div>
          <button (click)="remove(toast.id)" class="text-gray-500 hover:text-white transition-colors">
            [X]
          </button>
        </div>
        
        <div *ngIf="toast.type === 'error'" class="absolute inset-0 bg-red-500/10 animate-pulse pointer-events-none"></div>
      </div>
    </div>
  `,
  styles: [`
    .toast-item {
      animation: slideInRight 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
      transform-origin: right center;
      position: relative;
      overflow: hidden;
    }
    
    @keyframes slideInRight {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    
    .error-glitch {
      animation: slideInRight 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards, glitch 2s linear infinite;
    }

    @keyframes glitch {
      2%, 64% { transform: translate(2px, 0) skew(0deg); }
      4%, 60% { transform: translate(-2px, 0) skew(0deg); }
      62% { transform: translate(0, 0) skew(5deg); }
    }
  `]
})
export class ToastContainerComponent implements OnInit {
  toasts: Toast[] = [];

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.toastService.toasts$.subscribe(toasts => {
      this.toasts = toasts;
    });
  }

  remove(id: number) {
    this.toastService.remove(id);
  }
}
