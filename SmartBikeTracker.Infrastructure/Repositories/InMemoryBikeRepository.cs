using SmartBikeTracker.Application.Interfaces;
using SmartBikeTracker.Domain.Entities;

namespace SmartBikeTracker.Infrastructure.Repositories;

public class InMemoryBikeRepository : IBikeRepository
{
    private readonly List<Bike> _bikes;

    public InMemoryBikeRepository()
    {
        // Seed cu dummy data
        _bikes = new List<Bike>
        {
            // O bicicletă în stare perfectă
            new Bike(Guid.NewGuid(), "Bike-001 (București Nord)", Domain.Enums.BikeType.CityBike, new Battery(85), new ChainSensor(false)),
            
            // O bicicletă care va declanșa alerta de baterie critică (< 20%)
            new Bike(Guid.NewGuid(), "Bike-002 (Universitate)", Domain.Enums.BikeType.CityBike, new Battery(15), new ChainSensor(false)),
            
            // O bicicletă care va declanșa alerta de mentenanță la senzorul de lanț
            new Bike(Guid.NewGuid(), "Bike-003 (Tineretului)", Domain.Enums.BikeType.CityBike, new Battery(60), new ChainSensor(true))
        };
    }

    public Task<IEnumerable<Bike>> GetAllAsync()
    {
        // Returnăm lista încapsulată într-un Task finalizat pentru a respecta interfața asincronă
        return Task.FromResult<IEnumerable<Bike>>(_bikes);
    }

    public Task<Bike?> GetByIdAsync(Guid id)
    {
        var bike = _bikes.FirstOrDefault(b => b.Id == id);
        return Task.FromResult(bike);
    }

    public Task UpdateAsync(Bike bike)
    {
        // Deși obiectul a fost actualizat direct în UseCase prin referință, 
        // simulăm o actualizare reală în colecție pentru robustețe.
        var index = _bikes.FindIndex(b => b.Id == bike.Id);
        if (index != -1)
        {
            _bikes[index] = bike;
        }

        return Task.CompletedTask;
    }
}