import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReservationService, BookedInterval } from '../../../../core/services/reservation.service';
import { HttpErrorResponse } from '@angular/common/http';
import { overlapValidator } from '../../../../core/validators/reservation.validators';

@Component({
    selector: 'app-reservation-dialog',
    // În Angular 22 componentele sunt standalone by default, deci importăm bibliotecile direct aici, nu într-un module.ts
    imports: [
        ReactiveFormsModule,
        MatDialogModule,
        MatDatepickerModule,
        MatInputModule,
        MatButtonModule
    ],
    templateUrl: './reservation-dialog.component.html',
    styleUrls: ['./reservation-dialog.component.scss']
})
export class ReservationDialogComponent implements OnInit {
    // Injectăm dependențele direct ca proprietăți (Angular 22 style)
    private fb = inject(FormBuilder);
    private reservationService = inject(ReservationService);
    private dialogRef = inject(MatDialogRef<ReservationDialogComponent>);
    // Prindem ID-ul bicicletei trimis de componenta părinte (Dashboard) la deschiderea modalului
    public data = inject<{ bikeId: string, preselectedStartTime?: Date }>(MAT_DIALOG_DATA);

    // Funcție care scoate formatul "10:00" dintr-un obiect Date
    private getInitialTime(): string {
        if (!this.data.preselectedStartTime) return '';
        const hours = this.data.preselectedStartTime.getHours().toString().padStart(2, '0');
        const minutes = this.data.preselectedStartTime.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    // Rescanează și actualizează HTML-ul acum
    private cdr = inject(ChangeDetectorRef);

    public errorMessage: string | null = null;
    public isLoading = true; // pt că validările sunt asincrone (depind de o bază de date), 'isLoading = true' până aducem intervalele de la backend, apoi adăugăm validatorul

    public reservationForm: FormGroup = this.fb.group({
        // Dacă am primit o dată din calendar, o folosim pe aia. Altfel punem ziua de azi.
        date: [this.data.preselectedStartTime || new Date(), Validators.required],

        // Folosim funcția de mai sus pentru a completa ora de start
        startTime: [this.getInitialTime(), Validators.required], // ex: "10:00"
        endTime: ['', Validators.required] // ex: "12:00"
    });

    ngOnInit(): void { // Se execută automat o singură dată, imediat după ce componenta (fereastra modală) a fost creată pe ecran.
        // Aducem rezervările de la backend la deschiderea modalului
        this.reservationService.getBookedIntervals(this.data.bikeId).subscribe({ // ascultă răspunsul asincron (codul dintre acolade se va executa abia după ce datele au ajuns)
            next: (intervals: BookedInterval[]) => {
                // Adăugăm validatorul la nivel de formular
                // Odată ce serverul a răspuns cu array-ul de intervals (rezervările deja existente), metoda addValidators() e aplicată pe întregul formular (this.reservationForm)
                // Asta îi spune lui Angular: "Din acest moment, ia toată logica din overlapValidator și aplic-o pe tot grupul de controale"
                this.reservationForm.addValidators(overlapValidator(intervals));
                
                // Forțează formularul să își recalculeze starea (Valid sau Invalid), după adăugarea validatorului
                this.reservationForm.updateValueAndValidity();
                this.isLoading = false; // Arată formularul

                this.cdr.detectChanges();
            },
            error: (err: HttpErrorResponse) => {
                this.errorMessage = 'Eroare la preluarea bicicletei';
                this.isLoading = false;
            }
        });
    }

    // Funcție pentru MatDatepicker care blochează selectarea zilelor din trecut
    public dateFilter = (d: Date | null): boolean => { // Union Type
        const date = d || new Date();
        const today = new Date(); // momentul exact de acum
        today.setHours(0, 0, 0, 0);
        return date >= today;
    };

    public onSubmit(): void {
        if(this.reservationForm.invalid) return;

        this.isLoading = true;
        this.errorMessage = null;

        // Extragem valorile
        const formValues = this.reservationForm.value;
        const selectedDate: Date = formValues.date;

        // Construim obiectele DateTime complete, combinând data din Datepicker cu orele din inputuri
        const startDateTime = this.combineDateAndTime(selectedDate, formValues.startTime);
        const endDateTime = this.combineDateAndTime(selectedDate, formValues.endTime);

        const request = {
            bikeId: this.data.bikeId,
            startTime: startDateTime.toISOString(),
            endTime: endDateTime.toISOString()
        };

        // Apelăm backendul
        this.reservationService.createReservation(request).subscribe({
            next: () => {
                // Dacă e 200 OK, închidem modalul și trimitem true părintelui pt a reîncărca lista
                this.dialogRef.close(true);
            },
            error: (err: HttpErrorResponse) => {
                this.isLoading = false;
                // Dacă primim HTTP 400 (bad request), setăm mesajul de eroare aruncat de UseCase-ul din .NET
                if(err.status === 400 && err.error?.message) {
                    this.errorMessage = err.error.message;
                } else {
                    this.errorMessage = 'A apărut o eroare neașteptată la server.';
                }
                this.cdr.detectChanges();
            }
        });
    }

    // Funcție de ajutor pentru a combina Data și Ora
    private combineDateAndTime(date: Date, timeString: string): Date {
        const [hours, minutes] = timeString.split(':').map(Number);
        const newDate = new Date(date);
        newDate.setHours(hours, minutes, 0, 0);
        return newDate;
    }
}
