"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.375rem",
        padding: "0.375rem 0.875rem",
        background: "rgba(239,68,68,0.1)",
        border: "1px solid rgba(239,68,68,0.2)",
        borderRadius: "0.625rem",
        cursor: "pointer",
        color: "#f87171",
        fontSize: "0.75rem",
        fontWeight: 500,
      }}
    >
      <LogOut size={14} />
      Chiqish
    </button>
  );
}