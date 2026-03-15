import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

import { TicketsService } from 'shared';
import type { Ticket } from 'shared';

export interface TicketMDA extends Ticket {
  horasRestantes: number;
  prioridad: string;
  area: string;
  vencido: boolean;
}

@Component({
  selector: 'app-tickets-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule, MatCardModule, MatTableModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatSelectModule,
    MatSnackBarModule, MatInputModule, MatTooltipModule, MatProgressSpinnerModule
  ],
  templateUrl: './tickets-list.html',
  styleUrls: ['./tickets-list.scss'],
})
export class TicketsListComponent implements OnInit, OnDestroy {
  private api = inject(TicketsService);
  private router = inject(Router);
  private snack = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);
  private sub?: Subscription;

  public loading = true;
  public all: TicketMDA[] = [];
  public view: TicketMDA[] = [];
  
  public displayedColumns: string[] = ['id', 'info', 'prioridad', 'estado', 'area', 'actualizado', 'acciones'];

  public statusOptions = ['TODOS', 'PENDIENTE', 'EN_PROCESO', 'RESUELTO'];
  public priorityOptions = ['TODAS', 'ALTA', 'MEDIA', 'BAJA'];
  public areaOptions = ['TODAS', 'Soporte N1', 'Infraestructura', 'Sistemas', 'Admisiones'];

  public filters = { 
    id: '', 
    search: '', 
    status: 'TODOS', 
    priority: 'TODAS', 
    area: 'TODAS' 
  };

  ngOnInit(): void { this.loadTickets(); }

public loadTickets(): void {
  this.loading = true;

  this.sub = this.api.dashboard().subscribe({
    next: (tickets: any[]) => {

      this.all = tickets.map(t => ({
        ...t,

        id: t.uuid,
        label: t.ticket_label,
        correo: t.solicitante_email,
        area: t.area_asignada,

        prioridad: t.prioridad || 'MEDIA',
        estado: t.estado,

        horasRestantes: t.horas_restantes_sla ?? 0,
        vencido: t.sla_vencido ?? false,

        actualizadoEn: t.creado_en
      }));

      this.applyFilter();
      this.loading = false;

      this.cdr.detectChanges();
    },

    error: () => {
      this.loading = false;
      this.snack.open('Error al cargar datos', 'Cerrar', { duration: 3000 });
    }
  });
}

  public applyFilter(): void {
    this.view = this.all.filter((t) => {
      const matchId = !this.filters.id || (t.label || t.id || '').toLowerCase().includes(this.filters.id.toLowerCase());
      const correoStr = (t.correo ?? '').toLowerCase();
      const catStr = (t.categoria ?? '').toLowerCase();
      const searchQ = this.filters.search.toLowerCase();
      
      const matchSearch = !searchQ || correoStr.includes(searchQ) || catStr.includes(searchQ);
      const matchStatus = this.filters.status === 'TODOS' || t.estado === this.filters.status;
      const matchPrio = this.filters.priority === 'TODAS' || t.prioridad === this.filters.priority;
      const matchArea = this.filters.area === 'TODAS' || t.area === this.filters.area;

      return matchId && matchSearch && matchStatus && matchPrio && matchArea;
    });
  }

  public clearFilters(): void {
    this.filters = { id: '', search: '', status: 'TODOS', priority: 'TODAS', area: 'TODAS' };
    this.applyFilter();
  }

  public open(id: string) { this.router.navigate(['/tickets', id]); }

  public getSlaClass(t: TicketMDA) {
    if (t.vencido) return 'urgent';
    return t.horasRestantes <= 2 ? 'urgent' : t.horasRestantes <= 8 ? 'warning' : 'ok';
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }
}