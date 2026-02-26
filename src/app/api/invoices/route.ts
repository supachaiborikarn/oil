import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const officeId = (session?.user as any)?.officeId;

        const { searchParams } = new URL(req.url);

        // GET /api/invoices?lastNo=true — return just the latest invoice number
        if (searchParams.get("lastNo") === "true") {
            const last = await prisma.invoice.findFirst({
                where: officeId ? { officeId } : {},
                orderBy: { createdAt: "desc" },
                select: { invoiceNo: true, bookNo: true },
            });
            return NextResponse.json(last || { invoiceNo: null, bookNo: null });
        }

        const invoices = await prisma.invoice.findMany({
            where: officeId ? { officeId } : {},
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
        const session = await getServerSession(authOptions);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const officeId = (session?.user as any)?.officeId || "default";

        const body = await req.json();
        const items = body.items || [];

        const subtotal = items.reduce((s: number, item: { amount?: string }) => s + (parseFloat(item.amount || "0") || 0), 0);
        const discount = parseFloat(body.discount) || 0;
        const afterDiscount = subtotal - discount;
        const vatRate = parseFloat(body.vatRate) || 7;
        const vatAmount = afterDiscount * (vatRate / 100);
        const total = afterDiscount + vatAmount;

        const invoice = await prisma.invoice.create({
            data: {
                invoiceNo: body.invoiceNo,
                bookNo: body.bookNo || null,
                date: new Date(body.date),
                customerId: body.customerId,
                officeId,
                subtotal,
                vatRate,
                vatAmount,
                total,
                discount,
                billType: body.billType || "1",
                note: body.note || null,
                items: {
                    create: items.map((item: { description?: string; oilType?: string; liters?: string; unitPrice?: string; amount?: string; productId?: string }, idx: number) => ({
                        description: item.description || "",
                        oilType: item.oilType || null,
                        liters: parseFloat(item.liters || "0") || 0,
                        unitPrice: parseFloat(item.unitPrice || "0") || 0,
                        amount: parseFloat(item.amount || "0") || 0,
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
        console.error("Failed to create invoice:", error);
        return NextResponse.json({ error: "Failed to create" }, { status: 500 });
    }
}
