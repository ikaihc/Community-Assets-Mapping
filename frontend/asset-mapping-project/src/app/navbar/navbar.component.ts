import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginModalComponent } from '../login-modal/login-modal.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, LoginModalComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {

  isLoginModalOpen = false;
  isLoggedIn = false;
  currentUser: any = null;

  constructor() { }


  onNavigate(route: string): void {
    console.log('Navigating to:', route);
  }

  onLogin(): void {
    console.log('Login clicked');
    this.isLoginModalOpen = true;
  }

  onAddAsset(): void {
    if (!this.isLoggedIn) {
      this.onLogin();
      return;
    }
    console.log('Add New Asset clicked');
    // to do - implement add asset functionality
  }


  onLogout(): void {
    this.isLoggedIn = false;
    this.currentUser = null;
    localStorage.removeItem('authToken');
    console.log('User logged out');
  }

  onCloseLoginModal(): void {
    this.isLoginModalOpen = false;
  }

  onLoginSuccess(userData: any): void {
    this.isLoggedIn = true;
    this.currentUser = userData;
    localStorage.setItem('authToken', userData.token);
    console.log('Login successful:', userData);
  }
}