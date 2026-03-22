import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { finalize } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { TicketsService } from '../../../../../shared/src/lib/tickets.service';
import {
  TicketCreatePayload,
  TicketCreateResponse,
  TicketPrioridad,
  TicketTipo,
} from '../../../../../shared/src/models/ticket.model';

@Component({
  selector: 'app-create-ticket',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatSnackBarModule,
    MatCheckboxModule,
  ],
  templateUrl: './create-ticket.html',
  styleUrls: ['./create-ticket.scss'],
})
export class CreateTicketComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(TicketsService);
  private readonly snack = inject(MatSnackBar);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  loading = false;
  result: TicketCreateResponse | null = null;

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    documento: ['', [Validators.required, Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.maxLength(30)]],
    tieneWhatsapp: [false],
    empresaDepartamento: ['', [Validators.required, Validators.maxLength(150)]],
    tipo: ['SOLICITUD' as TicketTipo, [Validators.required]],
    categoria: ['', [Validators.required]],
    subcategoria: ['', [Validators.maxLength(100)]],
    asunto: ['', [Validators.required, Validators.maxLength(200)]],
    descripcion: ['', [Validators.required, Validators.minLength(10)]],
    areaAsignada: ['MESA'],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.result = null;
    const raw = this.form.getRawValue();

    const payload: TicketCreatePayload = {
      nombre: (raw.nombre ?? '').trim(),
      documento: this.normalizeOptional(raw.documento),
      email: (raw.email ?? '').trim(),
      telefono: this.normalizeOptional(raw.telefono),
      tieneWhatsapp: !!raw.tieneWhatsapp,
      empresaDepartamento: this.normalizeOptional(raw.empresaDepartamento),
      tipo: raw.tipo as TicketTipo,
      categoria: raw.categoria ?? '',
      subcategoria: this.normalizeOptional(raw.subcategoria),
      asunto: this.normalizeOptional(raw.asunto),
      descripcion: (raw.descripcion ?? '').trim(),
      prioridad: this.getPrioridadByTipo(raw.tipo as TicketTipo),
      areaAsignada: raw.areaAsignada ?? 'MESA',
    };

    this.api
      .create(payload)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res) => {
          this.result = res;
          this.snack.open(res.mensaje || 'Ticket creado', 'OK', { duration: 2500 });
          this.form.reset({ tipo: 'SOLICITUD', tieneWhatsapp: false, areaAsignada: 'MESA' });
        },
        error: (err) => {
          const msg = err?.error?.detail || 'Error creando solicitud';
          this.snack.open(msg, 'OK', { duration: 3000 });
        },
      });
  }

  goTrack(): void {
    if (!this.result?.ticketLabel) return;
    this.router.navigate(['/consulta'], {
      queryParams: { id: this.result.ticketLabel },
    });
  }

  private getPrioridadByTipo(tipo: TicketTipo): TicketPrioridad {
    const mapa: Record<TicketTipo, TicketPrioridad> = {
      PETICION: 'BAJA', QUEJA: 'MEDIA', RECLAMO: 'ALTA',
      SUGERENCIA: 'BAJA', INCIDENTE: 'URGENTE', SOLICITUD: 'MEDIA', CONSULTA: 'BAJA',
    };
    return mapa[tipo] ?? 'MEDIA';
  }

  private normalizeOptional(value: string | null | undefined): string | null {
    const cleaned = (value ?? '').trim();
    return cleaned.length ? cleaned : null;
  }
} 