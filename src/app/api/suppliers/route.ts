import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const suppliers = await prisma.supplier.findMany({ where: { active: true }, orderBy: { name: "asc" } });
        return NextResponse.json(suppliers);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const supplier = await prisma.supplier.create({
            data: {
                code: body.code, name: body.name, address: body.address || null,
                taxId: body.taxId || null, phone: body.phone || null,
                vatRate: parseFloat(body.vatRate) || 7, officeId: "default",
            },
        });
        return NextResponse.json(supplier, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create" }, { status: 500 });
    }
}
