"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

interface InvoiceItem {
    oilType: string;
    description: string;
    liters: string;
    unitPrice: string;
    amount: string;
    productId: string;
}

export default function NewInvoicePage() {
    const router = useRouter();
    const [customers, setCustomers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        invoiceNo: "",
        date: format(new Date(), "yyyy-MM-dd"),
        customerId: "",
        billType: "1",
        vatRate: "7",
        discount: "0",
        note: "",
    });

    const [items, setItems] = useState<InvoiceItem[]>([
        { oilType: "D", description: "ดีเซล B7", liters: "", unitPrice: "", amount: "", productId: "" },
    ]);

    useEffect(() => {
        fetch("/api/customers").then(r => r.json()).then(setCustomers).catch(console.error);
        fetch("/api/products").then(r => r.json()).then(setProducts).catch(console.error);
    }, []);

    function addItem() {
        setItems([...items, { oilType: "D", description: "", liters: "", unitPrice: "", amount: "", productId: "" }]);
    }

    function removeItem(idx: number) {
        setItems(items.filter((_, i) => i !== idx));
    }

    function updateItem(idx: number, field: keyof InvoiceItem, value: string) {
        const updated = [...items];
        updated[idx][field] = value;

        if (field === "productId" && value) {
            const prod = products.find((p: any) => p.id === value);
            if (prod) {
                updated[idx].oilType = prod.oilType;
                updated[idx].description = prod.name;
                updated[idx].unitPrice = String(prod.salePrice || "");
            }
        }

        if (field === "liters" || field === "unitPrice") {
            const liters = parseFloat(updated[idx].liters) || 0;
            const price = parseFloat(updated[idx].unitPrice) || 0;
            updated[idx].amount = String((liters * price).toFixed(2));
        }

        setItems(updated);
    }

    const subtotal = items.reduce((s, item) => s + (parseFloat(item.amount) || 0), 0);
    const discount = parseFloat(form.discount) || 0;
    const vatRate = parseFloat(form.vatRate) || 7;
    const afterDiscount = subtotal - discount;
    const vatAmount = afterDiscount * (vatRate / 100);
    const total = afterDiscount + vatAmount;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!form.customerId) { alert("กรุณาเลือกลูกค้า"); return; }
        if (items.length === 0) { alert("กรุณาเพิ่มรายการสินค้า"); return; }

        setSaving(true);
        try {
            const res = await fetch("/api/invoices", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, items }),
            });
            if (res.ok) {
                router.push("/dashboard/invoices");
            } else {
                alert("เกิดข้อผิดพลาด กรุณาลองอีกครั้ง");
            }
        } catch (e) { alert("เกิดข้อผิดพลาด"); }
        setSaving(false);
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            const target = e.target as HTMLElement;
            if (target.tagName === "INPUT" || target.tagName === "SELECT") {
                e.preventDefault();
                const formElements = Array.from(document.querySelectorAll("input, select, textarea, button[type='submit']")) as HTMLElement[];
                const index = formElements.indexOf(target);
                if (index > -1 && index < formElements.length - 1) {
                    formElements[index + 1].focus();
                }
            }
        }
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <div className="page-title">🧾 ออกบิลใหม่</div>
                    <div className="page-subtitle">สร้างใบแจ้งหนี้/ใบกำกับภาษี</div>
                </div>
                <a href="/dashboard/invoices" className="btn btn-secondary">← กลับรายการบิล</a>
            </div>

            <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
                {/* Header info */}
                <div className="card" style={{ marginBottom: "1rem" }}>
                    <div className="card-header"><span className="card-title">ข้อมูลบิล</span></div>
                    <div className="card-body">
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">เลขที่บิล <span className="required">*</span></label>
                                <input className="form-control" required value={form.invoiceNo} onChange={(e) => setForm({ ...form, invoiceNo: e.target.value })} placeholder="เช่น 67/00001" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">วันที่</label>
                                <input type="date" className="form-control" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">ลูกค้า <span className="required">*</span></label>
                                <select className="form-control" required value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })}>
                                    <option value="">— เลือกลูกค้า —</option>
                                    {customers.map((c: any) => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">ประเภทบิล</label>
                                <select className="form-control" value={form.billType} onChange={(e) => setForm({ ...form, billType: e.target.value })}>
                                    <option value="1">ใบกำกับภาษี/ใบส่งของ</option>
                                    <option value="2">ใบเสร็จรับเงิน</option>
                                    <option value="3">ใบแจ้งหนี้</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Items */}
                <div className="card" style={{ marginBottom: "1rem" }}>
                    <div className="card-header">
                        <span className="card-title">รายการสินค้า</span>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={addItem}>+ เพิ่มรายการ</button>
                    </div>
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ width: "40px" }}>#</th>
                                    <th style={{ width: "200px" }}>สินค้า</th>
                                    <th>รายละเอียด</th>
                                    <th className="td-number" style={{ width: "120px" }}>จำนวน (ลิตร)</th>
                                    <th className="td-number" style={{ width: "120px" }}>ราคา/หน่วย</th>
                                    <th className="td-number" style={{ width: "130px" }}>จำนวนเงิน</th>
                                    <th style={{ width: "50px" }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, i) => (
                                    <tr key={i}>
                                        <td className="td-center">{i + 1}</td>
                                        <td>
                                            <select className="form-control" value={item.productId} onChange={(e) => updateItem(i, "productId", e.target.value)} style={{ padding: "0.3rem" }}>
                                                <option value="">— เลือก —</option>
                                                {products.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                            </select>
                                        </td>
                                        <td>
                                            <input className="form-control" value={item.description} onChange={(e) => updateItem(i, "description", e.target.value)} placeholder="รายละเอียด" style={{ padding: "0.3rem" }} />
                                        </td>
                                        <td>
                                            <input className="form-control td-number" type="number" step="0.01" value={item.liters} onChange={(e) => updateItem(i, "liters", e.target.value)} placeholder="0.00" style={{ textAlign: "right", padding: "0.3rem" }} />
                                        </td>
                                        <td>
                                            <input className="form-control td-number" type="number" step="0.0001" value={item.unitPrice} onChange={(e) => updateItem(i, "unitPrice", e.target.value)} placeholder="0.0000" style={{ textAlign: "right", padding: "0.3rem" }} />
                                        </td>
                                        <td className="td-number" style={{ fontWeight: 700, color: "var(--primary)", fontSize: "0.95rem" }}>
                                            {(parseFloat(item.amount) || 0).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="td-center">
                                            {items.length > 1 && <button type="button" className="btn btn-ghost btn-sm" style={{ color: "var(--danger)" }} onClick={() => removeItem(i)}>🗑️</button>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Summary */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "1rem" }}>
                    <div className="card">
                        <div className="card-body">
                            <div className="form-group">
                                <label className="form-label">หมายเหตุ</label>
                                <textarea className="form-control" rows={3} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="หมายเหตุเพิ่มเติม..." />
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span>ยอดรวม</span>
                                <span style={{ fontWeight: 500 }}>{subtotal.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span>ส่วนลด</span>
                                <input className="form-control" type="number" step="0.01" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} style={{ width: "120px", textAlign: "right", padding: "0.3rem" }} />
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span>VAT</span>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    <input className="form-control" type="number" step="0.01" value={form.vatRate} onChange={(e) => setForm({ ...form, vatRate: e.target.value })} style={{ width: "60px", textAlign: "right", padding: "0.3rem" }} />
                                    <span>% = {vatAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                            <hr style={{ border: "none", borderTop: "2px solid var(--primary)", margin: "0.3rem 0" }} />
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>รวมทั้งสิ้น</span>
                                <span style={{ fontWeight: 700, fontSize: "1.2rem", color: "var(--primary)" }}>{total.toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท</span>
                            </div>

                            <button type="submit" className="btn btn-primary btn-lg" disabled={saving} style={{ marginTop: "0.5rem", justifyContent: "center" }}>
                                {saving ? "กำลังบันทึก..." : "💾 บันทึกบิล"}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
