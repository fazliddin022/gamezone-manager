"use client";

import { useState } from "react";
import { Station } from "@/lib/schema";
import { X, Play, DollarSign } from "lucide-react";

const PRICE_CONFIG: Record<string, number> = {
  ps1: 50000, ps2: 50000, ps3: 50000,
  arena: 17000, vip: 25000,
};

export default function StartSessionModal({
  station,
  onClose,
  onSuccess,
}: {
  station: Station;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [paymentType, setPaymentType] = useState<"postpaid" | "prepaid">("postpaid");
  const [prepaidAmount, setPrepaidAmount] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [loading, setLoading] = useState(false);

  const pricePerHour = PRICE_CONFIG[station.zoneType];
  const prepaidMinutes = prepaidAmount
    ? Math.floor((Number(prepaidAmount) / pricePerHour) * 60)
    : 0;

  const handleStart = async () => {
    setLoading(true);
    try {
      await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stationId: station.id,
          paymentType,
          prepaidAmount: paymentType === "prepaid" ? Number(prepaidAmount) : null,
          customerName,
        }),
      });
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  const QUICK_AMOUNTS = [10000, 20000, 30000, 50000, 100000];

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.7)",
      zIndex: 100,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem",
      backdropFilter: "blur(4px)",
    }}>
      <div style={{
        background: "#1a1a2e",
        borderRadius: "1.5rem",
        padding: "1.5rem",
        width: "100%",
        maxWidth: "420px",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 25px 50px rgba(0,0,0,0.8)",
      }}>
        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}>
          <div>
            <h2 style={{ fontWeight: 700, color: "white", fontSize: "1.125rem" }}>
              ▶ Sessiya boshlash
            </h2>
            <p style={{ fontSize: "0.75rem", color: "#7c3aed", marginTop: "0.125rem" }}>
              {station.name} · {pricePerHour.toLocaleString()} so'm/soat
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "0.5rem",
              padding: "0.375rem",
              cursor: "pointer",
              color: "#9ca3af",
              display: "flex",
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Mijoz ismi */}
          <div>
            <label style={{
              display: "block",
              fontSize: "0.75rem",
              color: "#9ca3af",
              marginBottom: "0.375rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}>
              Mijoz ismi (ixtiyoriy)
            </label>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Ismi..."
              style={{
                width: "100%",
                padding: "0.625rem 0.875rem",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "0.75rem",
                fontSize: "0.875rem",
                color: "white",
                outline: "none",
              }}
            />
          </div>

          {/* To'lov turi */}
          <div>
            <label style={{
              display: "block",
              fontSize: "0.75rem",
              color: "#9ca3af",
              marginBottom: "0.5rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}>
              To'lov turi
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
              <button
                onClick={() => setPaymentType("postpaid")}
                style={{
                  padding: "0.625rem",
                  borderRadius: "0.75rem",
                  border: "1px solid",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  background: paymentType === "postpaid"
                    ? "rgba(34,197,94,0.15)"
                    : "rgba(255,255,255,0.03)",
                  color: paymentType === "postpaid" ? "#22c55e" : "#6b7280",
                  borderColor: paymentType === "postpaid"
                    ? "rgba(34,197,94,0.3)"
                    : "rgba(255,255,255,0.08)",
                }}
              >
                ⏱ Keyinroq
              </button>
              <button
                onClick={() => setPaymentType("prepaid")}
                style={{
                  padding: "0.625rem",
                  borderRadius: "0.75rem",
                  border: "1px solid",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  background: paymentType === "prepaid"
                    ? "rgba(124,58,237,0.15)"
                    : "rgba(255,255,255,0.03)",
                  color: paymentType === "prepaid" ? "#a78bfa" : "#6b7280",
                  borderColor: paymentType === "prepaid"
                    ? "rgba(124,58,237,0.3)"
                    : "rgba(255,255,255,0.08)",
                }}
              >
                💵 Oldindan
              </button>
            </div>
          </div>

          {/* Prepaid miqdor */}
          {paymentType === "prepaid" && (
            <div>
              <label style={{
                display: "block",
                fontSize: "0.75rem",
                color: "#9ca3af",
                marginBottom: "0.5rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}>
                Summa (so'm)
              </label>

              {/* Quick amounts */}
              <div style={{
                display: "flex",
                gap: "0.375rem",
                flexWrap: "wrap",
                marginBottom: "0.5rem",
              }}>
                {QUICK_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setPrepaidAmount(String(amt))}
                    style={{
                      padding: "0.25rem 0.625rem",
                      borderRadius: "999px",
                      border: "1px solid",
                      cursor: "pointer",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      background: prepaidAmount === String(amt)
                        ? "rgba(124,58,237,0.2)"
                        : "rgba(255,255,255,0.03)",
                      color: prepaidAmount === String(amt) ? "#a78bfa" : "#6b7280",
                      borderColor: prepaidAmount === String(amt)
                        ? "rgba(124,58,237,0.4)"
                        : "rgba(255,255,255,0.08)",
                    }}
                  >
                    {(amt / 1000)}k
                  </button>
                ))}
              </div>

              <input
                type="number"
                value={prepaidAmount}
                onChange={(e) => setPrepaidAmount(e.target.value)}
                placeholder="Summa kiriting..."
                style={{
                  width: "100%",
                  padding: "0.625rem 0.875rem",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "0.75rem",
                  fontSize: "0.875rem",
                  color: "white",
                  outline: "none",
                }}
              />

              {prepaidMinutes > 0 && (
                <div style={{
                  marginTop: "0.5rem",
                  padding: "0.625rem",
                  background: "rgba(124,58,237,0.1)",
                  borderRadius: "0.625rem",
                  border: "1px solid rgba(124,58,237,0.2)",
                }}>
                  <p style={{ fontSize: "0.8rem", color: "#a78bfa", fontWeight: 600 }}>
                    ⏱ {Math.floor(prepaidMinutes / 60)} soat {prepaidMinutes % 60} daqiqa
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Start button */}
          <button
            onClick={handleStart}
            disabled={loading || (paymentType === "prepaid" && !prepaidAmount)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              padding: "0.875rem",
              background: loading
                ? "rgba(124,58,237,0.3)"
                : "linear-gradient(135deg, #7c3aed, #4f46e5)",
              color: "white",
              border: "none",
              borderRadius: "0.875rem",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "0.875rem",
              fontWeight: 700,
              boxShadow: loading ? "none" : "0 0 20px rgba(124,58,237,0.4)",
              marginTop: "0.5rem",
            }}
          >
            <Play size={16} />
            {loading ? "Boshlanmoqda..." : "Boshlash"}
          </button>
        </div>
      </div>
    </div>
  );
}