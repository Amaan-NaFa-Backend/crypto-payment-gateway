using CryptoPay.Api.Application.Services;
using CryptoPay.Api.Infrastructure.Repositories;
using CryptoPay.Api.Domain.Models;

var builder = WebApplication.CreateBuilder(args);

// Logging: avoid Windows EventLog requirement
builder.Logging.ClearProviders();
builder.Logging.AddConsole();

// Config
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(5000);
});

// Bind seed accounts
var accountList = builder.Configuration.GetSection("Accounts").Get<List<Account>>() ?? new List<Account>();
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? new[] { "http://localhost:3000" };

// Services & DI
builder.Services.AddSingleton<IAccountRepository>(_ => new InMemoryAccountRepository(accountList));
builder.Services.AddSingleton<IPaymentRequestRepository, InMemoryPaymentRequestRepository>();
builder.Services.AddSingleton<ITransactionRepository, InMemoryTransactionRepository>();
builder.Services.AddSingleton<IPaymentService, PaymentService>();

builder.Services.AddControllers()
    .AddJsonOptions(opts =>
    {
        opts.JsonSerializerOptions.PropertyNamingPolicy = null; // honor JsonPropertyName attributes / exact casing
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("frontend", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors("frontend");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthorization();
app.MapControllers();

app.Run();
