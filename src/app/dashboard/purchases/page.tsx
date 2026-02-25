"use client";
import { useState, useEffect } from "react";
import { format } from "date-fns";

export default function PurchasesPage() {
    const [purchases, setPurchases] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/purchases").then(r => r.json()).then(setPurchases).catch(console.error).finally(() => setLoading(false));
    }, []);

    const totalAmount = purchases.reduce((s: number, p: any) => s + Number(p.total || 0), 0);

    return (
        <div>
            <div className="page-header">
                <div>
                    <div className="page-title">🚛 รับน้ำมันเข้า</div>
                    <div className="page-subtitle">{purchases.length} รายการ · ยอดรวม {totalAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท</div>
                </div>
                <a href="/dashboard/purchases/new" className="btn btn-primary">+ บันทึกรับน้ำมัน</a>
            </div>

            <div className="card">
                <div className="table-wrapper">
                    <table>
                        <thead><tr><th>เลขที่</th><th>วันที่</th><th>ผู้จัดจำหน่าย</th><th className="td-number">ยอดรวม</th><th className="td-number">VAT</th><th className="td-number">รวมทั้งสิ้น</th></tr></thead>
                        <tbody>
                            {loading ? <tr><td colSpan={6} className="td-center"><span className="spinner" /></td></tr> :
                                purchases.length === 0 ? <tr><td colSpan={6}><div className="empty-state"><div className="empty-state-icon">🚛</div><div className="empty-state-title">ยังไม่มีข้อมูล</div></div></td></tr> :
                                    purchases.map(p => (
                                        <tr key={p.id}>
                                            <td style={{ fontWeight: 600 }}>{p.purchaseNo}</td>
                                            <td>{p.date ? format(new Date(p.date), "dd/MM/yyyy") : "—"}</td>
                                            <td>{p.supplier?.name || "—"}</td>
                                            <td className="td-number">{Number(p.subtotal).toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
                                            <td className="td-number" style={{ color: "var(--text-muted)" }}>{Number(p.vatAmount).toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
                                            <td className="td-number" style={{ fontWeight: 700 }}>{Number(p.total).toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
                                        </tr>
                                    ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
