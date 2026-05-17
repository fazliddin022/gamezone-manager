"use client";

import { useEffect, useState, useCallback } from "react";
import { Station, Session } from "@/lib/schema";
import {
  Monitor,
  Tv,
  Crown,
  Play,
  Square,
  Clock,
  DollarSign,
  Users,
  TrendingUp,
} from "lucide-react";
import StartSessionModal from "../components/StartSessionModal";
import StopSessionModal from "../components/StopSessionModal";


type StationWithSession = Station & { activeSession: Session | null };

const ZONE_CONFIG = {
  ps1: { label: "PS1 Xona", icon: "🎮", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)" },
  ps2: { label: "PS2 Xona", icon: "🎮", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)" },
  ps3: { label: "PS3 Xona", icon: "🎮", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)" },
  arena: { label: "Arena", icon: "💻", color: "#3b82f6", bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.3)" },
  vip: { label: "VIP", icon: "👑", color: "#a855f7", bg: "rgba(168,85,247,0.1)", border: "rgba(168,85,247,0.3)" },
};

const PRICE_CONFIG = {
  ps1: 50000, ps2: 50000, ps3: 50000,
  arena: 17000, vip: 25000,
};

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function getElapsedSeconds(startTime: Date | string) {
  return Math.floor((Date.now() - new Date(startTime).getTime()) / 1000);
}

function getAmount(station: StationWithSession, elapsedSeconds: number) {
  if (!station.activeSession) return 0;
  const pricePerHour = PRICE_CONFIG[station.zoneType];
  if (station.activeSession.paymentType === "prepaid") {
    return station.activeSession.prepaidAmount || 0;
  }
  return Math.ceil((elapsedSeconds / 3600) * pricePerHour);
}

