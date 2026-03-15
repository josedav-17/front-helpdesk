import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


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
  private readonly baseUrl = 'https://back-helpdesk-dmep.onrender.com';

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
}