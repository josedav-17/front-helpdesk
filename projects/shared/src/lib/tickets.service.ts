import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

import {
  TicketCreatePayload,
  TicketCreateResponse,
  TicketConsultaPayload,
  TicketConsultaResponse,
  TicketMDA,
} from '../models/ticket.model';

@Injectable({
  providedIn: 'root',
})
export class TicketsService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = environment.apiBase + '/api/tickets';

  create(payload: TicketCreatePayload): Observable<TicketCreateResponse> {
    return this.http.post<TicketCreateResponse>(`${this.baseUrl}/crear`, payload);
  }

  consultar(payload: TicketConsultaPayload): Observable<TicketConsultaResponse> {
    return this.http.post<TicketConsultaResponse>(`${this.baseUrl}/consultar`, payload);
  }

  dashboard(): Observable<TicketMDA[]> {
    return this.http.get<TicketMDA[]>(`${this.baseUrl}/dashboard`);
  }

  getById(ticketId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${ticketId}`);
  }

  dashboardMetricas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/dashboard-metricas`);
  }

  actualizar(
    ticketId: string,
    payload: {
      estado: string;
      prioridad: string;
      area: string;
      respuesta: string;
    }
  ): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.baseUrl}/${ticketId}/actualizar`,
      payload
    );
  }

  asignar(ticketId: string, agenteId: string, motivo: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/${ticketId}/asignar`, {
      agenteId,
      motivo,
    });
  }

  transferir(
    ticketId: string,
    nuevaArea: string,
    agenteId: string,
    motivo: string
  ): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/${ticketId}/transferir`, {
      nuevaArea,
      agenteId,
      motivo,
    });
  }

  reclasificar(
    ticketId: string,
    nuevaPrioridad: string,
    nuevaCategoria: string,
    motivo: string
  ): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/${ticketId}/reclasificar`, {
      nuevaPrioridad,
      nuevaCategoria,
      motivo,
    });
  }

  pausar(ticketId: string, motivo: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/${ticketId}/pausar`, {
      motivo,
    });
  }

  reabrir(ticketId: string, motivo: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/${ticketId}/reabrir`, {
      motivo,
    });
  }

  cancelar(ticketId: string, motivo: string, rol: 'USUARIO' | 'AGENTE'): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/${ticketId}/cancelar`, {
      motivo,
      rol,
    });
  }

  archivar(ticketId: string, motivo: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.baseUrl}/${ticketId}/archivar`,
      { motivo }
    );
  }
}