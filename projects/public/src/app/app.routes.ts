import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './layout/public-layout/public-layout';
import { CreateTicketComponent } from './features/create-ticket/create-ticket';
import { TrackTicketComponent } from './features/track-ticket/track-ticket';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', redirectTo: 'solicitud', pathMatch: 'full' },
      { path: 'solicitud', component: CreateTicketComponent },
      { path: 'consulta', component: TrackTicketComponent },
    ],
  },
  { path: '**', redirectTo: '' },
];