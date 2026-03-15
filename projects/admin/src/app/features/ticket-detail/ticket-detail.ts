import { Component, OnInit, OnDestroy, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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

  public statusOptions = [
    { value: 'PENDIENTE', label: 'Pendiente' },
    { value: 'EN_PROCESO', label: 'En proceso' },
    { value: 'RESUELTO', label: 'Resuelto' }
  ];

  private sub?: Subscription;

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.sub = this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) this.fetchData(id);
    });
  }

  private fetchData(id: string) {
    this.loading = true;
    this.api.getById(id).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res) => {
        this.ticket = res.ticket;
        this.historial = res.historial || [];
        this.initForm();
      },
      error: () => this.snack.open('Error al cargar datos', 'Cerrar')
    });
  }

  private initForm() {
    this.form = this.fb.group({
      estado: [this.ticket?.estado_db || 'PENDIENTE', Validators.required],
      prioridad: [this.ticket?.prioridad_nom || 'MEDIA', Validators.required],
      area: [this.ticket?.area_asignada || 'Soporte N1', Validators.required],
      respuesta: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  public save() {
    if (this.form.invalid || this.saving) return;
    this.saving = true;
    setTimeout(() => {
      this.saving = false;
      this.snack.open('Ticket actualizado', 'OK');
      this.cdr.detectChanges();
    }, 1500);
  }

  public back() { this.location.back(); }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}