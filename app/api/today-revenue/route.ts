import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sessions } from "@/lib/schema";
import { eq, gte, and } from "drizzle-orm";

export async function GET() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todaySessions = await db
    .select({ totalAmount: sessions.totalAmount })
    .from(sessions)
    .where(
      and(
        eq(sessions.status, "completed"),
        gte(sessions.startTime, todayStart)
      )
    );

  const total = todaySessions.reduce(
    (sum, s) => sum + (s.totalAmount || 0), 0
  );

  return NextResponse.json({ total });
}