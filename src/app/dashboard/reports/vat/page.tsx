"use client";
import { useState } from "react";

export default function VatReportPage() {
    const [month, setMonth] = useState("");
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    async function fetchReport() {
        setLoading(true);
        try {
            const res = await fetch(`/api/reports/vat?month=${month}`);
            if (res.ok) setReport(await res.json());
        } catch (e) { console.error(e); }
        setLoading(false);
    }

    return (
        <div>
            <div className="page-header">
                <div><div className="page-title">📋 รายงานภาษี VAT</div><div className="page-subtitle">สรุปภาษีซื้อ-ภาษีขายรายเดือน</div></div>
            </div>
            <div className="filter-bar">
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <input type="month" className="form-control" value={month} onChange={e => setMonth(e.target.value)} style={{ width: "180px" }} />
                    <button className="btn btn-primary" onClick={fetchReport} disabled={loading}>{loading ? "โหลด..." : "🔍 ดูรายงาน"}</button>
                    {report && (
                        <button className="btn btn-ghost" onClick={() => window.open(`/dashboard/reports/vat/print-purchases?month=${month}`, '_blank')}>
                            🖨️ พิมพ์รายงานภาษีซื้อ
                        </button>
                    )}
                </div>
            </div>

            {report ? (
                <>
                    <div className="stats-grid" style={{ marginBottom: "1rem" }}>
                        <div className="stat-card"><div className="stat-icon green">📤</div><div><div className="stat-label">ภาษีขาย (Output VAT)</div><div className="stat-value">{Number(report.outputVat).toLocaleString("th-TH", { minimumFractionDigits: 2 })}</div></div></div>
                        <div className="stat-card"><div className="stat-icon blue">📥</div><div><div className="stat-label">ภาษีซื้อ (Input VAT)</div><div className="stat-value">{Number(report.inputVat).toLocaleString("th-TH", { minimumFractionDigits: 2 })}</div></div></div>
                        <div className="stat-card"><div className={`stat-icon ${report.netVat >= 0 ? "amber" : "green"}`}>{report.netVat >= 0 ? "💸" : "💰"}</div>
                            <div><div className="stat-label">ภาษีสุทธิ ({report.netVat >= 0 ? "ต้องชำระ" : "ขอคืน"})</div>
                                <div className="stat-value" style={{ color: report.netVat >= 0 ? "var(--danger)" : "var(--success)" }}>{Math.abs(Number(report.netVat)).toLocaleString("th-TH", { minimumFractionDigits: 2 })}</div></div></div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div className="card">
                            <div className="card-header"><span className="card-title">📤 ภาษีขาย — รายการขาย</span></div>
                            <div className="table-wrapper"><table><thead><tr><th>เลขที่</th><th>ลูกค้า</th><th className="td-number">ยอดก่อน VAT</th><th className="td-number">VAT</th></tr></thead>
                                <tbody>{report.salesInvoices?.map((inv: any) => (
                                    <tr key={inv.id}><td>{inv.invoiceNo}</td><td>{inv.customer?.name}</td><td className="td-number">{Number(inv.subtotal).toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td><td className="td-number">{Number(inv.vatAmount).toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td></tr>
                                ))}</tbody></table></div>
                        </div>
                        <div className="card">
                            <div className="card-header"><span className="card-title">📥 ภาษีซื้อ — รายการซื้อ</span></div>
                            <div className="table-wrapper"><table><thead><tr><th>เลขที่</th><th>ผู้จัดจำหน่าย</th><th className="td-number">ยอดก่อน VAT</th><th className="td-number">VAT</th></tr></thead>
                                <tbody>{report.purchaseInvoices?.map((p: any) => (
                                    <tr key={p.id}><td>{p.purchaseNo}</td><td>{p.supplier?.name}</td><td className="td-number">{Number(p.subtotal).toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td><td className="td-number">{Number(p.vatAmount).toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td></tr>
                                ))}</tbody></table></div>
                        </div>
                    </div>
                </>
            ) : !loading && (
                <div className="card"><div className="card-body"><div className="empty-state"><div className="empty-state-icon">📋</div><div className="empty-state-title">เลือกเดือนเพื่อดูรายงาน VAT</div></div></div></div>
            )}
        </div>
    );
}
