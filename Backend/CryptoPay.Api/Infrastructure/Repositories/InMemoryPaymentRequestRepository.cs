using System.Collections.Concurrent;
using CryptoPay.Api.Domain.Models;

namespace CryptoPay.Api.Infrastructure.Repositories;

public class InMemoryPaymentRequestRepository : IPaymentRequestRepository
{
    private readonly ConcurrentDictionary<string, PaymentRequest> _requests = new(StringComparer.OrdinalIgnoreCase);

    public Task<PaymentRequest?> GetByPaymentIdAsync(string paymentId)
    {
        _requests.TryGetValue(paymentId, out var existing);
        return Task.FromResult(existing);
    }

    public Task AddAsync(PaymentRequest request)
    {
        _requests[request.PaymentId] = request;
        return Task.CompletedTask;
    }

    public Task<IReadOnlyList<PaymentRequest>> GetAllAsync()
    {
        var list = _requests.Values
            .OrderByDescending(r => r.CreatedAt)
            .ToList()
            .AsReadOnly();
        return Task.FromResult((IReadOnlyList<PaymentRequest>)list);
    }
}
