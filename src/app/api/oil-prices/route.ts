import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const date = req.nextUrl.searchParams.get("date");
    try {
        if (date) {
            const price = await prisma.oilPrice.findFirst({
                where: { date: new Date(date) },
            });
            return NextResponse.json(price);
        }
        const prices = await prisma.oilPrice.findMany({
            orderBy: { date: "desc" },
            take: 30,
        });
        return NextResponse.json(prices);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const dateObj = new Date(body.date);

        const price = await prisma.oilPrice.upsert({
            where: {
                date_officeId: {
                    date: dateObj,
                    officeId: "default",
                },
            },
            update: {
                dieselSale: body.dieselSale ? parseFloat(body.dieselSale) : null,
                benzinSale: body.benzinSale ? parseFloat(body.benzinSale) : null,
                e20Sale: body.e20Sale ? parseFloat(body.e20Sale) : null,
                gas91Sale: body.gas91Sale ? parseFloat(body.gas91Sale) : null,
                gas95Sale: body.gas95Sale ? parseFloat(body.gas95Sale) : null,
                powerDieselSale: body.powerDieselSale ? parseFloat(body.powerDieselSale) : null,
                dieselCost: body.dieselCost ? parseFloat(body.dieselCost) : null,
                benzinCost: body.benzinCost ? parseFloat(body.benzinCost) : null,
                e20Cost: body.e20Cost ? parseFloat(body.e20Cost) : null,
                gas91Cost: body.gas91Cost ? parseFloat(body.gas91Cost) : null,
                gas95Cost: body.gas95Cost ? parseFloat(body.gas95Cost) : null,
                powerDieselCost: body.powerDieselCost ? parseFloat(body.powerDieselCost) : null,
            },
            create: {
                date: dateObj,
                officeId: "default",
                dieselSale: body.dieselSale ? parseFloat(body.dieselSale) : null,
                benzinSale: body.benzinSale ? parseFloat(body.benzinSale) : null,
                e20Sale: body.e20Sale ? parseFloat(body.e20Sale) : null,
                gas91Sale: body.gas91Sale ? parseFloat(body.gas91Sale) : null,
                gas95Sale: body.gas95Sale ? parseFloat(body.gas95Sale) : null,
                powerDieselSale: body.powerDieselSale ? parseFloat(body.powerDieselSale) : null,
                dieselCost: body.dieselCost ? parseFloat(body.dieselCost) : null,
                benzinCost: body.benzinCost ? parseFloat(body.benzinCost) : null,
                e20Cost: body.e20Cost ? parseFloat(body.e20Cost) : null,
                gas91Cost: body.gas91Cost ? parseFloat(body.gas91Cost) : null,
                gas95Cost: body.gas95Cost ? parseFloat(body.gas95Cost) : null,
                powerDieselCost: body.powerDieselCost ? parseFloat(body.powerDieselCost) : null,
            },
        });

        return NextResponse.json(price, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to save" }, { status: 500 });
    }
}
