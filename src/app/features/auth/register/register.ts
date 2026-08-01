import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { Role } from '../../../core/models/user.model';

const ROLE_HOME: Record<Role, string> = {
  PLAYER: '/player',
  VENUE_OWNER: '/owner',
  ADMIN: '/admin',
};

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(ToastService);

  readonly isSubmitting = signal(false);
  readonly hidePassword = signal(true);

  readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    password: ['', [Validators.required, Validators.minLength(8)]],
    role: ['PLAYER' as Extract<Role, 'PLAYER' | 'VENUE_OWNER'>, [Validators.required]],
  });

  togglePasswordVisibility(): void {
    this.hidePassword.set(!this.hidePassword());
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.authService.register(this.form.getRawValue()).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        this.router.navigateByUrl(ROLE_HOME[response.user.role]);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const message = err?.error?.message ?? 'Registration failed, please try again';
        this.snackBar.open(message, 'Dismiss', { duration: 4000 });
      },
    });
  }
}
