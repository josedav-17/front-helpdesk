import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Ticket } from '../models/ticket.model';

export interface TicketCreateDto {
  nombre: string;
  email: string;
  telefono: string;
  tieneWhatsapp: boolean;
  categoria: string;
  asunto: string;
  descripcion: string;
  prioridad?: string;
}

/** Esto es EXACTAMENTE lo que devuelve fn_obtener_dashboard_tickets() */
export interface TicketDashboardDto {
  ticket_uuid: string;
  label: string;
  solicitante: string;
  asunto_txt: string;
  estado_nom: string;
  estado_color: string;
  prioridad_nom: string;
  fecha_format: string;
}

export interface AsignarTicketDto {
  agenteId: string;
  motivo: string;
}

export interface TransferirTicketDto {
  nuevaArea: string;
  agenteId: string;
  motivo: string;
}

export interface CancelarTicketDto {
  motivo: string;
  rol: 'USUARIO' | 'AGENTE';
}

export interface ReclasificarTicketDto {
  nuevaPrioridad: string;
  nuevaCategoria: string;
  motivo: string;
}

export interface ReabrirTicketDto {
  motivo: string;
}

export interface PausarTicketDto {
  motivo: string;
}

@Injectable({ providedIn: 'root' })
export class TicketsService {
  private http = inject(HttpClient);

  /** Ajusta a tu environment si ya lo tienes */
  private baseUrl = 'http://localhost:8000';
  private api = `${this.baseUrl}/api`;

  // ----------------------------
  // PÚBLICO: Crear ticket
  // ----------------------------
  crear(payload: TicketCreateDto): Observable<{ message: string; label: string }> {
    return this.http.post<{ message: string; label: string }>(
      `${this.api}/tickets/public`,
      payload
    );
  }

  // ----------------------------
  // CONSULTA: Dashboard
  // Devuelve Ticket[] (ViewModel)
  // ----------------------------
  dashboard(): Observable<Ticket[]> {
    return this.http.get<TicketDashboardDto[]>(`${this.api}/tickets/dashboard`).pipe(
      map(rows => rows.map(dto => this.mapDashboardDtoToTicket(dto)))
    );
  }

  // ----------------------------
  // MESA DE AYUDA: SPs por UUID
  // ----------------------------
  asignar(ticketUuid: string, payload: AsignarTicketDto) {
    return this.http.post<{ message: string }>(
      `${this.api}/tickets/${ticketUuid}/asignar`,
      payload
    );
  }

  transferir(ticketUuid: string, payload: TransferirTicketDto) {
    return this.http.post<{ message: string }>(
      `${this.api}/tickets/${ticketUuid}/transferir`,
      payload
    );
  }

  cancelar(ticketUuid: string, payload: CancelarTicketDto) {
    return this.http.post<{ message: string }>(
      `${this.api}/tickets/${ticketUuid}/cancelar`,
      payload
    );
  }

  reclasificar(ticketUuid: string, payload: ReclasificarTicketDto) {
    return this.http.post<{ message: string }>(
      `${this.api}/tickets/${ticketUuid}/reclasificar`,
      payload
    );
  }

  reabrir(ticketUuid: string, payload: ReabrirTicketDto) {
    return this.http.post<{ message: string }>(
      `${this.api}/tickets/${ticketUuid}/reabrir`,
      payload
    );
  }

  pausar(ticketUuid: string, payload: PausarTicketDto) {
    return this.http.post<{ message: string }>(
      `${this.api}/tickets/${ticketUuid}/pausar`,
      payload
    );
  }

  // ----------------------------
  // Mapper: DTO (API) -> Ticket (UI)
  // ----------------------------
  private mapDashboardDtoToTicket(dto: TicketDashboardDto): Ticket {
    return {
      id: dto.ticket_uuid,
      label: dto.label,
      nombre: dto.solicitante,

      // Estos no vienen del dashboard; se quedan opcionales
      documento: '',
      correo: '',
      telefono: '',
      categoria: '',

      // En dashboard mostramos el asunto como “descripcion corta”
      descripcion: dto.asunto_txt,

      // Normalización de estado
      estado: this.mapEstado(dto.estado_nom),

      estadoDb: dto.estado_nom,
      estadoColor: dto.estado_color,
      prioridad: dto.prioridad_nom,

      // La función ya devuelve texto formateado
      creadoEn: dto.fecha_format,
      actualizadoEn: dto.fecha_format
    };
  }

  private mapEstado(dbEstado: string): Ticket['estado'] {
    const e = (dbEstado || '').toUpperCase();

    // Ajusta según tus cat_estados reales
    if (e === 'ABIERTO' || e === 'PENDIENTE') return 'PENDIENTE';
    if (e === 'EN PROCESO' || e === 'EN_PROCESO') return 'EN_PROCESO';
    if (e === 'CERRADO' || e === 'RESUELTO') return 'RESUELTO';
    if (e === 'ARCHIVADO') return 'ARCHIVADO';

    return 'PENDIENTE';
  }
}