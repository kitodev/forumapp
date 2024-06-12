import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private loggedInSource = new BehaviorSubject<boolean>(false);
  currentLoggedIn = this.loggedInSource.asObservable();

  constructor() { }

  changeLoggedInStatus(status: boolean) {
    this.loggedInSource.next(status);
  }
}
