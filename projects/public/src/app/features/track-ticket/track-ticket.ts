import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';

import { TicketsService } from '../../../../../shared/src/lib/tickets.service';
import { Ticket } from '../../../../../shared/src/models/ticket.model';

@Component({
  selector: 'app-track-ticket',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatChipsModule
  ],
  templateUrl: './track-ticket.html',
  styleUrls: ['./track-ticket.scss'],
})
export class TrackTicketComponent implements OnInit {
  ticket: Ticket | null = null;
  notFound = false;
  loading = false;
  form: any;


  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private api: TicketsService
  ) {
    this.form = this.fb.group({
    id: ['', Validators.required],
  });
  }

  ngOnInit(): void {
    const prefill = this.route.snapshot.queryParamMap.get('id');
    if (prefill) {
      this.form.patchValue({ id: prefill });
      this.search();
    }
  }

  search() {
    if (this.form.invalid) return;

    this.loading = true;
    this.ticket = null;
    this.notFound = false;

    const id = (this.form.value.id || '').trim();

    this.api.getById(id).subscribe({
      next: (t) => {
        this.ticket = t;
        this.notFound = !t;
        this.loading = false;
      },
      error: () => {
        this.notFound = true;
        this.loading = false;
      }
    });
  }

  statusLabel(): string {
    if (!this.ticket) return '';
    switch (this.ticket.estado) {
      case 'PENDIENTE': return 'Pendiente';
      case 'EN_PROCESO': return 'En proceso';
      case 'RESUELTO': return 'Resuelto';
      case 'ARCHIVADO': return 'Archivado';
      default: return this.ticket.estado;
    }
  }
}