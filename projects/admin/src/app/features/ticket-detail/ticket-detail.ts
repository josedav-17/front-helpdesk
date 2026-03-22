import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  PLATFORM_ID,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule, Location, isPlatformBrowser } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription, finalize } from 'rxjs';

import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { TicketsService } from 'shared';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatSnackBarModule],
  templateUrl: './ticket-detail.html',
  styleUrls: ['./ticket-detail.scss']
})
export class TicketDetailComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private snack = inject(MatSnackBar);
  private location = inject(Location);
  private route = inject(ActivatedRoute);
  private api = inject(TicketsService);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  public loading = true;
  public saving = false;
  public ticket: any = null;
  public historial: any[] = [];
  public form!: FormGroup;
  public currentTicketId = '';

  private sub?: Subscription;

  public statusOptions = [
    { value: 'ABIERTO', label: 'Abierto' },
    { value: 'EN PROCESO', label: 'En proceso' },
    { value: 'RESUELTO', label: 'Resuelto' },
    { value: 'CERRADO', label: 'Cerrado' }
  ];

  public priorityOptions = [
    { value: 'URGENTE', label: 'Urgente' },
    { value: 'ALTA', label: 'Alta' },
    { value: 'MEDIA', label: 'Media' },
    { value: 'BAJA', label: 'Baja' }
  ];

  public areaOptions = [
    { value: 'SISTEMAS', label: 'Sistemas' },
    { value: 'SOPORTE TÉCNICO', label: 'Soporte técnico' },
    { value: 'REDES', label: 'Redes' },
    { value: 'INFRAESTRUCTURA', label: 'Infraestructura' },
    { value: 'DESARROLLO', label: 'Desarrollo' },
    { value: 'MESA DE AYUDA', label: 'Mesa de ayuda' }
  ];

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.sub = this.route.params.subscribe(params => {
      const id = params['id'];
      if (!id) return;

      this.currentTicketId = id;
      this.fetchData(id);
    });
  }

  private fetchData(id: string) {
    this.loading = true;

    this.api.getById(id)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res) => {
          const rawTicket = res?.ticket ?? null;

          this.ticket = rawTicket ? this.normalizeTicket(rawTicket) : null;
          this.historial = Array.isArray(res?.historial) ? res.historial : [];

          if (this.ticket) {
            this.initForm();
          }
        },
        error: (err) => {
          console.error('Error al cargar datos del ticket:', err);
          this.snack.open(
            err?.error?.detail || 'Error al cargar datos del ticket',
            'Cerrar',
            { duration: 4000 }
          );
        }
      });
  }

  private normalizeTicket(raw: any) {
    return {
      ...raw,

      // Identidad principal
      uuid: raw?.uuid,
      label: raw?.ticket_label ?? raw?.label ?? 'N/A',

      // Solicitante
      nombre: raw?.solicitante_nombre ?? raw?.nombre ?? 'Sin nombre',
      correo: raw?.solicitante_email ?? raw?.correo ?? 'Sin correo',
      telefono: raw?.solicitante_tel ?? raw?.telefono ?? '',
      tiene_whatsapp: raw?.tiene_whatsapp ?? raw?.tieneWhatsapp ?? false,

      // Ticket
      asunto: raw?.asunto ?? '',
      categoria: raw?.categoria ?? 'Sin categoría',
      descripcion: raw?.descripcion_problema ?? raw?.descripcion ?? 'Sin descripción',

      // Estado / prioridad / área
      estado_db: raw?.estado ?? raw?.estado_db ?? 'ABIERTO',
      prioridad_nom: raw?.prioridad ?? raw?.prioridad_nom ?? 'MEDIA',
      area_asignada: raw?.area_asignada ?? 'MESA DE AYUDA',

      // Fechas
      creado_en: raw?.creado_en ?? raw?.creadoEn ?? null,
      actualizado_en: raw?.actualizado_en ?? raw?.actualizadoEn ?? null,
      fecha_limite_sla: raw?.fecha_limite_sla ?? null,

      // Otros
      ip_registro: raw?.ip_registro ?? 'N/A',
      documento: raw?.documento ?? '',
      empresa_departamento: raw?.empresa_departamento ?? '',
      sla_horas: raw?.sla_horas ?? null
    };
  }

  private initForm() {
    const estado = this.normalizeEstado(this.ticket?.estado_db || 'ABIERTO');
    const prioridad = this.normalizePrioridad(this.ticket?.prioridad_nom || 'MEDIA');
    const area = this.normalizeArea(this.ticket?.area_asignada || 'MESA DE AYUDA');
    const respuesta = this.ticket?.respuesta_cliente || '';

    this.form = this.fb.group({
      estado: [estado, Validators.required],
      prioridad: [prioridad, Validators.required],
      area: [area, Validators.required],
      respuesta: [
        respuesta,
        [Validators.required, Validators.minLength(5), Validators.maxLength(5000)]
      ]
    });

    this.form.markAsPristine();
  }

  private normalizeEstado(value: string): string {
    const val = (value || '').trim().toUpperCase();

    if (val === 'PENDIENTE') return 'ABIERTO';
    if (val === 'EN_PROCESO') return 'EN PROCESO';

    const exists = this.statusOptions.some(x => x.value === val);
    return exists ? val : 'ABIERTO';
  }

  private normalizePrioridad(value: string): string {
    const val = (value || '').trim().toUpperCase();
    const exists = this.priorityOptions.some(x => x.value === val);
    return exists ? val : 'MEDIA';
  }

  private normalizeArea(value: string): string {
    const val = (value || '').trim().toUpperCase();
    const exists = this.areaOptions.some(x => x.value === val);
    return exists ? val : 'MESA DE AYUDA';
  }

  public save() {
    if (!this.form) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snack.open('Completa correctamente los campos requeridos', 'Cerrar', {
        duration: 3000
      });
      return;
    }

    if (this.saving || !this.currentTicketId) return;

    if (!this.hasChanges) {
      this.snack.open('No hay cambios para guardar', 'OK', {
        duration: 2500
      });
      return;
    }

    this.saving = true;

    const payload = this.buildPayload();

    this.api.actualizar(this.currentTicketId, payload)
      .pipe(
        finalize(() => {
          this.saving = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res) => {
          this.snack.open(res?.message || 'Ticket actualizado correctamente', 'OK', {
            duration: 2500
          });
          this.fetchData(this.currentTicketId);
        },
        error: (err) => {
          console.error('Error actualizando ticket:', err);
          this.snack.open(
            err?.error?.detail || 'No se pudo actualizar el ticket',
            'Cerrar',
            { duration: 4500 }
          );
        }
      });
  }

  private buildPayload() {
    return {
      estado: this.estadoCtrl?.value,
      prioridad: this.prioridadCtrl?.value,
      area: this.areaCtrl?.value,
      respuesta: (this.respuestaCtrl?.value || '').trim()
    };
  }

  public back() {
    this.location.back();
  }

  public get hasChanges(): boolean {
    return !!this.form && this.form.dirty;
  }

  public get canSave(): boolean {
    return !!this.form && this.form.valid && !this.saving && this.hasChanges;
  }

  public get estadoCtrl() {
    return this.form?.get('estado');
  }

  public get prioridadCtrl() {
    return this.form?.get('prioridad');
  }

  public get areaCtrl() {
    return this.form?.get('area');
  }

  public get respuestaCtrl() {
    return this.form?.get('respuesta');
  }

  public get respuestaLength(): number {
    return (this.respuestaCtrl?.value || '').length;
  }

  public trackByValue(_: number, item: { value: string }) {
    return item.value;
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}