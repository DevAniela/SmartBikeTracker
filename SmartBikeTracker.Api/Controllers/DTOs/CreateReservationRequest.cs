namespace SmartBikeTracker.Api.Controllers.DTOs;

public class CreateReservationRequest
{
    public Guid BikeId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
}