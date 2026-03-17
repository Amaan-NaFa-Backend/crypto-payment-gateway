using CryptoPay.Api.Domain.Models;

namespace CryptoPay.Api.Application.Services;

public interface IPaymentService
{
    Task<(PaymentRequest request, bool alreadyExists)> CreatePaymentRequestAsync(PaymentRequest request);
    Task<(Transaction transaction, bool alreadyExists)> VerifyTransactionAsync(Transaction transaction);
    Task<IReadOnlyList<Transaction>> GetHistoryAsync();
    Task<IReadOnlyList<PaymentRequest>> GetRequestsAsync();
    Task<Transaction?> GetStatusAsync(string txHash);
}
