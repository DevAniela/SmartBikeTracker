using SmartBikeTracker.Domain.Entities;

namespace SmartBikeTracker.Application.Interfaces;

public interface IBikeRepository
{
    Task<IEnumerable<Bike>> GetAllAsync();
    Task<Bike?> GetByIdAsync(Guid id);
    Task UpdateAsync(Bike bike);
}