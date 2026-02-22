export type TicketStatus = 'PENDIENTE' | 'EN_PROCESO' | 'RESUELTO' | 'ARCHIVADO';

export interface Ticket {
  /** UUID real (BD). Se usa para llamar SPs: /api/tickets/{uuid}/... */
  id: string;

  /** Label visible para el usuario: TCK-XXXXXXX */
  label: string;

  /** Nombre del solicitante (BD) */
  nombre: string;

  /** Datos opcionales (pueden venir vacíos si no están en el dashboard) */
  documento?: string;
  correo?: string;
  telefono?: string;

  /** Categoria (puede venir vacía si dashboard no la trae) */
  categoria?: string;

  /** En dashboard, aquí puedes poner el asunto o un resumen */
  descripcion: string;

  /** Estado normalizado para UI */
  estado: TicketStatus;

  /** Nombre estado desde BD (ABIERTO/EN PROCESO/CERRADO/...) */
  estadoDb: string;

  /** Color del estado desde BD (hex) */
  estadoColor: string;

  /** Prioridad desde BD (MEDIA/ALTA/...) */
  prioridad: string;

  /** Fecha formateada (texto) */
  creadoEn: string;
  actualizadoEn: string;
}

/** Vista MDA (mesa de ayuda) - lo mantengo pero basado en Ticket */
export interface TicketMDA extends Ticket {
  horasRestantes?: number;
  area?: string;
  agenteNombre?: string | null;
}