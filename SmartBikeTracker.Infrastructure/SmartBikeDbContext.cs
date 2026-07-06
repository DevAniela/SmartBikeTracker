using Microsoft.EntityFrameworkCore;
using SmartBikeTracker.Domain.Entities; // Entitatea Bike e aici

namespace SmartBikeTracker.Infrastructure
{
    public class SmartBikeDbContext : DbContext
    {
        // Constructorul primește de la sistem "opțiunile" (parola, portul, adresa) și le dă mai departe către clasa de bază ca să știe unde să se conecteze
        public SmartBikeDbContext(DbContextOptions<SmartBikeDbContext> options) : base(options)
        {
        }

        // DbSet reprezintă o tabelă în baza de date
        // crează o tabelă în PostgreSQL care va conține obiecte de tip Bike
        public DbSet<Bike> Bikes { get; set; }

        // Urmează logica de rezervări
    }
}

