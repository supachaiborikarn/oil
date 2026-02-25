"use client";
import { useState } from "react";

export default function MetersReportPage() {
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    async function fetchReport() {
        setLoading(true);
        try {
            const res = await fetch(`/api/reports/meters?from=${dateFrom}&to=${dateTo}`);
            if (res.ok) setReport(await res.json());
        } catch (e) { console.error(e); }
        setLoading(false);
    }

    return (
        <div>
            <div className="page-header">
                <div><div className="page-title">📉 สรุปมิเตอร์</div><div className="page-subtitle">สรุปยอดน้ำมันจากมิเตอร์ตามช่วงเวลา</div></div>
            </div>
            <div className="filter-bar">
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <input type="date" className="form-control" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ width: "160px" }} />
                    <span>ถึง</span>
                    <input type="date" className="form-control" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ width: "160px" }} />
                    <button className="btn btn-primary" onClick={fetchReport} disabled={loading}>{loading ? "โหลด..." : "🔍 ดูรายงาน"}</button>
                </div>
            </div>

            {report ? (
                <>
                    <div className="stats-grid" style={{ marginBottom: "1rem" }}>
                        <div className="stat-card"><div className="stat-icon blue">⛽</div><div><div className="stat-label">ลิตรรวม</div><div className="stat-value">{Number(report.totalLiters).toLocaleString("th-TH", { minimumFractionDigits: 2 })}</div></div></div>
                        <div className="stat-card"><div className="stat-icon green">📅</div><div><div className="stat-label">จำนวนวัน</div><div className="stat-value">{report.totalDays}</div></div></div>
                    </div>
                    {report.byOilType && (
                        <div className="card">
                            <div className="card-header"><span className="card-title">สรุปตามประเภทน้ำมัน</span></div>
                            <div className="table-wrapper"><table><thead><tr><th>ประเภท</th><th className="td-number">ลิตรรวม</th><th className="td-number">เฉลี่ย/วัน</th></tr></thead>
                                <tbody>{report.byOilType.map((r: any) => (
                                    <tr key={r.oilType}><td>{r.oilType}</td><td className="td-number" style={{ fontWeight: 600 }}>{Number(r.totalLiters).toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td><td className="td-number">{Number(r.avgPerDay).toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td></tr>
                                ))}</tbody></table></div>
                        </div>
                    )}
                </>
            ) : !loading && (
                <div className="card"><div className="card-body"><div className="empty-state"><div className="empty-state-icon">📉</div><div className="empty-state-title">เลือกช่วงวันที่</div></div></div></div>
            )}
        </div>
    );
}
