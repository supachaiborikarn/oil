"use client";
import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";

const OIL_TYPE_LABELS: Record<string, string> = {
    D: "ดีเซล B7",
    B: "เบนซิน",
    E: "แก๊สโซฮอล์ E20",
    K: "แก๊สโซฮอล์ 91",
    N: "NGV",
    S: "Super Diesel",
    O: "อื่นๆ"
};

const OIL_TYPE_BADGE: Record<string, string> = {
    D: "badge-diesel",
    B: "badge-benzin",
    E: "badge-e20",
    K: "badge-gas91",
    N: "badge-info",
    S: "badge-warning",
    O: "badge-secondary"
};

interface Adjustment {
    id: string;
    date: string;
    oilType: string;
    liters: string;
    reason: string;
}

export default function StockAdjustmentsPage() {
    const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        date: format(new Date(), "yyyy-MM-dd"),
        oilType: "D",
        liters: "",
        reason: ""
    });

    const fetchAdjustments = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/stock-adjustments?limit=50");
            if (res.ok) {
                const data = await res.json();
                setAdjustments(data);
            }
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchAdjustments();
    }, [fetchAdjustments]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        const litersVal = parseFloat(form.liters);
        if (isNaN(litersVal) || litersVal === 0) {
            alert("กรุณาระบุจำนวนลิตร (บวก หรือ ลบ)");
            return;
        }

        setSaving(true);
        try {
            const res = await fetch("/api/stock-adjustments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });

            if (res.ok) {
                setForm({ ...form, liters: "", reason: "" });
                fetchAdjustments();
            } else {
                alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
            }
        } catch (error) {
            alert("บันทึกไม่สำเร็จ");
        }
        setSaving(false);
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <div className="page-title">⚖️ เกลี่ยยอดสต็อก (CUTOIL)</div>
                    <div className="page-subtitle">ปรับปรุงยอดน้ำมันขาด/เกินด้วยมือ เพื่อให้ตรงกับไม้หยั่งถังจริvง</div>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem", alignItems: "start" }}>
                {/* Form */}
                <div className="card">
                    <div className="card-header"><span className="card-title">เพิ่มรายการปรับปรุง</span></div>
                    <div className="card-body">
                        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <div className="form-group">
                                <label className="form-label">วันที่</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={form.date}
                                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">ชนิดน้ำมัน</label>
                                <select
                                    className="form-control"
                                    value={form.oilType}
                                    onChange={(e) => setForm({ ...form, oilType: e.target.value })}
                                >
                                    {Object.entries(OIL_TYPE_LABELS).map(([k, v]) => (
                                        <option key={k} value={k}>{v}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">ปริมาณที่ปรับ (ลิตร)</label>
                                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="form-control"
                                        placeholder="เช่น 50 (เกิน) หรือ -20 (ขาด)"
                                        value={form.liters}
                                        onChange={(e) => setForm({ ...form, liters: e.target.value })}
                                        required
                                        style={{ textAlign: "right" }}
                                    />
                                    <span style={{ color: "var(--text-light)", fontSize: "0.9rem" }}>ลิตร</span>
                                </div>
                                <div style={{ fontSize: "0.85rem", color: "var(--text-light)", marginTop: "0.25rem" }}>
                                    ใส่ค่า <strong>บวก</strong> หากน้ำมันเกิน, ใส่ค่า <strong>ลบ (-)</strong> หากน้ำมันขาด/ระเหย
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">สาเหตุ / หมายเหตุ</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="เช่น ปรับยอดให้ตรงหน้าบ่อ"
                                    value={form.reason}
                                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                                />
                            </div>

                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? "กำลังบันทึก..." : "💾 บันทึกการปรับปรุง"}
                            </button>
                        </form>
                    </div>
                </div>

                {/* List View */}
                <div className="card">
                    <div className="card-header"><span className="card-title">ประวัติการเกลี่ยยอดล่าสุด</span></div>
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>วันที่</th>
                                    <th>ชนิดน้ำมัน</th>
                                    <th className="td-number">ปรับยอด (ลิตร)</th>
                                    <th>สาเหตุ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={4} className="td-center"><span className="spinner" /> กำลังโหลด...</td></tr>
                                ) : adjustments.length === 0 ? (
                                    <tr><td colSpan={4} className="td-center" style={{ padding: "2rem" }}>ยังไม่มีประวัติการปรับปรุงสต็อก</td></tr>
                                ) : adjustments.map((adj) => (
                                    <tr key={adj.id}>
                                        <td>{format(new Date(adj.date), "dd/MM/yyyy")}</td>
                                        <td><span className={`badge ${OIL_TYPE_BADGE[adj.oilType] || "badge-secondary"}`}>{OIL_TYPE_LABELS[adj.oilType] || adj.oilType}</span></td>
                                        <td className="td-number" style={{
                                            color: parseFloat(adj.liters) > 0 ? "var(--success)" : "var(--danger)",
                                            fontWeight: 600
                                        }}>
                                            {parseFloat(adj.liters) > 0 ? "+" : ""}{parseFloat(adj.liters).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                                        </td>
                                        <td>{adj.reason || "—"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
