using SmartBikeTracker.Application.Interfaces;
using SmartBikeTracker.Domain.Entities;

namespace SmartBikeTracker.Application.UseCases;

// Această clasă "mediază" (intermediază) procesul. 
// Controllerul nu vorbește direct cu baza de date (Repository). 
// Controllerul vorbește cu Use Case-ul, iar Use Case-ul orchestrează logica.
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
        // Aici putem adăuga logică suplimentară (ex: filtrare, validare)
        // Momentan vom returna direct entitățile.
        return await _repository.GetAllAsync();
    }
}