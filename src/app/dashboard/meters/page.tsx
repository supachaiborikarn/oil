"use client";
import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";

const OIL_TYPE_LABELS: Record<string, string> = {
    D: "ดีเซล",
    B: "เบนซิน",
    E: "แก๊สโซฮอล์ E20",
    K: "แก๊สโซฮอล์ 91",
    N: "NGV",
    S: "Super Diesel",
};

const OIL_TYPE_BADGE: Record<string, string> = {
    D: "badge-diesel",
    B: "badge-benzin",
    E: "badge-e20",
    K: "badge-gas91",
    N: "badge-info",
    S: "badge-warning",
};

interface MeterRow {
    id?: string;
    tankNumber: number;
    oilType: string;
    startMeter: string;
    endMeter: string;
    liters: string;
    truckId: string;
    note: string;
}

export default function MetersPage() {
    const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [rows, setRows] = useState<MeterRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const fetchMeters = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/meters?date=${date}`);
            if (res.ok) {
                const data = await res.json();
                processApiData(data);
            } else {
                processApiData([]);
            }
        } catch (e) {
            processApiData([]);
        }
        setLoading(false);
    }, [date]);

    useEffect(() => { fetchMeters(); }, [fetchMeters]);

    function processApiData(data: any[]) {
        const defaults: MeterRow[] = [];
        // ถัง 1-8 = ดีเซล, 9-16 = E20, 17-24 = แก๊ส 91, 25-28 = เบนซิน
        const tanks = [
            ...Array.from({ length: 8 }, (_, i) => ({ tank: i + 1, type: "D" })),
            ...Array.from({ length: 8 }, (_, i) => ({ tank: i + 9, type: "E" })),
            ...Array.from({ length: 8 }, (_, i) => ({ tank: i + 17, type: "K" })),
            ...Array.from({ length: 4 }, (_, i) => ({ tank: i + 25, type: "B" })),
        ];

        for (const t of tanks) {
            const ext = data.find(d => d.tankNumber === t.tank);
            defaults.push({
                id: ext?.id,
                tankNumber: t.tank,
                oilType: ext?.oilType || t.type,
                startMeter: ext ? String(ext.startMeter) : "0",
                endMeter: ext ? String(ext.endMeter) : "0",
                liters: ext ? String(ext.liters || "0") : "0",
                truckId: ext?.truckId || "",
                note: ext?.note || "",
            });
        }

        // Add any extra tanks not in the standard 28
        const extraTanks = data.filter(d => !tanks.some(t => t.tank === d.tankNumber));
        for (const ext of extraTanks) {
            defaults.push({
                id: ext.id,
                tankNumber: ext.tankNumber,
                oilType: ext.oilType,
                startMeter: String(ext.startMeter),
                endMeter: String(ext.endMeter),
                liters: String(ext.liters || "0"),
                truckId: ext.truckId || "",
                note: ext.note || "",
            });
        }

        defaults.sort((a, b) => a.tankNumber - b.tankNumber);
        setRows(defaults);
    }

    function updateRow(idx: number, field: keyof MeterRow, value: string) {
        const updated = [...rows];
        (updated[idx] as any)[field] = value;
        if (field === "startMeter" || field === "endMeter") {
            const start = parseFloat(updated[idx].startMeter) || 0;
            const end = parseFloat(updated[idx].endMeter) || 0;
            updated[idx].liters = String(Math.max(0, end - start));
        }
        setRows(updated);
        setSaved(false);
    }

    function addRow() {
        setRows([...rows, {
            tankNumber: rows.length + 1,
            oilType: "D",
            startMeter: "0",
            endMeter: "0",
            liters: "0",
            truckId: "",
            note: "",
        }]);
    }

    function removeRow(idx: number) {
        setRows(rows.filter((_, i) => i !== idx));
    }

    async function handleSave() {
        setSaving(true);
        try {
            const res = await fetch("/api/meters", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date, rows }),
            });
            if (res.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            }
        } catch (e) { console.error(e); }
        setSaving(false);
    }

    const totalLiters = rows.reduce((sum, r) => sum + (parseFloat(r.liters) || 0), 0);
    const oilTotals: Record<string, number> = {};
    rows.forEach(r => {
        const type = r.oilType;
        oilTotals[type] = (oilTotals[type] || 0) + (parseFloat(r.liters) || 0);
    });

    return (
        <div>
            <div className="page-header">
                <div>
                    <div className="page-title">⏱️ บันทึกมิเตอร์</div>
                    <div className="page-subtitle">บันทึกเลขมิเตอร์เริ่ม-จบ ของแต่ละถังรายวัน</div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <input
                        type="date"
                        className="form-control"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        style={{ width: "170px" }}
                    />
                    <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                        {saving ? <><span className="spinner" style={{ width: 14, height: 14 }} /> บันทึก...</> : "💾 บันทึก"}
                    </button>
                </div>
            </div>

            {saved && <div className="alert alert-success" style={{ marginBottom: "1rem" }}>✅ บันทึกมิเตอร์เรียบร้อยแล้ว!</div>}

            {/* Summary */}
            <div className="stats-grid" style={{ marginBottom: "1rem" }}>
                <div className="stat-card">
                    <div className="stat-icon blue">⛽</div>
                    <div>
                        <div className="stat-label">ลิตรรวมทั้งหมด</div>
                        <div className="stat-value">{totalLiters.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</div>
                    </div>
                </div>
                {Object.entries(oilTotals).filter(([, v]) => v > 0).map(([type, total]) => (
                    <div className="stat-card" key={type}>
                        <div className={`stat-icon ${type === "D" ? "amber" : type === "E" ? "green" : type === "K" ? "purple" : "blue"}`}>
                            {type === "D" ? "🛢️" : type === "E" ? "🟢" : type === "K" ? "🟣" : "🔵"}
                        </div>
                        <div>
                            <div className="stat-label">{OIL_TYPE_LABELS[type] || type}</div>
                            <div className="stat-value">{total.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</div>
                            <div className="stat-sub">ลิตร</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="card">
                <div className="card-header">
                    <span className="card-title">รายการมิเตอร์ ({rows.length} ถัง)</span>
                    <button className="btn btn-secondary btn-sm" onClick={addRow}>+ เพิ่มถัง</button>
                </div>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: "60px" }}>ถัง</th>
                                <th style={{ width: "130px" }}>ประเภท</th>
                                <th style={{ width: "80px" }}>รถ</th>
                                <th className="td-number">มิเตอร์เริ่ม</th>
                                <th className="td-number">มิเตอร์จบ</th>
                                <th className="td-number" style={{ fontWeight: 700, color: "var(--primary)" }}>ลิตร</th>
                                <th>หมายเหตุ</th>
                                <th style={{ width: "50px" }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={8} className="td-center"><span className="spinner" /> กำลังโหลด...</td></tr>
                            ) : (
                                rows.map((r, i) => (
                                    <tr key={i}>
                                        <td>
                                            <input
                                                className="form-control"
                                                type="number"
                                                value={r.tankNumber}
                                                onChange={(e) => updateRow(i, "tankNumber", e.target.value)}
                                                style={{ width: "55px", padding: "0.3rem", textAlign: "center" }}
                                            />
                                        </td>
                                        <td>
                                            <select
                                                className="form-control"
                                                value={r.oilType}
                                                onChange={(e) => updateRow(i, "oilType", e.target.value)}
                                                style={{ padding: "0.3rem" }}
                                            >
                                                {Object.entries(OIL_TYPE_LABELS).map(([k, v]) => (
                                                    <option key={k} value={k}>{v}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>
                                            <input
                                                className="form-control"
                                                value={r.truckId}
                                                onChange={(e) => updateRow(i, "truckId", e.target.value)}
                                                placeholder="ทะเบียน"
                                                style={{ width: "80px", padding: "0.3rem" }}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                className="form-control td-number"
                                                type="number"
                                                step="0.01"
                                                value={r.startMeter}
                                                onChange={(e) => updateRow(i, "startMeter", e.target.value)}
                                                style={{ textAlign: "right", padding: "0.3rem" }}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                className="form-control td-number"
                                                type="number"
                                                step="0.01"
                                                value={r.endMeter}
                                                onChange={(e) => updateRow(i, "endMeter", e.target.value)}
                                                style={{ textAlign: "right", padding: "0.3rem" }}
                                            />
                                        </td>
                                        <td
                                            className="td-number"
                                            style={{
                                                fontWeight: 700,
                                                color: parseFloat(r.liters) > 0 ? "var(--primary)" : "var(--text-light)",
                                                fontSize: "0.95rem",
                                            }}
                                        >
                                            {parseFloat(r.liters).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                                        </td>
                                        <td>
                                            <input
                                                className="form-control"
                                                value={r.note}
                                                onChange={(e) => updateRow(i, "note", e.target.value)}
                                                placeholder="—"
                                                style={{ padding: "0.3rem" }}
                                            />
                                        </td>
                                        <td className="td-center">
                                            <button
                                                className="btn btn-ghost btn-sm"
                                                style={{ color: "var(--danger)" }}
                                                onClick={() => removeRow(i)}
                                                title="ลบ"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
