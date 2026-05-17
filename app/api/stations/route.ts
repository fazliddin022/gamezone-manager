import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { stations, sessions } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

export async function GET() {
  const allStations = await db.select().from(stations).where(eq(stations.isActive, true));
  
  const activeSessions = await db
    .select()
    .from(sessions)
    .where(eq(sessions.status, "active"));

  const result = allStations.map((station) => {
    const activeSession = activeSessions.find(
      (s) => s.stationId === station.id
    );
    return { ...station, activeSession: activeSession || null };
  });

  return NextResponse.json(result);
}