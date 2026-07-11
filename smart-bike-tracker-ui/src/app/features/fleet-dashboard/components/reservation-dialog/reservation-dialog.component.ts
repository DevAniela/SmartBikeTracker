import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReservationService } from '../../../../core/services/reservation.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'app-reservation-dialog',
    // În Angular 22 componentele sunt standalone by default, deci importăm bibliotecile direct aici, nu într-un module.ts
    imports: [
        ReactiveFormsModule,
        MatDialogModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatInputModule,
        MatButtonModule
    ],
    templateUrl: './reservation-dialog.component.html',
    styleUrls: ['./reservation-dialog.component.scss']
})
export class ReservationDialogComponent {
    // Injectăm dependențele direct ca proprietăți (Angular 22 style)
    private fb = inject(FormBuilder);
    private reservationService = inject(ReservationService);
    private dialogRef = inject(MatDialogRef<ReservationDialogComponent>);
    // Prindem ID-ul bicicletei trimis de componenta părinte (Dashboard) la deschiderea modalului
    public data = inject<{ bikeId: string }>(MAT_DIALOG_DATA);

    public errorMessage: string | null = null;
    public isLoading = false;

    public reservationForm: FormGroup = this.fb.group({
        date: [new Date(), Validators.required],
        startTime: ['', Validators.required], // ex: "10:00"
        endTime: ['', Validators.required] // ex: "12:00"
    });

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
            next: (response) => {
                // Dacă e 200 OK, închidem modalul și trimitem true părintelui pt a reîncărca lista
                this.dialogRef.close(true);
            },
            error: (err: HttpErrorResponse) => {
                this.isLoading = false;
                // Dacă primim HTTP 400 (bad request), setăm mesajul de eroare aruncat de UseCase-ul din .NET
                if(err.status === 400 && err.error?.message) {
                    this.errorMessage = err.error.message;
                } else {
                    this.errorMessage = 'A apărul o eroare neașteptată la server.';
                }
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
