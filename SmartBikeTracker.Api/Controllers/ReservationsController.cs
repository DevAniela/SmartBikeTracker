// SmartBikeTracker.Api/Controllers/ReservationsController.cs
using Microsoft.AspNetCore.Mvc;
using SmartBikeTracker.Api.Controllers.DTOs;
using SmartBikeTracker.Application.Interfaces;

namespace SmartBikeTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")] // Mapează automat ruta către: http://localhost:5009/api/reservations
public class ReservationsController : ControllerBase
{
    private readonly ICreateReservationUseCase _createReservationUseCase;

    // Injectăm UseCase-ul
    public ReservationsController(ICreateReservationUseCase createReservationUseCase)
    {
        _createReservationUseCase = createReservationUseCase;
    }

    [HttpPost]
    public async Task<IActionResult> CreateReservation([FromBody] CreateReservationRequest request)
    {
        try
        {
            // Delegăm logica grea către stratul Application
            var reservation = await _createReservationUseCase.ExecuteAsync(
                request.BikeId,
                request.StartTime,
                request.EndTime
            );

            // Dacă am ajuns aici, rezervarea a fost salvată cu succes.
            // Returnăm codul 200 OK și obiectul proaspăt creat.
            return Ok(reservation);
        }
        catch (InvalidOperationException ex)
        {
            // Prindem excepția de suprapunere și o trimitem curat către Frontend
            // Am învelit mesajul într-un obiect anonim { message = ... } ca să fie ușor de citit din Angular
            return BadRequest(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            // Prindem și excepția de validare din Domain (dacă EndTime <= StartTime)
            return BadRequest(new { message = ex.Message });
        }
    }
}