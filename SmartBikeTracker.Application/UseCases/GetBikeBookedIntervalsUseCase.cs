using SmartBikeTracker.Application.Interfaces;

namespace SmartBikeTracker.Application.UseCases;

// Folosim un Record (DTO) pentru a trimite doar datele necesare, fără detalii interne
public record BookedIntervalDto(DateTime StartTime, DateTime EndTime);

public class GetBikeBookedIntervalsUseCase
{
    private readonly IReservationRepository _reservationRepository;

    public GetBikeBookedIntervalsUseCase(IReservationRepository reservationRepository)
    {
        _reservationRepository = reservationRepository;
    }

    public async Task<IEnumerable<BookedIntervalDto>> ExecuteAsync(Guid bikeId)
    {
        var activeReservations = await _reservationRepository.GetActiveReservationsForBikeAsync(bikeId);

        // Returnăm doar intervalele din viitor, ordonate cronologic
        return activeReservations
            .Where(r => r.EndTime > DateTime.UtcNow)
            .OrderBy(r => r.StartTime)
            .Select(r => new BookedIntervalDto(r.StartTime, r.EndTime));
    }
}