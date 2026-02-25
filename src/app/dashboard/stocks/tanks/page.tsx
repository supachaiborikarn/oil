"use client";
import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";

const OIL_TYPE_LABELS: Record<string, string> = {
    D: "ดีเซล B7", B: "เบนซิน", E: "แก๊สโซฮอล์ E20",
    K: "แก๊สโซฮอล์ 91", N: "NGV", S: "Super Diesel", O: "อื่นๆ"
};

interface DipRow {
    tankNumber: number;
    oilType: string;
    dipLevel: string;
    volume: string;
    waterLevel: string;
    note: string;
}

export default function TankDipsPage() {
    const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [rows, setRows] = useState<DipRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const fetchDips = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/tanks/dips?date=${date}`);
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

    useEffect(() => { fetchDips(); }, [fetchDips]);

    function processApiData(data: any[]) {
        const defaults: DipRow[] = [];
        // สร้าง Default 28 ถัง อ้างอิงจากหน้ามิเตอร์
        const tanks = [
            ...Array.from({ length: 8 }, (_, i) => ({ tank: i + 1, type: "D" })),
            ...Array.from({ length: 8 }, (_, i) => ({ tank: i + 9, type: "E" })),
            ...Array.from({ length: 8 }, (_, i) => ({ tank: i + 17, type: "K" })),
            ...Array.from({ length: 4 }, (_, i) => ({ tank: i + 25, type: "B" })),
        ];

        for (const t of tanks) {
            const ext = data.find(d => d.tankNumber === t.tank);
            defaults.push({
                tankNumber: t.tank,
                oilType: ext?.oilType || t.type,
                dipLevel: ext?.dipLevel !== null ? String(ext?.dipLevel || "") : "",
                volume: ext?.volume !== null ? String(ext?.volume || "") : "",
                waterLevel: ext?.waterLevel !== null ? String(ext?.waterLevel || "") : "",
                note: ext?.note || "",
            });
        }
        setRows(defaults);
    }

    function updateRow(idx: number, field: keyof DipRow, value: string) {
        const updated = [...rows];
        (updated[idx] as any)[field] = value;
        setRows(updated);
        setSaved(false);
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            const target = e.target as HTMLElement;
            if (target.tagName === "INPUT" || target.tagName === "SELECT") {
                e.preventDefault();
                const formElements = Array.from(document.querySelectorAll("input, select"));
                const index = formElements.indexOf(target);
                if (index > -1 && index < formElements.length - 1) {
                    (formElements[index + 1] as HTMLElement).focus();
                }
            }
        }
    };

    async function handleSave() {
        setSaving(true);
        try {
            const res = await fetch("/api/tanks/dips", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    date,
                    // กรองเอาเฉพาะถังที่มีการกรอกข้อมูลระดับ (dipLevel หรือ volume)
                    rows: rows.filter(r => r.dipLevel !== "" || r.volume !== "")
                })
            });
            if (res.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            }
        } catch (e) {
            alert("บันทึกไม่สำเร็จ");
        }
        setSaving(false);
    }

    const totalVolume = rows.reduce((sum, r) => sum + (parseFloat(r.volume) || 0), 0);
    const oilTotals: Record<string, number> = {};
    rows.forEach(r => {
        const type = r.oilType;
        oilTotals[type] = (oilTotals[type] || 0) + (parseFloat(r.volume) || 0);
    });

    return (
        <div>
            <div className="page-header">
                <div>
                    <div className="page-title">📏 ไม้หยั่งถัง (TUNG)</div>
                    <div className="page-subtitle">บันทึกระดับความสูงน้ำมันและน้ำก้นถังในแต่ละเบอร์ถังรายวัน</div>
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
                        {saving ? <><span className="spinner" style={{ width: 14, height: 14 }} /> บันทึก...</> : "💾 บันทึกไม้หยั่ง"}
                    </button>
                </div>
            </div>

            {saved && <div className="alert alert-success" style={{ marginBottom: "1rem" }}>✅ บันทึกข้อมูลไม้หยั่งถังเรียบร้อยแล้ว!</div>}

            {/* Summary */}
            <div className="stats-grid" style={{ marginBottom: "1rem" }}>
                <div className="stat-card">
                    <div className="stat-icon blue">📏</div>
                    <div>
                        <div className="stat-label">ปริมาตรในบ่อรวม</div>
                        <div className="stat-value">{totalVolume.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</div>
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

            <div className="card" onKeyDown={handleKeyDown}>
                <div className="card-header"><span className="card-title">บันทึกน้ำมันลงดิน (ความจุบ่อ)</span></div>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: "60px" }}>เบอร์ถัง</th>
                                <th style={{ width: "140px" }}>ชนิดน้ำมัน</th>
                                <th>ระดับไม้หยั่ง (มม./ซม.)</th>
                                <th className="td-number">ปริมาตรที่ได้ (ลิตร)</th>
                                <th>ระดับน้ำก้นถัง</th>
                                <th>หมายเหตุ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="td-center"><span className="spinner" /> กำลังโหลด...</td></tr>
                            ) : (
                                rows.map((r, i) => (
                                    <tr key={i}>
                                        <td className="td-center" style={{ fontWeight: "bold" }}>{r.tankNumber}</td>
                                        <td>
                                            <span className="badge badge-secondary">{OIL_TYPE_LABELS[r.oilType] || r.oilType}</span>
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                className="form-control"
                                                placeholder="ความสูงไม้หยั่ง"
                                                value={r.dipLevel}
                                                onChange={(e) => updateRow(i, "dipLevel", e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", justifyContent: "flex-end" }}>
                                                <input
                                                    type="number"
                                                    className="form-control td-number"
                                                    placeholder="จำนวนลิตร"
                                                    value={r.volume}
                                                    onChange={(e) => updateRow(i, "volume", e.target.value)}
                                                    style={{
                                                        fontWeight: parseFloat(r.volume) > 0 ? "bold" : "normal",
                                                        color: parseFloat(r.volume) > 0 ? "var(--primary)" : "var(--text-color)"
                                                    }}
                                                />
                                            </div>
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                className="form-control"
                                                placeholder="ถ้ามีน้ำ"
                                                value={r.waterLevel}
                                                onChange={(e) => updateRow(i, "waterLevel", e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="-"
                                                value={r.note}
                                                onChange={(e) => updateRow(i, "note", e.target.value)}
                                            />
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
