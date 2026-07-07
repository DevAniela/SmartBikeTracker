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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configurăm tabelul Bikes
            modelBuilder.Entity<Bike>(entity =>
            {
                entity.HasKey(e => e.Id);

                // Îi spunem lui EF Core că Battery este deținut de Bike
                // Se vor crea coloane precum "Battery_Percentage" în tabelul Bikes
                entity.OwnsOne(e => e.Battery);

                // La fel și pt senzorul de lanț
                entity.OwnsOne(e => e.ChainSensor);
            });
        }

        // Urmează logica de rezervări
    }
}

