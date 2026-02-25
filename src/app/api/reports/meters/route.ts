import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const from = req.nextUrl.searchParams.get("from");
    const to = req.nextUrl.searchParams.get("to");

    try {
        const where: any = {};
        if (from) where.date = { ...where.date, gte: new Date(from) };
        if (to) where.date = { ...where.date, lte: new Date(to + "T23:59:59") };

        const meters = await prisma.meterReading.findMany({ where, orderBy: { date: "asc" } });

        const totalLiters = meters.reduce((s, m) => s + Number(m.liters), 0);
        const dates = new Set(meters.map(m => m.date.toISOString().split("T")[0]));
        const totalDays = dates.size;

        const oilMap: Record<string, number> = {};
        meters.forEach(m => {
            const key = m.oilType;
            oilMap[key] = (oilMap[key] || 0) + Number(m.liters);
        });
        const byOilType = Object.entries(oilMap).map(([oilType, totalLiters]) => ({
            oilType, totalLiters, avgPerDay: totalDays > 0 ? totalLiters / totalDays : 0,
        }));

        return NextResponse.json({ totalLiters, totalDays, byOilType });
    } catch (error) {
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
