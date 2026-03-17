import React, { useState } from "react";
import QRCode from "qrcode";


const COMPANY_WALLETS = {
  "ERC20": "0xAE7d063d5735A623B8aB6Bc947505dF549785C2F",
  "BEP20": "0xAE7d063d5735A623B8aB6Bc947505dF549785C2F",
};


const COIN_OPTIONS = [
  {
    id:       "ERC20-USDT",
    label:    "ERC-20 · USDT",
    network:  "Ethereum (Mainnet)",
    coin:     "USDT",
    chainId:  1,
    contract: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    symbol:   "USDT",
    decimals: 6,
    icon:     "🟢",
    explorer: "https://etherscan.io",
    apiUrl:   (addr) => `https://api.etherscan.io/v2/api?chainid=1&module=account&action=tokentx&contractaddress=0xdAC17F958D2ee523a2206206994597C13D831ec7&address=${addr}&sort=desc&apikey=yourapi`,
  },
  {
    id:       "ERC20-USDC",
    label:    "ERC-20 · USDC",
    network:  "Ethereum (Mainnet)",
    coin:     "USDC",
    chainId:  1,
    contract: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    symbol:   "USDC",
    decimals: 6,
    icon:     "🔵",
    explorer: "https://etherscan.io",
    apiUrl:   (addr) => `https://api.etherscan.io/v2/api?chainid=1&module=account&action=tokentx&contractaddress=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48&address=${addr}&sort=desc&apikey=your api`,
  },
  {
    id:       "BEP20-USDT",
    label:    "BEP-20 · USDT",
    network:  "BNB Smart Chain (Mainnet)",
    coin:     "USDT",
    chainId:  56,
    contract: "0x55d398326f99059fF775485246999027B3197955",
    symbol:   "USDT",
    decimals: 18,
    icon:     "🟡",
    explorer: "https://bscscan.com",
    apiUrl:   (addr) => `https://api.etherscan.io/v2/api?chainid=56&module=account&action=tokentx&contractaddress=0x55d398326f99059fF775485246999027B3197955&address=${addr}&sort=desc&apikey=your api`,
  },
  {
    id:       "BEP20-BUSD",
    label:    "BEP-20 · BUSD",
    network:  "BNB Smart Chain (Mainnet)",
    coin:     "BUSD",
    chainId:  56,
    contract: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
    symbol:   "BUSD",
    decimals: 18,
    icon:     "🟡",
    explorer: "https://bscscan.com",
    apiUrl:   (addr) => `https://api.etherscan.io/v2/api?chainid=56&module=account&action=tokentx&contractaddress=0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56&address=${addr}&sort=desc&apikey=your api`,
  },
  {
    id:       "BEP20-BNB",
    label:    "BEP-20 · BNB",
    network:  "BNB Smart Chain (Mainnet)",
    coin:     "BNB",
    chainId:  56,
    contract: null,
    symbol:   "BNB",
    decimals: 18,
    icon:     "🟠",
    explorer: "https://bscscan.com",
    apiUrl:   (addr) => `https://api.etherscan.io/v2/api?chainid=56&module=account&action=txlist&address=${addr}&sort=desc&apikey=your api`,
  },
];

// ── CRM Accounts ──────────────────────────────────────────
const CRM_ACCOUNTS = [
  { account_number: "ACC-001", name: "Trust wallet -1", wallet_erc20: "0xAE7d063d5735A623B8aB6Bc947505dF549785C2F", wallet_bep20: "0xAE7d063d5735A623B8aB6Bc947505dF549785C2F" },
  { account_number: "ACC-002", name: "check2ac",         wallet_erc20: "0x937457A2C11611223B14dCefAB6ff6D1e926B6e9", wallet_bep20: "0x937457A2C11611223B14dCefAB6ff6D1e926B6e9" },
  { account_number: "ACC-003", name: "Account 3",        wallet_erc20: "0x85EA621E2a4f892c3d9fA4e69EE34AB2a0498904", wallet_bep20: "0x85EA621E2a4f892c3d9fA4e69EE34AB2a0498904" },
   { account_number: "ACC-004", name: "Karti sir binance", wallet_erc20: "0x56Eddb7aa87536c09CCc2793473599fD21A8b17F", wallet_bep20: "0x56Eddb7aa87536c09CCc2793473599fD21A8b17F" },
   { account_number: "ACC-005", name: "Karti 2", wallet_erc20: "0x916331f38948780cdf1fb82f010376664ac9d8ff", wallet_bep20: "0x916331f38948780cdf1fb82f010376664ac9d8ff" },
];

