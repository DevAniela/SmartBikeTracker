namespace SmartBikeTracker.Domain.Entities;

public class ChainSensor
{
    public bool RequiresMaintenance { get; private set; }

    public ChainSensor(bool requiresMaintenance)
    {
        RequiresMaintenance = requiresMaintenance;
    }
}