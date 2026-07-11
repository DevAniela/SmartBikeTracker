using SmartBikeTracker.Domain.Entities;

namespace SmartBikeTracker.Application.Interfaces;

public interface ICreateReservationUseCase
{
    // Metoda returnează rezervarea creată pt a putea fi trimisă înapoi utilizatorului
    Task<Reservation> ExecuteAsync(Guid bikeId, DateTime startTime, DateTime endTime);
}