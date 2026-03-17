using System.Text.Json.Serialization;

namespace CryptoPay.Api.Domain.Models;

public class PaymentRequest
{
    [JsonPropertyName("payment_id")]
    public string PaymentId { get; set; } = string.Empty;

    [JsonPropertyName("receiver_account")]
    public string ReceiverAccount { get; set; } = string.Empty;

    [JsonPropertyName("receiver_wallet")]
    public string ReceiverWallet { get; set; } = string.Empty;

    [JsonPropertyName("amount")]
    public decimal Amount { get; set; }

    [JsonPropertyName("currency")]
    public string Currency { get; set; } = "USDC";

    [JsonPropertyName("note")]
    public string? Note { get; set; }

    [JsonPropertyName("uri")]
    public string Uri { get; set; } = string.Empty;

    [JsonPropertyName("status")]
    public string Status { get; set; } = "pending";

    [JsonPropertyName("created_at")]
    public DateTime CreatedAt { get; set; }
}
