import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartEvent } from 'chart.js';

import { TicketsService } from 'shared';

interface TicketApi {
  uuid: string;
  ticket_label: string;
  solicitante_nombre: string;
  solicitante_email: string;
  tipo_solicitud: string;
  categoria: string;
  subcategoria: string;
  asunto: string;
  area_asignada: string;
  prioridad: string;
  sla_horas: number;
  estado: string;
  creado_en: string;
  fecha_limite_sla: string;
  horas_restantes_sla: number;
  sla_vencido: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    BaseChartDirective
  ],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly ticketsService = inject(TicketsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private sub?: Subscription;

  public loading = true;
  public renderCharts = false;
  private tickets: TicketApi[] = [];

  public trendPercent = 0;

  public kpis = [
    { label: 'Tickets Hoy', value: '0', icon: 'confirmation_number', class: 'blue' },
    { label: 'Tiempo Promedio', value: '0h', icon: 'hourglass_empty', class: 'orange' },
    { label: 'Críticos', value: '0', icon: 'report_problem', class: 'red' },
    { label: 'SLA Vencidos', value: '0', icon: 'alarm_on', class: 'purple' }
  ];

  public topRequesters: Array<{ name: string; solved: number; initial: string }> = [];

  public lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Tickets Ingresados',
      borderColor: '#2563eb',
      pointBackgroundColor: '#2563eb',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#2563eb',
      fill: 'origin',
      backgroundColor: 'rgba(37, 99, 235, 0.10)',
      tension: 0.35
    }]
  };

  public priorityChartData: ChartData<'doughnut'> = {
    labels: ['Crítica', 'Alta', 'Media', 'Baja'],
    datasets: [{
      data: [0, 0, 0, 0],
      backgroundColor: ['#dc2626', '#f97316', '#2563eb', '#94a3b8'],
      borderWidth: 0
    }]
  };

  public statusChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: ['#2563eb', '#16a34a', '#f97316', '#dc2626', '#7c3aed', '#64748b'],
      borderWidth: 0
    }]
  };

  public slaChartData: ChartData<'doughnut'> = {
    labels: ['Vigentes', 'Por vencer', 'Vencidos'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: ['#16a34a', '#f97316', '#dc2626'],
      borderWidth: 0
    }]
  };

  public areaChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Tickets',
      backgroundColor: '#2563eb',
      borderRadius: 6,
      barThickness: 18
    }]
  };

  public categoryChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Tickets',
      backgroundColor: '#0f766e',
      borderRadius: 6
    }]
  };

  public hourChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Tickets',
      backgroundColor: '#7c3aed',
      borderRadius: 6
    }]
  };

  public lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    normalized: true,
    parsing: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { grid: { display: false }, border: { display: false } },
      x: { grid: { display: false }, border: { display: false } }
    }
  };

  public doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    normalized: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 12,
          boxWidth: 10,
          font: { size: 11, weight: 'bold' }
        }
      }
    }
  };

  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    normalized: true,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: { grid: { display: false }, ticks: { display: false }, border: { display: false } },
      y: { grid: { display: false }, border: { display: false } }
    }
  };

  public verticalBarChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    normalized: true,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: { grid: { display: false }, border: { display: false } },
      y: { grid: { display: false }, border: { display: false } }
    }
  };

  ngOnInit(): void {
    this.loadDashboard();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private loadDashboard(): void {
    this.loading = true;
    this.renderCharts = false;
    this.cdr.markForCheck();

    this.sub = this.ticketsService.dashboard().subscribe({
      next: (resp: any[]) => {
        this.tickets = (resp ?? []) as TicketApi[];

        this.buildDashboardData();

        this.loading = false;
        this.cdr.markForCheck();

        requestAnimationFrame(() => {
          this.renderCharts = true;
          this.cdr.markForCheck();
        });
      },
      error: (err) => {
        console.error('Error cargando dashboard:', err);
        this.loading = false;
        this.renderCharts = false;
        this.cdr.markForCheck();
      }
    });
  }

  private buildDashboardData(): void {
    const todayKey = this.toDateKey(new Date());

    const last7 = this.getLastNDays(7);
    const previous7 = this.getLastNDays(7, 7);

    const current7Map = new Map<string, number>();
    const previous7Map = new Map<string, number>();
    last7.forEach(d => current7Map.set(this.toDateKey(d), 0));
    previous7.forEach(d => previous7Map.set(this.toDateKey(d), 0));

    const priorityMap = new Map<string, number>([
      ['CRITICA', 0],
      ['ALTA', 0],
      ['MEDIA', 0],
      ['BAJA', 0]
    ]);

    const statusMap = new Map<string, number>();
    const areaMap = new Map<string, number>();
    const categoryMap = new Map<string, number>();
    const requesterMap = new Map<string, number>();
    const hourMap = new Map<number, number>();

    for (let i = 0; i < 24; i++) hourMap.set(i, 0);

    let ticketsHoy = 0;
    let criticos = 0;
    let slaVencidos = 0;
    let slaPorVencer = 0;
    let totalHours = 0;

    for (const t of this.tickets) {
      const createdAt = new Date(t.creado_en);
      const dateKey = this.toDateKey(createdAt);
      const prioridad = String(t.prioridad || '').toUpperCase().trim();
      const estado = String(t.estado || 'SIN_ESTADO').trim();
      const area = String(t.area_asignada || 'Sin área').trim();
      const categoria = String(t.categoria || 'Sin categoría').trim();
      const requester = String(t.solicitante_nombre || 'Sin nombre').trim();
      const hr = createdAt.getHours();
      const hrsRestantes = Number(t.horas_restantes_sla ?? 0);
      const vencido = Boolean(t.sla_vencido);

      if (dateKey === todayKey) ticketsHoy++;
      totalHours += this.hoursSince(t.creado_en);

      if (priorityMap.has(prioridad)) {
        priorityMap.set(prioridad, (priorityMap.get(prioridad) ?? 0) + 1);
      }

      statusMap.set(estado, (statusMap.get(estado) ?? 0) + 1);
      areaMap.set(area, (areaMap.get(area) ?? 0) + 1);
      categoryMap.set(categoria, (categoryMap.get(categoria) ?? 0) + 1);
      requesterMap.set(requester, (requesterMap.get(requester) ?? 0) + 1);
      hourMap.set(hr, (hourMap.get(hr) ?? 0) + 1);

      if (current7Map.has(dateKey)) {
        current7Map.set(dateKey, (current7Map.get(dateKey) ?? 0) + 1);
      }

      if (previous7Map.has(dateKey)) {
        previous7Map.set(dateKey, (previous7Map.get(dateKey) ?? 0) + 1);
      }

      if (vencido) slaVencidos++;
      else if (hrsRestantes <= 4) slaPorVencer++;

      if (vencido || prioridad === 'CRITICA' || prioridad === 'ALTA') {
        criticos++;
      }
    }

    const avgHours = this.tickets.length ? totalHours / this.tickets.length : 0;

    this.kpis = [
      { label: 'Tickets Hoy', value: String(ticketsHoy), icon: 'confirmation_number', class: 'blue' },
      { label: 'Tiempo Promedio', value: `${avgHours.toFixed(1)}h`, icon: 'hourglass_empty', class: 'orange' },
      { label: 'Críticos', value: String(criticos), icon: 'report_problem', class: 'red' },
      { label: 'SLA Vencidos', value: String(slaVencidos), icon: 'alarm_on', class: 'purple' }
    ];

    const currentTotal = Array.from(current7Map.values()).reduce((a, b) => a + b, 0);
    const previousTotal = Array.from(previous7Map.values()).reduce((a, b) => a + b, 0);

    this.trendPercent = previousTotal === 0
      ? (currentTotal > 0 ? 100 : 0)
      : Math.round(((currentTotal - previousTotal) / previousTotal) * 100);

    this.lineChartData = {
      labels: last7.map(d => d.toLocaleDateString('es-CO', { weekday: 'short' }).replace('.', '')),
      datasets: [{
        data: last7.map(d => current7Map.get(this.toDateKey(d)) ?? 0),
        label: 'Tickets Ingresados',
        borderColor: '#2563eb',
        pointBackgroundColor: '#2563eb',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#2563eb',
        fill: 'origin',
        backgroundColor: 'rgba(37, 99, 235, 0.10)',
        tension: 0.35
      }]
    };

    this.priorityChartData = {
      labels: ['Crítica', 'Alta', 'Media', 'Baja'],
      datasets: [{
        data: [
          priorityMap.get('CRITICA') ?? 0,
          priorityMap.get('ALTA') ?? 0,
          priorityMap.get('MEDIA') ?? 0,
          priorityMap.get('BAJA') ?? 0
        ],
        backgroundColor: ['#dc2626', '#f97316', '#2563eb', '#94a3b8'],
        borderWidth: 0
      }]
    };

    const statusSorted = Array.from(statusMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
    this.statusChartData = {
      labels: statusSorted.map(x => x[0]),
      datasets: [{
        data: statusSorted.map(x => x[1]),
        backgroundColor: ['#2563eb', '#16a34a', '#f97316', '#dc2626', '#7c3aed'],
        borderWidth: 0
      }]
    };

    const vigentes = this.tickets.length - slaVencidos - slaPorVencer;
    this.slaChartData = {
      labels: ['Vigentes', 'Por vencer', 'Vencidos'],
      datasets: [{
        data: [Math.max(vigentes, 0), slaPorVencer, slaVencidos],
        backgroundColor: ['#16a34a', '#f97316', '#dc2626'],
        borderWidth: 0
      }]
    };

    const areaSorted = Array.from(areaMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8);
    this.areaChartData = {
      labels: areaSorted.map(x => x[0]),
      datasets: [{
        data: areaSorted.map(x => x[1]),
        label: 'Tickets',
        backgroundColor: '#2563eb',
        borderRadius: 6,
        barThickness: 18
      }]
    };

    const categorySorted = Array.from(categoryMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6);
    this.categoryChartData = {
      labels: categorySorted.map(x => x[0]),
      datasets: [{
        data: categorySorted.map(x => x[1]),
        label: 'Tickets',
        backgroundColor: '#0f766e',
        borderRadius: 6
      }]
    };

    this.hourChartData = {
      labels: Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`),
      datasets: [{
        data: Array.from({ length: 24 }, (_, i) => hourMap.get(i) ?? 0),
        label: 'Tickets',
        backgroundColor: '#7c3aed',
        borderRadius: 6
      }]
    };

    this.topRequesters = Array.from(requesterMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, solved]) => ({
        name,
        solved,
        initial: this.getInitials(name)
      }));
  }

  private getLastNDays(days: number, offset = 0): Date[] {
    const result: Date[] = [];
    const base = new Date();

    for (let i = days - 1 + offset; i >= offset; i--) {
      const d = new Date(base);
      d.setHours(0, 0, 0, 0);
      d.setDate(base.getDate() - i);
      result.push(d);
    }

    return result;
  }

  private toDateKey(value: string | Date): string {
    const d = new Date(value);
    const year = d.getFullYear();
    const month = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private hoursSince(value: string): number {
    const created = new Date(value).getTime();
    return Math.max((Date.now() - created) / 36e5, 0);
  }

  private getInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  public chartClicked({ event, active }: { event?: ChartEvent, active?: object[] }): void {
    console.log(event, active);
  }
}