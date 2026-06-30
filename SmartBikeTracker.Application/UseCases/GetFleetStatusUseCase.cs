using SmartBikeTracker.Application.Interfaces;
using SmartBikeTracker.Domain.Entities;

namespace SmartBikeTracker.Application.UseCases;

public class GetFleetStatusUseCase
{
    private readonly IBikeRepository _repository;

    public GetFleetStatusUseCase(IBikeRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<Bike>> ExecuteAsync()
    {
        // Într-o aplicație complexă am mapa entitățile către DTO-uri aici. 
        // Momentan vom returna direct entitățile.
        return await _repository.GetAllAsync();
    }
}