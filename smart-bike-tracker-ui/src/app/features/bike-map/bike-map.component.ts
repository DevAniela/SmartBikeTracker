import { Component, OnInit, inject } from '@angular/core';
import { LeafletModule } from '@bluehalo/ngx-leaflet';
import * as L from 'leaflet';
import { BikeApiService } from '../../core/services/bike-api.service';
import { Bike } from '../../core/models/bike.model';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ReservationDialogComponent } from '../fleet-dashboard/components/reservation-dialog/reservation-dialog.component';

@Component({
  selector: 'app-bike-map',
  standalone: true,
  imports: [LeafletModule, MatDialogModule],
  templateUrl: './bike-map.component.html',
  styleUrls: ['./bike-map.component.scss']
})
export class BikeMapComponent implements OnInit {
  private bikeApiService = inject(BikeApiService);
  private dialog = inject(MatDialog); // Injectăm modalul de rezervare

  // Configurația de bază pentru Leaflet
  public mapOptions: L.MapOptions = {
    layers: [
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© OpenStreetMap contributors'
      })
    ],
    zoom: 13,
    center: L.latLng(44.4268, 26.1025) // Coordonatele pentru București
  };

  // Acest array va conține markerii
  public layers: L.Layer[] = [];

  
  ngOnInit(): void {
    // Dacă polling-ul nu e pornit global, trebuie să ne asigurăm că îl pornim când intrăm pe hartă
    this.bikeApiService.startPolling();
    
    // Ne abonăm la fluxul existent de biciclete din serviciu
    // Ascultăm schimbările de la polling
    this.bikeApiService.bikes$.subscribe((bikes) => {
      
      if (bikes && bikes.length > 0) {
        // Imediat ce vin de la server, le dăm niște coordonate random din București
        const bikesWithDummyCoordinates = this.generateDummyCoordinates(bikes);
        
        // Transformăm bicicletele în Markere Leaflet
        this.generateMarkers(bikesWithDummyCoordinates);
      }
    });
  }
  
  // Funcție care pune markeri pe hartă
  private generateMarkers(bikes: Bike[]): void {
    this.layers = bikes.map(bike => {
      
      // Calculăm clasa CSS dinamică pt iconiță
      let markerStatusClass = '';
      if(bike.hasAlert) {
        markerStatusClass = 'marker-alert';
      } else if (bike.isCurrentlyInUse) {
        markerStatusClass = 'marker-in-use';
      }
      
      // Creăm pictograma pt această bicicletă, inserând clasa în HTML
      const dynamicIcon = L.divIcon({
        html: `<div class="bike-marker ${markerStatusClass}">🚲</div>`,
        className: 'custom-leaflet-icon', // Containerul Leaflet rămâne transparent
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18], // De unde apare popup-ul față de centrul iconiței
      });

      // Creăm markerul folosind pictograma dinamică
      const marker = L.marker([bike.latitude, bike.longitude], {
        icon: dynamicIcon,
        title: bike.name
      });

      // Creăm un element HTML de la zero pt popup
      const popupContainer = document.createElement('div');
      popupContainer.className = 'bike-popup-content';
      
      // Setăm conținutul (nume, baterie, buton)
      popupContainer.innerHTML = `<h3 style="margin: 0 0 8px 0;">${bike.name}</h3>
      <p style="margin: 0 0 12px 0;">Baterie: <strong>${bike.battery.percentage}%</strong></p>
      <button class="mat-primary-like-btn" 
                id="btn-reserve-${bike.id}"
                ${ bike.hasAlert ? 'disabled style="background-color: #9e9e9e; cursor: not-allowed;"' : '' }>
              ${ bike.hasAlert ? 'Indisponibilă' : 'Rezervă Bicicleta' }
      </button>`;
      
      // Legăm evenimentul de click de metoda din Angular
      const reserveBtn = popupContainer.querySelector(`#btn-reserve-${bike.id}`);
      if (reserveBtn) {
        reserveBtn.addEventListener('click', () => {
          this.openReservationDialog(bike.id);
        });
      }
      
      // Atașăm popup-ul la marker
      marker.bindPopup(popupContainer);
      return marker;
    });
  }

  // Metoda care deschide modalul
  private openReservationDialog(bikeId: string): void {
    const dialogRef = this.dialog.open(ReservationDialogComponent, {
      width: '400px',
      data: { bikeId: bikeId }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        console.log('Rezervare creată pentru bicicleta ', bikeId);
      }
    });
  }

  // Helper pentru a genera locații random în București
  private generateDummyCoordinates(bikes: Bike[]): Bike[] {
    const minLat = 44.41;
    const maxLat = 44.45;
    const minLng = 26.07;
    const maxLng = 26.12;

    return bikes.map(bike => ({
      ...bike,
      latitude: Math.random() * (maxLat - minLat) + minLat,
      longitude: Math.random() * (maxLng - minLng) + minLng
    }));
  }
}