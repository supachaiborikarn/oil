import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const office = await prisma.office.findFirst();
        if (!office) return NextResponse.json({});
        return NextResponse.json({
            officeName: office.name,
            officeAddress: office.address || "",
            taxId: office.taxId || "",
            phone: office.phone || "",
            discordWebhook: office.discordWebhook || "",
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const office = await prisma.office.findFirst();
        if (!office) return NextResponse.json({ error: "No office found" }, { status: 404 });

        const updated = await prisma.office.update({
            where: { id: office.id },
            data: {
                name: body.officeName || office.name,
                address: body.officeAddress || null,
                taxId: body.taxId || null,
                phone: body.phone || null,
                discordWebhook: body.discordWebhook || null,
            },
        });
        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
