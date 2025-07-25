import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent], // ✅ Removed HomeComponent
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']       
})
export class AppComponent {
  title = 'asset-mapping-project';
}
