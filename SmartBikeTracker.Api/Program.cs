using SmartBikeTracker.Application.Interfaces;
using SmartBikeTracker.Application.UseCases;
using SmartBikeTracker.Infrastructure.Repositories;

// Composition Root
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
// Astfel, starea memoriei RAM este păstrată între request-uri.
builder.Services.AddSingleton<IBikeRepository, InMemoryBikeRepository>();

// Înregistrăm Use Case-urile ca Transient (se creează o instanță nouă la fiecare utilizare, consum mic de memorie).
builder.Services.AddTransient<GetFleetStatusUseCase>();
builder.Services.AddTransient<UpdateBikeTelemetryUseCase>();

// Aici se creează instanța aplicației web
var app = builder.Build();

// --- 3. MIDDLEWARE PIPELINE ---
app.UseCors("AllowAngular"); // Activăm politica de CORS înainte de controllere
app.UseAuthorization();
app.MapControllers();

// pornește server-ul web (Kestrel) și ascultă request-urile HTTP
app.Run();