import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).officeId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const officeId = (session.user as any).officeId;
    const date = req.nextUrl.searchParams.get("date");

    try {
        if (date) {
            const dips = await prisma.tankDipRecord.findMany({
                where: { date: new Date(date), officeId },
                orderBy: { tankNumber: "asc" },
            });
            return NextResponse.json(dips);
        }

        const recentDips = await prisma.tankDipRecord.findMany({
            where: { officeId },
            orderBy: [{ date: "desc" }, { tankNumber: "asc" }],
            take: 100,
        });
        return NextResponse.json(recentDips);
    } catch (error) {
        console.error("Fetch tank dips error:", error);
        return NextResponse.json({ error: "Failed to fetch tank dips" }, { status: 500 });
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

        if (!date || !rows) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Delete existing for that date
        await prisma.tankDipRecord.deleteMany({
            where: { date: new Date(date), officeId }
        });

        // 2. Insert new
        const created = await prisma.tankDipRecord.createMany({
            data: rows.map((r: any) => ({
                date: new Date(date),
                officeId,
                tankNumber: parseInt(r.tankNumber),
                oilType: r.oilType,
                dipLevel: r.dipLevel ? parseFloat(r.dipLevel) : null,
                volume: parseFloat(r.volume) || 0,
                waterLevel: r.waterLevel ? parseFloat(r.waterLevel) : null,
                note: r.note || null,
            }))
        });

        return NextResponse.json({ success: true, count: created.count }, { status: 201 });
    } catch (error) {
        console.error("Save tank dips error:", error);
        return NextResponse.json({ error: "Failed to save tank dips" }, { status: 500 });
    }
}
