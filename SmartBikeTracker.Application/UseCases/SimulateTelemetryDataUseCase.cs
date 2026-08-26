using SmartBikeTracker.Application.Interfaces;

namespace SmartBikeTracker.Application.UseCases;

public class SimulateTelemetryDataUseCase
{
    private readonly IBikeRepository _bikeRepository;
    private readonly Random _random = new Random();

    public SimulateTelemetryDataUseCase(IBikeRepository bikeRepository)
    {
        _bikeRepository = bikeRepository;
    }

    public async Task ExecuteAsync(CancellationToken cancellationToken = default)
    // În programarea .NET la nivel de producție, orice metodă asincronă (async/Task) ar trebui să accepte un CancellationToken, pentru ca aplicația să poată opri interogările din baza de date dacă serverul se închide brusc (graceful shutdown).
    // Folosim "default" ca să fie opțional. Dacă cineva (cum ar fi Controller-ul) nu dă un token de anulare, limbajul va folosi unul gol (default) și va rula normal. Dar, când este apelat de BackgroundService, acesta îi va pasa propriul lui stoppingToken.
    {
        // 1. Aducem toate bicicletele din baza de date
        var bikes = await _bikeRepository.GetAllAsync();

        foreach (var bike in bikes)
        {
            int currentBattery = bike.Battery.Percentage;
            int drainAmount = _random.Next(1, 4); // Scădem între 1% și 3%
            int newBattery = currentBattery - drainAmount;

            if (newBattery <= 0)
            {
                newBattery = 100; // Dacă s-a descărcat complet, simulăm că a fost pusă la încărcat
            }

            // Păstrăm starea curentă a lanțului
            bool currentChainState = bike.ChainSensor.RequiresMaintenance;

            // 2. Apelăm metoda UpdateTelemetry (din entitate) pentru a actualiza starea
            bike.UpdateTelemetry(newBattery, currentChainState);

            // 3. Salvăm modificările în BD
            await _bikeRepository.UpdateAsync(bike);
        }
    }
}