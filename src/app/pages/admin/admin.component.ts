import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { RoleDTO } from '../../dtos/role.dto';
import { UserDTO } from '../../dtos/user.dto';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  roles: RoleDTO[] = [];
  selectedRole: RoleDTO | null = null;
  roleName: string = '';
  permissions: { [key: string]: boolean } = {};
  rolePermissions: { [key: number]: string } = {
    1: 'Read Comments',
    2: 'Add/Delete Comments',
    4: 'Add/Delete Topics',
    8: 'Delete Others\' Comments/Topics'
  };
  usersWithRole: UserDTO[] = [];
  otherUsers: UserDTO[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.apiService.getRoles().subscribe(roles => {
      this.roles = roles;
    }, error => {
      console.error('Error loading roles:', error);
    });
  }

  selectRole(event: Event): void {
    const roleId = parseInt((event.target as HTMLSelectElement).value ?? '-1');
    const role = this.roles.find(r => r.id === roleId);
    if (!role) return;

    this.selectedRole = role;
    this.roleName = role.name;
    this.permissions = {
      readComments: !!(role.rights & 1),
      addDeleteComments: !!(role.rights & 2),
      addDeleteTopics: !!(role.rights & 4),
      deleteOthersCommentsTopics: !!(role.rights & 8)
    };
    this.loadUsersForRole(role.id);
  }

  updateRole(): void {
    if (!this.selectedRole) return;

    const updatedRights = (this.permissions['readComments'] ? 1 : 0)
      + (this.permissions['addDeleteComments'] ? 2 : 0)
      + (this.permissions['addDeleteTopics'] ? 4 : 0)
      + (this.permissions['deleteOthersCommentsTopics'] ? 8 : 0);

    const updatedRole = {
      ...this.selectedRole,
      name: this.roleName,
      rights: updatedRights
    };

    this.apiService.updateRole(updatedRole.id, updatedRole).subscribe(() => {
      alert('Role updated successfully');
      this.loadRoles(); // Reload roles to reflect changes
    }, error => {
      console.error('Error updating role:', error);
    });
  }

  loadUsersForRole(roleId: number): void {
    this.apiService.getUsersOfRole(roleId).subscribe(users => {
      this.usersWithRole = users;
      this.apiService.getUsers().subscribe(allUsers => {
        this.otherUsers = allUsers.filter(user => user.role !== roleId);
      }, error => {
        console.error('Error loading users:', error);
      });
    }, error => {
      console.error('Error loading users for role:', error);
    });
  }

  drop(event: CdkDragDrop<UserDTO[]>): void {
    const user = event.previousContainer.data[event.previousIndex];
    console.log("Event: ", event);
    console.log("User: ", user);

    if (event.container.id === 'usersWithRoleList') {
      user.role = this.selectedRole?.id ?? user.role;
    } else {
      user.role = 1; // default role
    }

    console.log("Updated User Role: ", user.role);
    console.log("Previous Container ID: ", event.previousContainer.id);
    console.log("Current Container ID: ", event.container.id);

    this.apiService.updateUser(user.id, user).subscribe(() => {
      console.log("User role updated in the backend.");
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      console.log("Items transferred between lists.");
      this.loadUsersForRole(this.selectedRole?.id ?? -1); // Reload users after update
    }, error => {
      console.error('Error updating user:', error);
    });
  }


  onPermissionChange(event: any, key: string): void {
    this.permissions[key] = event.target.checked;
  }
}
