using System.Text.Json.Serialization;
using CryptoPay.Api.Domain.Models;

namespace CryptoPay.Api.Application.Dtos;

public class TransactionVerifyDto
{
    [JsonPropertyName("tx_hash")]
    public string TxHash { get; set; } = string.Empty;

    [JsonPropertyName("sender_wallet")]
    public string SenderWallet { get; set; } = string.Empty;

    [JsonPropertyName("receiver_wallet")]
    public string ReceiverWallet { get; set; } = string.Empty;

    [JsonPropertyName("receiver_account")]
    public string ReceiverAccount { get; set; } = string.Empty;

    [JsonPropertyName("amount")]
    public decimal Amount { get; set; }

    [JsonPropertyName("currency")]
    public string? Currency { get; set; }

    [JsonPropertyName("network")]
    public string? Network { get; set; }

    public Transaction ToModel() => new()
    {
        TxHash = TxHash,
        SenderWallet = SenderWallet,
        ReceiverWallet = ReceiverWallet,
        ReceiverAccountNumber = ReceiverAccount,
        Amount = Amount,
        Currency = Currency ?? "USDC",
        Network = Network ?? "Unknown"
    };
}
