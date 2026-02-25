"use client";
import { useState, useEffect } from "react";

export default function DebtReportPage() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/reports/debt").then(r => r.json()).then(setCustomers).catch(console.error).finally(() => setLoading(false));
    }, []);

    const totalDebt = customers.reduce((s: number, c: any) => s + Number(c.totalDebt || 0), 0);

    return (
        <div>
            <div className="page-header">
                <div><div className="page-title">⚠️ ยอดค้างชำระ</div><div className="page-subtitle">ลูกค้าที่มียอดค้างชำระ</div></div>
            </div>

            <div className="stats-grid" style={{ marginBottom: "1rem" }}>
                <div className="stat-card"><div className="stat-icon amber">⚠️</div><div><div className="stat-label">ยอดค้างรวม</div><div className="stat-value" style={{ color: "var(--danger)" }}>{totalDebt.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</div></div></div>
                <div className="stat-card"><div className="stat-icon purple">👥</div><div><div className="stat-label">จำนวนลูกค้า</div><div className="stat-value">{customers.length}</div><div className="stat-sub">ราย</div></div></div>
            </div>

            <div className="card">
                <div className="table-wrapper">
                    <table>
                        <thead><tr><th>รหัส</th><th>ชื่อลูกค้า</th><th>ที่อยู่</th><th>โทร</th><th className="td-number">ยอดค้างชำระ</th></tr></thead>
                        <tbody>
                            {loading ? <tr><td colSpan={5} className="td-center"><span className="spinner" /></td></tr> :
                                customers.length === 0 ? <tr><td colSpan={5}><div className="empty-state"><div className="empty-state-icon">✅</div><div className="empty-state-title">ไม่มีลูกค้าค้างชำระ!</div></div></td></tr> :
                                    customers.map(c => (
                                        <tr key={c.id}>
                                            <td style={{ fontWeight: 500 }}>{c.code}</td>
                                            <td>{c.name}</td>
                                            <td style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{[c.address, c.address2].filter(Boolean).join(", ")}</td>
                                            <td>{c.phone || "—"}</td>
                                            <td className="td-number" style={{ fontWeight: 700, color: "var(--danger)", fontSize: "0.95rem" }}>
                                                {Number(c.totalDebt).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
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
