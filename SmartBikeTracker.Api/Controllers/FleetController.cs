using Microsoft.AspNetCore.Mvc;
using SmartBikeTracker.Application.UseCases;

namespace SmartBikeTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FleetController : ControllerBase
{
    // Declaram dependența ca readonly (nu poate fi modificată după ce e primită)
    private readonly GetFleetStatusUseCase _getFleetStatusUseCase;
    private readonly UpdateBikeTelemetryUseCase _updateTelemetryUseCase;

    // INJECȚIA: Controllerul spune "Cine mă creează pe mine, trebuie să îmi dea un IGetFleetStatusUseCase"
    // Containerul .NET vede asta și îi "injectează" automat implementarea corectă.
    // Injectăm direct Use Case-urile. API-ul nu are nevoie să știe de Repository.
    public FleetController(GetFleetStatusUseCase getFleetStatusUseCase, UpdateBikeTelemetryUseCase updateTelemetryUseCase)
    {
        _getFleetStatusUseCase = getFleetStatusUseCase;
        _updateTelemetryUseCase = updateTelemetryUseCase;
    }

    [HttpGet]
    public async Task<IActionResult> GetFleet()
    // "Task<IActionResult>" este promisiunea că, în viitor, vom returna un rezultat
    {
        // Folosim dependența injectată, fără să ne pese cum a fost construită în spate
        var bikes = await _getFleetStatusUseCase.ExecuteAsync();
        // "await" cere bicicletele de la baza de date, eliberând între timp thread-ul principal
        // când sunt gata datele, execuția revine exact de aici
        return Ok(bikes);
    }

    [HttpPost("telemetry")]
    public async Task<IActionResult> UpdateTelemetry([FromBody] TelemetryDto request)
    {
        try
        {
            await _updateTelemetryUseCase.ExecuteAsync(request.BikeId, request.BatteryPercentage, request.ChainRequiresMaintenance);
            return Ok(new { message = "Telemetrie actualizată cu succes." });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message }); // Fail-fast: returnăm 404 dacă ID-ul e greșit
        }
    }
}

// Obiect simplu pentru a citi datele trimise de senzori
public class TelemetryDto
{
    public Guid BikeId { get; set; }
    public int BatteryPercentage { get; set; }
    public bool ChainRequiresMaintenance { get; set; }
}