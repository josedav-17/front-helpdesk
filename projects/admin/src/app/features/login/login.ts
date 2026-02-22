import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  hide = true; // Controla la visibilidad de la contraseña en el HTML

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private snack: MatSnackBar
  ) {
    this.form = this.fb.group({
      user: ['', [Validators.required]],
      pass: ['', [Validators.required]],
    });
  }

  submit() {
    if (this.form.invalid || this.loading) return;

    this.loading = true;
    const { user, pass } = this.form.value;

    this.auth.login(user.trim(), pass.trim()).subscribe({
      next: (ok) => {
        this.loading = false;
        if (ok) {
          this.router.navigate(['/tickets']);
        } else {
          this.snack.open('Credenciales administrativas incorrectas', 'Cerrar', { duration: 3000 });
        }
      },
      error: () => {
        this.loading = false;
        this.snack.open('Error de conexión con el servidor', 'Cerrar', { duration: 3000 });
      }
    });
  }
}