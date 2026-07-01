using Microsoft.AspNetCore.Mvc;
using SmartBikeTracker.Application.UseCases;

namespace SmartBikeTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FleetController : ControllerBase
{
    private readonly GetFleetStatusUseCase _getFleetStatusUseCase;
    private readonly UpdateBikeTelemetryUseCase _updateTelemetryUseCase;

    // Injectăm direct Use Case-urile. API-ul nu are nevoie să știe de Repository.
    public FleetController(GetFleetStatusUseCase getFleetStatusUseCase, UpdateBikeTelemetryUseCase updateTelemetryUseCase)
    {
        _getFleetStatusUseCase = getFleetStatusUseCase;
        _updateTelemetryUseCase = updateTelemetryUseCase;
    }

    [HttpGet]
    public async Task<IActionResult> GetFleet()
    {
        var bikes = await _getFleetStatusUseCase.ExecuteAsync();
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