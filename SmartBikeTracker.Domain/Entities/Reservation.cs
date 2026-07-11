using SmartBikeTracker.Domain.Enums;

namespace SmartBikeTracker.Domain.Entities;

public class Reservation
{
    public Guid Id { get; private set; }
    public Guid BikeId { get; private set; }
    public DateTime StartTime { get; private set; }
    public DateTime EndTime { get; private set; }
    public ReservationStatus Status { get; private set; }

    // Constructorul folosit în cod pt a crea o rezervare nouă
    public Reservation(Guid id, Guid bikeId, DateTime startTime, DateTime endTime)
    {
        if (endTime <= startTime)
        {
            throw new ArgumentException("Timpul de final trebuie să fie după timpul de început.");
        }

        Id = id;
        BikeId = bikeId;
        StartTime = startTime;
        EndTime = endTime;
        Status = ReservationStatus.Active;
    }

    // Constructorul privat pt Entity Framework Core
#pragma warning disable CS8618 // ignorăm avertismetul de null
    private Reservation() { }
#pragma warning disable CS8618

    // Metoda de business (Rich Domain Model)
    public void Complete()
    {
        Status = ReservationStatus.Completed;
    }

    public void Cancel()
    {
        Status = ReservationStatus.Cancelled;
    }
}