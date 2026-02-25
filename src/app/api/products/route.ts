import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            where: { active: true },
            orderBy: { code: "asc" },
        });
        return NextResponse.json(products);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const product = await prisma.product.create({
            data: {
                code: body.code,
                name: body.name,
                oilType: body.oilType,
                buyPrice: parseFloat(body.buyPrice) || 0,
                salePrice: parseFloat(body.salePrice) || 0,
                sendPrice: parseFloat(body.sendPrice) || 0,
                unit: body.unit || "ลิตร",
                hasVat: body.hasVat || false,
            },
        });
        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create" }, { status: 500 });
    }
}
