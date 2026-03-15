import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';

import { TicketsService } from '../../../../../shared/src/lib/tickets.service';

interface TicketPublicView {
  uuid: string;
  ticket_label: string;
  tipo_solicitud?: string;
  categoria?: string;
  subcategoria?: string;
  asunto?: string;
  descripcion_problema?: string;
  area_asignada?: string;
  estado?: string;
  prioridad?: string;
  sla_horas?: number;
  creado_en?: string;
  fecha_limite_sla?: string;
}

interface TicketConsultaResponse {
  ticket: TicketPublicView | null;
  historial?: any[];
}

@Component({
  selector: 'app-track-ticket',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatChipsModule
  ],
  templateUrl: './track-ticket.html',
  styleUrls: ['./track-ticket.scss'],
})
export class TrackTicketComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private api = inject(TicketsService);

  ticket: TicketPublicView | null = null;
  notFound = false;
  loading = false;

  form = this.fb.group({
    label: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
  });

  ngOnInit(): void {
    const prefillLabel = this.route.snapshot.queryParamMap.get('id');
    const prefillEmail = this.route.snapshot.queryParamMap.get('email');

    if (prefillLabel) {
      this.form.patchValue({
        label: prefillLabel,
        email: prefillEmail || '',
      });

      if (prefillEmail) {
        this.search();
      }
    }
  }

  search(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.ticket = null;
    this.notFound = false;

    const payload = {
      label: (this.form.value.label || '').trim(),
      email: (this.form.value.email || '').trim(),
    };

    this.api.consultar(payload).subscribe({
      next: (res: TicketConsultaResponse) => {
        this.ticket = res?.ticket ?? null;
        this.notFound = !this.ticket;
        this.loading = false;
      },
      error: () => {
        this.ticket = null;
        this.notFound = true;
        this.loading = false;
      }
    });
  }

  statusLabel(status?: string): string {
    switch ((status || '').toUpperCase()) {
      case 'ABIERTO':
        return 'Abierto';
      case 'EN_PROCESO':
        return 'En proceso';
      case 'PAUSADO':
        return 'Pausado';
      case 'RESUELTO':
        return 'Resuelto';
      case 'CANCELADO':
        return 'Cancelado';
      case 'CERRADO':
        return 'Cerrado';
      default:
        return status || '';
    }
  }
}