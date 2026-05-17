"use client";

import { useEffect, useState, useCallback } from "react";
import { Clock, DollarSign, Monitor, Calendar, TrendingUp } from "lucide-react";

type HistoryItem = {
  id: string;
  customerName: string | null;
  paymentType: string;
  startTime: string;
  endTime: string | null;
  totalMinutes: number | null;
  totalAmount: number | null;
  status: string;
  stationName: string;
  zoneType: string;
};

const ZONE_COLORS: Record<string, string> = {
  ps1: "#f59e0b", ps2: "#f59e0b", ps3: "#f59e0b",
  arena: "#3b82f6", vip: "#a855f7",
};

function formatTime(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}s ${m}d` : `${m}d`;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchHistory = useCallback(async () => {
    const res = await fetch("/api/history");
    const data = await res.json();
    setHistory(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const filtered = filter === "all"
    ? history
    : history.filter((h) => h.zoneType === filter ||
      (filter === "ps" && ["ps1", "ps2", "ps3"].includes(h.zoneType))
    );

  const todayHistory = history.filter((h) => {
    const today = new Date().toDateString();
    return new Date(h.startTime).toDateString() === today;
  });

  const todayRevenue = todayHistory
    .filter((h) => h.status === "completed")
    .reduce((sum, h) => sum + (h.totalAmount || 0), 0);

  const todayMinutes = todayHistory
    .filter((h) => h.status === "completed")
    .reduce((sum, h) => sum + (h.totalMinutes || 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "white" }}>
          📋 Tarix
        </h1>
        <p style={{ color: "#6b7280", fontSize: "0.875rem", marginTop: "0.25rem" }}>
          Barcha sessionlar tarixi
        </p>
      </div>

      {/* Bugungi statistika */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: "1rem",
      }}>
        {[
          {
            label: "Bugungi sessionlar",
            value: todayHistory.length,
            icon: Calendar,
            color: "#3b82f6",
          },
          {
            label: "Bugungi daromad",
            value: todayRevenue.toLocaleString() + " so'm",
            icon: DollarSign,
            color: "#22c55e",
          },
          {
            label: "Jami vaqt",
            value: formatTime(todayMinutes),
            icon: Clock,
            color: "#a78bfa",
          },
          {
            label: "O'rtacha session",
            value: todayHistory.length > 0
              ? formatTime(Math.floor(todayMinutes / todayHistory.length))
              : "—",
            icon: TrendingUp,
            color: "#f59e0b",
          },
        ].map((stat) => (
          <div key={stat.label} style={{
            background: "rgba(255,255,255,0.03)",
            borderRadius: "1rem",
            padding: "1.25rem",
            border: "1px solid rgba(255,255,255,0.06)",
          }}>
            <div style={{
              background: `${stat.color}15`,
              padding: "0.625rem",
              borderRadius: "0.75rem",
              width: "fit-content",
              marginBottom: "0.75rem",
            }}>
              <stat.icon size={18} color={stat.color} />
            </div>
            <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "white" }}>
              {stat.value}
            </p>
            <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.125rem" }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {[
          { key: "all", label: "🎯 Hammasi" },
          { key: "ps", label: "🎮 PlayStation" },
          { key: "arena", label: "💻 Arena" },
          { key: "vip", label: "👑 VIP" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              padding: "0.375rem 1rem",
              borderRadius: "999px",
              border: "1px solid",
              cursor: "pointer",
              fontSize: "0.8rem",
              fontWeight: 600,
              transition: "all 0.2s",
              background: filter === f.key ? "#7c3aed" : "rgba(255,255,255,0.03)",
              color: filter === f.key ? "white" : "#9ca3af",
              borderColor: filter === f.key ? "#7c3aed" : "rgba(255,255,255,0.08)",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Tarix jadvali */}
      <div style={{
        background: "rgba(255,255,255,0.02)",
        borderRadius: "1rem",
        border: "1px solid rgba(255,255,255,0.06)",
        overflow: "hidden",
      }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#6b7280" }}>
            Yuklanmoqda...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#6b7280" }}>
            <Clock size={40} style={{ margin: "0 auto 1rem", opacity: 0.3 }} />
            <p>Hali tarix yo'q</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  background: "rgba(255,255,255,0.02)",
                }}>
                  {["Stansiya", "Mijoz", "Boshlanish", "Tugash", "Vaqt", "Summa", "Holat"].map((h) => (
                    <th key={h} style={{
                      padding: "0.875rem 1rem",
                      textAlign: "left",
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      color: "#6b7280",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      whiteSpace: "nowrap",
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, i) => (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom: i < filtered.length - 1
                        ? "1px solid rgba(255,255,255,0.04)"
                        : "none",
                    }}
                  >
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <div style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: ZONE_COLORS[item.zoneType] || "#6b7280",
                          flexShrink: 0,
                        }} />
                        <span style={{
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          color: "white",
                          whiteSpace: "nowrap",
                        }}>
                          {item.stationName}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <span style={{ fontSize: "0.875rem", color: "#9ca3af" }}>
                        {item.customerName || "—"}
                      </span>
                    </td>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <span style={{
                        fontSize: "0.8rem",
                        color: "#6b7280",
                        fontFamily: "monospace",
                        whiteSpace: "nowrap",
                      }}>
                        {new Date(item.startTime).toLocaleTimeString("uz-UZ", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </td>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <span style={{
                        fontSize: "0.8rem",
                        color: "#6b7280",
                        fontFamily: "monospace",
                        whiteSpace: "nowrap",
                      }}>
                        {item.endTime
                          ? new Date(item.endTime).toLocaleTimeString("uz-UZ", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"
                        }
                      </span>
                    </td>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <span style={{
                        fontSize: "0.8rem",
                        color: "#a78bfa",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}>
                        {item.totalMinutes ? formatTime(item.totalMinutes) : "—"}
                      </span>
                    </td>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <span style={{
                        fontSize: "0.875rem",
                        fontWeight: 700,
                        color: "#22c55e",
                        whiteSpace: "nowrap",
                      }}>
                        {item.totalAmount
                          ? item.totalAmount.toLocaleString() + " so'm"
                          : "—"
                        }
                      </span>
                    </td>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <span style={{
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        padding: "0.2rem 0.625rem",
                        borderRadius: "999px",
                        background: item.status === "completed"
                          ? "rgba(34,197,94,0.15)"
                          : "rgba(245,158,11,0.15)",
                        color: item.status === "completed" ? "#22c55e" : "#f59e0b",
                        whiteSpace: "nowrap",
                      }}>
                        {item.status === "completed" ? "✓ Tugadi" : "⏳ Aktiv"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}