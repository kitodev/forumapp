import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  errorMessage: string = '';

  constructor(private fb: FormBuilder, private apiService: ApiService, private router: Router, private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      rememberMe: [false]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { email, password, rememberMe } = this.loginForm.value;
      this.apiService.getUsers().subscribe(users => {
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
          user.loggedIn = true;
          localStorage.setItem('currentUser', JSON.stringify(user));
          if (rememberMe) {
            localStorage.setItem('rememberMe', JSON.stringify(user));
          }
          this.notificationService.changeLoggedInStatus(true);
          this.router.navigate(['/home']);
        } else {
          this.errorMessage = 'Invalid email or password';
        }
      });
    }
  }

  ngAfterViewInit() {
    const rememberedUser = localStorage.getItem('rememberMe');
    if (rememberedUser) {
      const user = JSON.parse(rememberedUser);
      this.loginForm.patchValue({
        email: user.email,
        password: user.password,
        rememberMe: true
      });
    }
  }
}
