import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const supplier = await prisma.supplier.update({
            where: { id },
            data: { code: body.code, name: body.name, address: body.address || null, taxId: body.taxId || null, phone: body.phone || null, vatRate: parseFloat(body.vatRate) || 7 },
        });
        return NextResponse.json(supplier);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }
}
