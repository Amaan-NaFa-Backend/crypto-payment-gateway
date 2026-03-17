using CryptoPay.Api.Domain.Models;

namespace CryptoPay.Api.Infrastructure.Repositories;

public class InMemoryAccountRepository : IAccountRepository
{
    private readonly Dictionary<string, Account> _accounts;

    public InMemoryAccountRepository(IEnumerable<Account> accounts)
    {
        _accounts = accounts
            .Where(a => !string.IsNullOrWhiteSpace(a.AccountNumber))
            .ToDictionary(a => a.AccountNumber.ToUpperInvariant(), a => a);
    }

    public Task<Account?> GetByAccountNumberAsync(string accountNumber)
    {
        _accounts.TryGetValue(accountNumber.ToUpperInvariant(), out var account);
        return Task.FromResult(account);
    }
}
