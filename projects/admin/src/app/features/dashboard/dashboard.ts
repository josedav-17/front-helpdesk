import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

// Importaciones de ng2-charts y Chart.js
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType, ChartEvent } from 'chart.js';

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
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {

  // --- 1. DATOS DE LOS KPIs ---
  public kpis = [
    { label: 'Tickets Hoy', value: '142', icon: 'confirmation_number', class: 'blue' },
    { label: 'Tiempo Prom.', value: '2.4h', icon: 'hourglass_empty', class: 'orange' },
    { label: 'Críticos', value: '08', icon: 'report_problem', class: 'red' },
    { label: 'CSAT', value: '4.8/5', icon: 'sentiment_very_satisfied', class: 'green' }
  ];

  // --- 2. CONFIGURACIÓN GRÁFICA DE TENDENCIA (LÍNEAS) ---
  public lineChartData: ChartData<'line'> = {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    datasets: [
      {
        data: [65, 78, 56, 89, 120, 45, 30],
        label: 'Tickets Ingresados',
        borderColor: '#2563eb', // Tu Azul
        pointBackgroundColor: '#2563eb',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#2563eb',
        fill: 'origin',
        backgroundColor: 'rgba(37, 99, 235, 0.1)', // Sombra azul sutil
        tension: 0.4, // Curva suave
      }
    ]
  };

  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1a1a1a',
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        padding: 12,
        cornerRadius: 10,
        displayColors: false
      }
    },
    scales: {
      y: { grid: { display: false }, border: { display: false } },
      x: { grid: { display: false }, border: { display: false } }
    }
  };

  // --- 3. CONFIGURACIÓN GRÁFICA PRIORIDAD (DONA) ---
  public priorityChartData: ChartData<'doughnut'> = {
    labels: ['Crítica', 'Alta', 'Media', 'Baja'],
    datasets: [{
      data: [8, 25, 40, 27],
      backgroundColor: ['#dc2626', '#f97316', '#2563eb', '#94a3b8'], // Rojo, Naranja, Azul, Gris
      hoverOffset: 10,
      borderWidth: 0
    }]
  };

  public doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { usePointStyle: true, padding: 20, font: { size: 12, weight: 'bold' } }
      }
    }
  };

  // --- 4. DATOS DE AGENTES TOP ---
  public topAgents = [
    { name: 'Andrés García', solved: 45, initial: 'AG' },
    { name: 'Beatriz López', solved: 38, initial: 'BL' },
    { name: 'Carlos Ruiz', solved: 32, initial: 'CR' },
    { name: 'Diana Pérez', solved: 29, initial: 'DP' }
  ];

  // --- 5. CONFIGURACIÓN GRÁFICA ÁREAS (BARRAS HORIZONTALES) ---
  public areaChartData: ChartData<'bar'> = {
    labels: ['Soporte IT', 'Académico', 'Financiero', 'Admisiones', 'Bienestar'],
    datasets: [{ 
      data: [120, 85, 40, 30, 25], 
      label: 'Tickets',
      backgroundColor: '#2563eb',
      borderRadius: 6,
      barThickness: 20
    }]
  };

  public barChartOptions: ChartConfiguration['options'] = {
    indexAxis: 'y', // Barras horizontales
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: { grid: { display: false }, ticks: { display: false }, border: { display: false } },
      y: { grid: { display: false }, border: { display: false } }
    }
  };

  constructor() { }

  ngOnInit(): void {
    // Aquí podrías llamar a un servicio para traer datos reales
    console.log('Dashboard de HELPDESK-IUD cargado');
  }

  // Eventos de clic en gráficas (Opcional)
  public chartClicked({ event, active }: { event?: ChartEvent, active?: object[] }): void {
    console.log(event, active);
  }
}