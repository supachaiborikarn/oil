import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 เริ่ม seed ข้อมูล...");

    // 1. สร้าง Office (สาขา)
    const office = await prisma.office.upsert({
        where: { code: "HQ" },
        update: {},
        create: {
            id: "default",
            code: "HQ",
            name: "สำนักงานใหญ่ กำแพงเพชร",
            address: "กำแพงเพชร",
        },
    });
    console.log("📍 สร้าง Office:", office.name);

    // 2. สร้าง Admin User
    const hashedPassword = await bcrypt.hash("admin1234", 10);
    const admin = await prisma.user.upsert({
        where: { email: "admin@oilseve.com" },
        update: {},
        create: {
            email: "admin@oilseve.com",
            name: "ผู้ดูแลระบบ",
            password: hashedPassword,
            role: "SUPERADMIN",
            officeId: office.id,
        },
    });
    console.log("👤 สร้าง Admin:", admin.email);

    // 3. สร้าง Products (จาก STOCK.DBF เดิม)
    const products = [
        { code: "110001", name: "พาวเวอร์ดีเซล", oilType: "S" as const, buyPrice: 41.0316 },
        { code: "120001", name: "แก๊สโซฮอล์ E20", oilType: "E" as const, buyPrice: 25.6853 },
        { code: "180001", name: "แก๊สโซฮอล์ 91", oilType: "K" as const, buyPrice: 27.4048 },
        { code: "140001", name: "ดีเซล B7", oilType: "D" as const, buyPrice: 29.94 },
        { code: "150001", name: "ดีเซล B10", oilType: "D" as const, buyPrice: 28.94 },
        { code: "160001", name: "เบนซิน 95", oilType: "B" as const, buyPrice: 35.0 },
        { code: "170001", name: "แก๊สโซฮอล์ 95", oilType: "K" as const, buyPrice: 30.0 },
    ];

    for (const p of products) {
        await prisma.product.upsert({
            where: { code: p.code },
            update: {},
            create: {
                code: p.code,
                name: p.name,
                oilType: p.oilType,
                buyPrice: p.buyPrice,
                unit: "ลิตร",
                hasVat: true,
            },
        });
    }
    console.log("⛽ สร้าง Products:", products.length, "รายการ");

    // 4. สร้าง Suppliers (จาก PERSON.DBF เดิม)
    const suppliers = [
        { code: "00326", name: "บจก.สตาร์ฟูเอลส์มาร์เก็ตติ้ง", taxId: "0105555138899", vatRate: 7 },
        { code: "54132", name: "บริษัท แสงเงินออยล์ จำกัด", taxId: "0105541054132", vatRate: 7 },
        { code: "00201", name: "บริษัท ธัญญะมงคล จำกัด", taxId: "0415544000201", vatRate: 7 },
    ];

    for (const s of suppliers) {
        await prisma.supplier.upsert({
            where: { code_officeId: { code: s.code, officeId: office.id } },
            update: {},
            create: {
                code: s.code,
                name: s.name,
                taxId: s.taxId,
                vatRate: s.vatRate,
                officeId: office.id,
            },
        });
    }
    console.log("🏭 สร้าง Suppliers:", suppliers.length, "ราย");

    // 5. สร้าง Customers ตัวอย่าง (จาก PERSON2.DBF เดิม)
    const customers = [
        { code: "00305", name: "หจก.อัครวัฒน์กำแพงเพชรก่อสร้าง", address: "261/2 ม.27 ต.คลองน้ำไหล", address2: "ต.คลองลาน กพ", totalDebt: 205971 },
        { code: "00102", name: "หจก.จรูญการยาง", address: "629 ถ.เจริญสุข ต.ในเมือง", address2: "อ.เมือง กพ", totalDebt: 0 },
        { code: "00921", name: "หจก.พรวิษณุก่อสร้าง", address: "135 ม.4 ต.คลองน้ำไหล อ.คลองลาน", address2: "กพ", totalDebt: 510481 },
    ];

    for (const c of customers) {
        await prisma.customer.upsert({
            where: { code_officeId: { code: c.code, officeId: office.id } },
            update: {},
            create: {
                code: c.code,
                name: c.name,
                address: c.address,
                address2: c.address2,
                totalDebt: c.totalDebt,
                type: "1",
                officeId: office.id,
            },
        });
    }
    console.log("👥 สร้าง Customers:", customers.length, "ราย");

    console.log("");
    console.log("✅ Seed เสร็จสมบูรณ์!");
    console.log("🔑 Login: admin@oilseve.com / admin1234");
}

main()
    .catch((e) => {
        console.error("❌ Seed error:", e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
