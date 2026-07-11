using Microsoft.EntityFrameworkCore;
using SmartBikeTracker.Application.Interfaces;
using SmartBikeTracker.Domain.Entities;

namespace SmartBikeTracker.Infrastructure.Repositories;

public class PostgresBikeRepository : IBikeRepository
{
    private readonly SmartBikeDbContext _dbContext;

    // Injectăm conexiunea către baza de date reală 
    public PostgresBikeRepository(SmartBikeDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IEnumerable<Bike>> GetAllAsync()
    {
        // EF Core va scrie în spate "SELECT * FROM Bikes" și va aduce lista
        return await _dbContext.Bikes.ToListAsync();
    }

    public async Task<Bike?> GetByIdAsync(Guid id)
    {
        // Căutăm bicicleta după ID în baza de date
        return await _dbContext.Bikes.FirstOrDefaultAsync(b => b.Id == id);
    }

    public async Task UpdateAsync(Bike bike)
    {
        // Spunem lui EF Core că această biciletă are date noi
        _dbContext.Bikes.Update(bike);

        // Salvăm efectiv modificările pe disk, în PostgreSQL
        await _dbContext.SaveChangesAsync();
    }
}