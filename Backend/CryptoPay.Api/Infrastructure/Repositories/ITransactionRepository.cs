using CryptoPay.Api.Domain.Models;

namespace CryptoPay.Api.Infrastructure.Repositories;

public interface ITransactionRepository
{
    Task<Transaction?> GetByHashAsync(string txHash);
    Task AddAsync(Transaction transaction);
    Task<IReadOnlyList<Transaction>> GetAllAsync();
}
