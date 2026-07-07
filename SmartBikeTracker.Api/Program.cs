using SmartBikeTracker.Application.Interfaces;
using SmartBikeTracker.Application.UseCases;
using SmartBikeTracker.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using SmartBikeTracker.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// --- 1. CONFIGURARE CORS ---
// Permitem aplicației Angular (care rulează pe alt port) să facă request-uri către acest API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddControllers();

// --- 2. DEPENDENCY INJECTION (DI) ---
// Înregistrăm Repository-ul ca SINGLETON. 
// Pentru că e în memorie. Dacă l-am face Transient, la fiecare request s-ar crea o listă nouă și s-ar pierde modificările.
// builder.Services.AddSingleton<IBikeRepository, InMemoryBikeRepository>();

// Clasele de tip DbContext din Entity Framework sunt concepute să fie Scoped (trăiesc doar pe durata unui singur request HTTP). Dacă l-am face Singleton, ar da eroare de tip Dependency Injection lifetime mismatch
builder.Services.AddScoped<IBikeRepository, PostgresBikeRepository>();

// Înregistrăm Use Case-urile ca Transient (se creează o instanță nouă la fiecare utilizare, consum mic de memorie).
builder.Services.AddTransient<GetFleetStatusUseCase>();
builder.Services.AddTransient<UpdateBikeTelemetryUseCase>();

// Înregistrarea bazei de date PostgreSQL în containerul de DI
// Ori de câte ori o clasă are nevoie de SmartBikeDbContext în constructorul ei, creează-l folosind opțiunile pentru PostgreSQL (UseNpgsql) și ia parola/adresa bazei de date din fișierul appsettings.json de la cheia DefaultConnection.
builder.Services.AddDbContext<SmartBikeDbContext>(options => options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

// --- 3. MIDDLEWARE PIPELINE ---
app.UseCors("AllowAngular"); // Activăm politica de CORS înainte de controllere
app.UseAuthorization();
app.MapControllers();

app.Run();