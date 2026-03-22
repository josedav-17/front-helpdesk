import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

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
  hide = true;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
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

    const user = (this.form.get('user')?.value ?? '').trim();
    const pass = (this.form.get('pass')?.value ?? '').trim();
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/dashboard';

    this.auth.login(user, pass).subscribe({
      next: (ok) => {
        this.loading = false;

        if (ok) {
          this.router.navigateByUrl(returnUrl);
        } else {
          this.snack.open('Credenciales administrativas incorrectas', 'Cerrar', {
            duration: 3000
          });
        }
      },
      error: () => {
        this.loading = false;
        this.snack.open('Error de conexión con el servidor', 'Cerrar', {
          duration: 3000
        });
      }
    });
  }
}