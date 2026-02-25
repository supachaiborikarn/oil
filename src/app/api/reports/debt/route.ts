import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const customers = await prisma.customer.findMany({
            where: { active: true, totalDebt: { gt: 0 } },
            orderBy: { totalDebt: "desc" },
        });
        return NextResponse.json(customers);
    } catch (error) {
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
