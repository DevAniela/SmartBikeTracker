using SmartBikeTracker.Application.Interfaces;
using SmartBikeTracker.Domain.Entities;

namespace SmartBikeTracker.Application.UseCases;

// Această clasă "mediază" (intermediază) procesul. 
// Controllerul nu vorbește direct cu baza de date (Repository). 
// Controllerul vorbește cu Use Case-ul, iar Use Case-ul orchestrează logica.

// 1. Definim DTO-urile așa cum le așteaptă interfața de Angular (nested objects)
// În arhitecturile moderne (Clean Architecture, DDD), se folosește class pentru Entități (deoarece entitățile au identitate proprie și își schimbă starea în timp prin metode de business) și record pentru Value Objects și DTO-uri (pentru că sunt imuabile și reprezintă doar un screenshot al datelor).
// Tipul record generează automat în spate constructorul și proprietățile (cu init in loc de set, adică obiectul poate primi valori doar în momentul instanțierii).
/*public class BatteryDto
{
    public int Percentage { get; init; }
    public bool IsCritical { get; init; }

    public BatteryDto(int percentage, bool isCritical)
    {
        Percentage = percentage;
        IsCritical = isCritical;
    }
}*/
public record BatteryDto(int Percentage, bool IsCritical);
public record ChainSensorDto(bool RequiresMaintenance);

public record BikeStatusDto(
    Guid Id,
    string Name,
    string Type,
    BatteryDto Battery,
    ChainSensorDto ChainSensor,
    bool HasAlert,
    bool IsCurrentlyInUse
);

public class GetFleetStatusUseCase
{
    private readonly IBikeRepository _bikeRepository;
    private readonly IReservationRepository _reservationRepository;

    // 2. Injectăm IReservationRepository în constructor
    public GetFleetStatusUseCase(IBikeRepository bikeRepository, IReservationRepository reservationRepository)
    {
        _bikeRepository = bikeRepository;
        _reservationRepository = reservationRepository;
    }

    // 3. Modificăm semnătura metodei pt a returna IEnumerable<BikeStatusDto> în loc de IEnumerable<Bike> 
    public async Task<IEnumerable<BikeStatusDto>> ExecuteAsync()
    {
        // Aducem toate bicicletele
        var bikes = await _bikeRepository.GetAllAsync();

        // Aducem toate rezervările care se află în desfășurare acum
        var ongoingReservations = await _reservationRepository.GetOngoingReservationsAsync();

        // Creăm un HashSet cu ID-urile bicicletelor ocupate (HashSet oferă căutare ultra-rapidă)
        var busyBikeIds = ongoingReservations.Select(r => r.BikeId).ToHashSet();

        // Mapăm entitățile către DTO, integrând statusul dinamic
        var result = bikes.Select(bike => new BikeStatusDto(
            Id: bike.Id,
            Name: bike.Name,
            Type: bike.Type.ToString(), // Convertim enum-ul în string pentru Angular
            Battery: new BatteryDto(
                Percentage: bike.Battery.Percentage,
                IsCritical: bike.Battery.IsCritical
            ),
            ChainSensor: new ChainSensorDto(
                RequiresMaintenance: bike.ChainSensor.RequiresMaintenance
            ),
            HasAlert: bike.HasAlert,
            IsCurrentlyInUse: busyBikeIds.Contains(bike.Id) // Verifică dacă ID-ul bicicletei e în HashSet
        ));

        return result;
    }
}