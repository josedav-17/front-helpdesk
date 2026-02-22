import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

// Material Imports
import { MatMenu, MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

import { TicketsService } from 'shared';
import type { Ticket, TicketStatus } from 'shared';

export interface TicketMDA extends Ticket {
  horasRestantes: number;
  prioridad: string;
  area: string;
  agenteNombre: string | null;
}

type StatusFilter = TicketStatus | 'TODOS';

@Component({
  selector: 'app-tickets-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule, MatCardModule, MatTableModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatSelectModule,
    MatSnackBarModule, MatDividerModule, MatInputModule, MatSlideToggleModule,
    MatDatepickerModule, MatNativeDateModule, MatMenuModule, MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './tickets-list.html',
  styleUrls: ['./tickets-list.scss'],
})
export class TicketsListComponent implements OnInit, OnDestroy {
  @ViewChild('filterMenu') filterMenu!: MatMenu;

  private api = inject(TicketsService);
  private router = inject(Router);
  private snack = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);
  private sub?: Subscription;

  public loading = true;
  public all: TicketMDA[] = [];
  public view: TicketMDA[] = [];

  // Columnas sincronizadas: Todas deben existir en el HTML
  public displayedColumns: string[] = ['sla', 'id', 'categoria', 'correo', 'estado', 'area', 'actualizado', 'acciones'];

  public areaOptions = ['Soporte N1', 'Infraestructura', 'Sistemas Académicos', 'Bienestar', 'Admisiones'];
  public statusOptions: { value: StatusFilter; label: string }[] = [
    { value: 'TODOS', label: 'Todos' },
    { value: 'PENDIENTE', label: 'Pendiente' },
    { value: 'EN_PROCESO', label: 'En proceso' },
    { value: 'RESUELTO', label: 'Resuelto' },
    { value: 'ARCHIVADO', label: 'Archivado' },
  ];

  public status: StatusFilter = 'TODOS';
  public q = '';
  public categoria = 'TODAS';
  public categoriaOptions: string[] = [];
  public hideArchived = false;
  public fromDate: Date | null = null;
  public toDate: Date | null = null;

  ngOnInit(): void {
    this.loadTickets();
  }

  public loadTickets(): void {
    this.loading = true;
    this.sub = this.api.list().subscribe({
      next: (tickets: Ticket[]) => {
        setTimeout(() => {
          this.all = tickets.map(t => ({
            ...t,
            horasRestantes: (t as any).horasRestantes ?? Math.floor(Math.random() * 24),
            prioridad: (t as any).prioridad ?? 'MEDIA',
            area: (t as any).area ?? 'Soporte N1',
            agenteNombre: (t as any).agenteNombre ?? null
          }));
          this.refreshCategoriaOptions();
          this.applyFilter();
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: () => this.loading = false
    });
  }

  public applyFilter(): void {
    const search = (this.q || '').trim().toLowerCase();
    this.view = this.all.filter((t) => {
      if (this.status !== 'TODOS' && t.estado !== this.status) return false;
      if (this.categoria !== 'TODAS' && t.categoria !== this.categoria) return false;
      if (this.hideArchived && t.estado === 'ARCHIVADO') return false;
      
      const fechaTicket = new Date(t.actualizadoEn);
      if (this.fromDate && fechaTicket < this.fromDate) return false;
      if (this.toDate && fechaTicket > this.toDate) return false;

      if (search && !Object.values(t).some(v => String(v).toLowerCase().includes(search))) return false;
      return true;
    });
    this.cdr.detectChanges();
  }

  private refreshCategoriaOptions(): void {
    const set = new Set<string>();
    this.all.forEach(t => t.categoria && set.add(t.categoria));
    this.categoriaOptions = Array.from(set).sort();
  }

  public clearFilters(): void {
    this.q = ''; this.status = 'TODOS'; this.categoria = 'TODAS';
    this.fromDate = null; this.toDate = null; this.hideArchived = false;
    this.applyFilter();
  }

  public getSlaClass(h: number) { 
    return h <= 2 ? 'urgent' : h <= 8 ? 'warning' : 'ok'; 
  }

  public statusLabel(s: string): string {
    const labels: any = { 'PENDIENTE': 'Pendiente', 'EN_PROCESO': 'En proceso', 'RESUELTO': 'Resuelto', 'ARCHIVADO': 'Archivado' };
    return labels[s] || s;
  }

  public open(id: string) { this.router.navigate(['/tickets', id]); }

  public archive(id: string) {
    this.snack.open('Ticket archivado', 'OK', { duration: 2000 });
    const t = this.all.find(x => x.id === id);
    if (t) t.estado = 'ARCHIVADO';
    this.applyFilter();
  }

  public transferirTicket(id: string, area: string) {
    this.snack.open(`Asignado a ${area}`, 'OK', { duration: 2000 });
    const t = this.all.find(x => x.id === id);
    if (t) t.area = area;
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }
}