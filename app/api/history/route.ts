import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sessions, stations } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth-config";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const history = await db
    .select({
      id: sessions.id,
      customerName: sessions.customerName,
      paymentType: sessions.paymentType,
      startTime: sessions.startTime,
      endTime: sessions.endTime,
      totalMinutes: sessions.totalMinutes,
      totalAmount: sessions.totalAmount,
      status: sessions.status,
      stationName: stations.name,
      zoneType: stations.zoneType,
    })
    .from(sessions)
    .innerJoin(stations, eq(sessions.stationId, stations.id))
    .orderBy(desc(sessions.startTime))
    .limit(100);

  return NextResponse.json(history);
}