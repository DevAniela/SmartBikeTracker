import { Component } from '@angular/core';
import { LeafletModule } from '@bluehalo/ngx-leaflet';
import * as L from 'leaflet';

@Component({
  selector: 'app-bike-map',
  standalone: true,
  imports: [LeafletModule],
  templateUrl: './bike-map.component.html',
  styleUrls: ['./bike-map.component.scss']
})
export class BikeMapComponent {
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
}