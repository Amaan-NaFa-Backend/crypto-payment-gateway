using System.Text.Json.Serialization;

namespace CryptoPay.Api.Domain.Models;

public class Account
{
    [JsonPropertyName("account_number")]
    public string AccountNumber { get; set; } = string.Empty;

    [JsonPropertyName("wallet")]
    public string Wallet { get; set; } = string.Empty;

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;
}
