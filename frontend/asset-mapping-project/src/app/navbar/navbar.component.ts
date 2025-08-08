
import { Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LoginModalComponent } from '../login-modal/login-modal.component';
import { AuthService, User } from '../services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, LoginModalComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit, OnDestroy {

  isLoginModalOpen = false;
  isLoggedIn = false;
  currentUser: User | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.isLoggedIn = !!this.currentUser;

    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        this.isLoggedIn = !!user;
        this.cdr.detectChanges();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

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

    // Check if user is logged in
    if (!this.isLoggedIn) {
      // For guests, redirect to multi-step process
      this.router.navigate(['/add-asset/start']);
    } else {
      // For logged-in users, they can choose:
      // - Quick add via dashboard
      // - Multi-step process
      // For now, default to dashboard quick-add
      this.router.navigate(['/dashboard'], { queryParams: { view: 'add-asset' } });
    }
  }

  onCloseLoginModal(): void {
    this.isLoginModalOpen = false;
    this.cdr.detectChanges();
  }

  onLoginSuccess(userData: any): void {
    console.log('Login successful from navbar:', userData);
    this.router.navigate(['/dashboard']);
    this.cdr.detectChanges();
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/home']);
    this.cdr.detectChanges();
  }
}
