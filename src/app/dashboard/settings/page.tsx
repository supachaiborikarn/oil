"use client";
import { useState, useEffect } from "react";

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        officeName: "",
        officeAddress: "",
        taxId: "",
        phone: "",
        discordWebhook: "",
        caltexUsername: "",
        caltexPassword: "",
    });
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState("");

    useEffect(() => {
        fetch("/api/settings").then(r => r.json()).then(data => {
            if (data) setSettings(s => ({ ...s, ...data }));
        }).catch(console.error);
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setStatus("");
        try {
            const res = await fetch("/api/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            });
            if (res.ok) setStatus("✅ บันทึกสำเร็จ");
            else setStatus("❌ เกิดข้อผิดพลาด");
        } catch { setStatus("❌ เกิดข้อผิดพลาด"); }
        setSaving(false);
    }

    async function testDiscord() {
        if (!settings.discordWebhook) { alert("กรุณาใส่ Discord Webhook URL ก่อน"); return; }
        try {
            await fetch(settings.discordWebhook, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: "🧪 ทดสอบการแจ้งเตือนจาก OIL SEVE v2.0" }),
            });
            alert("✅ ส่งข้อความทดสอบสำเร็จ! ตรวจสอบ Discord channel");
        } catch { alert("❌ ส่งไม่สำเร็จ ตรวจสอบ URL"); }
    }

    return (
        <div>
            <div className="page-header">
                <div><div className="page-title">⚙️ ตั้งค่าระบบ</div><div className="page-subtitle">จัดการข้อมูลสำนักงานและการเชื่อมต่อ</div></div>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div className="card">
                        <div className="card-header"><span className="card-title">🏢 ข้อมูลสำนักงาน</span></div>
                        <div className="card-body">
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                <div className="form-group"><label className="form-label">ชื่อสำนักงาน</label><input className="form-control" value={settings.officeName} onChange={e => setSettings({ ...settings, officeName: e.target.value })} /></div>
                                <div className="form-group"><label className="form-label">ที่อยู่</label><input className="form-control" value={settings.officeAddress} onChange={e => setSettings({ ...settings, officeAddress: e.target.value })} /></div>
                                <div className="form-group"><label className="form-label">เลขผู้เสียภาษี</label><input className="form-control" value={settings.taxId} onChange={e => setSettings({ ...settings, taxId: e.target.value })} /></div>
                                <div className="form-group"><label className="form-label">โทรศัพท์</label><input className="form-control" value={settings.phone} onChange={e => setSettings({ ...settings, phone: e.target.value })} /></div>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header"><span className="card-title">🔗 การเชื่อมต่อ</span></div>
                        <div className="card-body">
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                <div className="form-group">
                                    <label className="form-label">Discord Webhook URL</label>
                                    <div style={{ display: "flex", gap: "0.5rem" }}>
                                        <input className="form-control" value={settings.discordWebhook} onChange={e => setSettings({ ...settings, discordWebhook: e.target.value })} placeholder="https://discord.com/api/webhooks/..." style={{ flex: 1 }} />
                                        <button type="button" className="btn btn-secondary btn-sm" onClick={testDiscord}>🧪 ทดสอบ</button>
                                    </div>
                                </div>
                                <div className="form-group"><label className="form-label">Caltex Bizpoint Username</label><input className="form-control" value={settings.caltexUsername} onChange={e => setSettings({ ...settings, caltexUsername: e.target.value })} placeholder="username" /></div>
                                <div className="form-group"><label className="form-label">Caltex Bizpoint Password</label><input className="form-control" type="password" value={settings.caltexPassword} onChange={e => setSettings({ ...settings, caltexPassword: e.target.value })} placeholder="••••••••" /></div>
                                <div style={{ padding: "0.75rem", background: "var(--bg-muted)", borderRadius: "var(--radius-sm)", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                                    ℹ️ Caltex Bizpoint sync จะดึงราคาต้นทุนอัตโนมัติเมื่อตั้งค่าครบ (ฟีเจอร์อยู่ระหว่างพัฒนา)
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: "1rem", display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "1rem" }}>
                    {status && <span style={{ fontSize: "0.85rem" }}>{status}</span>}
                    <button type="submit" className="btn btn-primary btn-lg" disabled={saving} style={{ justifyContent: "center" }}>
                        {saving ? "กำลังบันทึก..." : "💾 บันทึกการตั้งค่า"}
                    </button>
                </div>
            </form>
        </div>
    );
}
