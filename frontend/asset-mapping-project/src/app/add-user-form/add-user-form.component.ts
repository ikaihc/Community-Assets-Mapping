import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService, User } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-add-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-user-form.component.html',
  styleUrl: './add-user-form.component.scss'
})
export class AddUserFormComponent implements OnInit {
  @Output() backToUsers = new EventEmitter<void>();
  @Output() userAdded = new EventEmitter<User>();

  addUserForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    this.addUserForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      jobTitle: [''],
      role: ['guest', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  ngOnInit() {
    // Check if user is admin, if not redirect back
    if (!this.authService.isAdmin()) {
      this.notificationService.error('You do not have permission to add users', 'Access Denied');
      this.onBack();
    }
  }

  onSubmit() {
    if (this.addUserForm.valid && this.authService.isAdmin()) {
      this.isLoading = true;

      const userData = {
        email: this.addUserForm.value.email,
        first_name: this.addUserForm.value.firstName,
        last_name: this.addUserForm.value.lastName,
        job_title: this.addUserForm.value.jobTitle || '',
        role: this.addUserForm.value.role,
        password: this.addUserForm.value.password
      };

      // Reset form immediately after user clicks submit
      this.resetForm();

      this.userService.createUser(userData).subscribe({
        next: (response) => {
          console.log('AddUserForm: User creation response:', response);
          if (response.success && response.user) {
            this.notificationService.success('User created successfully', 'Success');
            this.userAdded.emit(response.user);
            // Reset form after successful creation
            this.resetForm();
          } else {
            this.notificationService.error('Failed to create user', 'Error');
            // If creation failed, restore the form data
            this.restoreFormData(userData);
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error creating user:', error);
          const errorMessage = error.error?.message || 'Failed to create user';
          this.notificationService.error(errorMessage, 'Error');
          // If creation failed, restore the form data
          this.restoreFormData(userData);
          this.isLoading = false;
        }
      });
    }
  }

  onBack() {
    this.backToUsers.emit();
    this.resetForm();
  }

  private resetForm() {
    this.addUserForm.reset({
      email: '',
      firstName: '',
      lastName: '',
      jobTitle: '',
      role: 'guest',
      password: ''
    });
    this.addUserForm.markAsUntouched();
    this.addUserForm.markAsPristine();
    this.isLoading = false;
  }

  private restoreFormData(userData: any) {
    this.addUserForm.patchValue({
      email: userData.email,
      firstName: userData.first_name,
      lastName: userData.last_name,
      jobTitle: userData.job_title,
      role: userData.role,
      password: userData.password
    });
  }
}
