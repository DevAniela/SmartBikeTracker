namespace SmartBikeTracker.Domain.Entities;

public class Battery
{
    public int Percentage { get; private set; }

    // bateria este in stare critica sub 20%
    public bool IsCritical => Percentage < 20;

    public Battery(int percentage)
    {
        if (percentage < 0 || percentage > 100)
        {
            throw new ArgumentOutOfRangeException(nameof(percentage), "Procentajul bateriei trebuie să fie între 0 și 100.");
        }
        Percentage = percentage;
    }
}