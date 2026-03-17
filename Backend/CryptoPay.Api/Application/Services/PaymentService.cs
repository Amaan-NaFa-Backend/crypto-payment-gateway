using CryptoPay.Api.Domain.Models;
using CryptoPay.Api.Infrastructure.Repositories;

namespace CryptoPay.Api.Application.Services;

public class PaymentService : IPaymentService
{
    private readonly IPaymentRequestRepository _paymentRequests;
    private readonly ITransactionRepository _transactions;

    public PaymentService(IPaymentRequestRepository paymentRequests, ITransactionRepository transactions)
    {
        _paymentRequests = paymentRequests;
        _transactions = transactions;
    }

    public async Task<(PaymentRequest request, bool alreadyExists)> CreatePaymentRequestAsync(PaymentRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.PaymentId))
        {
            request.PaymentId = "PAY-" + DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        }

        var existing = await _paymentRequests.GetByPaymentIdAsync(request.PaymentId);
        if (existing != null)
        {
            return (existing, true);
        }

        request.CreatedAt = DateTime.UtcNow;
        request.Status = string.IsNullOrWhiteSpace(request.Status) ? "pending" : request.Status;
        request.Currency = string.IsNullOrWhiteSpace(request.Currency) ? "USDC" : request.Currency;

        await _paymentRequests.AddAsync(request);
        return (request, false);
    }

    public async Task<(Transaction transaction, bool alreadyExists)> VerifyTransactionAsync(Transaction transaction)
    {
        var existing = await _transactions.GetByHashAsync(transaction.TxHash);
        if (existing != null)
        {
            return (existing, true);
        }

        transaction.TransactionId = "TXN-" + DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        transaction.Timestamp = DateTime.UtcNow;
        transaction.Status = string.IsNullOrWhiteSpace(transaction.Status) ? "confirmed" : transaction.Status;
        transaction.Currency = string.IsNullOrWhiteSpace(transaction.Currency) ? "USDC" : transaction.Currency;
        transaction.Network = string.IsNullOrWhiteSpace(transaction.Network) ? "Unknown" : transaction.Network;

        await _transactions.AddAsync(transaction);
        return (transaction, false);
    }

    public Task<IReadOnlyList<Transaction>> GetHistoryAsync() => _transactions.GetAllAsync();

    public Task<IReadOnlyList<PaymentRequest>> GetRequestsAsync() => _paymentRequests.GetAllAsync();

    public Task<Transaction?> GetStatusAsync(string txHash) => _transactions.GetByHashAsync(txHash);
}
