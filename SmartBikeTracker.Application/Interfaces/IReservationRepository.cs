using SmartBikeTracker.Domain.Entities;

namespace SmartBikeTracker.Application.Interfaces;

public interface IReservationRepository
{
    // Adaugă o rezervare nouă în baza de date
    Task AddAsync(Reservation reservation);

    // Aduce doar rezervările active pt o anumită bicicletă (util pt validarea suprapunerilor)
    Task<IEnumerable<Reservation>> GetActiveReservationsForBikeAsync(Guid bikeId);

    // Găsește o rezervare specifică după id
    Task<Reservation?> GetByIdAsync(Guid id);

    // Actualizează o rezervare (ex: când îi schimbăm statusul)
    Task UpdateAsync(Reservation reservation);
}