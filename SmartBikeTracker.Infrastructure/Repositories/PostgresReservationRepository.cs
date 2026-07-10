using Microsoft.EntityFrameworkCore;
using SmartBikeTracker.Application.Interfaces;
using SmartBikeTracker.Domain.Entities;
using SmartBikeTracker.Domain.Enums;

namespace SmartBikeTracker.Infrastructure.Repositories;

public class PostgresReservationRepository : IReservationRepository
{
    private readonly SmartBikeDbContext _dbContext;

    public PostgresReservationRepository(SmartBikeDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task AddAsync(Reservation reservation)
    {
        await _dbContext.Reservations.AddAsync(reservation);
        await _dbContext.SaveChangesAsync(); // Salvăm modificarea în PostgreSQL
    }

    public async Task<IEnumerable<Reservation>> GetActiveReservationsForBikeAsync(Guid bikeId)
    {
        // Filtrăm direct în baza de date: aducem doar rezervările pt bicicleta cerută care au statusul Active
        return await _dbContext.Reservations.Where(r => r.BikeId == bikeId && r.Status == ReservationStatus.Active).ToListAsync();
    }

    public async Task<Reservation?> GetByIdAsync(Guid id)
    {
        return await _dbContext.Reservations.FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task UpdateAsync(Reservation reservation)
    {
        _dbContext.Reservations.Update(reservation);
        await _dbContext.SaveChangesAsync();
    }
}