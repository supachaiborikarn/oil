import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth } from "date-fns";

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

        const salesInvoices = await prisma.invoice.findMany({
            where: { date: { gte: start, lte: end }, officeId },
            include: { customer: { select: { name: true } } },
            orderBy: { date: "asc" },
        });

        const purchaseInvoices = await prisma.purchase.findMany({
            where: { date: { gte: start, lte: end }, officeId },
            include: { supplier: { select: { name: true, taxId: true, address: true, vatType: true } } },
            orderBy: { date: "asc" },
        });

        const outputVat = salesInvoices.reduce((s, inv) => s + Number(inv.vatAmount), 0);
        const inputVat = purchaseInvoices.reduce((s, p) => s + Number(p.vatAmount), 0);
        const netVat = outputVat - inputVat;

        return NextResponse.json({ outputVat, inputVat, netVat, salesInvoices, purchaseInvoices, office });
    } catch (error) {
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