export default function DashboardPage() {
  const [stationList, setStationList] = useState<StationWithSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const [startModal, setStartModal] = useState<StationWithSession | null>(null);
  const [stopModal, setStopModal] = useState<StationWithSession | null>(null);
  const [activeZone, setActiveZone] = useState<string>("all");

  const fetchStations = useCallback(async () => {
    const res = await fetch("/api/stations");
    const data = await res.json();
    setStationList(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  // Har soniyada yangilash (timer uchun)
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const zones = ["all", "ps1", "ps2", "ps3", "arena", "vip"];

  const filtered = activeZone === "all"
    ? stationList
    : stationList.filter((s) => s.zoneType === activeZone);

  const activeCount = stationList.filter((s) => s.activeSession).length;
  const totalRevenue = stationList
    .filter((s) => s.activeSession)
    .reduce((sum, s) => {
      const elapsed = getElapsedSeconds(s.activeSession!.startTime!);
      return sum + getAmount(s, elapsed);
    }, 0);

  // VIP xonalarni guruhlash
  const vipRooms = [1, 2, 3, 4];

  if (loading) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "60vh",
        color: "#6b7280",
        fontSize: "1rem",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎮</div>
          <p>Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* Stats */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "1rem",
      }}>
        {[
          {
            label: "Jami o'rinlar",
            value: stationList.length,
            icon: Monitor,
            color: "#3b82f6",
            bg: "rgba(59,130,246,0.1)",
          },
          {
            label: "Band",
            value: activeCount,
            icon: Users,
            color: "#22c55e",
            bg: "rgba(34,197,94,0.1)",
          },
          {
            label: "Bo'sh",
            value: stationList.length - activeCount,
            icon: Tv,
            color: "#6b7280",
            bg: "rgba(107,114,128,0.1)",
          },
          {
            label: "Joriy daromad",
            value: totalRevenue.toLocaleString() + " so'm",
            icon: DollarSign,
            color: "#f59e0b",
            bg: "rgba(245,158,11,0.1)",
          },
        ].map((stat) => (
          <div key={stat.label} style={{
            background: "rgba(255,255,255,0.03)",
            borderRadius: "1rem",
            padding: "1.25rem",
            border: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}>
            <div style={{
              background: stat.bg,
              padding: "0.75rem",
              borderRadius: "0.75rem",
            }}>
              <stat.icon size={20} color={stat.color} />
            </div>
            <div>
              <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "white" }}>
                {stat.value}
              </p>
              <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Zone filter */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {zones.map((zone) => {
          const config = zone === "all" ? null : ZONE_CONFIG[zone as keyof typeof ZONE_CONFIG];
          const count = zone === "all"
            ? stationList.length
            : stationList.filter((s) => s.zoneType === zone).length;

          return (
            <button
              key={zone}
              onClick={() => setActiveZone(zone)}
              style={{
                padding: "0.375rem 1rem",
                borderRadius: "999px",
                border: "1px solid",
                cursor: "pointer",
                fontSize: "0.8rem",
                fontWeight: 600,
                transition: "all 0.2s",
                background: activeZone === zone
                  ? (config?.color || "#7c3aed")
                  : "rgba(255,255,255,0.03)",
                color: activeZone === zone ? "white" : "#9ca3af",
                borderColor: activeZone === zone
                  ? (config?.color || "#7c3aed")
                  : "rgba(255,255,255,0.08)",
              }}
            >
              {zone === "all" ? "🎯 Hammasi" : config?.icon + " " + config?.label} ({count})
            </button>
          );
        })}
      </div>

      {/* PlayStation xonalari */}
      {(activeZone === "all" || ["ps1", "ps2", "ps3"].includes(activeZone)) && (
        <div>
          <h2 style={{
            fontSize: "0.875rem",
            fontWeight: 700,
            color: "#f59e0b",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}>
            🎮 PlayStation Xonalari
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "1rem",
          }}>
            {filtered
              .filter((s) => ["ps1", "ps2", "ps3"].includes(s.zoneType))
              .map((station) => (
                <StationCard
                  key={station.id}
                  station={station}
                  tick={tick}
                  onStart={() => setStartModal(station)}
                  onStop={() => setStopModal(station)}
                />
              ))}
          </div>
        </div>
      )}

      {/* Arena */}
      {(activeZone === "all" || activeZone === "arena") && (
        <div>
          <h2 style={{
            fontSize: "0.875rem",
            fontWeight: 700,
            color: "#3b82f6",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}>
            💻 Arena ({filtered.filter((s) => s.zoneType === "arena").length} kompyuter)
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
            gap: "0.75rem",
          }}>
            {filtered
              .filter((s) => s.zoneType === "arena")
              .map((station) => (
                <StationCard
                  key={station.id}
                  station={station}
                  tick={tick}
                  compact
                  onStart={() => setStartModal(station)}
                  onStop={() => setStopModal(station)}
                />
              ))}
          </div>
        </div>
      )}

      {/* VIP xonalar */}
      {(activeZone === "all" || activeZone === "vip") && (
        <div>
          <h2 style={{
            fontSize: "0.875rem",
            fontWeight: 700,
            color: "#a855f7",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}>
            👑 VIP Xonalar
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {vipRooms.map((roomNum) => {
              const roomStations = filtered.filter(
                (s) => s.zoneType === "vip" && s.roomNumber === roomNum
              );
              if (roomStations.length === 0) return null;

              return (
                <div key={roomNum}>
                  <p style={{
                    fontSize: "0.75rem",
                    color: "#7c3aed",
                    fontWeight: 600,
                    marginBottom: "0.5rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}>
                    VIP Xona {roomNum}
                  </p>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(5, 1fr)",
                    gap: "0.625rem",
                  }}>
                    {roomStations.map((station) => (
                      <StationCard
                        key={station.id}
                        station={station}
                        tick={tick}
                        compact
                        onStart={() => setStartModal(station)}
                        onStop={() => setStopModal(station)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modals */}
      {startModal && (
        <StartSessionModal
          station={startModal}
          onClose={() => setStartModal(null)}
          onSuccess={() => {
            setStartModal(null);
            fetchStations();
          }}
        />
      )}

      {stopModal && (
        <StopSessionModal
          station={stopModal}
          tick={tick}
          onClose={() => setStopModal(null)}
          onSuccess={() => {
            setStopModal(null);
            fetchStations();
          }}
        />
      )}
    </div>
  );
}

// Station Card komponenti
function StationCard({
  station,
  tick,
  compact = false,
  onStart,
  onStop,
}: {
  station: StationWithSession;
  tick: number;
  compact?: boolean;
  onStart: () => void;
  onStop: () => void;
}) {
  const isActive = !!station.activeSession;
  const config = ZONE_CONFIG[station.zoneType];
  const elapsed = isActive
    ? getElapsedSeconds(station.activeSession!.startTime!)
    : 0;
  const amount = isActive ? getAmount(station, elapsed) : 0;

  // Prepaid uchun qolgan vaqt
  const prepaidElapsed = isActive && station.activeSession?.paymentType === "prepaid"
    ? elapsed
    : null;
  const prepaidTotal = station.activeSession?.prepaidMinutes
    ? station.activeSession.prepaidMinutes * 60
    : null;
  const prepaidRemaining = prepaidTotal && prepaidElapsed !== null
    ? Math.max(0, prepaidTotal - prepaidElapsed)
    : null;
  const isAlmostDone = prepaidRemaining !== null && prepaidRemaining <= 300; // 5 daqiqa

  if (compact) {
    return (
      <div
        onClick={isActive ? onStop : onStart}
        style={{
          background: isActive
            ? `${config.bg}`
            : "rgba(255,255,255,0.02)",
          borderRadius: "0.75rem",
          padding: "0.75rem 0.5rem",
          border: `1px solid ${isActive ? config.border : "rgba(255,255,255,0.06)"}`,
          cursor: "pointer",
          textAlign: "center",
          transition: "all 0.2s",
          position: "relative",
          boxShadow: isActive && isAlmostDone
            ? "0 0 12px rgba(239,68,68,0.5)"
            : isActive
            ? `0 0 12px ${config.color}30`
            : "none",
          animation: isAlmostDone ? "pulse 1s infinite" : "none",
        }}
      >
        {/* Status dot */}
        <div style={{
          position: "absolute",
          top: "0.375rem",
          right: "0.375rem",
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: isActive
            ? isAlmostDone ? "#ef4444" : "#22c55e"
            : "#374151",
          boxShadow: isActive ? `0 0 6px ${isAlmostDone ? "#ef4444" : "#22c55e"}` : "none",
        }} />

        <p style={{
          fontSize: "0.7rem",
          fontWeight: 700,
          color: isActive ? config.color : "#6b7280",
          marginBottom: "0.25rem",
        }}>
          {station.name.split("-").slice(-1)[0]}
        </p>

        {isActive ? (
          <>
            <p style={{
              fontSize: "0.65rem",
              fontFamily: "monospace",
              color: isAlmostDone ? "#ef4444" : "white",
              fontWeight: 700,
            }}>
              {prepaidRemaining !== null
                ? formatTime(prepaidRemaining)
                : formatTime(elapsed)
              }
            </p>
          </>
        ) : (
          <p style={{ fontSize: "0.6rem", color: "#4b5563" }}>Bo'sh</p>
        )}
      </div>
    );
  }

  return (
    <div style={{
      background: isActive ? config.bg : "rgba(255,255,255,0.02)",
      borderRadius: "1.25rem",
      padding: "1.25rem",
      border: `1px solid ${isActive ? config.border : "rgba(255,255,255,0.06)"}`,
      transition: "all 0.3s",
      position: "relative",
      boxShadow: isActive ? `0 0 20px ${config.color}20` : "none",
    }}>
      {/* Status */}
      <div style={{
        position: "absolute",
        top: "1rem",
        right: "1rem",
        display: "flex",
        alignItems: "center",
        gap: "0.375rem",
      }}>
        <div style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: isActive ? "#22c55e" : "#374151",
          boxShadow: isActive ? "0 0 8px #22c55e" : "none",
        }} />
        <span style={{
          fontSize: "0.65rem",
          color: isActive ? "#22c55e" : "#6b7280",
          fontWeight: 600,
          textTransform: "uppercase",
        }}>
          {isActive ? "Band" : "Bo'sh"}
        </span>
      </div>

      {/* Icon + Name */}
      <div style={{ marginBottom: "1rem" }}>
        <div style={{ fontSize: "1.5rem", marginBottom: "0.375rem" }}>
          {config.icon}
        </div>
        <p style={{ fontWeight: 700, color: "white", fontSize: "1rem" }}>
          {station.name}
        </p>
        <p style={{ fontSize: "0.7rem", color: config.color, fontWeight: 600 }}>
          {PRICE_CONFIG[station.zoneType].toLocaleString()} so'm/soat
        </p>
      </div>

      {/* Active session info */}
      {isActive && (
        <div style={{
          background: "rgba(0,0,0,0.2)",
          borderRadius: "0.75rem",
          padding: "0.75rem",
          marginBottom: "1rem",
        }}>
          {station.activeSession?.customerName && (
            <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginBottom: "0.375rem" }}>
              👤 {station.activeSession.customerName}
            </p>
          )}

          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.375rem",
            marginBottom: "0.25rem",
          }}>
            <Clock size={13} color="#a78bfa" />
            <span style={{
              fontFamily: "monospace",
              fontSize: "1.125rem",
              fontWeight: 700,
              color: prepaidRemaining !== null && isAlmostDone ? "#ef4444" : "#a78bfa",
            }}>
              {prepaidRemaining !== null
                ? formatTime(prepaidRemaining) + " qoldi"
                : formatTime(elapsed)
              }
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
            <DollarSign size={13} color="#22c55e" />
            <span style={{
              fontSize: "0.875rem",
              fontWeight: 700,
              color: "#22c55e",
            }}>
              {amount.toLocaleString()} so'm
            </span>
          </div>
        </div>
      )}

      {/* Action button */}
      <button
        onClick={isActive ? onStop : onStart}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          padding: "0.625rem",
          background: isActive
            ? "rgba(239,68,68,0.15)"
            : `linear-gradient(135deg, ${config.color}40, ${config.color}20)`,
          border: `1px solid ${isActive ? "rgba(239,68,68,0.3)" : config.border}`,
          borderRadius: "0.75rem",
          cursor: "pointer",
          color: isActive ? "#f87171" : config.color,
          fontSize: "0.8rem",
          fontWeight: 700,
          transition: "all 0.2s",
        }}
      >
        {isActive ? (
          <><Square size={14} /> To'xtatish</>
        ) : (
          <><Play size={14} /> Boshlash</>
        )}
      </button>
    </div>
  );
}