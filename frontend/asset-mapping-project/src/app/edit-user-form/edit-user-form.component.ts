import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { User } from '../services/user.service';

@Component({
  selector: 'app-edit-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  templateUrl: './edit-user-form.component.html',
  styleUrl: './edit-user-form.component.scss'
})
export class EditUserFormComponent implements OnInit, OnChanges {
  @Input() user: User | null = null;
  @Output() backToUsers = new EventEmitter<void>();
  @Output() userUpdated = new EventEmitter<User>();

  editUserForm: FormGroup;
  isLoading = false;

  constructor(private fb: FormBuilder) {
    this.editUserForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      jobTitle: ['', [Validators.required]],
      role: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.populateForm();
  }

  ngOnChanges() {
    this.populateForm();
  }

  private populateForm() {
    if (this.user) {
      this.editUserForm.patchValue({
        email: this.user.email,
        firstName: this.user.first_name || '',
        lastName: this.user.last_name || '',
        jobTitle: this.user.job_title,
        role: this.user.role
      });
    }
  }

  onSubmit() {
    if (this.editUserForm.valid && this.user && this.user.id) {
      this.isLoading = true;

      const updatedUser: User = {
        id: this.user.id,
        email: this.editUserForm.value.email,
        first_name: this.editUserForm.value.firstName,
        last_name: this.editUserForm.value.lastName,
        role: this.editUserForm.value.role,
        job_title: this.editUserForm.value.jobTitle,
        is_active: this.user.is_active,
        created_at: this.user.created_at,
        updated_at: this.user.updated_at
      };

      setTimeout(() => {
        this.userUpdated.emit(updatedUser);
        this.isLoading = false;
      }, 500);
    }
  }

  onBack() {
    this.backToUsers.emit();
  }

  getCreatedByInfo(): string {
    // TODO - Implement logic to fetch created by info from service
    return 'Jane Doe - admin';
  }

  getLastModifiedByInfo(): string {
    // TODO - Implement logic to fetch last modified by info from service
    return 'Jane Doe - admin';
  }
}
