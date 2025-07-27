import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddUserFormComponent } from '../add-user-form/add-user-form.component';
import { EditUserFormComponent } from '../edit-user-form/edit-user-form.component';
import { Router } from '@angular/router';
// Material imports
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, AddUserFormComponent, EditUserFormComponent, MatSelectModule, MatFormFieldModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  activeView: 'users' | 'assets' | 'add-user' | 'edit-user' = 'users';
  selectedUser: any = null;
  userSortField: string = '';
  userSortDirection: 'asc' | 'desc' = 'asc';
  assetSortField: string = '';
  assetSortDirection: 'asc' | 'desc' = 'asc';
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
    email: 'user1@example.com',
    name: 'Jane Doe',
    role: 'Admin',
    jobTitle: 'System Administrator',
    dateCreated: '15-01-2022',
    lastModified: '20-01-2022',
    isActive: true
  },
  {
    id: 2,
    email: 'user2@example.com',
    name: 'Jane Doe',
    role: 'User',
    jobTitle: 'Developer',
    dateCreated: '22-03-2022',
    lastModified: '25-03-2022',
    isActive: false
  },
  {
    id: 3,
    email: 'user3@example.com',
    name: 'Jane Doe',
    role: 'Manager',
    jobTitle: 'Project Manager',
    dateCreated: '10-02-2022',
    lastModified: '15-02-2022',
    isActive: true
  },
  {
    id: 4,
    email: 'user4@example.com',
    name: 'Jane Doe',
    role: 'User',
    jobTitle: 'Designer',
    dateCreated: '05-04-2022',
    lastModified: '08-04-2022',
    isActive: true
  },
  {
    id: 5,
    email: 'user5@example.com',
    name: 'Jane Doe',
    role: 'Admin',
    jobTitle: 'Database Admin',
    dateCreated: '30-12-2021',
    lastModified: '02-01-2022',
    isActive: false
  },
  {
    id: 6,
    email: 'user6@example.com',
    name: 'Jane Doe',
    role: 'User',
    jobTitle: 'Marketing Specialist',
    dateCreated: '18-05-2022',
    lastModified: '22-05-2022',
    isActive: true
  },
  {
    id: 7,
    email: 'user7@example.com',
    name: 'Jane Doe',
    role: 'Manager',
    jobTitle: 'Engineering Manager',
    dateCreated: '12-06-2022',
    lastModified: '16-06-2022',
    isActive: true
  },
  {
    id: 8,
    email: 'user8@example.com',
    name: 'Jane Doe',
    role: 'User',
    jobTitle: 'Content Writer',
    dateCreated: '28-02-2022',
    lastModified: '03-03-2022',
    isActive: false
  },
  {
    id: 9,
    email: 'user9@example.com',
    name: 'Jane Doe',
    role: 'Admin',
    jobTitle: 'Security Administrator',
    dateCreated: '07-07-2022',
    lastModified: '11-07-2022',
    isActive: true
  },
  {
    id: 10,
    email: 'user10@example.com',
    name: 'Jane Doe',
    role: 'User',
    jobTitle: 'QA Tester',
    dateCreated: '14-08-2022',
    lastModified: '18-08-2022',
    isActive: false
  }
];

  assets = [
  {
    id: 1,
    name: 'Good Food on the Move',
    status: 'Approved',
    dateCreated: '15-01-2022',
    createdBy: 'Jane Doe',
    lastModified: '20-01-2022',
    modifiedBy: 'Jane Doe',
    isActive: false
  },
  {
    id: 2,
    name: 'Bike Repair Station',
    status: 'Pending',
    dateCreated: '22-03-2022',
    createdBy: 'Jane Doe',
    lastModified: '25-03-2022',
    modifiedBy: 'Jane Doe',
    isActive: false
  },
  {
    id: 3,
    name: 'Good Food on the Move',
    status: 'Rejected',
    dateCreated: '10-02-2022',
    createdBy: 'Jane Doe',
    lastModified: '15-02-2022',
    modifiedBy: 'Jane Doe',
    isActive: false
  },
  {
    id: 4,
    name: 'Bike Repair Station',
    status: 'Pending',
    dateCreated: '05-04-2022',
    createdBy: 'Jane Doe',
    lastModified: '08-04-2022',
    modifiedBy: 'Jane Doe',
    isActive: false
  },
  {
    id: 5,
    name: 'Good Food on the Move',
    status: 'Approved',
    dateCreated: '30-12-2021',
    createdBy: 'Jane Doe',
    lastModified: '02-01-2022',
    modifiedBy: 'Jane Doe',
    isActive: false
  },
  {
    id: 6,
    name: 'Bike Repair Station',
    status: 'Pending',
    dateCreated: '18-05-2022',
    createdBy: 'Jane Doe',
    lastModified: '22-05-2022',
    modifiedBy: 'Jane Doe',
    isActive: false
  },
  {
    id: 7,
    name: 'Good Food on the Move',
    status: 'Approved',
    dateCreated: '12-06-2022',
    createdBy: 'Jane Doe',
    lastModified: '16-06-2022',
    modifiedBy: 'Jane Doe',
    isActive: false
  },
  {
    id: 8,
    name: 'Bike Repair Station',
    status: 'Pending',
    dateCreated: '28-02-2022',
    createdBy: 'Jane Doe',
    lastModified: '03-03-2022',
    modifiedBy: 'Jane Doe',
    isActive: false
  },
  {
    id: 9,
    name: 'Good Food on the Move',
    status: 'Approved',
    dateCreated: '07-07-2022',
    createdBy: 'Jane Doe',
    lastModified: '11-07-2022',
    modifiedBy: 'Jane Doe',
    isActive: false
  }
];

  userSearchType = 'name';
  userSearchTerm = '';
  assetSearchType = 'name';
  assetSearchTerm = '';

  constructor(private router: Router) { }

  ngOnInit(): void {
  }


 onAddNewAsset(): void {
  console.log('Add new asset clicked');
  this.router.navigate(['/add-asset/start']);
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

  sortUsers(field: 'dateCreated' | 'lastModified'): void {
    if (this.userSortField === field) {
      this.userSortDirection = this.userSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.userSortField = field;
      this.userSortDirection = 'asc';
    }
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
  let filteredUsers = this.users.filter(user => {
    if (!this.userSearchTerm) return true;
    
    const searchTerm = this.userSearchTerm.toLowerCase();
    switch(this.userSearchType) {
      case 'name':
        return user.name.toLowerCase().includes(searchTerm);
      case 'email':
        return user.email.toLowerCase().includes(searchTerm);
      case 'role':
        return user.role.toLowerCase().includes(searchTerm);
      case 'action':
        return user.isActive ? 'active' : 'inactive' === searchTerm;
      default:
        return true;
    }
  });

  if (this.userSortField) {
    filteredUsers.sort((a, b) => {
      const field = this.userSortField as 'dateCreated' | 'lastModified';
      const parseDate = (dateStr: string) => {
        const [day, month, year] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day);
      };
      
      const aValue = parseDate(a[field]);
      const bValue = parseDate(b[field]);
      
      if (this.userSortDirection === 'asc') {
        return aValue.getTime() - bValue.getTime();
      } else {
        return bValue.getTime() - aValue.getTime();
      }
    });
  }
  return filteredUsers;
}

  getFilteredAssets() {
    let filteredAssets = this.assets.filter(asset => {
      if (!this.assetSearchTerm) return true;
      
      const searchTerm = this.assetSearchTerm.toLowerCase();
      switch(this.assetSearchType) {
        case 'name':
          return asset.name.toLowerCase().includes(searchTerm);
        case 'status':
          return asset.status.toLowerCase().includes(searchTerm);
        case 'action':
          return asset.isActive ? 'active' : 'inactive' === searchTerm;
        default:
          return true;
      }
    });
    if (this.assetSortField) {
      filteredAssets.sort((a, b) => {
        const field = this.assetSortField as 'dateCreated' | 'lastModified';

        const parseDate = (dateStr: string) => {
          const [day, month, year] = dateStr.split('-').map(Number);
          return new Date(year, month - 1, day); 
        };
        
        const aValue = parseDate(a[field]);
        const bValue = parseDate(b[field]);
        
        if (this.assetSortDirection === 'asc') {
          return aValue.getTime() - bValue.getTime();
        } else {
          return bValue.getTime() - aValue.getTime();
        }
      });
    }

    return filteredAssets;
  }

  sortAssets(field: 'dateCreated' | 'lastModified'): void {
  if (this.assetSortField === field) {
    this.assetSortDirection = this.assetSortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    this.assetSortField = field;
    this.assetSortDirection = 'asc';
  }
}

  onToggleAssetStatus(assetId: number): void {
  const asset = this.assets.find(a => a.id === assetId);
  if (asset) {
    asset.isActive = !asset.isActive;
    console.log(`Asset ${assetId} is now ${asset.isActive ? 'active' : 'inactive'}`);
  }
  }
}