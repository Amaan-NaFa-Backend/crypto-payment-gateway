# Crypto Pay (React + ASP.NET Core)

Two parts live in this repo:
- **Frontend** (`Frontend/`): React UI for creating payment requests, sending payments, and viewing history.
- **Backend** (`Backend/CryptoPay.Api/`): ASP.NET Core Web API that replaces the old Node/Express server. Routes/payloads stay the same, so the UI is unchanged.

## Directory Map
```
pushrepo/
├── Backend/
│   └── CryptoPay.Api/
│       ├── Program.cs            # Startup: DI, CORS (localhost:3000), Swagger (dev), Kestrel port 5000
│       ├── Controllers/          # AccountsController, PaymentsController
│       ├── Domain/Models/        # Account, PaymentRequest, Transaction (snake_case via JsonPropertyName)
│       ├── Application/          # Services (PaymentService) + DTOs that map HTTP bodies to models
│       ├── Infrastructure/       # In-memory repositories (thread-safe dictionaries) behind interfaces
│       └── appsettings.json      # Seed accounts + allowed origins
└── Frontend/
    ├── src/
    │   ├── App.jsx               # Tabs (Request / Send / History)
    │   ├── PaymentRequest.jsx    # Generates QR; POST /api/payments/create
    │   ├── PaymentSend.jsx       # MetaMask send; POST /api/payments/verify
    │   └── TransactionHistory.jsx# GET /api/payments/history
    └── package.json
```

## Backend Layers (for the Node dev)
- **Domain/Models**: Plain C# classes with `JsonPropertyName` so JSON fields stay snake_case (payment_id, tx_hash, etc.). No logic.
- **Infrastructure**: Repository interfaces + in-memory implementations (ConcurrentDictionary). Can swap to EF Core/Mongo later without changing controllers/services.
- **Application**: Business logic. PaymentService handles create (idempotent on payment_id), verify (idempotent on tx_hash), history, requests, status. DTOs convert request bodies into domain models.
- **Controllers**: Thin HTTP layer exposing the same endpoints as the old Express server.
- **Program.cs**: Wires DI, CORS for localhost:3000, Swagger in development, and listens on port 5000. Loads seed accounts from appsettings.json.

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
Make sure the API is reachable at http://localhost:5000 (or change `--urls` if you run on another port).

## API (unchanged from Node)
- `GET  /api/accounts/{account_number}` → wallet + name, 404 if missing  
- `POST /api/payments/create`           → saves QR request (idempotent on payment_id)  
- `POST /api/payments/verify`           → saves confirmed tx (idempotent on tx_hash)  
- `GET  /api/payments/history`          → all transactions, newest first  
- `GET  /api/payments/requests`         → all QR requests, newest first  
- `GET  /api/payments/status/{tx_hash}` → single tx or 404  
Data is in-memory; it resets on restart but is behind repositories so a real DB can be plugged in later.

## What Changed vs Node
- Replaced Express `server.js` with ASP.NET Core controllers + DI.
- Kept JSON field names and routes identical to avoid frontend changes.
- Added simple CORS policy (localhost:3000) and Swagger (dev only).
- Seed accounts moved to `appsettings.json`.

## Next Steps (optional)
- Persist with EF Core + SQLite/Postgres.
- Add authentication/API keys.
- Move ports to config/env vars for different environments.
