"use client";
import { useState, useEffect } from "react";

export default function SuppliersPage() {
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [form, setForm] = useState({ code: "", name: "", address: "", taxId: "", phone: "", vatRate: "7" });

    useEffect(() => { fetchData(); }, []);

    async function fetchData() {
        setLoading(true);
        try {
            const res = await fetch("/api/suppliers");
            if (res.ok) setSuppliers(await res.json());
        } catch (e) { console.error(e); }
        setLoading(false);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const method = editing ? "PUT" : "POST";
        const url = editing ? `/api/suppliers/${editing.id}` : "/api/suppliers";
        const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        if (res.ok) { setShowModal(false); setEditing(null); fetchData(); }
    }

    function openEdit(s: any) {
        setEditing(s);
        setForm({ code: s.code, name: s.name, address: s.address || "", taxId: s.taxId || "", phone: s.phone || "", vatRate: String(s.vatRate || 7) });
        setShowModal(true);
    }

    function openNew() {
        setEditing(null);
        setForm({ code: "", name: "", address: "", taxId: "", phone: "", vatRate: "7" });
        setShowModal(true);
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <div className="page-title">🏭 ผู้จัดจำหน่าย</div>
                    <div className="page-subtitle">{suppliers.length} ราย</div>
                </div>
                <button className="btn btn-primary" onClick={openNew}>+ เพิ่มผู้จัดจำหน่าย</button>
            </div>

            <div className="card">
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr><th>รหัส</th><th>ชื่อ</th><th>ที่อยู่</th><th>เลขผู้เสียภาษี</th><th>โทร</th><th className="td-number">VAT %</th><th className="td-center">จัดการ</th></tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} className="td-center"><span className="spinner" /></td></tr>
                            ) : suppliers.length === 0 ? (
                                <tr><td colSpan={7}><div className="empty-state"><div className="empty-state-icon">🏭</div><div className="empty-state-title">ยังไม่มีข้อมูล</div></div></td></tr>
                            ) : suppliers.map(s => (
                                <tr key={s.id}>
                                    <td style={{ fontWeight: 500 }}>{s.code}</td>
                                    <td>{s.name}</td>
                                    <td style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{s.address || "—"}</td>
                                    <td style={{ fontSize: "0.82rem" }}>{s.taxId || "—"}</td>
                                    <td>{s.phone || "—"}</td>
                                    <td className="td-number">{s.vatRate}%</td>
                                    <td className="td-center"><button className="btn btn-ghost btn-sm" onClick={() => openEdit(s)}>✏️</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">{editing ? "แก้ไข" : "เพิ่ม"}ผู้จัดจำหน่าย</div>
                            <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-grid">
                                    <div className="form-group"><label className="form-label">รหัส <span className="required">*</span></label><input className="form-control" required value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} /></div>
                                    <div className="form-group"><label className="form-label">ชื่อ <span className="required">*</span></label><input className="form-control" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                                    <div className="form-group"><label className="form-label">ที่อยู่</label><input className="form-control" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
                                    <div className="form-group"><label className="form-label">เลขผู้เสียภาษี</label><input className="form-control" value={form.taxId} onChange={e => setForm({ ...form, taxId: e.target.value })} /></div>
                                    <div className="form-group"><label className="form-label">โทรศัพท์</label><input className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                                    <div className="form-group"><label className="form-label">VAT %</label><input className="form-control" type="number" value={form.vatRate} onChange={e => setForm({ ...form, vatRate: e.target.value })} /></div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>ยกเลิก</button>
                                <button type="submit" className="btn btn-primary">บันทึก</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
