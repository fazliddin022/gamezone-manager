"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "🎮 Dashboard" },
  { href: "/dashboard/history", label: "📋 Tarix" },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <nav style={{ display: "flex", gap: "0.25rem" }}>
      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            style={{
              padding: "0.375rem 0.875rem",
              borderRadius: "0.625rem",
              textDecoration: "none",
              fontSize: "0.8rem",
              fontWeight: active ? 700 : 500,
              background: active ? "rgba(124,58,237,0.2)" : "transparent",
              color: active ? "#a78bfa" : "#6b7280",
              border: active ? "1px solid rgba(124,58,237,0.3)" : "1px solid transparent",
              transition: "all 0.2s",
            }}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}