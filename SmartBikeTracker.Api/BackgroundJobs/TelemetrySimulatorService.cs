using SmartBikeTracker.Application.Interfaces;
using SmartBikeTracker.Application.UseCases;

namespace SmartBikeTracker.Api.BackgroundJobs;

public class TelemetrySimulatorService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<TelemetrySimulatorService> _logger;

    public TelemetrySimulatorService(IServiceProvider serviceProvider, ILogger<TelemetrySimulatorService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Simulatorul de telemetrie a pornit.");

        // Rulează la infinit cât timp aplicația e pornită
        while (!stoppingToken.IsCancellationRequested)
        {
            await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);

            try
            {
                // Creăm un scope nou (BackgroundService e Singleton, UseCase-ul e Scoped)
                using var scope = _serviceProvider.CreateScope();
                var simulateUseCase = scope.ServiceProvider.GetRequiredService<SimulateTelemetryDataUseCase>();

                // Executăm logica din Application
                await simulateUseCase.ExecuteAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                // Folosim logger-ul în loc să lăsăm excepția să oprească serviciul
                _logger.LogError(ex, "Eroare la simularea telemetriei.");
            }
        }
    }
}