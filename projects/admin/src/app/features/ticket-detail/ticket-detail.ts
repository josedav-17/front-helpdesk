import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatButtonModule, 
    MatIconModule, MatDividerModule, MatFormFieldModule, MatSelectModule, 
    MatInputModule, MatSnackBarModule, MatProgressSpinnerModule, MatTooltipModule
  ],
  templateUrl: './ticket-detail.html',
  styleUrls: ['./ticket-detail.scss']
})
export class TicketDetailComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private snack = inject(MatSnackBar);
  private location = inject(Location);
  private route = inject(ActivatedRoute);

  public ticket: any = null;
  public loading = true;
  public saving = false;
  public form!: FormGroup;
  private routeSub?: Subscription;

  public statusOptions = [
    { value: 'PENDIENTE', label: 'Pendiente' },
    { value: 'EN_PROCESO', label: 'En proceso' },
    { value: 'RESUELTO', label: 'Resuelto' },
    { value: 'ARCHIVADO', label: 'Archivado' }
  ];

  public areaOptions = ['Soporte N1', 'Infraestructura', 'Sistemas Académicos', 'Bienestar', 'Admisiones'];
  public priorityOptions = ['BAJA', 'MEDIA', 'ALTA', 'CRÍTICA'];

  ngOnInit() {
    this.routeSub = this.route.params.subscribe(params => {
      const id = params['id'];
      this.simulateTicketData(id);
    });
  }

  private simulateTicketData(id: string) {
    this.loading = true;
    
    setTimeout(() => {
      this.ticket = {
        id: id || 'TCK-000',
        nombre: 'Andrés Felipe Restrepo',
        documento: '1020304050',
        correo: 'a.restrepo@universidad.edu.co',
        telefono: '+57 300 123 4567', // Nuevo campo
        tieneWhatsapp: true,           // Nuevo campo
        categoria: 'Plataforma Académica',
        descripcion: `El usuario reporta problemas técnicos con el ID ${id}. Requiere asistencia inmediata para recuperar acceso.`,
        estado: 'EN_PROCESO',
        prioridad: 'ALTA',
        area: 'Soporte N1',
        creadoEn: new Date().toISOString(),
        actualizadoEn: new Date().toISOString(),
        horasRestantes: 4
      };

      this.initForm();
      this.loading = false;
    }, 250); 
  }

  private initForm() {
    this.form = this.fb.group({
      estado: [this.ticket.estado, Validators.required],
      prioridad: [this.ticket.prioridad, Validators.required],
      area: [this.ticket.area, Validators.required],
      respuesta: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  public save() {
    if (this.form.invalid) return;
    this.saving = true;
    setTimeout(() => {
      this.saving = false;
      this.snack.open(`Ticket ${this.ticket.id} gestionado`, 'OK', { duration: 2000 });
      this.back();
    }, 800);
  }

  public back() { this.location.back(); }

  public statusLabel(s: string) {
    return this.statusOptions.find(o => o.value === s)?.label || s;
  }

  public getSlaClass(h: number) { 
    return h <= 2 ? 'urgent' : h <= 8 ? 'warning' : 'ok'; 
  }

  ngOnDestroy() {
    this.routeSub?.unsubscribe();
  }
}