import { useState } from "react";
import { ethers } from "ethers";

const COIN_OPTIONS = [
  { id:"ERC20-USDT", label:"ERC-20 · USDT", network:"Ethereum (Mainnet)",       symbol:"USDT", chainId:1,  chainHex:"0x1",  contract:"0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals:6,  icon:"🟢", explorer:"https://etherscan.io",  networkParams:{ chainId:"0x1",  chainName:"Ethereum Mainnet",   nativeCurrency:{name:"ETH",symbol:"ETH",decimals:18}, rpcUrls:["https://mainnet.infura.io/v3/"],          blockExplorerUrls:["https://etherscan.io"]  } },
  { id:"ERC20-USDC", label:"ERC-20 · USDC", network:"Ethereum (Mainnet)",       symbol:"USDC", chainId:1,  chainHex:"0x1",  contract:"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals:6,  icon:"🔵", explorer:"https://etherscan.io",  networkParams:{ chainId:"0x1",  chainName:"Ethereum Mainnet",   nativeCurrency:{name:"ETH",symbol:"ETH",decimals:18}, rpcUrls:["https://mainnet.infura.io/v3/"],          blockExplorerUrls:["https://etherscan.io"]  } },
  { id:"BEP20-USDT", label:"BEP-20 · USDT", network:"BNB Smart Chain (Mainnet)",symbol:"USDT", chainId:56, chainHex:"0x38", contract:"0x55d398326f99059fF775485246999027B3197955", decimals:18, icon:"🟡", explorer:"https://bscscan.com",   networkParams:{ chainId:"0x38", chainName:"BNB Smart Chain",    nativeCurrency:{name:"BNB",symbol:"BNB",decimals:18}, rpcUrls:["https://bsc-dataseed.binance.org/"],      blockExplorerUrls:["https://bscscan.com"]   } },
  { id:"BEP20-BUSD", label:"BEP-20 · BUSD", network:"BNB Smart Chain (Mainnet)",symbol:"BUSD", chainId:56, chainHex:"0x38", contract:"0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", decimals:18, icon:"🟡", explorer:"https://bscscan.com",   networkParams:{ chainId:"0x38", chainName:"BNB Smart Chain",    nativeCurrency:{name:"BNB",symbol:"BNB",decimals:18}, rpcUrls:["https://bsc-dataseed.binance.org/"],      blockExplorerUrls:["https://bscscan.com"]   } },
  { id:"BEP20-BNB",  label:"BEP-20 · BNB",  network:"BNB Smart Chain (Mainnet)",symbol:"BNB",  chainId:56, chainHex:"0x38", contract:null,                                         decimals:18, icon:"🟠", explorer:"https://bscscan.com",   networkParams:{ chainId:"0x38", chainName:"BNB Smart Chain",    nativeCurrency:{name:"BNB",symbol:"BNB",decimals:18}, rpcUrls:["https://bsc-dataseed.binance.org/"],      blockExplorerUrls:["https://bscscan.com"]   } },
];

const TOKEN_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
];

const CRM_ACCOUNTS = [
  { account_number:"ACC-001", name:"sahab_Dummy_data", wallet_erc20:"0xAE7d063d5735A623B8aB6Bc947505dF549785C2F", wallet_bep20:"0xAE7d063d5735A623B8aB6Bc947505dF549785C2F" },
  { account_number:"ACC-002", name:"check2ac",         wallet_erc20:"0x937457A2C11611223B14dCefAB6ff6D1e926B6e9", wallet_bep20:"0x937457A2C11611223B14dCefAB6ff6D1e926B6e9" },
  { account_number:"ACC-003", name:"Account 3",        wallet_erc20:"0x85EA621E2a4f892c3d9fA4e69EE34AB2a0498904", wallet_bep20:"0x85EA621E2a4f892c3d9fA4e69EE34AB2a0498904" },
];

function shortAddr(addr) { return addr.slice(0,10)+"..."+addr.slice(-8); }

export default function PaymentSend() {
  const [selectedCoinId, setSelectedCoinId] = useState("ERC20-USDT");
  const [accountNo, setAccountNo]           = useState("");
  const [amount, setAmount]                 = useState("");
  const [note, setNote]                     = useState("");
  const [walletAddr, setWalletAddr]         = useState("");
  const [balance, setBalance]               = useState(null);
  const [status, setStatus]                 = useState("idle");
  const [txHash, setTxHash]                 = useState("");
  const [error, setError]                   = useState("");
  const [resolved, setResolved]             = useState(null);

  const coinOption = COIN_OPTIONS.find(c => c.id === selectedCoinId);

  async function connect() {
    if (!window.ethereum) { setError("No wallet found! Install MetaMask or Trust Wallet browser extension."); return; }
    setStatus("connecting"); setError("");
    try {
      const accounts = await window.ethereum.request({ method:"eth_requestAccounts" });
      const addr = accounts[0];
      try {
        await window.ethereum.request({ method:"wallet_switchEthereumChain", params:[{ chainId:coinOption.chainHex }] });
      } catch(switchErr) {
        if (switchErr.code === 4902) {
          await window.ethereum.request({ method:"wallet_addEthereumChain", params:[coinOption.networkParams] });
        }
      }
      setWalletAddr(addr); setStatus("connected");
      const provider = new ethers.BrowserProvider(window.ethereum);
      if (coinOption.contract) {
        const token = new ethers.Contract(coinOption.contract, TOKEN_ABI, provider);
        const bal = await token.balanceOf(addr);
        setBalance(parseFloat(ethers.formatUnits(bal, coinOption.decimals)).toFixed(4));
      } else {
        const bal = await provider.getBalance(addr);
        setBalance(parseFloat(ethers.formatEther(bal)).toFixed(4));
      }
    } catch(e) { setError("Connection failed: "+e.message); setStatus("idle"); }
  }

  function findAccount() {
    const acc = CRM_ACCOUNTS.find(a => a.account_number === accountNo.toUpperCase());
    if (!acc) { setError("Account not found"); setResolved(null); return; }
    setResolved(acc); setError("");
  }

  async function send() {
    if (!resolved) { setError("Please find account first"); return; }
    if (!amount || parseFloat(amount) <= 0) { setError("Please enter a valid amount"); return; }
    setError(""); setStatus("sending");
    const toWallet = coinOption.id.startsWith("ERC20") ? resolved.wallet_erc20 : resolved.wallet_bep20;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      let tx;
      if (coinOption.contract) {
        const token = new ethers.Contract(coinOption.contract, TOKEN_ABI, signer);
        const amt = ethers.parseUnits(amount, coinOption.decimals);
        tx = await token.transfer(toWallet, amt);
      } else {
        tx = await signer.sendTransaction({ to:toWallet, value:ethers.parseEther(amount) });
      }
      setTxHash(tx.hash);
      const receipt = await tx.wait(1);
      if (receipt.status === 1) {
        setStatus("confirmed");
        fetch("http://localhost:5000/api/payments/verify", {
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ tx_hash:tx.hash, sender_wallet:walletAddr, receiver_wallet:toWallet, receiver_account:resolved.account_number, amount:parseFloat(amount), currency:coinOption.symbol, network:coinOption.network }),
        }).catch(()=>{});
      } else { setError("Transaction failed on blockchain"); setStatus("error"); }
    } catch(e) {
      setError(e.message?.includes("user rejected") ? "Transaction cancelled by user" : "Transaction failed: "+e.message);
      setStatus("connected");
    }
  }

  function reset() {
    setStatus("idle"); setAccountNo(""); setAmount(""); setNote("");
    setWalletAddr(""); setBalance(null); setTxHash(""); setError(""); setResolved(null); setSelectedCoinId("ERC20-USDT");
  }

  return (
    <div className="grid-2">
      <div>
        <p className="page-title">Send payment</p>
        <p className="page-sub">Send crypto directly to any company account.</p>
        {error && <div className="alert alert-error"><span className="alert-icon">⚠</span>{error}</div>}

        {status === "confirmed" && (
          <div className="card card-lg" style={{textAlign:"center"}}>
            <div style={{fontSize:56, marginBottom:12}}>✅</div>
            <h2 style={{fontSize:22, fontWeight:700, marginBottom:8}}>Payment Sent!</h2>
            <p style={{color:"var(--text-3)", fontSize:13, marginBottom:20}}>Confirmed on {coinOption.network}</p>
            <div className="info-table" style={{marginBottom:20}}>
              <div className="info-row"><span className="info-key">Amount</span><span className="info-val green large">{amount} {coinOption.symbol}</span></div>
              <div className="info-row"><span className="info-key">Network</span><span className="info-val">{coinOption.network}</span></div>
              <div className="info-row"><span className="info-key">To</span><span className="info-val">{resolved?.account_number} — {resolved?.name}</span></div>
              <div className="info-row"><span className="info-key">Tx Hash</span><span className="info-val mono" style={{fontSize:11}}>{txHash.slice(0,20)}...</span></div>
            </div>
            <a href={`${coinOption.explorer}/tx/${txHash}`} target="_blank" rel="noreferrer" className="btn btn-outline btn-full" style={{marginBottom:12, display:"block", textDecoration:"none"}}>
              🔍 View on {coinOption.id.startsWith("ERC20") ? "Etherscan" : "BscScan"}
            </a>
            <button className="btn btn-primary btn-full" onClick={reset}>+ New Payment</button>
          </div>
        )}

        {status !== "confirmed" && (
          <div className="card card-lg">
            <div className="section-label">Network & Coin</div>
            <div className="field">
              <label className="field-label">Select coin & network</label>
              <select className="input" value={selectedCoinId} onChange={e => { setSelectedCoinId(e.target.value); setStatus("idle"); setBalance(null); setWalletAddr(""); }}>
                {COIN_OPTIONS.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label} — {c.network}</option>)}
              </select>
              <div className="field-hint">Chain ID: {coinOption.chainId} · {coinOption.network}</div>
            </div>
            <div className="divider" />
            <div className="section-label">Your Wallet</div>
            {status === "idle" && <button className="btn btn-primary btn-full" onClick={connect}>🔗 Connect Wallet</button>}
            {status === "connecting" && <button className="btn btn-primary btn-full" disabled><span className="spinner"/> Connecting...</button>}
            {(status === "connected" || status === "sending") && (
              <div className="account-found">
                <div className="account-found-icon">💼</div>
                <div>
                  <div className="account-found-name">{shortAddr(walletAddr)}</div>
                  <div className="account-found-addr">Balance: <strong style={{color:"var(--green)"}}>{balance} {coinOption.symbol}</strong> · {coinOption.network}</div>
                </div>
              </div>
            )}
            {(status === "connected" || status === "sending") && (
              <>
                <div className="divider" />
                <div className="section-label">Receiver Account</div>
                <div className="field">
                  <label className="field-label">Account number</label>
                  <div style={{display:"flex", gap:8}}>
                    <input className="input" type="text" placeholder="ACC-001, ACC-002..." value={accountNo} onChange={e => setAccountNo(e.target.value.toUpperCase())} />
                    <button className="btn btn-outline" onClick={findAccount}>Find</button>
                  </div>
                </div>
                {resolved && (
                  <div className="account-found">
                    <div className="account-found-icon">🏦</div>
                    <div>
                      <div className="account-found-name">{resolved.name}</div>
                      <div className="account-found-addr">{shortAddr(coinOption.id.startsWith("ERC20") ? resolved.wallet_erc20 : resolved.wallet_bep20)}</div>
                    </div>
                  </div>
                )}
                <div className="divider" />
                <div className="section-label">Payment Details</div>
                <div className="field">
                  <label className="field-label">Amount</label>
                  <div className="amount-wrap">
                    <span className="amount-prefix">$</span>
                    <input className="input" type="number" min="0" step="0.01" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} />
                    <span style={{padding:"0 12px", color:"var(--text-3)", fontSize:13}}>{coinOption.symbol}</span>
                  </div>
                </div>
                <div className="field">
                  <label className="field-label">Note <span style={{color:"var(--text-3)", fontWeight:400}}>(optional)</span></label>
                  <input className="input" type="text" placeholder="Invoice #, purpose..." value={note} onChange={e => setNote(e.target.value)} />
                </div>
                <button className="btn btn-primary btn-full" onClick={send} disabled={status==="sending"}>
                  {status === "sending" ? <><span className="spinner"/>Sending — confirm in wallet...</> : `Send ${coinOption.symbol} →`}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div>
        <div className="card" style={{marginBottom:16}}>
          <div className="section-label">Supported Networks</div>
          {COIN_OPTIONS.map(c => (
            <div key={c.id} onClick={() => { setSelectedCoinId(c.id); setStatus("idle"); setBalance(null); setWalletAddr(""); }}
              style={{display:"flex", gap:12, marginBottom:8, padding:"8px 12px", borderRadius:8, cursor:"pointer",
                background: c.id===selectedCoinId ? "var(--green-light)" : "transparent",
                border: c.id===selectedCoinId ? "1px solid var(--green)" : "1px solid transparent"}}>
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
          {[["🪙","Select Coin","Choose network and coin"],["🔗","Connect Wallet","Auto switches to correct network"],["🏦","Find Account","Enter CRM account number"],["✅","Send & Confirm","Approve in wallet — blockchain confirmed"]].map(([icon,title,desc]) => (
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
  );
}