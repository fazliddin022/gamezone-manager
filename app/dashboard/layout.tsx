import { auth } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import LiveClock from "../components/LiveClock";
import SignOutButton from "../components/SignOutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0f1a 0%, #1a0f2e 50%, #0f1a1a 100%)",
    }}>
      {/* Header */}
      <header style={{
        background: "rgba(255,255,255,0.03)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "0 2rem",
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "blur(20px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{
            width: "36px",
            height: "36px",
            background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
            borderRadius: "0.75rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 15px rgba(124,58,237,0.4)",
            fontSize: "1.125rem",
          }}>
            🎮
          </div>
          <div>
            <p style={{ fontWeight: 700, color: "white", fontSize: "0.875rem" }}>
              GameZone Manager
            </p>
            <p style={{ fontSize: "0.7rem", color: "#6b7280" }}>
              Boshqaruv paneli
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {/* Live clock */}
          <LiveClock />

          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.375rem 0.875rem",
            background: "rgba(255,255,255,0.05)",
            borderRadius: "999px",
            border: "1px solid rgba(255,255,255,0.08)",
          }}>
            <div style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#22c55e",
              boxShadow: "0 0 8px #22c55e",
            }} />
            <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
              {session.user?.name}
            </span>
          </div>

          <SignOutButton />
        </div>
      </header>

      {/* Main */}
      <main style={{ padding: "2rem" }}>
        {children}
      </main>
    </div>
  );
}
