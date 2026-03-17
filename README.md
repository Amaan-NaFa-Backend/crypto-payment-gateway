# 🏦 Nafa Barter — Crypto QR Payment Module

A complete USDT payment request system using Ethereum blockchain, ethers.js, and QR codes.
Works like UPI/Paytm but on blockchain.

---

## 📁 Project Structure

```
crypto-payment/
├── frontend/           ← React app (UI)
│   └── src/
│       ├── App.jsx             ← Main app + tabs
│       ├── App.css             ← All styles
│       ├── PaymentRequest.jsx  ← Receiver: create QR
│       ├── PaymentSend.jsx     ← Sender: MetaMask + send
│       └── TransactionHistory.jsx ← History + status
│
└── backend/            ← Node.js API
    ├── server.js       ← Express server + blockchain listener
    └── package.json
```

---

## 🚀 Setup & Run

### 1. Backend
```bash
cd backend
npm install
node server.js
```
Backend runs on http://localhost:5000

### 2. Frontend
```bash
cd frontend
npm install
npm start
```
Frontend runs on http://localhost:3000

### 3. Add Infura Key (for mainnet)
In `backend/server.js`, replace:
```js
const INFURA_URL = "https://mainnet.infura.io/v3/YOUR_INFURA_KEY";
```
Get free key at: https://infura.io

---

## 💡 How It Works

### Receiver Flow
1. Open app → "Request Payment" tab
2. Select CRM account (ACC-001, ACC-002, ACC-003)
3. Enter USDT amount
4. Click "Generate Payment QR"
5. Share QR code with sender

### Sender Flow
1. Open app → "Send Payment" tab
2. Connect MetaMask
3. Enter receiver's account number (e.g. ACC-001)
4. Enter amount → Click "Send USDT"
5. Approve in MetaMask popup

### Backend Auto-Verification
- Backend listens for Transfer events on Ethereum
- When USDT arrives at any registered wallet → auto-records in DB
- Transaction hash stored for proof

---

## 🔗 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/accounts/:account | Lookup wallet by account number |
| POST | /api/payments/create | Create payment request |
| POST | /api/payments/verify | Verify transaction on blockchain |
| GET | /api/payments/history | Get all transactions |
| GET | /api/payments/status/:hash | Check specific tx status |

---

## 🗄️ Database Schema (Production)

### Users Table
```sql
CREATE TABLE users (
  user_id UUID PRIMARY KEY,
  account_number VARCHAR(20) UNIQUE,
  name VARCHAR(100),
  wallet_address VARCHAR(42),
  created_at TIMESTAMP
);
```

### Transactions Table
```sql
CREATE TABLE transactions (
  transaction_id UUID PRIMARY KEY,
  sender_wallet VARCHAR(42),
  receiver_wallet VARCHAR(42),
  receiver_account_number VARCHAR(20),
  amount DECIMAL(18,6),
  currency VARCHAR(10),
  transaction_hash VARCHAR(66) UNIQUE,
  status VARCHAR(20),  -- pending, confirmed, failed
  block_number INTEGER,
  timestamp TIMESTAMP
);
```

---

## 🔧 QR Code Format

Uses EIP-681 standard (Ethereum Payment URI):
```
ethereum:0xdAC17F...31ec7@1/transfer?address=<wallet>&uint256=<amount>
```

This URI is recognized by MetaMask mobile and most crypto wallets.
Scanning it pre-fills the transaction automatically.

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js + ethers.js |
| QR Generation | qrcode npm library |
| Backend | Node.js + Express.js |
| Blockchain | Ethereum Mainnet |
| Token | USDT ERC-20 |
| Wallet | MetaMask |
| DB (prod) | MongoDB or PostgreSQL |

---

## ⚡ Next Steps for Production

1. Replace in-memory DB with PostgreSQL/MongoDB
2. Add user authentication (JWT)
3. Add webhook notifications on payment received
4. Deploy frontend to Vercel
5. Deploy backend to AWS/Railway
6. Add email/SMS notification on payment confirmed
7. Add payment expiry (QR valid for 30 mins)
