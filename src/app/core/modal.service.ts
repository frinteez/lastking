import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ModalType = 'drone' | 'academy' | 'ministries' | 'geopolitics' | 'education' | 'endgame' | 'trade' | 'school' | 'uni' | 'tech' | null;

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private activeModalSubject = new BehaviorSubject<{type: ModalType, data?: any}>({type: null});
  activeModal$ = this.activeModalSubject.asObservable();

  open(modal: ModalType, data?: any) {
    this.activeModalSubject.next({type: modal, data});
  }

  close() {
    this.activeModalSubject.next({type: null});
  }
}
