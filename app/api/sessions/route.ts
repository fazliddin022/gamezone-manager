import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sessions, stations } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth-config";

// Yangi session boshlash
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { stationId, paymentType, prepaidAmount, customerName } = body;

  let prepaidMinutes = null;

  if (paymentType === "prepaid" && prepaidAmount) {
    // Stansiya turini topib narxini olamiz
    const [station] = await db
      .select()
      .from(stations)
      .where(eq(stations.id, stationId));

    const pricePerHour =
      station.zoneType === "vip" ? 25000 :
      station.zoneType === "arena" ? 17000 : 50000;

    prepaidMinutes = Math.floor((prepaidAmount / pricePerHour) * 60);
  }

  const [newSession] = await db
    .insert(sessions)
    .values({
      stationId,
      operatorId: session.user.id,
      customerName,
      paymentType,
      prepaidAmount: prepaidAmount || null,
      prepaidMinutes,
      startTime: new Date(),
      status: "active",
    })
    .returning();

  return NextResponse.json(newSession);
}