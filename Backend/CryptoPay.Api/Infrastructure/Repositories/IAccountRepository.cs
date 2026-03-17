using CryptoPay.Api.Domain.Models;

namespace CryptoPay.Api.Infrastructure.Repositories;

public interface IAccountRepository
{
    Task<Account?> GetByAccountNumberAsync(string accountNumber);
}
