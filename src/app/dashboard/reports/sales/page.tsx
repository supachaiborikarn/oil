"use client";
import { useState } from "react";

export default function SalesReportPage() {
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    async function fetchReport() {
        setLoading(true);
        try {
            const res = await fetch(`/api/reports/sales?from=${dateFrom}&to=${dateTo}`);
            if (res.ok) setReport(await res.json());
        } catch (e) { console.error(e); }
        setLoading(false);
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <div className="page-title">📈 รายงานยอดขาย</div>
                    <div className="page-subtitle">สรุปยอดขายตามช่วงเวลา</div>
                </div>
            </div>

            <div className="filter-bar">
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <input type="date" className="form-control" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ width: "160px" }} />
                    <span>ถึง</span>
                    <input type="date" className="form-control" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ width: "160px" }} />
                    <button className="btn btn-primary" onClick={fetchReport} disabled={loading}>
                        {loading ? "กำลังโหลด..." : "🔍 ดูรายงาน"}
                    </button>
                    {report && (
                        <button className="btn btn-ghost" onClick={() => window.open(`/dashboard/reports/sales/print?from=${dateFrom}&to=${dateTo}`, '_blank')}>
                            🖨️ พิมพ์รายงานภาษีขาย
                        </button>
                    )}
                </div>
            </div>

            {report && (
                <>
                    <div className="stats-grid" style={{ marginBottom: "1rem" }}>
                        <div className="stat-card"><div className="stat-icon blue">🧾</div><div><div className="stat-label">จำนวนบิล</div><div className="stat-value">{report.totalBills}</div></div></div>
                        <div className="stat-card"><div className="stat-icon green">💰</div><div><div className="stat-label">ยอดขายรวม</div><div className="stat-value">{Number(report.totalSales).toLocaleString("th-TH", { minimumFractionDigits: 2 })}</div></div></div>
                        <div className="stat-card"><div className="stat-icon purple">📊</div><div><div className="stat-label">VAT</div><div className="stat-value">{Number(report.totalVat).toLocaleString("th-TH", { minimumFractionDigits: 2 })}</div></div></div>
                        <div className="stat-card"><div className="stat-icon amber">⚠️</div><div><div className="stat-label">ค้างชำระ</div><div className="stat-value">{Number(report.totalUnpaid).toLocaleString("th-TH", { minimumFractionDigits: 2 })}</div></div></div>
                    </div>

                    {report.byOilType && report.byOilType.length > 0 && (
                        <div className="card" style={{ marginBottom: "1rem" }}>
                            <div className="card-header"><span className="card-title">สรุปตามประเภทน้ำมัน</span></div>
                            <div className="table-wrapper">
                                <table>
                                    <thead><tr><th>ประเภท</th><th className="td-number">ลิตร</th><th className="td-number">ยอดเงิน</th></tr></thead>
                                    <tbody>
                                        {report.byOilType.map((r: any) => (
                                            <tr key={r.oilType}>
                                                <td>{r.oilType}</td>
                                                <td className="td-number">{Number(r.totalLiters).toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
                                                <td className="td-number" style={{ fontWeight: 600 }}>{Number(r.totalAmount).toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {report.invoices && report.invoices.length > 0 && (
                        <div className="card">
                            <div className="card-header"><span className="card-title">รายการบิล</span></div>
                            <div className="table-wrapper">
                                <table>
                                    <thead><tr><th>เลขที่</th><th>วันที่</th><th>ลูกค้า</th><th className="td-number">ยอด</th><th>สถานะ</th></tr></thead>
                                    <tbody>
                                        {report.invoices.map((inv: any) => (
                                            <tr key={inv.id}>
                                                <td style={{ fontWeight: 500 }}>{inv.invoiceNo}</td>
                                                <td>{new Date(inv.date).toLocaleDateString("th-TH")}</td>
                                                <td>{inv.customer?.name || "—"}</td>
                                                <td className="td-number" style={{ fontWeight: 600 }}>{Number(inv.total).toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
                                                <td><span className={`badge ${inv.isPaid ? "badge-success" : "badge-warning"}`}>{inv.isPaid ? "ชำระแล้ว" : "ค้างชำระ"}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}

            {!report && !loading && (
                <div className="card"><div className="card-body">
                    <div className="empty-state"><div className="empty-state-icon">📈</div><div className="empty-state-title">เลือกช่วงวันที่เพื่อดูรายงาน</div></div>
                </div></div>
            )}
        </div>
    );
}
