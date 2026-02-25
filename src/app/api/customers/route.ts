import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const customers = await prisma.customer.findMany({
            orderBy: { name: "asc" },
        });
        return NextResponse.json(customers);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const customer = await prisma.customer.create({
            data: {
                code: body.code,
                name: body.name,
                address: body.address || null,
                address2: body.address2 || null,
                taxId: body.taxId || null,
                phone: body.phone || null,
                type: body.type || "1",
                officeId: body.officeId || "default",
            },
        });
        return NextResponse.json(customer, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
    }
}
