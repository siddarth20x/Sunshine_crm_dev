import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ReminderSidebarInfo {
  status: 'red' | 'green' | '';
  count: number;
}

@Injectable({
  providedIn: 'root'
})
export class SidebarStatusService {
  private reminderInfoSource = new BehaviorSubject<ReminderSidebarInfo>(this.getInitialState());
  reminderInfo$ = this.reminderInfoSource.asObservable();

  constructor() { }

  private getInitialState(): ReminderSidebarInfo {
    const savedState = sessionStorage.getItem('reminderState');
    if (savedState) {
      return JSON.parse(savedState);
    }
    return { status: '', count: 0 };
  }

  updateReminderInfo(status: 'red' | 'green' | '', count: number): void {
    const newState = { status, count };
    sessionStorage.setItem('reminderState', JSON.stringify(newState));
    this.reminderInfoSource.next(newState);
  }
} 