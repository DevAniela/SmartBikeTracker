import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscription, timer, of } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';
import { Bike } from '../models/bike.model';

@Injectable({
    providedIn: 'root' // FACE SERVICIUL DISPONIBIL LA NIVEL GLOBAL (Singleton) - nu trebuie să-l importăm în module, ci doar să-l injectăm în constructorul componentelor care au nevoie de el.
})
export class BikeApiService implements OnDestroy {
    // Hardcodat pentru PoC. În producție, acesta vine din environment.ts
    private readonly API_URL = 'http://localhost:5009/api/fleet';

    // 1. BehaviorSubject: Stocăm "starea curentă". 
    // Acesta este SUBIECTUL (Publisher)
    // Starea aplicației (State) - privată, ca să nu poată fi modificată din exterior
    // Când cineva se abonează, primește imediat ultima valoare cunoscută.
    private bikesSubject = new BehaviorSubject<Bike[]>([]);

    // 2. Fluxul public (Observable) la care componentele se vor abona
    // Acesta este fluxul pe care ceilalți îl pot OBSERVA
    // Componentele au voie doar să "asculte" (Observable), nu să modifice datele direct.
    public bikes$: Observable<Bike[]> = this.bikesSubject.asObservable();

    private pollingSubscription?: Subscription;

    constructor(private http: HttpClient) { }

    public startPolling(): void {
        if (this.pollingSubscription) {
            return; // Evităm crearea mai multor fluxuri de polling simultan
        }

        // RxJS Polling Magic
        this.pollingSubscription = timer(0, 5000).pipe(
            // 1. timer(0, 5000): Emite o valoare IMEDIAT (0ms), apoi la fiecare 5000ms (5 secunde).

            // 2. switchMap: Inima polling-ului. Când timer-ul "ticăie", switchMap declanșează apelul HTTP.
            // Dacă a trecut intervalul de 5s, dar request-ul HTTP anterior nu s-a terminat,
            // switchMap anulează request-ul vechi și pornește unul nou.
            switchMap(() => this.http.get<Bike[]>(this.API_URL)),

            // 3. tap: Un "spion" (side-effect). Preia datele primite de la backend și le 
            // trimite în BehaviorSubject pentru a actualiza starea (bikesSubject.next(bikes)).
            tap((bikes: Bike[]) => this.bikesSubject.next(bikes)), // Actualizăm starea

            // 4. Dacă serverul pică, prindem eroarea, o logăm, și returnăm un array gol (of([])).
            // Astfel, fluxul RxJS NU "moare" și va continua să încerce din nou peste 5 secunde.
            catchError(error => {
                console.error('Eroare la preluarea datelor despre flotă:', error);
                return of([]); // Împiedicăm distrugerea fluxului în caz de eroare (ex: backend oprit)
            })
        ).subscribe(); // Declanșează efectiv execuția fluxului.
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