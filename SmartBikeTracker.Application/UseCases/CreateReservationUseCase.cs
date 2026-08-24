using SmartBikeTracker.Application.Interfaces;
using SmartBikeTracker.Domain.Entities;

namespace SmartBikeTracker.Application.UseCases;

public class CreateReservationUseCase : ICreateReservationUseCase
{
    private readonly IReservationRepository _reservationRepository;
    private readonly IBikeRepository _bikeRepository;

    // Injectăm repository-ul pt a putea citi și salva din/în baza de date
    public CreateReservationUseCase(IReservationRepository reservationRepository, IBikeRepository bikeRepository)
    {
        _reservationRepository = reservationRepository;
        _bikeRepository = bikeRepository;
    }

    public async Task<Reservation> ExecuteAsync(Guid bikeId, DateTime startTime, DateTime endTime)
    {
        // 1. Aducem bicicleta din baza de date
        var bike = await _bikeRepository.GetByIdAsync(bikeId);
        if (bike == null)
        {
            throw new ArgumentException("Bicicleta nu a fost găsită.");
        }

        // 2. GUARD 1: Verificăm dacă bicicleta are nevoie de mentenanță
        if (bike.HasAlert)
        {
            throw new InvalidOperationException("Bicicleta are nevoie de mentenanță și nu poate fi rezervată.");
        }

        // 3. Aducem toate rezervările active pt această bicicletă din baza de date
        var activeReservations = await _reservationRepository.GetActiveReservationsForBikeAsync(bikeId);

        // 4. GUARD 2: Verificăm dacă există vreo suprapunere (dacă vreo rezervare începe înainte ca alta să se termine și se termină după ce a început cealaltă).
        bool isOverlapping = activeReservations.Any(r => startTime < r.EndTime && endTime > r.StartTime);

        if (isOverlapping)
        {
            throw new InvalidOperationException("Bicicleta este deja rezervată în acest interval de timp.");
        }

        // 5. Instanțiem noua rezervare (dacă totul este valid).
        var newReservation = new Reservation(Guid.NewGuid(), bikeId, startTime, endTime);

        // 6. Salvăm rezervarea
        await _reservationRepository.AddAsync(newReservation);

        // 7. Returnăm obiectul creat
        return newReservation;
    }
}