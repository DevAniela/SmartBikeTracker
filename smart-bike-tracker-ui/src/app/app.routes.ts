import { Routes } from '@angular/router';
import { FleetDashboardComponent } from './features/fleet-dashboard/fleet-dashboard.component';
import { BikeMapComponent } from './features/bike-map/bike-map.component';

export const routes: Routes = [
    { path: '', component: FleetDashboardComponent }, // Ruta default
    { path: 'map', component: BikeMapComponent },
    { path: '**', redirectTo: '' } // Orice rută invalidă duce la dashboard
];