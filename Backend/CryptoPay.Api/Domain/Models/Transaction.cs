using System.Text.Json.Serialization;

namespace CryptoPay.Api.Domain.Models;

public class Transaction
{
    [JsonPropertyName("transaction_id")]
    public string TransactionId { get; set; } = string.Empty;

    [JsonPropertyName("tx_hash")]
    public string TxHash { get; set; } = string.Empty;

    [JsonPropertyName("sender_wallet")]
    public string SenderWallet { get; set; } = string.Empty;

    [JsonPropertyName("receiver_wallet")]
    public string ReceiverWallet { get; set; } = string.Empty;

    [JsonPropertyName("receiver_account_number")]
    public string ReceiverAccountNumber { get; set; } = string.Empty;

    [JsonPropertyName("amount")]
    public decimal Amount { get; set; }

    [JsonPropertyName("currency")]
    public string Currency { get; set; } = "USDC";

    [JsonPropertyName("network")]
    public string Network { get; set; } = "Unknown";

    [JsonPropertyName("status")]
    public string Status { get; set; } = "confirmed";

    [JsonPropertyName("timestamp")]
    public DateTime Timestamp { get; set; }
}
