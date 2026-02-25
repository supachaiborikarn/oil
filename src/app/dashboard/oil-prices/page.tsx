"use client";
import { useState, useEffect } from "react";
import { format } from "date-fns";

export default function OilPricesPage() {
    const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [prices, setPrices] = useState({
        dieselSale: "", benzinSale: "", e20Sale: "", gas91Sale: "", gas95Sale: "", powerDieselSale: "",
        dieselCost: "", benzinCost: "", e20Cost: "", gas91Cost: "", gas95Cost: "", powerDieselCost: "",
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        async function fetch_prices() {
            setLoading(true);
            try {
                const res = await fetch(`/api/oil-prices?date=${date}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data) {
                        setPrices({
                            dieselSale: data.dieselSale || "",
                            benzinSale: data.benzinSale || "",
                            e20Sale: data.e20Sale || "",
                            gas91Sale: data.gas91Sale || "",
                            gas95Sale: data.gas95Sale || "",
                            powerDieselSale: data.powerDieselSale || "",
                            dieselCost: data.dieselCost || "",
                            benzinCost: data.benzinCost || "",
                            e20Cost: data.e20Cost || "",
                            gas91Cost: data.gas91Cost || "",
                            gas95Cost: data.gas95Cost || "",
                            powerDieselCost: data.powerDieselCost || "",
                        });
                    }
                }
            } catch (e) { console.error(e); }
            setLoading(false);
        }
        fetch_prices();
    }, [date]);

    async function handleSave() {
        setSaving(true);
        try {
            await fetch("/api/oil-prices", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date, ...prices }),
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (e) { console.error(e); }
        setSaving(false);
    }

    const oilTypes = [
        { key: "diesel", label: "ดีเซล B7", icon: "🛢️", color: "#b45309" },
        { key: "powerDiesel", label: "พาวเวอร์ดีเซล", icon: "⚡", color: "#d97706" },
        { key: "e20", label: "แก๊สโซฮอล์ E20", icon: "🟢", color: "#059669" },
        { key: "gas91", label: "แก๊สโซฮอล์ 91", icon: "🟣", color: "#7c3aed" },
        { key: "gas95", label: "แก๊สโซฮอล์ 95", icon: "🔵", color: "#1d4ed8" },
        { key: "benzin", label: "เบนซิน", icon: "🟠", color: "#ea580c" },
    ];

    return (
        <div>
            <div className="page-header">
                <div>
                    <div className="page-title">💰 ราคาน้ำมันวันนี้</div>
                    <div className="page-subtitle">กำหนดราคาขายหน้าลาน (กรอกเอง) และราคาต้นทุน</div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <input type="date" className="form-control" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: "170px" }} />
                    <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                        {saving ? "บันทึก..." : "💾 บันทึก"}
                    </button>
                </div>
            </div>

            {saved && <div className="alert alert-success" style={{ marginBottom: "1rem" }}>✅ บันทึกราคาเรียบร้อยแล้ว!</div>}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                {/* ราคาขาย */}
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">📊 ราคาขายหน้าลาน (บาท/ลิตร)</span>
                    </div>
                    <div className="card-body">
                        <div className="alert alert-info" style={{ marginBottom: "1rem", fontSize: "0.78rem" }}>
                            💡 กรอกราคาขายเองเพราะราคาต่างจังหวัดไม่เท่ากับ กทม.
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            {oilTypes.map(({ key, label, icon, color }) => (
                                <div key={key} className="form-group" style={{ flexDirection: "row", alignItems: "center", gap: "0.75rem" }}>
                                    <span style={{ width: "25px", textAlign: "center" }}>{icon}</span>
                                    <label style={{ width: "140px", fontSize: "0.85rem", fontWeight: 500, color }}>{label}</label>
                                    <input
                                        className="form-control"
                                        type="number"
                                        step="0.0001"
                                        placeholder="0.0000"
                                        value={(prices as any)[`${key}Sale`] || ""}
                                        onChange={(e) => setPrices({ ...prices, [`${key}Sale`]: e.target.value })}
                                        style={{ width: "120px", textAlign: "right" }}
                                    />
                                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>บาท</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ราคาต้นทุน */}
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">🏭 ราคาต้นทุน (บาท/ลิตร)</span>
                    </div>
                    <div className="card-body">
                        <div className="alert alert-warning" style={{ marginBottom: "1rem", fontSize: "0.78rem" }}>
                            ⚙️ ราคาต้นทุนสามารถ sync อัตโนมัติจาก Caltex Bizpoint ได้ในอนาคต
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            {oilTypes.map(({ key, label, icon }) => {
                                const saleVal = parseFloat((prices as any)[`${key}Sale`]) || 0;
                                const costVal = parseFloat((prices as any)[`${key}Cost`]) || 0;
                                const margin = saleVal && costVal ? saleVal - costVal : 0;
                                return (
                                    <div key={key} className="form-group" style={{ flexDirection: "row", alignItems: "center", gap: "0.75rem" }}>
                                        <span style={{ width: "25px", textAlign: "center" }}>{icon}</span>
                                        <label style={{ width: "140px", fontSize: "0.85rem", fontWeight: 500 }}>{label}</label>
                                        <input
                                            className="form-control"
                                            type="number"
                                            step="0.0001"
                                            placeholder="0.0000"
                                            value={(prices as any)[`${key}Cost`] || ""}
                                            onChange={(e) => setPrices({ ...prices, [`${key}Cost`]: e.target.value })}
                                            style={{ width: "120px", textAlign: "right" }}
                                        />
                                        {margin > 0 && (
                                            <span style={{ fontSize: "0.75rem", color: "var(--success)", fontWeight: 600 }}>
                                                +{margin.toFixed(4)}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Margin Summary */}
            <div className="card" style={{ marginTop: "1rem" }}>
                <div className="card-header"><span className="card-title">📈 สรุป Margin กำไร</span></div>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>ประเภท</th>
                                <th className="td-number">ราคาขาย</th>
                                <th className="td-number">ราคาต้นทุน</th>
                                <th className="td-number">Margin</th>
                                <th className="td-number">Margin %</th>
                            </tr>
                        </thead>
                        <tbody>
                            {oilTypes.map(({ key, label, icon, color }) => {
                                const sale = parseFloat((prices as any)[`${key}Sale`]) || 0;
                                const cost = parseFloat((prices as any)[`${key}Cost`]) || 0;
                                const margin = sale - cost;
                                const pct = cost > 0 ? ((margin / cost) * 100) : 0;
                                if (!sale && !cost) return null;
                                return (
                                    <tr key={key}>
                                        <td><span style={{ color }}>{icon} {label}</span></td>
                                        <td className="td-number">{sale ? sale.toFixed(4) : "-"}</td>
                                        <td className="td-number">{cost ? cost.toFixed(4) : "-"}</td>
                                        <td className="td-number" style={{ fontWeight: 700, color: margin > 0 ? "var(--success)" : margin < 0 ? "var(--danger)" : "var(--text)" }}>
                                            {margin > 0 ? "+" : ""}{margin.toFixed(4)}
                                        </td>
                                        <td className="td-number" style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
                                            {pct.toFixed(2)}%
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
