import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {NotificationService} from "./notification.service";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;

  constructor(private notificationService: NotificationService) {
    const storedUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    this.currentUserSubject = new BehaviorSubject<any>(storedUser);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

  setCurrentUser(user: any) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.notificationService.changeLoggedInStatus(true);
    this.currentUserSubject.next(user);
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.notificationService.changeLoggedInStatus(false);
    this.currentUserSubject.next(null);
  }
}
