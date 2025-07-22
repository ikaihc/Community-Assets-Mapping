
import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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

  constructor(private router: Router, private cdr: ChangeDetectorRef) { }

  onNavigate(route: string): void {
    console.log('Navigating to:', route);

    if (route === 'dashboard' && !this.isLoggedIn) {
      this.onLogin();
      return;
    }
    
    this.router.navigate([route]);
  }

  onLogin(): void {
    console.log('Login clicked');
    this.isLoginModalOpen = true;
    this.cdr.detectChanges(); 
  }

  onAddAsset(): void {
    console.log('Add New Asset clicked');
    // to do - implement add asset functionality
  }

  onLogout(): void {
    this.isLoggedIn = false;
    this.currentUser = null;
    localStorage.removeItem('authToken');
    console.log('User logged out');
    this.router.navigate(['/home']);
    this.cdr.detectChanges(); 
  }

  onCloseLoginModal(): void {
    this.isLoginModalOpen = false;
    this.cdr.detectChanges();
  }

  onLoginSuccess(userData: any): void {
    this.isLoggedIn = true;
    this.currentUser = userData;
    localStorage.setItem('authToken', userData.token);
    console.log('Login successful:', userData);
    this.router.navigate(['/dashboard']);
    this.cdr.detectChanges();
  }
}