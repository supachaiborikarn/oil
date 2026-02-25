import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const invoices = await prisma.invoice.findMany({
            include: { customer: { select: { name: true, code: true } }, items: true },
            orderBy: { date: "desc" },
            take: 200,
        });
        return NextResponse.json(invoices);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const items = body.items || [];

        const subtotal = items.reduce((s: number, item: any) => s + (parseFloat(item.amount) || 0), 0);
        const vatRate = parseFloat(body.vatRate) || 7;
        const vatAmount = subtotal * (vatRate / 100);
        const total = subtotal + vatAmount;

        const invoice = await prisma.invoice.create({
            data: {
                invoiceNo: body.invoiceNo,
                date: new Date(body.date),
                customerId: body.customerId,
                officeId: body.officeId || "default",
                subtotal,
                vatRate,
                vatAmount,
                total,
                discount: parseFloat(body.discount) || 0,
                billType: body.billType || "1",
                note: body.note || null,
                items: {
                    create: items.map((item: any, idx: number) => ({
                        description: item.description || "",
                        oilType: item.oilType || null,
                        liters: parseFloat(item.liters) || 0,
                        unitPrice: parseFloat(item.unitPrice) || 0,
                        amount: parseFloat(item.amount) || 0,
                        vatRate: vatRate,
                        productId: item.productId || null,
                        sequence: idx,
                    })),
                },
            },
            include: { items: true, customer: true },
        });

        return NextResponse.json(invoice, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create" }, { status: 500 });
    }
}
