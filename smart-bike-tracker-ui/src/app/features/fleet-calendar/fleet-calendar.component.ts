import { Component, LOCALE_ID, Injectable, OnInit, inject } from '@angular/core';
import { CommonModule, registerLocaleData, formatDate } from '@angular/common';
import localeRo from '@angular/common/locales/ro';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReservationDialogComponent } from '../fleet-dashboard/components/reservation-dialog/reservation-dialog.component';

import { 
    CalendarView, 
    CalendarEvent,
    CalendarPreviousViewDirective,
    CalendarNextViewDirective,
    CalendarTodayDirective,
    CalendarMonthViewComponent,
    CalendarWeekViewComponent,
    CalendarDayViewComponent,
    CalendarDateFormatter,
    DateFormatterParams
} from 'angular-calendar';

import { BikeApiService } from '../../core/services/bike-api.service';
import { ReservationService } from '../../core/services/reservation.service';
import { Bike } from '../../core/models/bike.model';
import { interval } from 'rxjs';

// Înregistrăm limba română în Angular
registerLocaleData(localeRo, 'ro');

// Clasă pentru suprascrierea formatelor default de oră (AM/PM -> 24h)
@Injectable()
export class CustomDateFormatter extends CalendarDateFormatter {
  
  // Format pentru coloana de ore din vizualizarea "Săptămână"
  public override weekViewHour({ date, locale }: DateFormatterParams): string {
    return formatDate(date, 'HH:mm', locale || 'ro');
  }

  // Format pentru coloana de ore din vizualizarea "Zi"
  public override dayViewHour({ date, locale }: DateFormatterParams): string {
    return formatDate(date, 'HH:mm', locale || 'ro');
  }
}

@Component({
    selector: 'app-fleet-calendar',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatSelectModule,
        MatFormFieldModule,
        // Directive pentru navigația în timp (butoanele)
        CalendarPreviousViewDirective,
        CalendarNextViewDirective,
        CalendarTodayDirective,
        // Componentele vizuale (tag-urile <mwl-...>)
        CalendarMonthViewComponent,
        CalendarWeekViewComponent,
        CalendarDayViewComponent
    ],
    // Adăugăm LOCALE_ID în providers pentru a seta limba implicită
    providers: [
        { provide: LOCALE_ID, useValue: 'ro' },
        // Îi spunem calendarului să folosească formatatorul customizat
        { provide: CalendarDateFormatter, useClass: CustomDateFormatter }
    ],
    templateUrl: './fleet-calendar.component.html',
    styleUrls: ['./fleet-calendar.component.scss']
})
export class FleetCalendarComponent implements OnInit {
    private bikeApiService = inject(BikeApiService);
    private reservationService = inject(ReservationService);
    private dialog = inject(MatDialog);

    // Setup-ul inițial pentru calendar
    public view: CalendarView = CalendarView.Week;
    public CalendarView = CalendarView; // Expunem enum-ul către HTML
    public viewDate: Date = new Date(); // Data de azi

    // Variabilă de limbă pe care o vom trimite către HTML
    public locale: string = 'ro';

    public bikes: Bike[] = [];
    public selectedBikeControl = new FormControl<string>('');
    public events: CalendarEvent[] = [];

    ngOnInit() {
        this.bikeApiService.startPolling();

        // 1. Populăm dropdown-ul și selectăm prima bicicletă
        this.bikeApiService.bikes$.subscribe(bikes => {
            this.bikes = bikes;
            if (bikes.length > 0 && !this.selectedBikeControl.value) {
                this.selectedBikeControl.setValue(bikes[0].id);
            }
        });

        // 2. Ascultăm modificările ca să cerem rezervările pt bicicleta aleasă
        this.selectedBikeControl.valueChanges.subscribe(bikeId => {
            if(bikeId) this.loadReservations(bikeId);
        });
    }

    private loadReservations(bikeId: string) {
        this.reservationService.getBookedIntervals(bikeId).subscribe(intervals => {
            this.events = intervals.map(interval => {
                return {
                    start: new Date(interval.startTime),
                    end: new Date(interval.endTime),
                    title: `Rezervat (indisponibilă)`,
                    color: {
                        primary: '#ffc107',
                        secondary: '#fff8e1'
                    },
                    allDay: false
                } as CalendarEvent;
            });
        });
    }

    // Metodă schimbare vizualizare (lună/saptămână/zi)
    public setView(view: CalendarView) {
        this.view = view;
    }

    // Metoda pentru click pe un spațiu liber
    public hourSegmentClicked(event: { date: Date }) {
        const selectedBikeId = this.selectedBikeControl.value;
        if (!selectedBikeId) return;

        // Blocăm rezervările în trecut
        if (event.date < new Date()) {
            alert('Nu poți face o rezervare în trecut!');
            return;
        }

        // Deschidem dialogul
        const dialogRef = this.dialog.open(ReservationDialogComponent, {
            width: '400px',
            data: { 
                bikeId: selectedBikeId,
                preselectedStartTime: event.date // Îi trimitem ora pe care a dat click
            }
        });

        // Ascultăm când se închide dialogul.
        // Dacă utilizatorul a dat "Salvează", reîncărcăm intervalele de la backend ca să apară instant pe calendar
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadReservations(selectedBikeId);
            }
        });
    }
}