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

    const limitStr = req.nextUrl.searchParams.get("limit");
    const limit = limitStr ? parseInt(limitStr) : 100;

    try {
        const adjustments = await prisma.stockAdjustment.findMany({
            where: { officeId },
            orderBy: { date: "desc" },
            take: limit,
        });

        return NextResponse.json(adjustments);
    } catch (error) {
        console.error("Fetch stock adjustments error:", error);
        return NextResponse.json({ error: "Failed to fetch stock adjustments" }, { status: 500 });
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
        const { date, oilType, liters, reason } = body;

        if (!date || !oilType || !liters) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const adjustment = await prisma.stockAdjustment.create({
            data: {
                date: new Date(date),
                officeId,
                oilType,
                liters: parseFloat(liters),
                reason: reason || "",
            },
        });

        return NextResponse.json({ success: true, adjustment }, { status: 201 });
    } catch (error) {
        console.error("Save stock adjustment error:", error);
        return NextResponse.json({ error: "Failed to save stock adjustment" }, { status: 500 });
    }
}
