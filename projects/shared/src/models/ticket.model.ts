export type TicketStatus =
  | 'ABIERTO'
  | 'EN_PROCESO'
  | 'PAUSADO'
  | 'RESUELTO'
  | 'CANCELADO'
  | 'CERRADO';

export type TicketTipo =
  | 'PETICION'
  | 'QUEJA'
  | 'RECLAMO'
  | 'SUGERENCIA'
  | 'INCIDENTE'
  | 'SOLICITUD'
  | 'CONSULTA';

export type TicketPrioridad =
  | 'BAJA'
  | 'MEDIA'
  | 'ALTA'
  | 'URGENTE';

export interface Ticket {
  id: string;
  label: string;
  tipo?: TicketTipo;
  nombre: string;
  documento?: string;
  correo?: string;
  telefono?: string;
  empresaDepartamento?: string;
  categoria?: string;
  subcategoria?: string;
  asunto?: string;
  descripcion: string;
  estado: TicketStatus;
  prioridad: TicketPrioridad | string;
  slaHoras?: number;
  fechaLimiteSla?: string;
  area?: string;
  creadoEn: string;
  actualizadoEn?: string;
}

export interface TicketMDA extends Ticket {
  horasRestantes?: number;
  slaVencido?: boolean;
  agenteNombre?: string | null;
}

export interface TicketCreatePayload {
  nombre: string;
  documento?: string | null;
  email: string;
  telefono?: string | null;
  tieneWhatsapp?: boolean;
  empresaDepartamento?: string | null;
  tipo: TicketTipo;
  categoria: string;
  subcategoria?: string | null;
  asunto?: string | null;
  descripcion: string;
  prioridad: TicketPrioridad | string;
  areaAsignada?: string | null;
}

export interface TicketCreateResponse {
  ticketUuid: string;
  ticketLabel: string;
  estado: string;
  tipo: string;
  prioridad: string;
  slaHoras: number;
  fechaCreacion: string;
  fechaLimiteSla: string;
  mensaje: string;
}

export interface TicketConsultaPayload {
  label: string;
  email: string;
}

export interface TicketConsultaPublica {
  uuid: string;
  ticket_label: string;
  tipo_solicitud?: string;
  categoria?: string;
  subcategoria?: string;
  asunto?: string;
  descripcion_problema?: string;
  area_asignada?: string;
  estado?: string;
  prioridad?: string;
  sla_horas?: number;
  creado_en?: string;
  fecha_limite_sla?: string;
}

export interface TicketConsultaResponse {
  ticket: TicketConsultaPublica | null;
  historial?: any[];
}