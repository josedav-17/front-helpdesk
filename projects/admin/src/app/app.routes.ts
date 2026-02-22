import { Routes } from '@angular/router';

import { AdminLayoutComponent } from './layout/admin-layout';
import { LoginComponent } from './features/login/login';
import { TicketsListComponent } from './features/tickets-list/tickets-list';
import { TicketDetailComponent } from './features/ticket-detail/ticket-detail';
import { DashboardComponent } from './features/dashboard/dashboard'; 

import { authGuard } from './core/auth/auth-guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'tickets', component: TicketsListComponent },
      { path: 'tickets/:id', component: TicketDetailComponent },
    ],
  },

  { path: '**', redirectTo: 'login' },
];