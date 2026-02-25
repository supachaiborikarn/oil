"use client";
import { useState, useEffect } from "react";

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [form, setForm] = useState({
        code: "", name: "", oilType: "D", buyPrice: "", salePrice: "", sendPrice: "",
        unit: "ลิตร", hasVat: false,
    });

    useEffect(() => { fetchProducts(); }, []);

    async function fetchProducts() {
        setLoading(true);
        try {
            const res = await fetch("/api/products");
            if (res.ok) setProducts(await res.json());
        } catch (e) { console.error(e); }
        setLoading(false);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const method = editingProduct ? "PUT" : "POST";
        const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";
        const res = await fetch(url, {
            method, headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });
        if (res.ok) {
            setShowModal(false);
            setEditingProduct(null);
            fetchProducts();
        }
    }

    function openEdit(p: any) {
        setEditingProduct(p);
        setForm({
            code: p.code, name: p.name, oilType: p.oilType, buyPrice: p.buyPrice || "",
            salePrice: p.salePrice || "", sendPrice: p.sendPrice || "", unit: p.unit, hasVat: p.hasVat,
        });
        setShowModal(true);
    }

    function openNew() {
        setEditingProduct(null);
        setForm({ code: "", name: "", oilType: "D", buyPrice: "", salePrice: "", sendPrice: "", unit: "ลิตร", hasVat: false });
        setShowModal(true);
    }

    const oilTypeLabels: Record<string, string> = {
        D: "ดีเซล", B: "เบนซิน", E: "E20", K: "แก๊ส 91", N: "NGV", S: "Super", O: "อื่นๆ",
    };

    const oilTypeBadge: Record<string, string> = {
        D: "badge-diesel", B: "badge-benzin", E: "badge-e20", K: "badge-gas91", N: "badge-info", S: "badge-warning", O: "badge-gray",
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <div className="page-title">⛽ น้ำมัน / สินค้า</div>
                    <div className="page-subtitle">{products.length} รายการ</div>
                </div>
                <button className="btn btn-primary" onClick={openNew}>+ เพิ่มสินค้า</button>
            </div>

            <div className="card">
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>รหัส</th>
                                <th>ชื่อ</th>
                                <th>ประเภท</th>
                                <th className="td-number">ราคาซื้อ</th>
                                <th className="td-number">ราคาขาย</th>
                                <th className="td-number">ราคาส่ง</th>
                                <th>หน่วย</th>
                                <th>VAT</th>
                                <th className="td-center">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={9} className="td-center"><span className="spinner" /></td></tr>
                            ) : products.length === 0 ? (
                                <tr><td colSpan={9}>
                                    <div className="empty-state">
                                        <div className="empty-state-icon">⛽</div>
                                        <div className="empty-state-title">ยังไม่มีสินค้า</div>
                                    </div>
                                </td></tr>
                            ) : (
                                products.map((p) => (
                                    <tr key={p.id}>
                                        <td style={{ fontWeight: 500 }}>{p.code}</td>
                                        <td>{p.name}</td>
                                        <td><span className={`badge ${oilTypeBadge[p.oilType] || "badge-gray"}`}>{oilTypeLabels[p.oilType] || p.oilType}</span></td>
                                        <td className="td-number">{Number(p.buyPrice).toFixed(4)}</td>
                                        <td className="td-number">{Number(p.salePrice).toFixed(4)}</td>
                                        <td className="td-number">{Number(p.sendPrice).toFixed(4)}</td>
                                        <td>{p.unit}</td>
                                        <td>{p.hasVat ? <span className="badge badge-info">VAT</span> : "—"}</td>
                                        <td className="td-center">
                                            <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>✏️</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">{editingProduct ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}</div>
                            <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">รหัสสินค้า <span className="required">*</span></label>
                                        <input className="form-control" required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">ชื่อสินค้า <span className="required">*</span></label>
                                        <input className="form-control" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">ประเภทน้ำมัน</label>
                                        <select className="form-control" value={form.oilType} onChange={(e) => setForm({ ...form, oilType: e.target.value })}>
                                            {Object.entries(oilTypeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">หน่วย</label>
                                        <input className="form-control" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">ราคาซื้อ</label>
                                        <input className="form-control" type="number" step="0.0001" value={form.buyPrice} onChange={(e) => setForm({ ...form, buyPrice: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">ราคาขาย</label>
                                        <input className="form-control" type="number" step="0.0001" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">ราคาส่ง</label>
                                        <input className="form-control" type="number" step="0.0001" value={form.sendPrice} onChange={(e) => setForm({ ...form, sendPrice: e.target.value })} />
                                    </div>
                                    <div className="form-group" style={{ justifyContent: "center" }}>
                                        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                                            <input type="checkbox" checked={form.hasVat} onChange={(e) => setForm({ ...form, hasVat: e.target.checked })} />
                                            <span className="form-label" style={{ margin: 0 }}>มี VAT</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>ยกเลิก</button>
                                <button type="submit" className="btn btn-primary">{editingProduct ? "บันทึก" : "เพิ่มสินค้า"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
