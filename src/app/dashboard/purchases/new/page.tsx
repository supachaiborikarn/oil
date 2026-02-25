"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

export default function NewPurchasePage() {
    const router = useRouter();
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        purchaseNo: "",
        date: format(new Date(), "yyyy-MM-dd"),
        supplierId: "",
        note: "",
    });

    const [items, setItems] = useState([
        { productId: "", description: "", liters: "", unitPrice: "", amount: "" },
    ]);

    useEffect(() => {
        fetch("/api/suppliers").then(r => r.json()).then(setSuppliers).catch(console.error);
        fetch("/api/products").then(r => r.json()).then(setProducts).catch(console.error);
    }, []);

    function addItem() {
        setItems([...items, { productId: "", description: "", liters: "", unitPrice: "", amount: "" }]);
    }

    function removeItem(idx: number) { setItems(items.filter((_, i) => i !== idx)); }

    function updateItem(idx: number, field: string, value: string) {
        const updated = [...items];
        (updated[idx] as any)[field] = value;
        if (field === "productId" && value) {
            const prod = products.find(p => p.id === value);
            if (prod) { updated[idx].description = prod.name; updated[idx].unitPrice = String(prod.buyPrice || ""); }
        }
        if (field === "liters" || field === "unitPrice") {
            const liters = parseFloat(updated[idx].liters) || 0;
            const price = parseFloat(updated[idx].unitPrice) || 0;
            updated[idx].amount = String((liters * price).toFixed(2));
        }
        setItems(updated);
    }

    const subtotal = items.reduce((s, item) => s + (parseFloat(item.amount) || 0), 0);
    const vat = subtotal * 0.07;
    const total = subtotal + vat;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!form.supplierId) { alert("กรุณาเลือกผู้จัดจำหน่าย"); return; }
        setSaving(true);
        try {
            const res = await fetch("/api/purchases", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, items }),
            });
            if (res.ok) router.push("/dashboard/purchases");
            else alert("เกิดข้อผิดพลาด");
        } catch { alert("เกิดข้อผิดพลาด"); }
        setSaving(false);
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <div className="page-title">🚛 รับน้ำมันเข้า</div>
                    <div className="page-subtitle">บันทึกการสั่งซื้อน้ำมันจากผู้จัดจำหน่าย</div>
                </div>
                <a href="/dashboard/purchases" className="btn btn-secondary">← กลับ</a>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="card" style={{ marginBottom: "1rem" }}>
                    <div className="card-header"><span className="card-title">ข้อมูลการสั่งซื้อ</span></div>
                    <div className="card-body">
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">เลขที่ใบสั่งซื้อ</label>
                                <input className="form-control" value={form.purchaseNo} onChange={e => setForm({ ...form, purchaseNo: e.target.value })} placeholder="PO-NNNN" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">วันที่</label>
                                <input type="date" className="form-control" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">ผู้จัดจำหน่าย <span className="required">*</span></label>
                                <select className="form-control" required value={form.supplierId} onChange={e => setForm({ ...form, supplierId: e.target.value })}>
                                    <option value="">— เลือก —</option>
                                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.code} — {s.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ marginBottom: "1rem" }}>
                    <div className="card-header">
                        <span className="card-title">รายการน้ำมัน</span>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={addItem}>+ เพิ่ม</button>
                    </div>
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th><th>สินค้า</th><th>รายละเอียด</th>
                                    <th className="td-number">ลิตร</th><th className="td-number">ราคา/ลิตร</th><th className="td-number">จำนวนเงิน</th><th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, i) => (
                                    <tr key={i}>
                                        <td className="td-center">{i + 1}</td>
                                        <td>
                                            <select className="form-control" value={item.productId} onChange={e => updateItem(i, "productId", e.target.value)} style={{ padding: "0.3rem" }}>
                                                <option value="">— เลือก —</option>
                                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                            </select>
                                        </td>
                                        <td><input className="form-control" value={item.description} onChange={e => updateItem(i, "description", e.target.value)} style={{ padding: "0.3rem" }} /></td>
                                        <td><input className="form-control td-number" type="number" step="0.01" value={item.liters} onChange={e => updateItem(i, "liters", e.target.value)} style={{ textAlign: "right", padding: "0.3rem" }} /></td>
                                        <td><input className="form-control td-number" type="number" step="0.0001" value={item.unitPrice} onChange={e => updateItem(i, "unitPrice", e.target.value)} style={{ textAlign: "right", padding: "0.3rem" }} /></td>
                                        <td className="td-number" style={{ fontWeight: 700, color: "var(--primary)" }}>{(parseFloat(item.amount) || 0).toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
                                        <td className="td-center">{items.length > 1 && <button type="button" className="btn btn-ghost btn-sm" style={{ color: "var(--danger)" }} onClick={() => removeItem(i)}>🗑️</button>}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <div className="card" style={{ width: "350px" }}>
                        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}><span>ยอดรวม</span><span>{subtotal.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</span></div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}><span>VAT 7%</span><span>{vat.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</span></div>
                            <hr style={{ border: "none", borderTop: "2px solid var(--primary)", margin: "0.3rem 0" }} />
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>รวมทั้งสิ้น</span>
                                <span style={{ fontWeight: 700, fontSize: "1.2rem", color: "var(--primary)" }}>{total.toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท</span>
                            </div>
                            <button type="submit" className="btn btn-primary btn-lg" disabled={saving} style={{ marginTop: "0.5rem", justifyContent: "center" }}>
                                {saving ? "กำลังบันทึก..." : "💾 บันทึกการรับน้ำมัน"}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
