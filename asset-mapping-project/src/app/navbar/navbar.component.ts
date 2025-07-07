import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  
  constructor() { }

  // need to add rounting here later when the routes are defined
  onNavigate(route: string): void {
    console.log('Navigating to:', route);
    
  }

  // for login
  onLogin(): void {
    console.log('Login clicked');
    // to do: implement login logic
  }

  // add new asset
  onAddAsset(): void {
    console.log('Add New Asset clicked');
    // to do: implement add asset logic
  }
}