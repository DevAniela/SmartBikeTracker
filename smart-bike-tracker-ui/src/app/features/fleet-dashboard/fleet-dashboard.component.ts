import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { BikeApiService } from '../../core/services/bike-api.service';
import { Bike } from '../../core/models/bike.model';

@Component({
  selector: 'app-fleet-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fleet-dashboard.component.html',
  styleUrl: './fleet-dashboard.component.scss' // 'styleUrl' (singular) specific Angular 17+
})
export class FleetDashboardComponent implements OnInit, OnDestroy {
  // Păstrăm referința către fluxul de date. Convenția cere să punem '$' la finalul variabilelor Observable.
  public bikes$: Observable<Bike[]>;

  constructor(private bikeApiService: BikeApiService) {
    // Conectăm UI-ul la fluxul de date din Serviciu
    this.bikes$ = this.bikeApiService.bikes$;
  }

  ngOnInit(): void {
    // Când componenta apare pe ecran, pornim "motorul" de polling
    this.bikeApiService.startPolling();
  }

  ngOnDestroy(): void {
    // Când componenta este distrusă (ex: navigăm pe altă pagină), oprim polling-ul pentru a nu consuma resurse
    this.bikeApiService.stopPolling();
  }
}