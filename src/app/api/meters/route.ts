import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
    const date = req.nextUrl.searchParams.get("date");
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).officeId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const officeId = (session.user as any).officeId;

    try {
        if (date) {
            const readings = await prisma.meterReading.findMany({
                where: { date: new Date(date), officeId },
                orderBy: { tankNumber: "asc" },
            });

            // If readings exist for this date, return them directly
            if (readings.length > 0) {
                return NextResponse.json(readings);
            }

            // If not, fetch the *latest* reading before this date for each tank in this office to use as starting point
            const latestReadings = await prisma.meterReading.groupBy({
                by: ['tankNumber'],
                where: { date: { lt: new Date(date) }, officeId },
                _max: { date: true }
            });

            // Fetch the actual meter values for those max dates
            const defaultReadings = await Promise.all(
                latestReadings.map(async (lr) => {
                    const r = await prisma.meterReading.findFirst({
                        where: { tankNumber: lr.tankNumber, date: lr._max.date!, officeId }
                    });
                    if (r) {
                        return {
                            ...r,
                            id: undefined, // ensure it's treated as new
                            date: new Date(date),
                            startMeter: r.endMeter,
                            endMeter: r.endMeter,
                            liters: 0
                        };
                    }
                    return null;
                })
            );

            return NextResponse.json(defaultReadings.filter(Boolean));
        }

        const readings = await prisma.meterReading.findMany({
            where: { officeId },
            orderBy: [{ date: "desc" }, { tankNumber: "asc" }],
            take: 100,
        });
        return NextResponse.json(readings);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).officeId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const officeId = (session.user as any).officeId;

    try {
        const body = await req.json();
        const { date, rows } = body;

        // Delete existing readings for this date
        await prisma.meterReading.deleteMany({
            where: { date: new Date(date), officeId },
        });

        // Create new readings
        const created = await prisma.meterReading.createMany({
            data: rows
                .filter((r: any) => parseFloat(r.endMeter) > 0 || parseFloat(r.startMeter) > 0)
                .map((r: any) => ({
                    date: new Date(date),
                    officeId: officeId,
                    tankNumber: parseInt(r.tankNumber),
                    oilType: r.oilType,
                    startMeter: parseFloat(r.startMeter) || 0,
                    endMeter: parseFloat(r.endMeter) || 0,
                    liters: Math.max(0, (parseFloat(r.endMeter) || 0) - (parseFloat(r.startMeter) || 0)),
                    truckId: r.truckId || null,
                    note: r.note || null,
                })),
        });

        return NextResponse.json({ success: true, count: created.count }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to save meters" }, { status: 500 });
    }
}
