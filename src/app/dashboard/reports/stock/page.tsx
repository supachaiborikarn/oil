"use client";
import { useState, useEffect } from "react";

export default function StockReportPage() {
    const [month, setMonth] = useState("");
    const [report, setReport] = useState<{ office: any, stock: any[] } | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch current month on initial load
        fetchReport();
    }, []);

    async function fetchReport() {
        setLoading(true);
        try {
            const url = month ? `/api/reports/stock?month=${month}` : "/api/reports/stock";
            const res = await fetch(url);
            if (res.ok) {
                setReport(await res.json());
            }
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <div className="page-title">🛢️ สต็อกน้ำมัน</div>
                    <div className="page-subtitle">รายงานสรุปสินค้าและวัตถุดิบ (น้ำมันเชื้อเพลิง)</div>
                </div>
            </div>

            <div className="filter-bar">
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <input type="month" className="form-control" value={month} onChange={e => setMonth(e.target.value)} style={{ width: "180px" }} />
                    <button className="btn btn-primary" onClick={fetchReport} disabled={loading}>{loading ? "กำลังโหลด..." : "🔍 ดูรายงาน"}</button>
                    {report && report.stock && report.stock.length > 0 && (
                        <button className="btn btn-ghost" onClick={() => window.open(`/dashboard/reports/stock/print?month=${month}`, '_blank')}>
                            🖨️ พิมพ์รายงานน้ำมันคงเหลือ
                        </button>
                    )}
                </div>
            </div>

            <div className="card">
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>ประเภทน้ำมัน</th>
                                <th className="td-number">ยอดยกมา (ลิตร)</th>
                                <th className="td-number">รับเข้า (ลิตร)</th>
                                <th className="td-number">จ่ายออก (ลิตร)</th>
                                <th className="td-number">ปรับปรุง/เกลี่ย (ลิตร)</th>
                                <th className="td-number">คงเหลือ (ลิตร)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? <tr><td colSpan={6} className="td-center"><span className="spinner" /></td></tr> :
                                (!report || !report.stock || report.stock.length === 0) ?
                                    <tr><td colSpan={6}><div className="empty-state"><div className="empty-state-icon">🛢️</div><div className="empty-state-title">ยังไม่มีข้อมูลสต็อก</div></div></td></tr> :
                                    report.stock.map((s: any) => (
                                        <tr key={s.oilType}>
                                            <td style={{ fontWeight: 500 }}>{s.label}</td>
                                            <td className="td-number">{Number(s.openingBalance).toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
                                            <td className="td-number" style={{ color: "var(--success)" }}>+{Number(s.incoming).toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
                                            <td className="td-number" style={{ color: "var(--danger)" }}>-{Number(s.outgoing).toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
                                            <td className="td-number" style={{ color: Number(s.adjustments) > 0 ? "var(--success)" : Number(s.adjustments) < 0 ? "var(--danger)" : "inherit" }}>
                                                {Number(s.adjustments) > 0 ? "+" : ""}{Number(s.adjustments).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="td-number" style={{ fontWeight: 700, fontSize: "1rem", color: Number(s.remaining) < 0 ? "var(--danger)" : "var(--primary)" }}>
                                                {Number(s.remaining).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
