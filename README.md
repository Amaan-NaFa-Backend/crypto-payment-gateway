# Crypto Pay (React + ASP.NET Core)

This repo now has two parts:
- **Frontend** (`Frontend/`): React UI for creating payment requests, sending payments, and viewing history.
- **Backend** (`Backend/CryptoPay.Api/`): ASP.NET Core Web API that replaces the old Node/Express server. It keeps the same routes/payloads so the UI works without changes.

## Directory Map
```
pushrepo/
├── Backend/
│   └── CryptoPay.Api/           # ASP.NET Core 8 Web API
│       ├── Program.cs           # Startup, DI, CORS, Kestrel on port 5000
│       ├── Controllers/         # AccountsController, PaymentsController
│       ├── Domain/Models/       # Account, PaymentRequest, Transaction (snake_case JSON)
│       ├── Application/         # Services + DTOs
│       ├── Infrastructure/      # In-memory repositories (thread-safe)
│       └── appsettings.json     # Seed accounts, allowed origins (localhost:3000)
└── Frontend/
    ├── src/
    │   ├── App.jsx              # Tab layout (Request / Send / History)
    │   ├── PaymentRequest.jsx   # Generates QR + posts /api/payments/create
    │   ├── PaymentSend.jsx      # MetaMask send + posts /api/payments/verify
    │   └── TransactionHistory.jsx # Reads /api/payments/history
    └── package.json
```

## Run Locally
Backend (port 5000):
```bash
cd Backend/CryptoPay.Api
dotnet run --launch-profile http
```
Frontend (port 3000):
```bash
cd Frontend
npm install        # first time
npm start
```
Make sure the API is reachable at http://localhost:5000; the React app calls that base URL.

## API (unchanged from Node version)
- `GET  /api/accounts/{account_number}` → wallet + name, 404 if missing  
- `POST /api/payments/create`           → saves QR request (idempotent on payment_id)  
- `POST /api/payments/verify`           → saves confirmed tx (idempotent on tx_hash)  
- `GET  /api/payments/history`          → all txs, newest first  
- `GET  /api/payments/requests`         → all QR requests, newest first  
- `GET  /api/payments/status/{tx_hash}` → single tx or 404  
Data is in-memory; it resets on restart but is wrapped in repositories so a real DB can be plugged in later.

## What Changed vs Node
- Swapped Express server (`server.js`) for ASP.NET Core with controllers + DI.
- Kept the same JSON field names (snake_case) and endpoints to avoid UI changes.
- Added simple CORS policy (localhost:3000) and Swagger (dev only).
- Seed accounts live in `appsettings.json`.

## Common Issues
- **Port already in use (5000)**: `netstat -ano | findstr :5000` then `taskkill /PID <pid> /F`, or run `dotnet run --urls http://localhost:5001` and point the UI to that port.
- **NU1900 NuGet warning**: Just means the vulnerability feed couldn’t be reached; build still succeeds.
- **npm start: react-scripts missing**: Run `npm install` in `Frontend/` (not in `src/`).

## Next Steps (optional)
- Persist data with EF Core + SQLite/Postgres.
- Add authentication/API keys.
- Move ports to config/env variables for different environments.
