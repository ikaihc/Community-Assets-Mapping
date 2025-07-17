import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-user-form.component.html',
  styleUrl: './add-user-form.component.scss'
})
export class AddUserFormComponent implements OnInit {
  @Output() backToUsers = new EventEmitter<void>();
  @Output() userAdded = new EventEmitter<any>();

  addUserForm: FormGroup;
  isLoading = false;

  constructor(private fb: FormBuilder) {
    this.addUserForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      jobTitle: ['', [Validators.required]],
      role: ['', [Validators.required]]
    });
  }

  ngOnInit() {}

  onSubmit() {
    if (this.addUserForm.valid) {
      this.isLoading = true;
      
      const newUser = {
        id: Date.now(),
        email: this.addUserForm.value.email,
        name: `${this.addUserForm.value.firstName} ${this.addUserForm.value.lastName}`,
        role: this.addUserForm.value.role,
        jobTitle: this.addUserForm.value.jobTitle,
        dateCreated: new Date().toLocaleDateString('en-GB'),
        lastModified: new Date().toLocaleDateString('en-GB'),
        isActive: false
      };

      setTimeout(() => {
        this.userAdded.emit(newUser);
        this.resetForm();
        this.isLoading = false;
      }, 500);
    }
  }

  onBack() {
    this.backToUsers.emit();
    this.resetForm();
  }

  private resetForm() {
    this.addUserForm.reset();
    this.isLoading = false;
  }
}