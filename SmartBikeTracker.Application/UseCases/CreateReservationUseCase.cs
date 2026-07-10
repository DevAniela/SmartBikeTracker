using SmartBikeTracker.Application.Interfaces;
using SmartBikeTracker.Domain.Entities;

namespace SmartBikeTracker.Application.UseCases;

public class CreateReservationUseCase : ICreateReservationUseCase
{
    private readonly IReservationRepository _reservationRepository;

    // Injectăm repository-ul pt a putea citi și salva din/în baza de date
    public CreateReservationUseCase(IReservationRepository reservationRepository)
    {
        _reservationRepository = reservationRepository;
    }

    public async Task<Reservation> ExecuteAsync(Guid bikeId, DateTime startTime, DateTime endTime)
    {
        // 1. Aducem toate rezervările active pt această bicicletă din baza de date
        var activeReservations = await _reservationRepository.GetActiveReservationsForBikeAsync(bikeId);

        // 2. Verificăm dacă există vreo suprapunere (dacă vreo rezervare începe înainte ca alta să se termine și se termină după ce a început cealaltă).
        bool isOverlapping = activeReservations.Any(r => startTime < r.EndTime && endTime > r.StartTime);

        if (isOverlapping)
        {
            throw new InvalidOperationException("Bicicleta este deja rezervată în acest interval de timp.");
        }

        // 3. Instanțiem noua rezervare (dacă totul este valid).
        var newReservation = new Reservation(Guid.NewGuid(), bikeId, startTime, endTime);

        // 4. Salvăm rezervarea
        await _reservationRepository.AddAsync(newReservation);

        // 5. Returnăm obiectul creat
        return newReservation;
    }
}