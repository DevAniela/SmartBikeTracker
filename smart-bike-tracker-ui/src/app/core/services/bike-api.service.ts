import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscription, timer, of } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';
import { Bike } from '../models/bike.model';

@Injectable({
    providedIn: 'root'
})
export class BikeApiService implements OnDestroy {
    // Hardcodat pentru PoC. În producție, acesta vine din environment.ts
    private readonly API_URL = 'http://localhost:5009/api/fleet';

    // 1. Starea aplicației (State) - privată, ca să nu poată fi modificată din exterior
    private bikesSubject = new BehaviorSubject<Bike[]>([]);

    // 2. Fluxul public (Observable) la care componentele se vor abona
    public bikes$: Observable<Bike[]> = this.bikesSubject.asObservable();

    private pollingSubscription?: Subscription;

    constructor(private http: HttpClient) { }

    public startPolling(): void {
        if (this.pollingSubscription) {
            return; // Evităm crearea mai multor fluxuri de polling simultan
        }

        // RxJS Polling Magic
        this.pollingSubscription = timer(0, 5000).pipe(
            switchMap(() => this.http.get<Bike[]>(this.API_URL)),
            tap((bikes: Bike[]) => this.bikesSubject.next(bikes)), // Actualizăm starea
            catchError(error => {
                console.error('Eroare la preluarea datelor despre flotă:', error);
                return of([]); // Împiedicăm distrugerea fluxului în caz de eroare (ex: backend oprit)
            })
        ).subscribe();
    }

    public stopPolling(): void {
        if (this.pollingSubscription) {
            this.pollingSubscription.unsubscribe();
            this.pollingSubscription = undefined;
        }
    }

    ngOnDestroy(): void {
        this.stopPolling();
    }
}