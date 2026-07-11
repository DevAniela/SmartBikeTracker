import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { BikeApiService } from '../../core/services/bike-api.service';
import { Bike } from '../../core/models/bike.model';
import { ReservationDialogComponent } from './components/reservation-dialog/reservation-dialog.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-fleet-dashboard',
  standalone: true,
  imports:  [CommonModule, MatDialogModule, MatButtonModule ],
  templateUrl: './fleet-dashboard.component.html',
  styleUrl: './fleet-dashboard.component.scss' // 'styleUrl' (singular) specific Angular 17+
})
export class FleetDashboardComponent implements OnInit, OnDestroy {
  // Păstrăm referința către fluxul public de date din serviciu.
  // Convenția cere să punem '$' la finalul variabilelor Observable.
  public bikes$: Observable<Bike[]>;

  constructor(private bikeApiService: BikeApiService) {
    // Conectăm UI-ul la fluxul de date din Serviciu
    this.bikes$ = this.bikeApiService.bikes$;
  }

  ngOnInit(): void {
    // Când componenta apare pe ecran, pornim "motorul" de polling RxJS
    this.bikeApiService.startPolling();
  }

  ngOnDestroy(): void {
    // Când componenta este distrusă (ex: când userul pleacă de pe pagină), oprim polling-ul (timer-ul) pentru a nu consuma resurse (Memory Leak prevention)
    this.bikeApiService.stopPolling();
  }
}