import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { TicketsService } from '../../../../../shared/src/lib/tickets.service';

@Component({
  selector: 'app-track-ticket',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, DatePipe],
  templateUrl: './track-ticket.html',
  styleUrls: ['./track-ticket.scss'],
})
export class TrackTicketComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(TicketsService);
  private cdr = inject(ChangeDetectorRef);

  ticket: any = null;
  notFound = false;
  loading = false;

  form = new FormGroup({
    label: new FormControl('', {
      validators: [Validators.required],
      nonNullable: true
    }),
    email: new FormControl('', {
      validators: [Validators.required, Validators.email],
      nonNullable: true
    })
  });

  ngOnInit(): void {
    const id = this.route.snapshot.queryParamMap.get('id');
    const email = this.route.snapshot.queryParamMap.get('email');

    if (id && email) {
      this.form.patchValue({ label: id, email });
      this.ejecutarBusqueda();
    }
  }

  ejecutarBusqueda(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.ticket = null;
    this.notFound = false;
    this.cdr.detectChanges();

    this.api.consultar(this.form.getRawValue()).subscribe({
      next: (res: any) => {
        const data = res?.data || res?.ticket || res;

        if (data && (data.ticketLabel || data.ticketUuid)) {
          this.ticket = data;
          this.notFound = false;
        } else {
          this.ticket = null;
          this.notFound = true;
        }

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.ticket = null;
        this.notFound = true;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}