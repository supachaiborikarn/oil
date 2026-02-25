import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const purchases = await prisma.purchase.findMany({
            include: { supplier: { select: { name: true, code: true } }, items: true },
            orderBy: { date: "desc" }, take: 200,
        });
        return NextResponse.json(purchases);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const items = body.items || [];
        const subtotal = items.reduce((s: number, i: any) => s + (parseFloat(i.amount) || 0), 0);
        const vatAmount = subtotal * 0.07;
        const total = subtotal + vatAmount;

        const purchase = await prisma.purchase.create({
            data: {
                purchaseNo: body.purchaseNo || `PO-${Date.now()}`,
                date: new Date(body.date),
                supplierId: body.supplierId,
                officeId: "default",
                subtotal, vatAmount, total,
                note: body.note || null,
                items: {
                    create: items.map((item: any, idx: number) => ({
                        productId: item.productId || null,
                        description: item.description || "",
                        liters: parseFloat(item.liters) || 0,
                        unitPrice: parseFloat(item.unitPrice) || 0,
                        amount: parseFloat(item.amount) || 0,
                        sequence: idx,
                    })),
                },
            },
            include: { items: true, supplier: true },
        });

        return NextResponse.json(purchase, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create" }, { status: 500 });
    }
}
