import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-user-form.component.html',
  styleUrl: './edit-user-form.component.scss'
})
export class EditUserFormComponent implements OnInit, OnChanges {
  @Input() user: any = null;
  @Output() backToUsers = new EventEmitter<void>();
  @Output() userUpdated = new EventEmitter<any>();

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
      const nameParts = this.user.name.split(' ');
      this.editUserForm.patchValue({
        email: this.user.email,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        jobTitle: this.user.jobTitle,
        role: this.user.role
      });
    }
  }

  onSubmit() {
    if (this.editUserForm.valid) {
      this.isLoading = true;
      
      const updatedUser = {
        ...this.user,
        email: this.editUserForm.value.email,
        name: `${this.editUserForm.value.firstName} ${this.editUserForm.value.lastName}`,
        role: this.editUserForm.value.role,
        jobTitle: this.editUserForm.value.jobTitle,
        lastModified: new Date().toLocaleDateString('en-GB')
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
