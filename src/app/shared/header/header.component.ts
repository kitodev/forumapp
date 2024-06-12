import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  loggedIn!: boolean;

  constructor(private router: Router, private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.currentLoggedIn.subscribe(loggedIn => {
      this.loggedIn = loggedIn;
    });

    this.loggedIn = (localStorage.getItem('currentUser')?.length ?? 0 ) > 0 ;
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.loggedIn = false;
    this.router.navigate(['/login']);
  }
}
