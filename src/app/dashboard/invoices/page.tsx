"use client";
import { useState, useEffect } from "react";
import { format } from "date-fns";

const OIL_TYPE_LABELS: Record<string, string> = {
    D: "ดีเซล", B: "เบนซิน", E: "E20", K: "91", N: "NGV", S: "Super Diesel", O: "อื่นๆ",
};

interface InvoiceItem {
    oilType: string;
    description: string;
    liters: string;
    unitPrice: string;
    amount: string;
}

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"all" | "paid" | "unpaid">("all");

    useEffect(() => {
        async function fetchInvoices() {
            setLoading(true);
            try {
                const res = await fetch("/api/invoices");
                if (res.ok) setInvoices(await res.json());
            } catch (e) { console.error(e); }
            setLoading(false);
        }
        fetchInvoices();
    }, []);

    const filtered = invoices.filter((inv) => {
        const matchSearch = inv.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
            inv.invoiceNo?.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === "all" ? true : filter === "paid" ? inv.isPaid : !inv.isPaid;
        return matchSearch && matchFilter;
    });

    const totalAmount = filtered.reduce((sum: number, inv: any) => sum + Number(inv.total || 0), 0);
    const unpaidAmount = filtered.filter((inv: any) => !inv.isPaid).reduce((sum: number, inv: any) => sum + Number(inv.total || 0), 0);

    return (
        <div>
            <div className="page-header">
                <div>
                    <div className="page-title">🧾 บิลขาย</div>
                    <div className="page-subtitle">{invoices.length} รายการ · ยอดรวม {totalAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท</div>
                </div>
                <a href="/dashboard/invoices/new" className="btn btn-primary">+ ออกบิลใหม่</a>
            </div>

            <div className="filter-bar">
                <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input className="form-control" placeholder="ค้นหาเลขบิลหรือชื่อลูกค้า..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: "2.25rem" }} />
                </div>
                <div className="tabs" style={{ borderBottom: "none", marginBottom: 0 }}>
                    {[
                        { key: "all" as const, label: "ทั้งหมด" },
                        { key: "unpaid" as const, label: "ค้างชำระ" },
                        { key: "paid" as const, label: "ชำระแล้ว" },
                    ].map(t => (
                        <div key={t.key} className={`tab${filter === t.key ? " active" : ""}`} onClick={() => setFilter(t.key)}>{t.label}</div>
                    ))}
                </div>
            </div>

            {/* Summary */}
            <div className="stats-grid" style={{ marginBottom: "1rem" }}>
                <div className="stat-card">
                    <div className="stat-icon blue">🧾</div>
                    <div>
                        <div className="stat-label">ยอดรวม</div>
                        <div className="stat-value">{totalAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon amber">⚠️</div>
                    <div>
                        <div className="stat-label">ค้างชำระ</div>
                        <div className="stat-value" style={{ color: "var(--danger)" }}>{unpaidAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</div>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>เลขที่บิล</th>
                                <th>วันที่</th>
                                <th>ลูกค้า</th>
                                <th className="td-number">ยอดเงิน</th>
                                <th className="td-number">VAT</th>
                                <th className="td-number">รวมทั้งสิ้น</th>
                                <th>สถานะ</th>
                                <th className="td-center">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={8} className="td-center"><span className="spinner" /> กำลังโหลด...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={8}>
                                        <div className="empty-state">
                                            <div className="empty-state-icon">🧾</div>
                                            <div className="empty-state-title">ไม่พบข้อมูลบิล</div>
                                            <div className="empty-state-desc">
                                                <a href="/dashboard/invoices/new" className="btn btn-primary btn-sm" style={{ marginTop: "0.75rem", display: "inline-flex" }}>ออกบิลใหม่</a>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((inv) => (
                                    <tr key={inv.id}>
                                        <td style={{ fontWeight: 600 }}>{inv.invoiceNo}</td>
                                        <td>{inv.date ? format(new Date(inv.date), "dd/MM/yyyy") : "—"}</td>
                                        <td>{inv.customer?.name || "—"}</td>
                                        <td className="td-number">{Number(inv.subtotal).toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
                                        <td className="td-number" style={{ color: "var(--text-muted)" }}>{Number(inv.vatAmount).toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
                                        <td className="td-number" style={{ fontWeight: 700 }}>{Number(inv.total).toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
                                        <td>
                                            <span className={`badge ${inv.isPaid ? "badge-success" : "badge-warning"}`}>
                                                {inv.isPaid ? "ชำระแล้ว" : "ค้างชำระ"}
                                            </span>
                                        </td>
                                        <td className="td-center" style={{ display: "flex", gap: "0.25rem", justifyContent: "center" }}>
                                            <a href={`/dashboard/invoices/${inv.id}`} className="btn btn-ghost btn-sm">👁️</a>
                                            <a href={`/dashboard/invoices/${inv.id}/print`} className="btn btn-ghost btn-sm">🖨️</a>
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
