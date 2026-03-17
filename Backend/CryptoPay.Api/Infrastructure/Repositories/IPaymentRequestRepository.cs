using CryptoPay.Api.Domain.Models;

namespace CryptoPay.Api.Infrastructure.Repositories;

public interface IPaymentRequestRepository
{
    Task<PaymentRequest?> GetByPaymentIdAsync(string paymentId);
    Task AddAsync(PaymentRequest request);
    Task<IReadOnlyList<PaymentRequest>> GetAllAsync();
}
