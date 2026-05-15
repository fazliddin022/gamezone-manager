import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { operators, stations } from "@/lib/schema";
import bcrypt from "bcryptjs";

export async function GET() {
  // Operator yaratish
  const hashedPassword = await bcrypt.hash("admin123", 10);

  await db.insert(operators).values({
    name: "Admin",
    email: "admin@gamezone.uz",
    password: hashedPassword,
  }).onConflictDoNothing();

  // Stansiyalar yaratish
  const stationData = [
    // PlayStation xonalari
    { name: "PS1", zoneType: "ps1" as const, roomNumber: 1 },
    { name: "PS2", zoneType: "ps2" as const, roomNumber: 2 },
    { name: "PS3", zoneType: "ps3" as const, roomNumber: 3 },

    // Arena — 40 ta kompyuter
    ...Array.from({ length: 40 }, (_, i) => ({
      name: `Arena-${i + 1}`,
      zoneType: "arena" as const,
      roomNumber: null,
    })),

    // VIP — 4 xona × 5 kompyuter
    ...Array.from({ length: 4 }, (_, room) =>
      Array.from({ length: 5 }, (_, pc) => ({
        name: `VIP-${room + 1}-${pc + 1}`,
        zoneType: "vip" as const,
        roomNumber: room + 1,
      }))
    ).flat(),
  ];

  await db.insert(stations).values(stationData).onConflictDoNothing();

  return NextResponse.json({ success: true, message: "Seeded successfully!" });
}