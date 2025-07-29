// src/app/pages/add-asset-registration/add-asset-registration.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';

// Angular Material 模块
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule }       from '@angular/material/input';
import { MatNativeDateModule }  from '@angular/material/core';
import { MatButtonModule }      from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select'; 

@Component({
  selector: 'app-add-asset-registration',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    // Material
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    MatButtonModule,
    MatSelectModule, 
  ],
  templateUrl: './add-asset-registration.component.html',
  styleUrls: ['./add-asset-registration.component.scss']
})
export class AddAssetRegistrationComponent {
  scheduleType: 'one-time' | 'recurring' | 'manual' | '' = '';
  showCalendar = false;

  // 为 One‑time schedule 准备 Reactive Form 的 date-range
  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end:   new FormControl<Date | null>(null),
  });

  constructor(private router: Router) {}

  goPrevious() {
    this.router.navigate(['/add-asset/contact']);
  }

  onScheduleChange(value: string) {
    this.scheduleType = value as any;
    // 重置已有日期
    this.range.reset();
  }

  onSubmit() {
    alert('Asset submitted!');
  }
}
