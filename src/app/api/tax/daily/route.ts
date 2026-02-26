import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const officeId = (session.user as any).officeId;
        if (!officeId) {
            return NextResponse.json({ error: "No office assigned" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const dateParam = searchParams.get("date");
        if (!dateParam) {
            return NextResponse.json({ error: "Missing date parameter" }, { status: 400 });
        }

        // Target Date (ex: 2026-02-26)
        const targetDate = new Date(dateParam);
        const nextDate = new Date(targetDate);
        nextDate.setDate(targetDate.getDate() + 1);

        // -- ข้อมูลส่วนหัว (office) --
        const office = await prisma.office.findUnique({
            where: { id: officeId }
        });

        // ============================================
        // ส่วน ก: มิเตอร์ (Meter Readings) ประจำวัน
        // ============================================
        const meterReadings = await prisma.meterReading.findMany({
            where: { date: targetDate, officeId },
            orderBy: { tankNumber: 'asc' }
        });

        // ============================================
        // ส่วน ข: สต็อกน้ำมัน (Stock) 
        // 1. รับเข้า (Purchases)
        // 2. จ่ายออก (Invoices / Sales)
        // 3. ปรับปรุง (Adjustments)
        // 4. ไม้หยั่งถัง (TankDips)
        // ============================================
        // ยอดรับเข้า
        const purchases = await prisma.purchase.findMany({
            where: {
                date: { gte: targetDate, lt: nextDate },
                officeId
            }
        });

        // ยอดจ่ายออก (ดึงจาก InvoiceItems)
        const invoices = await prisma.invoice.findMany({
            where: {
                date: { gte: targetDate, lt: nextDate },
                officeId
            },
            include: { items: true, customer: true }
        });

        // ยอดปรับปรุง 
        const adjustments = await prisma.stockAdjustment.findMany({
            where: { date: targetDate, officeId }
        });

        // ข้อมูลไม้หยั่งถัง
        const tankDips = await prisma.tankDipRecord.findMany({
            where: { date: targetDate, officeId },
            orderBy: { tankNumber: 'asc' }
        });


        // Group by Oil Type for Part B Summary
        const basicOilTypes = [
            { id: "DIESEL", label: "ดีเซล" },
            { id: "DIESEL_B7", label: "ดีเซล B7" },
            { id: "G95", label: "แก๊สโซฮอล์ 95" },
            { id: "G91", label: "แก๊สโซฮอล์ 91" },
            { id: "E20", label: "E20" },
            { id: "BENZIN", label: "เบนซิน 95" },
        ];

        const partB_stock = basicOilTypes.map(oil => {
            // Find Total purchases for this oil
            const incoming = purchases.filter((p: any) => p.oilType === oil.id).reduce((sum: number, p: any) => sum + Number(p.liters), 0);

            // Find total sales for this oil
            let outgoing = 0;
            invoices.forEach((inv: any) => {
                inv.items.forEach((item: any) => {
                    if (item.oilType === oil.id) {
                        outgoing += Number(item.liters);
                    }
                });
            });

            // Adjustments
            const adjust = adjustments.filter((a: any) => a.oilType === oil.id).reduce((sum: number, a: any) => sum + Number(a.liters), 0);

            // TUNG Dips (Real remaining from physical tanks)
            const physicalDips = tankDips.filter((t: any) => t.oilType === oil.id).reduce((sum: number, t: any) => sum + Number(t.volume), 0);

            return {
                oilType: oil.id,
                label: oil.label,
                incoming,
                outgoing,
                adjustments: adjust,
                physicalRemaining: physicalDips
            };
        });

        // ============================================
        // ส่วน ค: สรุปยอดขาย (Sales/Financials)
        // แยกตามลูกหนี้ (เครดิต) / เงินสด
        // ============================================
        let cashSales = 0;
        let creditSales = 0;

        invoices.forEach((inv: any) => {
            if (inv.isCredit) {
                creditSales += Number(inv.total);
            } else {
                cashSales += Number(inv.total);
            }
        });

        const totalSalesAmount = cashSales + creditSales;


        return NextResponse.json({
            office,
            targetDate: dateParam,
            partA_meters: meterReadings,
            partB_stock: partB_stock,
            partB_dips: tankDips,
            partC_financials: {
                cashSales,
                creditSales,
                totalSalesAmount,
                invoicesCount: invoices.length,
            },
            invoices: invoices.map((v: any) => ({ id: v.id, no: v.invoiceNo, total: v.total, isCredit: v.isCredit, customer: v.customer?.name || 'เงินสด' }))
        });

    } catch (error) {
        console.error("Failed to generate daily report:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
