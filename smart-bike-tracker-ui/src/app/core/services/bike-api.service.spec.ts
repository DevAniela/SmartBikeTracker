import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { BikeApiService } from './bike-api.service';

describe('BikeApiService', () => {
  let service: BikeApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        // Configurăm clientul HTTP de bază și interceptorul de teste pentru a izola serviciul de rețeaua reală
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(BikeApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});