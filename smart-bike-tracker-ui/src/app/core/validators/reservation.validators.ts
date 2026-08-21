import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { BookedInterval } from "../services/reservation.service";

// Funcția de validare
// Aceasta este o funcție "factory" (o funcție care creează și returnează o altă funcție)
// Primește ca argument un array cu rezervările deja existente (bookedIntervals) și returnează un validator de tip ValidatorFn
export function overlapValidator(bookedIntervals: BookedInterval[]): ValidatorFn {
    // Primește ca parametru FormGroup și va returna un obiect cu erori (dacă datele sunt greșite) sau null (dacă formularul e valid)
    return (group: AbstractControl): ValidationErrors | null => {
        const dateCtrl = group.get('date')?.value;
        const startCtrl = group.get('startTime')?.value;
        const endCtrl = group.get('endTime')?.value;

        // Dacă nu avem toate datele completate, validarea trece mai departe (consideră formularul valid deocamdată)
        if (!dateCtrl || !startCtrl || !endCtrl) return null;
        
        // Funcție ajutătoare pt a combina data cu ora (la fel ca în componentă)
        const combine = (d: Date, time: string) => {
            const [hours, minutes] = time.split(':').map(Number);
            const newDate = new Date(d); // copiem data ca să nu modificăm obiectul inițial
            newDate.setHours(hours, minutes, 0, 0);
            return newDate.getTime(); // returnează timpul sub formă de milisecunde scurse de la 1 ianuarie 1970 (timestamp) pt a face comparația
        }

            const requestedStart = combine(dateCtrl, startCtrl);
            const requestedEnd = combine(dateCtrl, endCtrl);
            
            // 1. Validare logică orară
            if (requestedEnd <= requestedStart) {
                return { invalidRange: true }; // form.hasError('invalidRange')
            }

            // 2. Validare suprapunerilor
            const isOverlapping = bookedIntervals.some(interval => { // .some() returnează true dacă cel puțin un element din listă respectă condiția din interior
                const bookedStart = new Date(interval.startTime).getTime();
                const bookedEnd = new Date(interval.endTime).getTime();
                return requestedStart < bookedEnd && requestedEnd > bookedStart; // dacă se suprapun, returnează true
            });
            return isOverlapping ? { overlappingReservation: true } : null;
    }
}
