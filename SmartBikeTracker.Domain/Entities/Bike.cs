using SmartBikeTracker.Domain.Enums;

namespace SmartBikeTracker.Domain.Entities;

public class Bike
{
    public Guid Id { get; private set; }
    public string Name { get; private set; }
    public BikeType Type { get; private set; }
    public Battery Battery { get; private set; }
    public ChainSensor ChainSensor { get; private set; }

    // o bicicleta are nevoie de reparatii daca bateria e critica sau are probleme cu lantul
    public bool HasAlert => Battery.IsCritical || ChainSensor.RequiresMaintenance;

    public Bike(Guid id, string name, BikeType type, Battery battery, ChainSensor chainSensor)
    {
        Id = id;
        Name = name;
        Type = type;
        Battery = battery;
        ChainSensor = chainSensor;
    }

    // Pentru Entity Framework Core
#pragma warning disable CS8618 // ignorăm avertismetul de null pt EF Core
    private Bike() { }
#pragma warning disable CS8618

    // metoda pt actualizarea datelor de telemetrie
    public void UpdateTelemetry(int batteryPercentage, bool chainRequiresMaintenance)
    {
        // se inlocuiesc Value Objects cu noile citiri de la senzori
        Battery = new Battery(batteryPercentage);
        ChainSensor = new ChainSensor(chainRequiresMaintenance);
    }
}