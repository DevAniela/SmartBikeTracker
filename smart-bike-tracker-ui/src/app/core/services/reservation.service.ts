import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

// DTO-ul care mapează exact clasa CreateReservationRequest din C#
export interface CreateReservationRequest {
    bikeId: string; 
    startTime: string; // ISO String (YYYY-MM-DDTHH:mm:ss.sssZ)
    endTime: string; // ISO String
}

// Interfața pt ce primim de la sever
export interface BookedInterval {
    startTime: string;
    endTime: string;
}

@Injectable({
    providedIn: 'root'
})
export class ReservationService {
    private readonly API_URL = 'http://localhost:5009/api/reservations';

    constructor(private http: HttpClient) {}

    public createReservation(request: CreateReservationRequest) : Observable<any> {
        // Returnează un flux pe care componenta îl va consuma
        return this.http.post(this.API_URL, request);
    }

    // Apelăm endpoint-ul din ReservationsController
    public getBookedIntervals(bikeId: string): Observable<BookedInterval[]> {
        return this.http.get<BookedInterval[]>(`${this.API_URL}/bike/${bikeId}`);
    }
}