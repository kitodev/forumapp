import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { UserDTO } from '../../dtos/user.dto';
import { RoleDTO } from '../../dtos/role.dto';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  currentUser!: UserDTO;
  role!: RoleDTO;
  permissions = {
    readComments: false,
    addDeleteComments: false,
    addDeleteTopics: false,
    deleteOthersCommentsTopics: false
  };

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private authService: AuthService
  ) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(5)]],
      email: ['', [Validators.required, Validators.email]]
    });

    this.passwordForm = this.fb.group({
      password1: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)]],
      password2: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      this.loadUserData();
      this.loadUserRole();
    });
  }

  loadUserData(): void {
    this.apiService.getUser(this.currentUser.id).subscribe(user => {
      this.profileForm.patchValue({
        name: user.name,
        email: user.email
      });
    });
  }

  loadUserRole(): void {
    this.apiService.getRole(this.currentUser.role).subscribe(role => {
      this.role = role;
      this.setPermissions(role.rights);
    });
  }

  setPermissions(rights: number): void {
    this.permissions.readComments = (rights & 1) === 1;
    this.permissions.addDeleteComments = (rights & 2) === 2;
    this.permissions.addDeleteTopics = (rights & 4) === 4;
    this.permissions.deleteOthersCommentsTopics = (rights & 8) === 8;
  }

  onUpdateProfile(): void {
    if (this.profileForm.valid) {
      this.apiService.updateUser(this.currentUser.id, this.profileForm.value).subscribe(() => {
        alert('Profile updated successfully');
      });
    }
  }

  onChangePassword(): void {
    if (this.passwordForm.valid) {
      const { password1, password2 } = this.passwordForm.value;
      this.apiService.changePassword(this.currentUser.id, password1, password2).subscribe(() => {
        alert('Password changed successfully');
        this.passwordForm.reset();
      });
    }
  }

  passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
    return form.get('password1')?.value === form.get('password2')?.value ? null : { mismatch: true };
  }
}
