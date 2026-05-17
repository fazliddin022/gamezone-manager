import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sessions, stations } from "@/lib/schema";
import { eq } from "drizzle-orm";

// Sessionni tugatish
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [activeSession] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, id));

  if (!activeSession) {
    return NextResponse.json({ error: "Session topilmadi" }, { status: 404 });
  }

  const endTime = new Date();
  const startTime = new Date(activeSession.startTime!);
  const totalMinutes = Math.ceil(
    (endTime.getTime() - startTime.getTime()) / 1000 / 60
  );

  // Narx hisoblash
  const [station] = await db
    .select()
    .from(stations)
    .where(eq(stations.id, activeSession.stationId));

  const pricePerHour =
    station.zoneType === "vip" ? 25000 :
    station.zoneType === "arena" ? 17000 : 50000;

  const totalAmount = activeSession.paymentType === "prepaid"
    ? activeSession.prepaidAmount!
    : Math.ceil((totalMinutes / 60) * pricePerHour);

  const [updated] = await db
    .update(sessions)
    .set({
      endTime,
      totalMinutes,
      totalAmount,
      status: "completed",
    })
    .where(eq(sessions.id, id))
    .returning();

  return NextResponse.json(updated);
}