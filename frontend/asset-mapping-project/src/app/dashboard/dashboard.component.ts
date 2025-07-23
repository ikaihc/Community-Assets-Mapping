import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddUserFormComponent } from '../add-user-form/add-user-form.component';
import { EditUserFormComponent } from '../edit-user-form/edit-user-form.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, AddUserFormComponent, EditUserFormComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  activeView: 'users' | 'assets' | 'add-user' | 'edit-user' = 'users';
  selectedUser: any = null;

  //dummy data used
  currentUser = {
    initials: 'JD',
    email: 'janedoe@email.com',
    firstName: 'Jane',
    lastName: 'Doe',
    role: 'admin',
    jobTitle: 'website administrator'
  };
  users = [
    {
      id: 1,
      email: 'janedoe@email.com',
      name: 'Jane Doe',
      role: 'admin',
      jobTitle: 'website administrator',
      dateCreated: '21-03-2022',
      lastModified: '23-03-2022',
      isActive: false
    },
    {
      id: 2,
      email: 'janedoe@email.com',
      name: 'Jane Doe',
      role: 'navigator',
      jobTitle: 'social worker',
      dateCreated: '21-03-2022',
      lastModified: '23-03-2022',
      isActive: false
    },
    {
      id: 3,
      email: 'janedoe@email.com',
      name: 'Jane Doe',
      role: 'admin',
      jobTitle: 'website administrator',
      dateCreated: '21-03-2022',
      lastModified: '23-03-2022',
      isActive: false
    },
    {
      id: 4,
      email: 'janedoe@email.com',
      name: 'Jane Doe',
      role: 'admin',
      jobTitle: 'website administrator',
      dateCreated: '21-03-2022',
      lastModified: '23-03-2022',
      isActive: false
    },
    {
      id: 5,
      email: 'janedoe@email.com',
      name: 'Jane Doe',
      role: 'admin',
      jobTitle: 'website administrator',
      dateCreated: '21-03-2022',
      lastModified: '23-03-2022',
      isActive: false
    },
    {
      id: 6,
      email: 'janedoe@email.com',
      name: 'Jane Doe',
      role: 'admin',
      jobTitle: 'website administrator',
      dateCreated: '21-03-2022',
      lastModified: '23-03-2022',
      isActive: false
    },
    {
      id: 7,
      email: 'janedoe@email.com',
      name: 'Jane Doe',
      role: 'admin',
      jobTitle: 'website administrator',
      dateCreated: '21-03-2022',
      lastModified: '23-03-2022',
      isActive: false
    },
    {
      id: 8,
      email: 'janedoe@email.com',
      name: 'Jane Doe',
      role: 'admin',
      jobTitle: 'website administrator',
      dateCreated: '21-03-2022',
      lastModified: '23-03-2022',
      isActive: false
    },
    {
      id: 9,
      email: 'janedoe@email.com',
      name: 'Jane Doe',
      role: 'admin',
      jobTitle: 'website administrator',
      dateCreated: '21-03-2022',
      lastModified: '23-03-2022',
      isActive: false
    }
  ];


  assets = [
    {
      id: 1,
      name: 'Good Food on the Move',
      status: 'Approved',
      dateCreated: '21-03-2022',
      lastModified: '23-03-2022',
      isActive: false
    },
    {
      id: 2,
      name: 'Bike Repair Station',
      status: 'Pending',
      dateCreated: '21-03-2022',
      lastModified: '23-03-2022',
      isActive: false
    },
    {
      id: 3,
      name: 'Good Food on the Move',
      status: 'Rejected',
      dateCreated: '21-03-2022',
      lastModified: '23-03-2022',
      isActive: false
    },
    {
      id: 4,
      name: 'Bike Repair Station',
      status: 'Pending',
      dateCreated: '21-03-2022',
      lastModified: '23-03-2022',
      isActive: false
    },
    {
      id: 5,
      name: 'Good Food on the Move',
      status: 'Approved',
      dateCreated: '21-03-2022',
      lastModified: '23-03-2022',
      isActive: false
    },
    {
      id: 6,
      name: 'Bike Repair Station',
      status: 'Pending',
      dateCreated: '21-03-2022',
      lastModified: '23-03-2022',
      isActive: false
    },
    {
      id: 7,
      name: 'Good Food on the Move',
      status: 'Approved',
      dateCreated: '21-03-2022',
      lastModified: '23-03-2022',
      isActive: false
    },
    {
      id: 8,
      name: 'Bike Repair Station',
      status: 'Pending',
      dateCreated: '21-03-2022',
      lastModified: '23-03-2022',
      isActive: false
    },
    {
      id: 9,
      name: 'Good Food on the Move',
      status: 'Approved',
      dateCreated: '21-03-2022',
      lastModified: '23-03-2022',
      isActive: false
    }
  ];


  userSearchType = 'name';
  userSearchTerm = '';
  assetSearchType = 'name';
  assetSearchTerm = '';

  constructor() { }

  ngOnInit(): void {
  }


  onAddNewAsset(): void {
    console.log('Add new asset clicked');
    // TODO: Implement add asset functionality
  }

  onActivateUser(userId: number): void {
    console.log('Activate user:', userId);
    // TODO: Implement user activation
  }

  onToggleUserStatus(userId: number): void {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.isActive = !user.isActive;
      console.log(`User ${userId} is now ${user.isActive ? 'active' : 'inactive'}`);
      // TODO: Implement API call to update user status on server
    }
  }

  onEditUser(userId: number): void {
    console.log('Edit user:', userId);
    this.selectedUser = this.users.find(user => user.id === userId);
    if (this.selectedUser) {
      this.setActiveView('edit-user');
    }
}

  onActivateAsset(assetId: number): void {
    console.log('Activate asset:', assetId);
    // TODO: Implement asset activation
  }

  onEditAsset(assetId: number): void {
    console.log('Edit asset:', assetId);
    // TODO: Implement asset editing
  }


  setActiveView(view: 'users' | 'assets' | 'add-user' | 'edit-user'): void {
    this.activeView = view;
  }

  onAddNewUser(): void {
    console.log('Add new user clicked');
    this.setActiveView('add-user');
  }

  onBackToUsers(): void {
    this.setActiveView('users');
  }

  onUserAdded(newUser: any): void {
    this.users.push(newUser);
    console.log('New user added:', newUser);
    this.setActiveView('users');
  }

  onUserUpdated(updatedUser: any): void {
    const index = this.users.findIndex(user => user.id === updatedUser.id);
    if (index !== -1) {
      this.users[index] = updatedUser;
      console.log('User updated:', updatedUser);
      this.setActiveView('users');
    }
  }
  

  getFilteredUsers() {
    return this.users.filter(user => {
      if (!this.userSearchTerm) return true;
      
      const searchTerm = this.userSearchTerm.toLowerCase();
      switch(this.userSearchType) {
        case 'name':
          return user.name.toLowerCase().includes(searchTerm);
        case 'email':
          return user.email.toLowerCase().includes(searchTerm);
        case 'role':
          return user.role.toLowerCase().includes(searchTerm);
        default:
          return true;
      }
    });
  }

  getFilteredAssets() {
    return this.assets.filter(asset => {
      if (!this.assetSearchTerm) return true;
      
      const searchTerm = this.assetSearchTerm.toLowerCase();
      switch(this.assetSearchType) {
        case 'name':
          return asset.name.toLowerCase().includes(searchTerm);
        case 'status':
          return asset.status.toLowerCase().includes(searchTerm);
        default:
          return true;
      }
    });
  }

  onToggleAssetStatus(assetId: number): void {
  const asset = this.assets.find(a => a.id === assetId);
  if (asset) {
    asset.isActive = !asset.isActive;
    console.log(`Asset ${assetId} is now ${asset.isActive ? 'active' : 'inactive'}`);
  }
  }
}