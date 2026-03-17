using CryptoPay.Api.Infrastructure.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace CryptoPay.Api.Controllers;

[ApiController]
[Route("api/accounts")]
public class AccountsController : ControllerBase
{
    private readonly IAccountRepository _accounts;

    public AccountsController(IAccountRepository accounts)
    {
        _accounts = accounts;
    }

    [HttpGet("{account_number}")]
    public async Task<IActionResult> GetAccount(string account_number)
    {
        var account = await _accounts.GetByAccountNumberAsync(account_number);
        if (account == null)
        {
            return NotFound(new { error = "Account not found" });
        }

        return Ok(new
        {
            account_number = account.AccountNumber,
            wallet = account.Wallet,
            name = account.Name
        });
    }
}