function shortAddr(addr) {
  return addr.slice(0, 10) + "..." + addr.slice(-8);
}

export default function PaymentRequest() {
  const [step, setStep]                         = useState(1);
  const [accountNo, setAccountNo]               = useState("");
  const [amount, setAmount]                     = useState("");
  const [note, setNote]                         = useState("");
  const [selectedCoinId, setSelectedCoinId]     = useState("ERC20-USDT");
  const [qrDataUrl, setQrDataUrl]               = useState("");
  const [payment, setPayment]                   = useState(null);
  const [loading, setLoading]                   = useState(false);
  const [error, setError]                       = useState("");
  const [copied, setCopied]                     = useState("");
  const [paymentConfirmed, setPaymentConfirmed] = useState(null);
  const [timeLeft, setTimeLeft]                 = useState(600);
  const [plainQrDataUrl, setPlainQrDataUrl]     = useState("");
  const [showBinanceQr, setShowBinanceQr]       = useState(false);

  const account    = CRM_ACCOUNTS.find(a => a.account_number === accountNo);
  const coinOption = COIN_OPTIONS.find(c => c.id === selectedCoinId);

  function getReceiverWallet() {
    if (!account) return "";
    return coinOption.id.startsWith("ERC20") ? account.wallet_erc20 : account.wallet_bep20;
  }

  async function generate() {
    if (!accountNo) { setError("Please select a receiving account"); return; }
    if (!amount || parseFloat(amount) <= 0) { setError("Please enter a valid amount"); return; }
    setError(""); setLoading(true);

    const wallet = getReceiverWallet();
    const units  = BigInt(Math.round(parseFloat(amount) * Math.pow(10, coinOption.decimals))).toString();

    // Universal QR URI — works with MetaMask, Trust Wallet, Binance Web3
    let uri;
    if (!coinOption.contract) {
      // Native BNB — no contract
      uri = `ethereum:${wallet}@${coinOption.chainId}?value=${units}`;
    } else {
      // Token transfer (USDT, USDC, BUSD) — EIP-681 standard
      uri = `ethereum:${coinOption.contract}@${coinOption.chainId}/transfer?address=${wallet}&uint256=${units}`;
    }

    const id = "PAY-" + Date.now();

    try {
      const qr = await QRCode.toDataURL(uri, { width: 220, margin: 1, errorCorrectionLevel: "M" });
      const plainQr = await QRCode.toDataURL(wallet, { width: 220, margin: 1, errorCorrectionLevel: "M" });
      const data = {
        payment_id: id, uri,
        receiver_account: accountNo, receiver_name: account.name,
        receiver_wallet: wallet, amount: parseFloat(amount),
        currency: coinOption.symbol, network: coinOption.network,
        coin_option_id: coinOption.id, note,
        created_at: new Date().toISOString(),
      };
      setQrDataUrl(qr); setPlainQrDataUrl(plainQr); setPayment(data); setTimeLeft(600);
      fetch("http://localhost:5000/api/payments/create", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).catch(() => {});
      setStep(2);
      pollForPayment(wallet, amount, id, coinOption);
      startCountdown();
    } catch (e) { setError("QR generation failed: " + e.message); }
    setLoading(false);
  }

  function startCountdown() {
    setTimeLeft(600);
    const countdown = setInterval(() => {
      setTimeLeft(prev => { if (prev <= 1) { clearInterval(countdown); return 0; } return prev - 1; });
    }, 1000);
  }

  function pollForPayment(wallet, expectedAmount, paymentId, coin) {
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      if (attempts > 120) { clearInterval(interval); return; }
      try {
        const res  = await fetch(coin.apiUrl(wallet));
        const data = await res.json();
        if (data.status === "1" && data.result?.length > 0) {
          const tx      = data.result[0];
          const ageMs   = Date.now() - parseInt(tx.timeStamp) * 1000;
          const txAmt   = parseInt(tx.value) / Math.pow(10, coin.decimals);
          const isOk    = ageMs < 1800000
          && txAmt >= parseFloat(expectedAmount)
            // && Math.abs(txAmt - parseFloat(expectedAmount)) < 0.01// Allow small rounding differences
            && tx.to.toLowerCase() === wallet.toLowerCase();
          if (isOk) {
            clearInterval(interval);
            setPaymentConfirmed({ hash: tx.hash, from: tx.from, amount: txAmt });
            setStep(3);
            fetch("http://localhost:5000/api/payments/verify", {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                tx_hash: tx.hash, sender_wallet: tx.from,
                receiver_wallet: wallet, receiver_account: accountNo,
                amount: txAmt, currency: coin.symbol,
                network: coin.network, payment_id: paymentId,
              }),
            }).catch(() => {});
          }
        }
      } catch (e) { console.log("Poll error:", e.message); }
    }, 10000);
  }

  function copy(text, key) {
    navigator.clipboard.writeText(text); setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  }

  function reset() {
    setStep(1); setAmount(""); setNote(""); setAccountNo("");
    setQrDataUrl(""); setPlainQrDataUrl(""); setShowBinanceQr(false); setPayment(null); setError("");
    setPaymentConfirmed(null); setTimeLeft(600); setSelectedCoinId("ERC20-USDT");
  }

  return (
    <div>
      {/* Stepper */}
      <div className="stepper">
        {["Select & Amount", "Scan QR", "Confirmed"].map((label, i) => (
          <React.Fragment key={label}>
            <div className="step-item">
              <div className={`step-circle ${step > i+1 ? "done" : step === i+1 ? "active" : "todo"}`}>
                {step > i+1 ? "✓" : i+1}
              </div>
            </div>
            {i < 2 && <div className={`step-line ${step > i+1 ? "done" : ""}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <div className="grid-2">
          <div>
            <p className="page-title">Request payment</p>
            <p className="page-sub">Generate a QR code — works with any crypto wallet worldwide.</p>
            {error && <div className="alert alert-error"><span className="alert-icon">⚠</span>{error}</div>}
            <div className="card card-lg">
              <div className="section-label">Network & Coin</div>
              <div className="field">
                <label className="field-label">Select coin & network</label>
                <select className="input" value={selectedCoinId} onChange={e => setSelectedCoinId(e.target.value)}>
                  {COIN_OPTIONS.map(c => (
                    <option key={c.id} value={c.id}>{c.icon} {c.label} — {c.network}</option>
                  ))}
                </select>
                <div className="field-hint">Network: {coinOption.network} · Chain ID: {coinOption.chainId}</div>
              </div>
              <div className="divider" />
              <div className="section-label">Receiving Account</div>
              <div className="field">
                <label className="field-label">Select account</label>
                <select className="input" value={accountNo} onChange={e => setAccountNo(e.target.value)}>
                  <option value="">Choose from CRM accounts...</option>
                  {CRM_ACCOUNTS.map(a => (
                    <option key={a.account_number} value={a.account_number}>{a.account_number} — {a.name}</option>
                  ))}
                </select>
              </div>
              {account && (
                <div className="account-found">
                  <div className="account-found-icon">🏦</div>
                  <div>
                    <div className="account-found-name">{account.name}</div>
                    <div className="account-found-addr">{shortAddr(getReceiverWallet())}</div>
                  </div>
                </div>
              )}
              <div className="divider" />
              <div className="section-label">Payment Details</div>
              <div className="field">
                <label className="field-label">Amount</label>
                <div className="amount-wrap">
                  <span className="amount-prefix">$</span>
                  <input className="input" type="number" min="0" step="0.01"
                    placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} />
                  <span style={{padding:"0 12px", color:"var(--text-3)", fontSize:13}}>{coinOption.symbol}</span>
                </div>
                <div className="field-hint">1 {coinOption.symbol} ≈ $1.00 USD</div>
              </div>
              <div className="field">
                <label className="field-label">Note <span style={{color:"var(--text-3)", fontWeight:400}}>(optional)</span></label>
                <input className="input" type="text" placeholder="Invoice #, project name..."
                  value={note} onChange={e => setNote(e.target.value)} />
              </div>
              <button className="btn btn-primary btn-full" onClick={generate} disabled={loading}>
                {loading ? <><span className="spinner"/>Generating QR...</> : "Generate payment QR →"}
              </button>
            </div>
          </div>

          {/* Info panel */}
          <div>
            <div className="card" style={{marginBottom:16}}>
              <div className="section-label">Supported Networks</div>
              {COIN_OPTIONS.map(c => (
                <div key={c.id} onClick={() => setSelectedCoinId(c.id)}
                  style={{display:"flex", gap:12, marginBottom:8, padding:"8px 12px",
                    borderRadius:8, cursor:"pointer",
                    background: c.id === selectedCoinId ? "var(--green-light)" : "transparent",
                    border: c.id === selectedCoinId ? "1px solid var(--green)" : "1px solid transparent"}}>
                  <div style={{fontSize:18}}>{c.icon}</div>
                  <div>
                    <div style={{fontSize:13, fontWeight:600, color:"var(--text)"}}>{c.label}</div>
                    <div style={{fontSize:11, color:"var(--text-3)"}}>{c.network}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="card">
              <div className="section-label">How it works</div>
              {[
                ["🪙","Select Coin","Choose network and coin"],
                ["🏦","Select Account","Pick receiving company account"],
                ["📱","Share QR","Works with any crypto wallet"],
                ["✅","Auto Detected","Confirmed from blockchain automatically"],
              ].map(([icon,title,desc]) => (
                <div key={title} style={{display:"flex", gap:12, marginBottom:14}}>
                  <div style={{fontSize:20, flexShrink:0}}>{icon}</div>
                  <div>
                    <div style={{fontSize:13, fontWeight:600, color:"var(--text)", marginBottom:2}}>{title}</div>
                    <div style={{fontSize:12, color:"var(--text-3)", lineHeight:1.5}}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && payment && (
        <div className="grid-2">
          <div className="card card-lg">
            <div className="section-label">Payment QR Code</div>
            <div className="qr-container">
              <div className="qr-currency-tag">
                <span>{coinOption.icon}</span> {payment.currency} · {coinOption.id.startsWith("ERC20") ? "Ethereum" : "BSC"}
              </div>
              <div className="qr-amount-display">${payment.amount.toFixed(2)}</div>
              <div style={{fontSize:12, color:"var(--text-3)", marginBottom:20}}>{payment.receiver_name}</div>
              <div className="qr-frame">
                <img src={showBinanceQr ? plainQrDataUrl : qrDataUrl} alt="Payment QR" width={200} height={200} style={{display:"block"}}/>
              </div>
              {showBinanceQr && (
                <div style={{fontSize:11, color:"#e67e00", background:"#fff8e1", border:"1px solid #ffe082", borderRadius:6, padding:"6px 10px", marginTop:6, textAlign:"center"}}>
                  ⚠️ Enter amount manually: <strong>{payment.amount} {payment.currency}</strong>
                </div>
              )}
              <div className="qr-id">{payment.payment_id}</div>
              {!paymentConfirmed && (
                <div style={{marginTop:12, fontSize:12, color:"var(--text-3)", display:"flex", alignItems:"center", gap:6}}>
                  {timeLeft > 0 ? (
                    <>
                      <span className="spinner spinner-dark" style={{width:12, height:12, flexShrink:0}}/>
                      Waiting... ({Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,"0")})
                    </>
                  ) : (
                    <div className="alert alert-error" style={{width:"100%"}}>
                      <span className="alert-icon">⏱</span>
                      <div>
                        <strong>Request expired</strong>
                        <button className="btn btn-ghost btn-sm" style={{marginTop:8}} onClick={reset}>Generate new QR</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div style={{display:"flex", gap:8, marginBottom:12}}>
              <button className="btn btn-outline btn-sm" style={{flex:1}} onClick={() => copy(payment.uri, "uri")}>
                {copied === "uri" ? "✓ Copied!" : "📋 Copy URI"}
              </button>
              <button className="btn btn-outline btn-sm" style={{flex:1}} onClick={() => {
                const a = document.createElement("a");
                a.href = showBinanceQr ? plainQrDataUrl : qrDataUrl;
                a.download = `${payment.payment_id}${showBinanceQr ? '-binance' : ''}.png`;
                a.click();
              }}>⬇ Download</button>
            </div>
            {/* Binance QR Toggle Button */}
            <button
              className="btn btn-outline btn-full btn-sm"
              style={{marginBottom:8, borderColor: showBinanceQr ? "#F0B90B" : "", color: showBinanceQr ? "#F0B90B" : ""}}
              onClick={() => setShowBinanceQr(!showBinanceQr)}>
              {showBinanceQr ? "← Switch to Normal QR" : "🟡 Generate QR for Binance Wallet"}
            </button>
            <button className="btn btn-ghost btn-full btn-sm" onClick={reset}>← New request</button>
          </div>



          <div>
            <div className="card" style={{marginBottom:16}}>
              <div className="section-label">Request Details</div>
              <div className="info-table">
                <div className="info-row"><span className="info-key">Payment ID</span><span className="info-val mono" style={{fontSize:11}}>{payment.payment_id}</span></div>
                <div className="info-row"><span className="info-key">Account</span><span className="info-val">{payment.receiver_account}</span></div>
                <div className="info-row"><span className="info-key">Amount</span><span className="info-val green large">${payment.amount.toFixed(2)} {payment.currency}</span></div>
                <div className="info-row"><span className="info-key">Network</span><span className="info-val">{payment.network}</span></div>
                <div className="info-row">
                  <span className="info-key">Status</span>
                  <span><div className={`badge ${paymentConfirmed ? "badge-success" : "badge-pending"}`}>{paymentConfirmed ? "Paid ✓" : "Awaiting payment"}</div></span>
                </div>
                {payment.note && <div className="info-row"><span className="info-key">Note</span><span className="info-val">{payment.note}</span></div>}
                <div className="info-row"><span className="info-key">Created</span><span className="info-val">{new Date(payment.created_at).toLocaleString()}</span></div>
              </div>
            </div>
            <div className="card">
              <div className="section-label">Receiving Wallet</div>
              <div style={{background:"var(--bg)", border:"1px solid var(--border)", borderRadius:"var(--radius-sm)", padding:"12px 14px", fontFamily:"var(--mono)", fontSize:12, color:"var(--text-2)", wordBreak:"break-all", lineHeight:1.6, marginBottom:10}}>
                {payment.receiver_wallet}
              </div>
              <button className="copy-btn" onClick={() => copy(payment.receiver_wallet, "wallet")}>
                {copied === "wallet" ? "✓ Copied" : "📋 Copy address"}
              </button>
              <div className="alert alert-info" style={{marginTop:16}}>
                <span className="alert-icon">ℹ</span>
                <span>Works with MetaMask, Trust Wallet, or any EIP-681 compatible wallet.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && paymentConfirmed && payment && (
        <div style={{display:"flex", justifyContent:"center", alignItems:"center", minHeight:400}}>
          <div className="card card-lg" style={{textAlign:"center", maxWidth:480, width:"100%"}}>
            <div style={{fontSize:64, marginBottom:16}}>✅</div>
            <h2 style={{fontSize:24, fontWeight:700, color:"var(--text)", marginBottom:8}}>Payment Confirmed!</h2>
            <p style={{color:"var(--text-3)", fontSize:14, marginBottom:24}}>Transaction verified on {payment.network}</p>
            <div className="info-table" style={{marginBottom:24}}>
              <div className="info-row"><span className="info-key">Amount</span><span className="info-val green large">${paymentConfirmed.amount} {payment.currency}</span></div>
              <div className="info-row"><span className="info-key">Network</span><span className="info-val">{payment.network}</span></div>
              <div className="info-row"><span className="info-key">From</span><span className="info-val mono" style={{fontSize:11}}>{paymentConfirmed.from}</span></div>
              <div className="info-row"><span className="info-key">To Account</span><span className="info-val">{payment.receiver_account} — {payment.receiver_name}</span></div>
              <div className="info-row"><span className="info-key">Payment ID</span><span className="info-val mono" style={{fontSize:11}}>{payment.payment_id}</span></div>
              <div className="info-row"><span className="info-key">Tx Hash</span><span className="info-val mono" style={{fontSize:11}}>{paymentConfirmed.hash.slice(0,20)}...</span></div>
              <div className="info-row"><span className="info-key">Time</span><span className="info-val">{new Date().toLocaleString()}</span></div>
            </div>
            <a href={`${coinOption.explorer}/tx/${paymentConfirmed.hash}`}
              target="_blank" rel="noreferrer"
              className="btn btn-outline btn-full"
              style={{marginBottom:12, display:"block", textDecoration:"none"}}>
              🔍 View on {coinOption.id.startsWith("ERC20") ? "Etherscan" : "BscScan"}
            </a>
            <button className="btn btn-primary btn-full" onClick={reset}>+ New Payment Request</button>
          </div>
        </div>
      )}
    </div>
  );
}
