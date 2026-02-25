export async function sendDiscordNotification(message: string) {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
        console.warn("DISCORD_WEBHOOK_URL not set, skipping notification");
        return;
    }

    try {
        await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: message }),
        });
    } catch (error) {
        console.error("Discord webhook error:", error);
    }
}

export async function sendDiscordEmbed(title: string, description: string, color: number = 0x3b82f6, fields?: { name: string; value: string; inline?: boolean }[]) {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) return;

    try {
        await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                embeds: [{
                    title,
                    description,
                    color,
                    fields: fields || [],
                    timestamp: new Date().toISOString(),
                    footer: { text: "OIL SEVE v2.0" },
                }],
            }),
        });
    } catch (error) {
        console.error("Discord webhook error:", error);
    }
}

// Notification helpers
export const notifySale = (invoiceNo: string, customer: string, total: number) =>
    sendDiscordEmbed("🧾 บิลขายใหม่", `เลขที่: ${invoiceNo}`, 0x22c55e, [
        { name: "ลูกค้า", value: customer, inline: true },
        { name: "ยอดเงิน", value: `${total.toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท`, inline: true },
    ]);

export const notifyPurchase = (purchaseNo: string, supplier: string, total: number) =>
    sendDiscordEmbed("🚛 รับน้ำมันเข้า", `เลขที่: ${purchaseNo}`, 0x3b82f6, [
        { name: "ผู้จัดจำหน่าย", value: supplier, inline: true },
        { name: "ยอดเงิน", value: `${total.toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท`, inline: true },
    ]);

export const notifyDebtAlert = (customer: string, amount: number) =>
    sendDiscordEmbed("⚠️ หนี้ค้างชำระ", `ลูกค้า: ${customer}`, 0xef4444, [
        { name: "ยอดค้าง", value: `${amount.toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท`, inline: true },
    ]);

export const notifyOilPriceUpdate = (date: string) =>
    sendDiscordEmbed("💰 อัปเดตราคาน้ำมัน", `วันที่: ${date}`, 0xf59e0b);
