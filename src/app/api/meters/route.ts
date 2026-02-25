import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const date = req.nextUrl.searchParams.get("date");
    try {
        if (date) {
            const readings = await prisma.meterReading.findMany({
                where: { date: new Date(date) },
                orderBy: { tankNumber: "asc" },
            });
            return NextResponse.json(readings);
        }
        const readings = await prisma.meterReading.findMany({
            orderBy: [{ date: "desc" }, { tankNumber: "asc" }],
            take: 100,
        });
        return NextResponse.json(readings);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { date, rows } = body;

        // Delete existing readings for this date
        await prisma.meterReading.deleteMany({
            where: { date: new Date(date) },
        });

        // Create new readings
        const created = await prisma.meterReading.createMany({
            data: rows
                .filter((r: any) => parseFloat(r.endMeter) > 0)
                .map((r: any) => ({
                    date: new Date(date),
                    tankNumber: parseInt(r.tankNumber),
                    oilType: r.oilType,
                    startMeter: parseFloat(r.startMeter) || 0,
                    endMeter: parseFloat(r.endMeter) || 0,
                    liters: Math.max(0, (parseFloat(r.endMeter) || 0) - (parseFloat(r.startMeter) || 0)),
                    truckId: r.truckId || null,
                    note: r.note || null,
                    officeId: "default",
                })),
        });

        return NextResponse.json({ success: true, count: created.count }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to save meters" }, { status: 500 });
    }
}
