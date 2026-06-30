using SmartBikeTracker.Application.Interfaces;

namespace SmartBikeTracker.Application.UseCases;

public class UpdateBikeTelemetryUseCase
{
    private readonly IBikeRepository _repository;

    public UpdateBikeTelemetryUseCase(IBikeRepository repository)
    {
        _repository = repository;
    }

    public async Task ExecuteAsync(Guid bikeId, int batteryPercentage, bool chainRequiresMaintenance)
    {
        var bike = await _repository.GetByIdAsync(bikeId);

        if (bike == null)
        {
            // Fail-fast: Dacă bicicleta nu există, oprim execuția.
            throw new KeyNotFoundException($"Bicicleta cu ID-ul {bikeId} nu a fost găsită.");
        }

        // 1. Apelăm metoda de domeniu (Logica de business pură)
        bike.UpdateTelemetry(batteryPercentage, chainRequiresMaintenance);

        // 2. Salvăm starea modificată prin interfață (Infrastructură)
        await _repository.UpdateAsync(bike);
    }
}