import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const customer = await prisma.customer.findUnique({ where: { id } });
        if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json(customer);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const customer = await prisma.customer.update({
            where: { id },
            data: {
                code: body.code,
                name: body.name,
                address: body.address || null,
                address2: body.address2 || null,
                taxId: body.taxId || null,
                phone: body.phone || null,
                type: body.type,
            },
        });
        return NextResponse.json(customer);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await prisma.customer.update({
            where: { id },
            data: { active: false },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
}
