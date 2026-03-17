import { useState } from "react";
import PaymentRequest from "./PaymentRequest";
import PaymentSend from "./PaymentSend";
import TransactionHistory from "./TransactionHistory";
import "./App.css";

export default function App() {
  const [tab, setTab] = useState("request");

  const tabs = [
    { id: "request", label: "Request", icon: "↓" },
    { id: "send",    label: "Send",    icon: "↑" },
    { id: "history", label: "History", icon: "≡" },
  ];

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          {/* Brand */}
          <div className="brand">
            <div className="brand-logo">
              <svg viewBox="0 0 20 20" fill="none">
                <path d="M10 2L17 5.5V10C17 13.5 13.5 17 10 18C6.5 17 3 13.5 3 10V5.5L10 2Z"
                  fill="white" opacity="0.9"/>
                <text x="50%" y="62%" dominantBaseline="middle" textAnchor="middle"
                  fontSize="9" fontWeight="bold" fill="#00875A" fontFamily="Georgia">₮</text>
              </svg>
            </div>
            <div>
              <div className="brand-name">NafaPay</div>
              <div className="brand-sub">USDT Payments</div>
            </div>
          </div>

          {/* Nav */}
          <nav className="nav">
            {tabs.map(t => (
              <button key={t.id} className={`nav-btn ${tab === t.id ? "active" : ""}`}
                onClick={() => setTab(t.id)}>
                <span className="nav-icon">{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </nav>

          {/* Network */}
          <div className="header-right">
            <div className="network-pill">
              <span className="network-dot" />
              Ethereum
            </div>
          </div>
        </div>
      </header>

      <main className="main">
        {tab === "request" && <PaymentRequest />}
        {tab === "send"    && <PaymentSend />}
        {tab === "history" && <TransactionHistory />}
      </main>
    </div>
  );
}