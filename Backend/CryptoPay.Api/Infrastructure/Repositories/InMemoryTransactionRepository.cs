using System.Collections.Concurrent;
using CryptoPay.Api.Domain.Models;

namespace CryptoPay.Api.Infrastructure.Repositories;

public class InMemoryTransactionRepository : ITransactionRepository
{
    private readonly ConcurrentDictionary<string, Transaction> _transactions = new(StringComparer.OrdinalIgnoreCase);

    public Task<Transaction?> GetByHashAsync(string txHash)
    {
        _transactions.TryGetValue(txHash, out var tx);
        return Task.FromResult(tx);
    }

    public Task AddAsync(Transaction transaction)
    {
        _transactions[transaction.TxHash] = transaction;
        return Task.CompletedTask;
    }

    public Task<IReadOnlyList<Transaction>> GetAllAsync()
    {
        var list = _transactions.Values
            .OrderByDescending(t => t.Timestamp)
            .ToList()
            .AsReadOnly();
        return Task.FromResult((IReadOnlyList<Transaction>)list);
    }
}
