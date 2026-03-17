import { useState, useEffect } from "react";

const MOCK = [
  { transaction_id:"TXN-001", sender_wallet:"0x114B7ACC2A37Cb5b97D8F4Cdf47c7b3936B119F3", receiver_wallet:"0x742d35Cc6634C0532925a3b844Bc454e4438f44e", receiver_account_number:"ACC-001", amount:500, currency:"USDT", transaction_hash:"0x746467b8e270efc1064e46b9520a49ff5dd24a626a4a052da5cb12decbde8b72", status:"confirmed", timestamp: new Date(Date.now()-3600000).toISOString() },
  { transaction_id:"TXN-002", sender_wallet:"0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B", receiver_wallet:"0x53d284357ec70cE289D6D64134DfAc8E511c8a3", receiver_account_number:"ACC-002", amount:1200, currency:"USDT", transaction_hash:"0x9a3f1b2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1", status:"confirmed", timestamp: new Date(Date.now()-86400000).toISOString() },
  { transaction_id:"TXN-003", sender_wallet:"0x53d284357ec70cE289D6D64134DfAc8E511c8a3", receiver_wallet:"0x742d35Cc6634C0532925a3b844Bc454e4438f44e", receiver_account_number:"ACC-001", amount:75.5, currency:"USDT", transaction_hash:"0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef", status:"pending", timestamp: new Date(Date.now()-900000).toISOString() },
  { transaction_id:"TXN-004", sender_wallet:"0x742d35Cc6634C0532925a3b844Bc454e4438f44e", receiver_wallet:"0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B", receiver_account_number:"ACC-003", amount:320, currency:"USDT", transaction_hash:"0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890", status:"confirmed", timestamp: new Date(Date.now()-172800000).toISOString() },
];

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h/24)}d ago`;
}

export default function TransactionHistory() {
  const [txns, setTxns]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]  = useState("all");
  const [search, setSearch]  = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const r = await fetch("http://localhost:5000/api/payments/history");
        const d = await r.json();
        setTxns(d.transactions?.length ? d.transactions : MOCK);
      } catch { setTxns(MOCK); }
      setLoading(false);
    }
    load();
  }, []);

  const filtered = txns.filter(t => {
    const matchFilter = filter === "all" || t.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || t.transaction_id.toLowerCase().includes(q)
      || t.receiver_account_number.toLowerCase().includes(q)
      || t.transaction_hash.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const confirmed = txns.filter(t => t.status === "confirmed");
  const pending   = txns.filter(t => t.status === "pending");
  const volume    = confirmed.reduce((s, t) => s + t.amount, 0);

  return (
    <div>
      <p className="page-title">Transaction history</p>
      <p className="page-sub">All USDT payments across Nafa Barter accounts.</p>

      {/* Stats */}
      <div className="grid-3" style={{marginBottom:24}}>
        <div className="card stat-card">
          <div className="stat-label">Total transactions</div>
          <div className="stat-value">{txns.length}</div>
          <div className="stat-change">{confirmed.length} confirmed · {pending.length} pending</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Confirmed volume</div>
          <div className="stat-value green">${volume.toLocaleString("en-US", {minimumFractionDigits:2})}</div>
          <div className="stat-change">USDT settled</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Pending volume</div>
          <div className="stat-value">${pending.reduce((s,t)=>s+t.amount,0).toLocaleString("en-US", {minimumFractionDigits:2})}</div>
          <div className="stat-change">Awaiting confirmation</div>
        </div>
      </div>

      <div className="grid-2" style={{alignItems:"start"}}>
        {/* List */}
        <div className="card" style={{padding:0, overflow:"hidden"}}>
          {/* Filters */}
          <div style={{
            padding:"16px 20px", borderBottom:"1px solid var(--border)",
            display:"flex", gap:8, flexWrap:"wrap", alignItems:"center"
          }}>
            <input className="input" placeholder="Search..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{flex:1, minWidth:140, padding:"8px 12px", fontSize:13}} />
            <div style={{display:"flex", gap:4}}>
              {["all","confirmed","pending","failed"].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding:"6px 12px", borderRadius:6, border:"1.5px solid",
                  borderColor: filter===f ? "var(--green)" : "var(--border-dark)",
                  background: filter===f ? "var(--green-light)" : "white",
                  color: filter===f ? "var(--green)" : "var(--text-3)",
                  fontFamily:"var(--sans)", fontSize:12, fontWeight:600,
                  cursor:"pointer", textTransform:"capitalize"
                }}>{f}</button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{padding:40, textAlign:"center", color:"var(--text-3)"}}>
              <span className="spinner spinner-dark" style={{width:24, height:24, margin:"0 auto 12px", display:"block"}}/>
              Loading...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{padding:40, textAlign:"center", color:"var(--text-3)"}}>
              No transactions found
            </div>
          ) : (
            <div className="tx-list">
              {filtered.map(tx => (
                <div key={tx.transaction_id} className="tx-item"
                  onClick={() => setSelected(tx === selected ? null : tx)}
                  style={{borderLeft: selected === tx ? "3px solid var(--green)" : "3px solid transparent"}}>
                  <div className={`tx-icon ${tx.status === "confirmed" ? "tx-icon-in" : "tx-icon-out"}`}>
                    {tx.status === "confirmed" ? "✓" : tx.status === "pending" ? "⏳" : "✕"}
                  </div>
                  <div className="tx-body">
                    <div className="tx-title">{tx.receiver_account_number} — {tx.transaction_id}</div>
                    <div className="tx-sub">
                      From {tx.sender_wallet.slice(0,10)}...{tx.sender_wallet.slice(-6)}
                    </div>
                  </div>
                  <div className="tx-right">
                    <div className={`tx-amount in`}>+{tx.amount.toLocaleString()} USDT</div>
                    <div className="tx-date">{timeAgo(tx.timestamp)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected ? (
          <div className="card card-lg">
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16}}>
              <div className="section-label" style={{marginBottom:0}}>Transaction Detail</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)} style={{padding:"4px 10px"}}>✕</button>
            </div>

            <div style={{textAlign:"center", padding:"20px 0 24px"}}>
              <div style={{
                width:56, height:56, borderRadius:"50%", margin:"0 auto 12px",
                background: selected.status==="confirmed" ? "var(--green-light)" : "var(--amber-light)",
                border:`2px solid ${selected.status==="confirmed" ? "var(--green)" : "var(--amber)"}`,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:22
              }}>
                {selected.status === "confirmed" ? "✓" : "⏳"}
              </div>
              <div style={{fontFamily:"var(--serif)", fontSize:28, color:"var(--text)"}}>
                {selected.amount.toLocaleString("en-US", {minimumFractionDigits:2})} USDT
              </div>
              <div style={{marginTop:8}}>
                <div className={`badge badge-${selected.status}`}>{selected.status}</div>
              </div>
            </div>

            <div className="info-table" style={{marginBottom:16}}>
              <div className="info-row"><span className="info-key">ID</span><span className="info-val">{selected.transaction_id}</span></div>
              <div className="info-row"><span className="info-key">Account</span><span className="info-val">{selected.receiver_account_number}</span></div>
              <div className="info-row"><span className="info-key">Date</span><span className="info-val">{new Date(selected.timestamp).toLocaleString()}</span></div>
              <div className="info-row"><span className="info-key">From</span><span className="info-val mono">{selected.sender_wallet.slice(0,12)}...{selected.sender_wallet.slice(-8)}</span></div>
              <div className="info-row"><span className="info-key">To</span><span className="info-val mono">{selected.receiver_wallet.slice(0,12)}...{selected.receiver_wallet.slice(-8)}</span></div>
            </div>

            <div className="section-label">Transaction Hash</div>
            <div style={{
              background:"var(--bg)", border:"1px solid var(--border)", borderRadius:"var(--radius-sm)",
              padding:"10px 12px", fontFamily:"var(--mono)", fontSize:11, color:"var(--text-2)",
              wordBreak:"break-all", lineHeight:1.7, marginBottom:10
            }}>{selected.transaction_hash}</div>
            <div style={{display:"flex", gap:8}}>
              <button className="copy-btn" onClick={() => navigator.clipboard.writeText(selected.transaction_hash)}>
                📋 Copy
              </button>
              {/* <a href={`https://etherscan.io/tx/${selected.transaction_hash}`} target="_blank" rel="noreferrer"
                style={{display:"inline-flex", alignItems:"center", gap:4, padding:"4px 10px",
                  borderRadius:"var(--radius-xs)", background:"var(--bg)", border:"1px solid var(--border)",
                  fontSize:11, fontWeight:500, color:"var(--blue)", textDecoration:"none"}}>
                Etherscan ↗
              </a> */}
              <a href={`https://sepolia.etherscan.io/tx/${selected.transaction_hash}`} target="_blank" rel="noreferrer"
                style={{display:"inline-flex", alignItems:"center", gap:4, padding:"4px 10px",
                  borderRadius:"var(--radius-xs)", background:"var(--bg)", border:"1px solid var(--border)",
                  fontSize:11, fontWeight:500, color:"var(--blue)", textDecoration:"none"}}>
                Etherscan ↗
              </a>{/* Using Etherscan link for mainnet transactions. Replace with Sepolia Etherscan link if using testnet.*/}
            </div>
          </div>
        ) : (
          <div className="card" style={{textAlign:"center", padding:40, color:"var(--text-3)"}}>
            <div style={{fontSize:32, marginBottom:12}}>←</div>
            <div style={{fontSize:14, fontWeight:500, marginBottom:6}}>Select a transaction</div>
            <div style={{fontSize:13}}>Click any row to view full details</div>
          </div>
        )}
      </div>
    </div>
  );
}