import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth } from "date-fns";

const OIL_LABELS: Record<string, string> = {
    D: "ดีเซล B7", E: "แก๊สโซฮอล์ E20", B: "เบนซิน",
    G91: "แก๊สโซฮอล์ 91", G95: "แก๊สโซฮอล์ 95", PD: "พาวเวอร์ดีเซล",
};

export async function GET(req: NextRequest) {
    const monthStr = req.nextUrl.searchParams.get("month"); // YYYY-MM
    try {
        const date = monthStr ? new Date(monthStr + "-01") : new Date();
        const start = startOfMonth(date);
        const end = endOfMonth(date);

        const { getServerSession } = await import("next-auth");
        const { authOptions } = await import("@/lib/auth");
        const session = await getServerSession(authOptions);
        if (!session?.user || !(session.user as any).officeId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const officeId = (session.user as any).officeId;

        const office = await prisma.office.findUnique({
            where: { id: officeId }
        });

        const oilTypes = ["D", "E", "B", "G91", "G95", "PD"];
        const result = [];

        for (const oilType of oilTypes) {
            // 1. Calculate historical (Opening Balance)
            // Purchases before start date
            const pastPurchases = await prisma.purchaseItem.aggregate({
                where: {
                    oilType: oilType as any,
                    purchase: { date: { lt: start }, officeId }
                },
                _sum: { liters: true }
            });

            // Meters (outgoing) before start date
            const pastMeters = await prisma.meterReading.aggregate({
                where: {
                    oilType: oilType as any,
                    date: { lt: start },
                    officeId
                },
                _sum: { liters: true }
            });

            const openingBalance = Number(pastPurchases._sum?.liters || 0) - Number(pastMeters._sum?.liters || 0);

            // 2. Calculate current month
            const currentPurchases = await prisma.purchaseItem.aggregate({
                where: {
                    oilType: oilType as any,
                    purchase: { date: { gte: start, lte: end }, officeId }
                },
                _sum: { liters: true }
            });

            const currentMeters = await prisma.meterReading.aggregate({
                where: {
                    oilType: oilType as any,
                    date: { gte: start, lte: end },
                    officeId
                },
                _sum: { liters: true }
            });

            const incoming = Number(currentPurchases._sum?.liters || 0);
            const outgoing = Number(currentMeters._sum?.liters || 0);
            const remaining = openingBalance + incoming - outgoing;

            result.push({
                oilType,
                label: OIL_LABELS[oilType] || oilType,
                openingBalance,
                incoming,
                outgoing,
                remaining
            });
        }

        return NextResponse.json({ office, stock: result });
    } catch (error) {
        console.error("Stock API Error:", error);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
