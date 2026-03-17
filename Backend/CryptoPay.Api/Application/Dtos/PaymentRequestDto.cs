using System.Text.Json.Serialization;
using CryptoPay.Api.Domain.Models;

namespace CryptoPay.Api.Application.Dtos;

public class PaymentRequestDto
{
    [JsonPropertyName("payment_id")]
    public string? PaymentId { get; set; }

    [JsonPropertyName("receiver_account")]
    public string ReceiverAccount { get; set; } = string.Empty;

    [JsonPropertyName("receiver_wallet")]
    public string ReceiverWallet { get; set; } = string.Empty;

    [JsonPropertyName("amount")]
    public decimal Amount { get; set; }

    [JsonPropertyName("currency")]
    public string? Currency { get; set; }

    [JsonPropertyName("note")]
    public string? Note { get; set; }

    [JsonPropertyName("uri")]
    public string Uri { get; set; } = string.Empty;

    public PaymentRequest ToModel() => new()
    {
        PaymentId = PaymentId ?? string.Empty,
        ReceiverAccount = ReceiverAccount,
        ReceiverWallet = ReceiverWallet,
        Amount = Amount,
        Currency = Currency ?? "USDC",
        Note = Note,
        Uri = Uri
    };
}
