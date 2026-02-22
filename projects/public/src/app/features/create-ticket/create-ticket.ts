import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { TicketsService } from '../../../../../shared/src/lib/tickets.service';
import { Ticket } from '../../../../../shared/src/models/ticket.model';

@Component({
  selector: 'app-create-ticket',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule,
    MatSnackBarModule,
  ],
  templateUrl: './create-ticket.html',
  styleUrls: ['./create-ticket.scss'],
})
export class CreateTicketComponent {
  loading = false;
  ticketId: string | null = null;
  form: any;

  constructor(
    private fb: FormBuilder,
    private api: TicketsService,
    private snack: MatSnackBar,
    private router: Router
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      documento: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      categoria: ['', Validators.required],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
    });
  }


  submit() {
    if (this.form.invalid) return;

    this.loading = true;
    this.ticketId = null;

    const payload = this.form.getRawValue() as Omit<Ticket, 'id' | 'estado' | 'creadoEn' | 'actualizadoEn'>;

    this.api.create(payload).subscribe({
      next: (t) => {
        this.ticketId = t.id;
        this.snack.open('Solicitud creada', 'OK', { duration: 2000 });
        this.loading = false;
        this.form.reset();
      },
      error: () => {
        this.snack.open('Error creando solicitud', 'OK', { duration: 2500 });
        this.loading = false;
      }
    });
  }

  goTrack() {
    this.router.navigate(['/consulta'], { queryParams: { id: this.ticketId } });
  }
}