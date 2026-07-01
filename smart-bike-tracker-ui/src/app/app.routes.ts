import { Routes } from '@angular/router';
import { FleetDashboardComponent } from './features/fleet-dashboard/fleet-dashboard.component';

export const routes: Routes = [
    { path: '', component: FleetDashboardComponent }, // Ruta default
    { path: '**', redirectTo: '' } // Orice rută invalidă duce la dashboard
];