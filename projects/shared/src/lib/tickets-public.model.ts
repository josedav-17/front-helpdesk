export interface TicketCreatePayload {
  nombre: string;
  documento?: string | null;
  email: string;
  telefono?: string | null;
  tieneWhatsapp: boolean;
  empresaDepartamento?: string | null;
  categoria: string;
  subcategoria?: string | null;
  asunto?: string | null;
  descripcion: string;
  prioridad?: string | null;
}

export interface TicketCreateResponse {
  message: string;
  label: string;
}

export interface TicketConsultarPayload {
  label: string;
  email: string;
}

export interface TicketPublicView {
  ticket_label: string;
  solicitante_nombre: string;
  solicitante_email: string;
  categoria: string;
  asunto: string;
  descripcion_problema: string;
  prioridad_nombre: string;
  estado_nombre: string;
  creado_en: string;
}