"use client";

import { useState } from "react";
import { Station, Session } from "@/lib/schema";
import { X, Square, Clock, DollarSign } from "lucide-react";

const PRICE_CONFIG: Record<string, number> = {
  ps1: 50000, ps2: 50000, ps3: 50000,
  arena: 17000, vip: 25000,
};

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

type StationWithSession = Station & { activeSession: Session | null };

export default function StopSessionModal({
  station,
  tick,
  onClose,
  onSuccess,
}: {
  station: StationWithSession;
  tick: number;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const session = station.activeSession!;
  const elapsed = Math.floor(
    (Date.now() - new Date(session.startTime!).getTime()) / 1000
  );
  const pricePerHour = PRICE_CONFIG[station.zoneType];
  const totalAmount = session.paymentType === "prepaid"
    ? session.prepaidAmount!
    : Math.ceil((elapsed / 3600) * pricePerHour);

  const handleStop = async () => {
    setLoading(true);
    try {
      await fetch(`/api/sessions/${session.id}`, { method: "PUT" });
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

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
        maxWidth: "380px",
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
          <h2 style={{ fontWeight: 700, color: "white", fontSize: "1.125rem" }}>
            ⏹ Sessionni tugatish
          </h2>
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

        {/* Info */}
        <div style={{
          background: "rgba(255,255,255,0.03)",
          borderRadius: "1rem",
          padding: "1.25rem",
          marginBottom: "1.25rem",
          border: "1px solid rgba(255,255,255,0.06)",
        }}>
          <p style={{ fontSize: "1rem", fontWeight: 700, color: "white", marginBottom: "1rem" }}>
            {station.name}
            {session.customerName && (
              <span style={{ color: "#9ca3af", fontWeight: 400, fontSize: "0.875rem" }}>
                {" · "}{session.customerName}
              </span>
            )}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.875rem", color: "#9ca3af" }}>
                <Clock size={14} />
                Vaqt
              </span>
              <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#a78bfa", fontSize: "1.125rem" }}>
                {formatTime(elapsed)}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.875rem", color: "#9ca3af" }}>
                <DollarSign size={14} />
                To'lov turi
              </span>
              <span style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                padding: "0.2rem 0.625rem",
                borderRadius: "999px",
                background: session.paymentType === "prepaid"
                  ? "rgba(124,58,237,0.2)"
                  : "rgba(34,197,94,0.2)",
                color: session.paymentType === "prepaid" ? "#a78bfa" : "#22c55e",
              }}>
                {session.paymentType === "prepaid" ? "Oldindan to'langan" : "Keyinroq to'lash"}
              </span>
            </div>

            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: "0.625rem",
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}>
              <span style={{ fontSize: "0.875rem", color: "#9ca3af" }}>Jami summa</span>
              <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "#22c55e" }}>
                {totalAmount.toLocaleString()} so'm
              </span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "0.75rem",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "0.875rem",
              cursor: "pointer",
              color: "#9ca3af",
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          >
            Bekor qilish
          </button>
          <button
            onClick={handleStop}
            disabled={loading}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              padding: "0.75rem",
              background: loading
                ? "rgba(239,68,68,0.3)"
                : "linear-gradient(135deg, #ef4444, #dc2626)",
              border: "none",
              borderRadius: "0.875rem",
              cursor: loading ? "not-allowed" : "pointer",
              color: "white",
              fontSize: "0.875rem",
              fontWeight: 700,
              boxShadow: loading ? "none" : "0 0 15px rgba(239,68,68,0.3)",
            }}
          >
            <Square size={14} />
            {loading ? "..." : "Tugatish"}
          </button>
        </div>
      </div>
    </div>
  );
}