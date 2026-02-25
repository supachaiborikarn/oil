import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const from = req.nextUrl.searchParams.get("from");
    const to = req.nextUrl.searchParams.get("to");

    try {
        const where: any = {};
        if (from) where.date = { ...where.date, gte: new Date(from) };
        if (to) where.date = { ...where.date, lte: new Date(to + "T23:59:59") };

        // We assume session validation exists elsewhere, but let's just get the first office for now or use session
        const { getServerSession } = await import("next-auth");
        const { authOptions } = await import("@/lib/auth");
        const session = await getServerSession(authOptions);
        if (!session?.user || !(session.user as any).officeId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        where.officeId = (session.user as any).officeId;

        const office = await prisma.office.findUnique({
            where: { id: (session.user as any).officeId }
        });

        const invoices = await prisma.invoice.findMany({
            where,
            include: { customer: { select: { name: true, code: true, taxId: true, address: true, type: true } }, items: true },
            orderBy: { date: "asc" }, // Ascending for report
        });

        const totalBills = invoices.length;
        const totalSales = invoices.reduce((s, inv) => s + Number(inv.total), 0);
        const totalVat = invoices.reduce((s, inv) => s + Number(inv.vatAmount), 0);
        const totalUnpaid = invoices.filter(inv => !inv.isPaid).reduce((s, inv) => s + Number(inv.total), 0);

        // Group by oil type
        const oilMap: Record<string, { totalLiters: number; totalAmount: number }> = {};
        invoices.forEach(inv => {
            inv.items.forEach(item => {
                const key = item.oilType || "อื่นๆ";
                if (!oilMap[key]) oilMap[key] = { totalLiters: 0, totalAmount: 0 };
                oilMap[key].totalLiters += Number(item.liters);
                oilMap[key].totalAmount += Number(item.amount);
            });
        });
        const byOilType = Object.entries(oilMap).map(([oilType, data]) => ({ oilType, ...data }));

        return NextResponse.json({ totalBills, totalSales, totalVat, totalUnpaid, byOilType, invoices, office });
    } catch (error) {
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
