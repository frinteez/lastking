import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: number;
  msg: string;
  type: 'error' | 'system';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toastsSubject.asObservable();
  private nextId = 0;

  showError(msg: string) {
    this.addToast(msg, 'error');
  }

  showSystem(msg: string) {
    this.addToast(msg, 'system');
  }

  private addToast(msg: string, type: 'error' | 'system') {
    const id = this.nextId++;
    const current = this.toastsSubject.value;
    
    // Limit to 5 toasts
    const newToasts = [...current, { id, msg, type }];
    if (newToasts.length > 5) {
      newToasts.shift();
    }
    
    this.toastsSubject.next(newToasts);

    setTimeout(() => {
      this.remove(id);
    }, 4000);
  }

  remove(id: number) {
    const current = this.toastsSubject.value;
    this.toastsSubject.next(current.filter(t => t.id !== id));
  }
}
