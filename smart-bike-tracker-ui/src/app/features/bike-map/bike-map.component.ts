import { Component, OnInit, inject } from '@angular/core';
import { LeafletModule } from '@bluehalo/ngx-leaflet';
import * as L from 'leaflet';
import { BikeApiService } from '../../core/services/bike-api.service';
import { Bike } from '../../core/models/bike.model';

@Component({
  selector: 'app-bike-map',
  standalone: true,
  imports: [LeafletModule],
  templateUrl: './bike-map.component.html',
  styleUrls: ['./bike-map.component.scss']
})
export class BikeMapComponent implements OnInit {
  private bikeApiService = inject(BikeApiService);

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

  // Pictograma pt bicicletă
  private bikeIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', // Icon default momentan
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

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
      const marker = L.marker([bike.latitude, bike.longitude], {
        icon: this.bikeIcon,
        title: bike.name
      });
      return marker;
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