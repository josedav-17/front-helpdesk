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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { TicketsService } from 'shared';
import { AuthService } from '../../core/auth/auth.service';

export interface TicketMDA {
  id: string;
  label: string;
  correo: string;
  categoria: string;
  estado: string;
  prioridad: string;
  area: string;
  horasRestantes: number;
  vencido: boolean;
  actualizadoEn: string;
}

@Component({
  selector: 'app-tickets-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSnackBarModule,
    MatInputModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './tickets-list.html',
  styleUrls: ['./tickets-list.scss'],
})
export class TicketsListComponent implements OnInit, OnDestroy {
  private api = inject(TicketsService);
  private router = inject(Router);
  private snack = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);
  private auth = inject(AuthService);
  private sub?: Subscription;

  public loading = true;
  public all: TicketMDA[] = [];
  public view: TicketMDA[] = [];

  public currentUser: any | null = null;
  public currentRole = '';
  public currentArea = '';

  public displayedColumns: string[] = [
    'id',
    'info',
    'prioridad',
    'estado',
    'area',
    'actualizado',
    'acciones'
  ];

  public statusOptions = ['TODOS', 'PENDIENTE', 'EN_PROCESO', 'RESUELTO', 'ARCHIVADO'];
  public priorityOptions = ['TODAS', 'ALTA', 'MEDIA', 'BAJA'];

  public areaOptions = [
    { value: 'TODAS', label: 'Todas' },
    { value: 'SISTEMAS', label: 'Sistemas' },
    { value: 'SOPORTE TÉCNICO', label: 'Soporte técnico' },
    { value: 'REDES', label: 'Redes' },
    { value: 'INFRAESTRUCTURA', label: 'Infraestructura' },
    { value: 'DESARROLLO', label: 'Desarrollo' },
    { value: 'MESA DE AYUDA', label: 'Mesa de ayuda' }
  ];

  public filters = {
    id: '',
    search: '',
    status: 'TODOS',
    priority: 'TODAS',
    area: 'TODAS'
  };

  ngOnInit(): void {
    this.currentUser = this.auth.getUser();
    this.currentRole = this.normalize(this.currentUser?.rol);
    this.currentArea = this.normalize(
      this.currentUser?.area ||
      this.currentUser?.area_nombre ||
      this.currentUser?.areaNombre ||
      this.currentUser?.departamento ||
      ''
    );

    if (this.isAreaUser()) {
      this.filters.area = this.currentArea;
    }

    this.loadTickets();
  }

  public loadTickets(): void {
    this.loading = true;

    this.sub = this.api.dashboard().subscribe({
      next: (tickets: any[]) => {
        this.all = tickets.map((t) => ({
          id: t.ticket_uuid ?? '',
          label: t.label ?? '',
          correo: t.correo ?? '',
          categoria: t.categoria ?? '',
          estado: t.estado_code ?? '',
          prioridad: t.prioridad_nom ?? '',
          area: t.area_asignada ?? '',
          horasRestantes: t.horas_restantes ?? 0,
          vencido: t.vencido ?? false,
          actualizadoEn: t.actualizado_en ?? ''
        }));

        this.applyFilter();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar tickets:', err);
        this.loading = false;
        this.snack.open('Error al cargar datos', 'Cerrar', { duration: 3000 });
      }
    });
  }

  public applyFilter(): void {
    this.view = this.all.filter((t) => {
      const matchId =
        !this.filters.id ||
        (t.label || t.id || '').toLowerCase().includes(this.filters.id.toLowerCase());

      const correoStr = (t.correo ?? '').toLowerCase();
      const catStr = (t.categoria ?? '').toLowerCase();
      const searchQ = this.filters.search.toLowerCase();

      const matchSearch =
        !searchQ || correoStr.includes(searchQ) || catStr.includes(searchQ);

      const matchStatus =
        this.filters.status === 'TODOS' || t.estado === this.filters.status;

      const matchPrio =
        this.filters.priority === 'TODAS' || t.prioridad === this.filters.priority;

      const matchArea =
        this.filters.area === 'TODAS' ||
        this.normalize(t.area) === this.normalize(this.filters.area);

      return matchId && matchSearch && matchStatus && matchPrio && matchArea;
    });
  }

  public clearFilters(): void {
    this.filters = {
      id: '',
      search: '',
      status: 'TODOS',
      priority: 'TODAS',
      area: this.isAreaUser() ? this.currentArea : 'TODAS'
    };
    this.applyFilter();
  }

  public normalize(value: string | null | undefined): string {
    return (value || '')
      .trim()
      .toUpperCase()
      .replace(/\s+/g, ' ');
  }

  public isAdminOrMesa(): boolean {
    return this.currentRole === 'ADMIN' || this.currentRole === 'MESA';
  }

  public isAreaUser(): boolean {
    return this.currentRole === 'AREA';
  }

  public canAccessTicket(ticket: TicketMDA): boolean {
    if (this.isAdminOrMesa()) return true;

    if (this.isAreaUser()) {
      return this.normalize(ticket.area) === this.currentArea;
    }

    return false;
  }

  public canOpen(ticket: TicketMDA): boolean {
    return this.canAccessTicket(ticket);
  }

  public canArchive(ticket: TicketMDA): boolean {
    return this.canAccessTicket(ticket);
  }

  public canUpdate(ticket: TicketMDA): boolean {
    return this.canAccessTicket(ticket);
  }

  public canPause(ticket: TicketMDA): boolean {
    return this.canAccessTicket(ticket);
  }

  public canCancel(ticket: TicketMDA): boolean {
    return this.canAccessTicket(ticket);
  }

  public getAreaLabel(areaValue: string): string {
    const normalized = this.normalize(areaValue);
    const found = this.areaOptions.find(a => a.value === normalized);
    return found?.label || areaValue || 'Sin área';
  }

  public openTicket(ticket: TicketMDA): void {
    if (!this.canOpen(ticket)) {
      this.snack.open('No tienes permisos para ver este ticket', 'Cerrar', {
        duration: 3000
      });
      return;
    }

    this.router.navigate(['/tickets', ticket.id]);
  }

  public getSlaClass(t: TicketMDA): string {
    if (t.vencido) return 'urgent';
    return t.horasRestantes <= 2 ? 'urgent' : t.horasRestantes <= 8 ? 'warning' : 'ok';
  }

  public archive(ticket: TicketMDA): void {
    if (!this.canArchive(ticket)) {
      this.snack.open('No tienes permisos para archivar este ticket', 'Cerrar', {
        duration: 3000
      });
      return;
    }

    const motivo = 'Archivado desde la consola de gestión';

    this.api.archivar(ticket.id, motivo).subscribe({
      next: (res) => {
        this.snack.open(res.message || 'Ticket archivado correctamente', 'Cerrar', {
          duration: 3000
        });
        this.loadTickets();
      },
      error: (err) => {
        console.error('Error al archivar:', err);
        this.snack.open(
          err?.error?.detail || 'No se pudo archivar el ticket',
          'Cerrar',
          { duration: 4000 }
        );
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}