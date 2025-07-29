import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.scss']
})
export class LoginModalComponent implements OnInit {
  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() loginSuccess = new EventEmitter<any>();

  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {}

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      setTimeout(() => {
        const { email, password } = this.loginForm.value;
        
        // todo need to replace this with actual authentication logic
        if (email === 'admin@carlington.com' && password === 'password123') {
          this.loginSuccess.emit({ email, token: 'fake-jwt-token' });
          this.closeModal.emit();
          this.resetForm();
        } else {
          this.errorMessage = 'Invalid email or password';
        }
        
        this.isLoading = false;
      }, 1000);
    }
  }

  onClose() {
    this.closeModal.emit();
    this.resetForm();
  }

  private resetForm() {
    this.loginForm.reset();
    this.errorMessage = '';
    this.isLoading = false;
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}