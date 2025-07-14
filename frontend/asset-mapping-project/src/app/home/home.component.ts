import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  categories = ['Food Bank', 'Shelter', 'Clinic', 'Community Support'];
  assets = Array(7).fill({ name: 'Good Food on the Move', type: 'Food Bank' });

}
