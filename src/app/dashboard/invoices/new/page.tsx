"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { format } from "date-fns";

interface InvoiceItem {
    oilType: string;
    description: string;
    liters: string;
    unitPrice: string;
    amount: string;
    productId: string;
}

const EMPTY_ITEM = (): InvoiceItem => ({
    oilType: "", description: "", liters: "", unitPrice: "", amount: "", productId: "",
});

const INITIAL_FORM = () => ({
    bookNo: "",
    invoiceNo: "",
    date: format(new Date(), "yyyy-MM-dd"),
    customerId: "",
    billType: "1",
    vatRate: "7",
    discount: "0",
    note: "",
});

export default function NewInvoicePage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [customers, setCustomers] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [products, setProducts] = useState<any[]>([]);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
    const [savedCount, setSavedCount] = useState(0);

    const [form, setForm] = useState(INITIAL_FORM);
    const [items, setItems] = useState<InvoiceItem[]>([EMPTY_ITEM()]);

    // Refs for keyboard navigation — stored in a map by id
    const fieldRefs = useRef<Map<string, HTMLElement>>(new Map());

    const registerRef = useCallback((id: string, el: HTMLElement | null) => {
        if (el) fieldRefs.current.set(id, el);
        else fieldRefs.current.delete(id);
    }, []);

    // Field order for Enter navigation
    const getFieldOrder = useCallback(() => {
        const order: string[] = [
            "bookNo", "invoiceNo", "date", "customerId", "billType",
        ];
        items.forEach((_, i) => {
            order.push(`item-${i}-product`, `item-${i}-liters`, `item-${i}-price`);
        });
        order.push("discount", "note", "submit");
        return order;
    }, [items]);

    const focusField = useCallback((id: string) => {
        const el = fieldRefs.current.get(id);
        if (el) {
            el.focus();
            if (el instanceof HTMLInputElement && el.type !== "date") {
                el.select();
            }
        }
    }, []);

    // Load customers + products + last invoice number
    useEffect(() => {
        fetch("/api/customers").then(r => r.json()).then(setCustomers).catch(console.error);
        fetch("/api/products").then(r => r.json()).then(setProducts).catch(console.error);
        loadLastInvoiceNo();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    async function loadLastInvoiceNo() {
        try {
            const res = await fetch("/api/invoices?lastNo=true");
            if (res.ok) {
                const data = await res.json();
                if (data.invoiceNo) {
                    setForm(prev => ({
                        ...prev,
                        invoiceNo: incrementInvoiceNo(data.invoiceNo),
                        bookNo: data.bookNo || prev.bookNo,
                    }));
                }
            }
        } catch { /* ignore */ }
    }

    function incrementInvoiceNo(no: string): string {
        // Try to increment the numeric part at the end, e.g. "67/00001" → "67/00002"
        const match = no.match(/^(.*?)(\d+)$/);
        if (match) {
            const prefix = match[1];
            const numPart = match[2];
            const next = String(parseInt(numPart, 10) + 1).padStart(numPart.length, "0");
            return prefix + next;
        }
        return no;
    }

    // ========================
    // Item management
    // ========================
    function addItem() {
        setItems(prev => [...prev, EMPTY_ITEM()]);
    }

    function removeItem(idx: number) {
        if (items.length <= 1) return;
        setItems(prev => prev.filter((_, i) => i !== idx));
    }

    function updateItem(idx: number, field: keyof InvoiceItem, value: string) {
        setItems(prev => {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], [field]: value };

            if (field === "productId" && value) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const prod = products.find((p: any) => p.id === value);
                if (prod) {
                    updated[idx].oilType = prod.oilType;
                    updated[idx].description = prod.name;
                    updated[idx].unitPrice = String(prod.salePrice || "");
                    // Auto-calculate amount if liters already filled
                    const liters = parseFloat(updated[idx].liters) || 0;
                    const price = parseFloat(String(prod.salePrice)) || 0;
                    if (liters > 0 && price > 0) {
                        updated[idx].amount = (liters * price).toFixed(2);
                    }
                }
            }

            if (field === "liters" || field === "unitPrice") {
                const liters = parseFloat(updated[idx].liters) || 0;
                const price = parseFloat(updated[idx].unitPrice) || 0;
                updated[idx].amount = (liters * price).toFixed(2);
            }

            return updated;
        });
    }

    // ========================
    // Calculations
    // ========================
    const subtotal = items.reduce((s, item) => s + (parseFloat(item.amount) || 0), 0);
    const discount = parseFloat(form.discount) || 0;
    const afterDiscount = subtotal - discount;
    const vatRate = parseFloat(form.vatRate) || 7;
    const vatAmount = afterDiscount * (vatRate / 100);
    const total = afterDiscount + vatAmount;

    // ========================
    // Keyboard navigation
    // ========================
    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key !== "Enter") return;

        const target = e.target as HTMLElement;
        // Don't handle Enter on textarea or submit button
        if (target.tagName === "TEXTAREA") return;
        if (target.tagName === "BUTTON") return;

        e.preventDefault();

        const order = getFieldOrder();
        const currentId = target.getAttribute("data-field-id");
        if (!currentId) return;

        const currentIdx = order.indexOf(currentId);
        if (currentIdx === -1) return;

        // If on the last item's price field, auto-add a new row
        const lastItemIdx = items.length - 1;
        if (currentId === `item-${lastItemIdx}-price`) {
            // Only add if current row has data
            if (items[lastItemIdx].productId || items[lastItemIdx].liters) {
                addItem();
                // Focus the new row's product field after state update
                setTimeout(() => focusField(`item-${lastItemIdx + 1}-product`), 50);
                return;
            }
        }

        // Move to next field
        const nextId = order[currentIdx + 1];
        if (nextId === "submit") {
            // Focus the submit button
            focusField("submit");
        } else if (nextId) {
            focusField(nextId);
        }
    }

    // ========================
    // Submit
    // ========================
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!form.invoiceNo.trim()) { showToast("กรุณากรอกเลขที่บิล", "error"); focusField("invoiceNo"); return; }
        if (!form.customerId) { showToast("กรุณาเลือกลูกค้า", "error"); focusField("customerId"); return; }

        const validItems = items.filter(item => item.productId || parseFloat(item.liters) > 0);
        if (validItems.length === 0) { showToast("กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ", "error"); return; }

        setSaving(true);
        try {
            const res = await fetch("/api/invoices", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, items: validItems }),
            });
            if (res.ok) {
                const saved = await res.json();
                setSavedCount(prev => prev + 1);
                showToast(`✅ บันทึกบิล ${saved.invoiceNo} สำเร็จ!`, "success");

                // Auto-clear form for next invoice
                const nextNo = incrementInvoiceNo(form.invoiceNo);
                setForm({
                    ...INITIAL_FORM(),
                    bookNo: form.bookNo,
                    invoiceNo: nextNo,
                    date: form.date,
                    billType: form.billType,
                    vatRate: form.vatRate,
                });
                setItems([EMPTY_ITEM()]);

                // Focus first field after state update
                setTimeout(() => focusField("bookNo"), 100);
            } else {
                const err = await res.json();
                showToast(`❌ ${err.error || "เกิดข้อผิดพลาด กรุณาลองอีกครั้ง"}`, "error");
            }
        } catch {
            showToast("❌ เกิดข้อผิดพลาดในการเชื่อมต่อ", "error");
        }
        setSaving(false);
    }

    function showToast(msg: string, type: string) {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    }

    // ========================
    // Auto-focus first field on mount
    // ========================
    useEffect(() => {
        setTimeout(() => focusField("bookNo"), 300);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div>
            {/* Toast notification */}
            {toast && (
                <div className={`invoice-toast invoice-toast-${toast.type}`}>
                    {toast.msg}
                </div>
            )}

            <div className="page-header">
                <div>
                    <div className="page-title">🧾 ออกบิลใหม่</div>
                    <div className="page-subtitle">
                        กด Enter เลื่อนช่องถัดไป • บันทึกแล้วเคลียร์ฟอร์มอัตโนมัติ
                        {savedCount > 0 && <span style={{ marginLeft: "1rem", color: "var(--success)", fontWeight: 600 }}>📋 บันทึกแล้ว {savedCount} ใบ</span>}
                    </div>
                </div>
                <a href="/dashboard/invoices" className="btn btn-secondary">← กลับรายการบิล</a>
            </div>

            <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
                {/* ===== Header Info ===== */}
                <div className="card" style={{ marginBottom: "1rem" }}>
                    <div className="card-header">
                        <span className="card-title">📝 ข้อมูลบิล</span>
                        <div style={{ display: "flex", gap: "0.5rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            <kbd className="kbd-hint">Enter</kbd> = ช่องถัดไป
                        </div>
                    </div>
                    <div className="card-body">
                        <div style={{ display: "grid", gridTemplateColumns: "120px 180px 160px 1fr 200px", gap: "1rem", alignItems: "end" }}>
                            <div className="form-group">
                                <label className="form-label">เล่มที่</label>
                                <input
                                    className="form-control invoice-field"
                                    data-field-id="bookNo"
                                    ref={(el) => registerRef("bookNo", el)}
                                    value={form.bookNo}
                                    onChange={(e) => setForm({ ...form, bookNo: e.target.value })}
                                    placeholder="เช่น 1"
                                    autoComplete="off"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">เลขที่ <span className="required">*</span></label>
                                <input
                                    className="form-control invoice-field"
                                    data-field-id="invoiceNo"
                                    ref={(el) => registerRef("invoiceNo", el)}
                                    required
                                    value={form.invoiceNo}
                                    onChange={(e) => setForm({ ...form, invoiceNo: e.target.value })}
                                    placeholder="เช่น 68/00001"
                                    autoComplete="off"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">วันที่</label>
                                <input
                                    type="date"
                                    className="form-control invoice-field"
                                    data-field-id="date"
                                    ref={(el) => registerRef("date", el)}
                                    value={form.date}
                                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">ลูกค้า <span className="required">*</span></label>
                                <select
                                    className="form-control invoice-field"
                                    data-field-id="customerId"
                                    ref={(el) => registerRef("customerId", el)}
                                    required
                                    value={form.customerId}
                                    onChange={(e) => setForm({ ...form, customerId: e.target.value })}
                                >
                                    <option value="">— เลือกลูกค้า —</option>
                                    {customers.map((c) => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">ประเภทบิล</label>
                                <select
                                    className="form-control invoice-field"
                                    data-field-id="billType"
                                    ref={(el) => registerRef("billType", el)}
                                    value={form.billType}
                                    onChange={(e) => setForm({ ...form, billType: e.target.value })}
                                >
                                    <option value="1">ใบกำกับภาษี/ใบส่งของ</option>
                                    <option value="2">ใบเสร็จรับเงิน</option>
                                    <option value="3">ใบแจ้งหนี้</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ===== Items Table ===== */}
                <div className="card" style={{ marginBottom: "1rem" }}>
                    <div className="card-header">
                        <span className="card-title">📦 รายการสินค้า</span>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={addItem}>+ เพิ่มรายการ</button>
                    </div>
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ width: "40px" }}>#</th>
                                    <th style={{ width: "220px" }}>สินค้า</th>
                                    <th>รายละเอียด</th>
                                    <th className="td-number" style={{ width: "130px" }}>จำนวน (ลิตร)</th>
                                    <th className="td-number" style={{ width: "130px" }}>ราคา/หน่วย</th>
                                    <th className="td-number" style={{ width: "140px" }}>จำนวนเงิน</th>
                                    <th style={{ width: "45px" }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, i) => (
                                    <tr key={i} className={item.amount && parseFloat(item.amount) > 0 ? "item-row-filled" : ""}>
                                        <td className="td-center" style={{ fontWeight: 600, color: "var(--text-muted)" }}>{i + 1}</td>
                                        <td>
                                            <select
                                                className="form-control invoice-field"
                                                data-field-id={`item-${i}-product`}
                                                ref={(el) => registerRef(`item-${i}-product`, el)}
                                                value={item.productId}
                                                onChange={(e) => updateItem(i, "productId", e.target.value)}
                                                style={{ padding: "0.35rem 0.5rem" }}
                                            >
                                                <option value="">— เลือกสินค้า —</option>
                                                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                            </select>
                                        </td>
                                        <td>
                                            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", padding: "0 0.5rem" }}>
                                                {item.description || "—"}
                                            </span>
                                        </td>
                                        <td>
                                            <input
                                                className="form-control invoice-field td-number"
                                                data-field-id={`item-${i}-liters`}
                                                ref={(el) => registerRef(`item-${i}-liters`, el)}
                                                type="number"
                                                step="0.01"
                                                value={item.liters}
                                                onChange={(e) => updateItem(i, "liters", e.target.value)}
                                                placeholder="0.00"
                                                style={{ textAlign: "right", padding: "0.35rem 0.5rem" }}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                className="form-control invoice-field td-number"
                                                data-field-id={`item-${i}-price`}
                                                ref={(el) => registerRef(`item-${i}-price`, el)}
                                                type="number"
                                                step="0.0001"
                                                value={item.unitPrice}
                                                onChange={(e) => updateItem(i, "unitPrice", e.target.value)}
                                                placeholder="0.0000"
                                                style={{ textAlign: "right", padding: "0.35rem 0.5rem" }}
                                            />
                                        </td>
                                        <td className="td-number" style={{ fontWeight: 700, color: parseFloat(item.amount) > 0 ? "var(--primary)" : "var(--text-light)", fontSize: "0.95rem" }}>
                                            {(parseFloat(item.amount) || 0).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="td-center">
                                            {items.length > 1 && (
                                                <button type="button" className="btn btn-ghost btn-sm" style={{ color: "var(--danger)", padding: "0.2rem" }} onClick={() => removeItem(i)} tabIndex={-1}>
                                                    ✕
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ===== Summary ===== */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "1rem" }}>
                    <div className="card">
                        <div className="card-body">
                            <div className="form-group">
                                <label className="form-label">หมายเหตุ</label>
                                <textarea
                                    className="form-control invoice-field"
                                    data-field-id="note"
                                    ref={(el) => registerRef("note", el)}
                                    rows={3}
                                    value={form.note}
                                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                                    placeholder="หมายเหตุเพิ่มเติม..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            <div className="invoice-summary-row">
                                <span>ยอดรวม</span>
                                <span className="invoice-summary-value">{subtotal.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="invoice-summary-row">
                                <span>ส่วนลด</span>
                                <input
                                    className="form-control invoice-field"
                                    data-field-id="discount"
                                    ref={(el) => registerRef("discount", el)}
                                    type="number"
                                    step="0.01"
                                    value={form.discount}
                                    onChange={(e) => setForm({ ...form, discount: e.target.value })}
                                    style={{ width: "120px", textAlign: "right", padding: "0.3rem 0.5rem" }}
                                />
                            </div>
                            <div className="invoice-summary-row">
                                <span>VAT</span>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                    <input
                                        className="form-control"
                                        type="number"
                                        step="0.01"
                                        value={form.vatRate}
                                        onChange={(e) => setForm({ ...form, vatRate: e.target.value })}
                                        style={{ width: "55px", textAlign: "right", padding: "0.3rem 0.5rem" }}
                                        tabIndex={-1}
                                    />
                                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>% = {vatAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                            <hr style={{ border: "none", borderTop: "2px solid var(--primary)", margin: "0.25rem 0" }} />
                            <div className="invoice-summary-row">
                                <span style={{ fontWeight: 700, fontSize: "1.05rem" }}>รวมทั้งสิ้น</span>
                                <span style={{ fontWeight: 700, fontSize: "1.25rem", color: "var(--primary)" }}>
                                    {total.toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท
                                </span>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-lg"
                                data-field-id="submit"
                                ref={(el) => registerRef("submit", el)}
                                disabled={saving}
                                style={{ marginTop: "0.5rem", justifyContent: "center", width: "100%" }}
                            >
                                {saving ? (
                                    <><span className="spinner" style={{ width: 16, height: 16 }}></span> กำลังบันทึก...</>
                                ) : (
                                    "💾 บันทึกบิล (Enter)"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
