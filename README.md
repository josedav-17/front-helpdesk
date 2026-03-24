# Front Helpdesk

Plataforma de helpdesk construida con Angular 21, que incluye un portal público para la creación de tickets sin autenticación y un panel administrativo con control de acceso basado en roles (RBAC). El proyecto utiliza Server-Side Rendering (SSR) para mejorar el rendimiento y el SEO.

## Características principales

- **Portal público** – Los usuarios pueden enviar tickets de soporte y consultar su estado sin necesidad de registrarse.
- **Panel administrativo** – Gestión completa de tickets, usuarios y métricas con autenticación y roles (ADMIN, MESA, AREA, USUARIO).
- **Seguimiento de SLA** – Cálculo automático de fechas límite y alertas visuales.
- **Dashboard analítico** – KPIs en tiempo real y gráficas interactivas con Chart.js.
- **Ciclo de vida completo** – Asignar, transferir, reclasificar, pausar, reabrir, cancelar y archivar tickets.
- **Server‑Side Rendering** – Angular Universal para mejorar la velocidad de carga inicial y el SEO.
- **Multi‑proyecto** – Código compartido entre el portal público y el panel admin mediante una librería interna.

## Tecnologías utilizadas

| Área               | Tecnología                         |
|--------------------|------------------------------------|
| Framework          | Angular 21 (standalone components) |
| UI Components      | Angular Material 21                |
| Gráficos           | Chart.js 4 vía ng2-charts          |
| Renderizado        | Angular Universal (SSR)            |
| Servidor HTTP      | Express 5                          |
| Estilos            | SCSS                               |
| Pruebas            | Vitest                             |
| Lenguaje           | TypeScript 5.9                     |



PROJECT BY: JOSE DAVID - DANIELA

DOCUMENTATION IN: https://www.mintlify.com/josedav-17/front-helpdesk/introduction  
