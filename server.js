const express = require("express");
const cors    = require("cors");

const app = express();
app.use(cors());
app.use(express.json());


const USDT_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"; // Sepolia USDC


let transactions    = []; // all confirmed transactions
let paymentRequests = []; // all QR payment requests generated


const ACCOUNT_WALLETS = {
  "ACC-001": { wallet: "0x114B7ACC2A37Cb5b97D8F4Cdf47c7b3936B119F3", name: "sahab_Dummy_data" },
  "ACC-002": { wallet: "0x937457A2C11611223B14dCefAB6ff6D1e926B6e9", name: "check2ac" },
  "ACC-003": { wallet: "0x85EA621E2a4f892c3d9fA4e69EE34AB2a0498904", name: "Account 3" },
};

/
app.get("/api/accounts/:account_number", (req, res) => {
  const account = ACCOUNT_WALLETS[req.params.account_number.toUpperCase()];
  if (!account) return res.status(404).json({ error: "Account not found" });
  res.json({ account_number: req.params.account_number, ...account });
});


app.post("/api/payments/create", (req, res) => {
  const { payment_id, receiver_account, receiver_wallet, amount, currency, note, uri } = req.body;

  // Check if already exists (avoid duplicates)
  const existing = paymentRequests.find(r => r.payment_id === payment_id);
  if (existing) {
    return res.json({ success: true, payment_id, message: "Already exists" });
  }

  const request = {
    payment_id,
    receiver_account,
    receiver_wallet,
    amount,
    currency: currency || "USDC",
    note,
    uri,
    status: "pending",
    created_at: new Date().toISOString(),
  };

  paymentRequests.push(request);
  console.log(`📋 Payment request saved: ${payment_id} — ${amount} USDC to ${receiver_account}`);
  res.json({ success: true, payment_id });
});


app.post("/api/payments/verify", (req, res) => {
  // const { tx_hash, sender_wallet, receiver_wallet, receiver_account, amount, currency } = req.body;// Old code had these fields — we keep them but also add "network" for better record-keeping
  const { tx_hash, sender_wallet, receiver_wallet, receiver_account, amount, currency, network } = req.body;// Added network field for better record-keeping, optional from frontend

  const existing = transactions.find(t => t.tx_hash === tx_hash);
  if (existing) {
    console.log(`ℹ️  Transaction already exists: ${tx_hash}`);
    return res.json({ success: true, transaction: existing });
  }

  const transaction = {
    transaction_id:          "TXN-" + Date.now(),
    tx_hash,
    sender_wallet,
    receiver_wallet,
    receiver_account_number: receiver_account,
    amount,
    currency:                currency || "USDC",
    network: network || "Unknown", // Frontend can add network info if desired
    status:                  "confirmed", // ← CHANGED from "pending" to "confirmed"

    timestamp:               new Date().toISOString(),
  };

  transactions.push(transaction);
  console.log(`✅ Transaction saved: ${tx_hash} — ${amount} USDC`);
  res.json({ success: true, transaction });
});

app.get("/api/payments/history", (req, res) => {
  // Create a copy before sorting to avoid mutating original array
  const sorted = [...transactions].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );
  res.json({ transactions: sorted });
});


app.get("/api/payments/requests", (req, res) => {
  const sorted = [...paymentRequests].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );
  res.json({ requests: sorted });
});


app.get("/api/payments/status/:tx_hash", (req, res) => {
  const tx = transactions.find(t => t.tx_hash === req.params.tx_hash);
  if (!tx) return res.status(404).json({ error: "Transaction not found" });
  res.json(tx);
});


const PORT = 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 NafaPay Backend running on http://localhost:${PORT}`);
  console.log(`\n📡 API Endpoints:`);
  console.log(`   GET  /api/accounts/:account_number  → resolve wallet`);
  console.log(`   POST /api/payments/create           → save QR request`);
  console.log(`   POST /api/payments/verify           → save confirmed tx`);
  console.log(`   GET  /api/payments/history          → all transactions`);
  console.log(`   GET  /api/payments/requests         → all QR requests`);
  console.log(`   GET  /api/payments/status/:tx_hash  → single tx status`);
  console.log(`\n💾 In-memory DB active — add MongoDB later`);
  console.log(`   Connection string ready: mongodb+srv://nafaadmin:...`);
  console.log(`\n⚠️  No blockchain provider — frontend handles all on-chain ops\n`);
});
