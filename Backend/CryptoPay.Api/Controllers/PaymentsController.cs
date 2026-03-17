using CryptoPay.Api.Application.Dtos;
using CryptoPay.Api.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace CryptoPay.Api.Controllers;

[ApiController]
[Route("api/payments")]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _paymentService;

    public PaymentsController(IPaymentService paymentService)
    {
        _paymentService = paymentService;
    }

    [HttpPost("create")]
    public async Task<IActionResult> Create([FromBody] PaymentRequestDto dto)
    {
        var (request, alreadyExists) = await _paymentService.CreatePaymentRequestAsync(dto.ToModel());
        if (alreadyExists)
        {
            return Ok(new { success = true, payment_id = request.PaymentId, message = "Already exists" });
        }
        return Ok(new { success = true, payment_id = request.PaymentId });
    }

    [HttpPost("verify")]
    public async Task<IActionResult> Verify([FromBody] TransactionVerifyDto dto)
    {
        var (tx, _) = await _paymentService.VerifyTransactionAsync(dto.ToModel());
        return Ok(new
        {
            success = true,
            transaction = tx
        });
    }

    [HttpGet("history")]
    public async Task<IActionResult> History()
    {
        var txs = await _paymentService.GetHistoryAsync();
        return Ok(new { transactions = txs });
    }

    [HttpGet("requests")]
    public async Task<IActionResult> Requests()
    {
        var reqs = await _paymentService.GetRequestsAsync();
        return Ok(new { requests = reqs });
    }

    [HttpGet("status/{tx_hash}")]
    public async Task<IActionResult> Status(string tx_hash)
    {
        var tx = await _paymentService.GetStatusAsync(tx_hash);
        if (tx == null)
        {
            return NotFound(new { error = "Transaction not found" });
        }
        return Ok(tx);
    }
}
