"use client";
import { useState, useEffect } from "react";

interface Customer {
    id: string;
    code: string;
    name: string;
    address: string | null;
    address2: string | null;
    taxId: string | null;
    phone: string | null;
    totalDebt: number;
    type: string | null;
    active: boolean;
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [form, setForm] = useState({
        code: "", name: "", address: "", address2: "", taxId: "", phone: "", type: "1",
    });

    useEffect(() => { fetchCustomers(); }, []);

    async function fetchCustomers() {
        setLoading(true);
        try {
            const res = await fetch("/api/customers");
            if (res.ok) {
                const data = await res.json();
                setCustomers(data);
            }
        } catch (e) { console.error(e); }
        setLoading(false);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const method = editingCustomer ? "PUT" : "POST";
        const url = editingCustomer ? `/api/customers/${editingCustomer.id}` : "/api/customers";
        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });
        if (res.ok) {
            setShowModal(false);
            setEditingCustomer(null);
            setForm({ code: "", name: "", address: "", address2: "", taxId: "", phone: "", type: "1" });
            fetchCustomers();
        }
    }

    function openEdit(c: Customer) {
        setEditingCustomer(c);
        setForm({
            code: c.code, name: c.name, address: c.address || "", address2: c.address2 || "",
            taxId: c.taxId || "", phone: c.phone || "", type: c.type || "1",
        });
        setShowModal(true);
    }

    function openNew() {
        setEditingCustomer(null);
        setForm({ code: "", name: "", address: "", address2: "", taxId: "", phone: "", type: "1" });
        setShowModal(true);
    }

    const filtered = customers.filter(
        (c) =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.code.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div className="page-header">
                <div>
                    <div className="page-title">👥 ลูกค้า</div>
                    <div className="page-subtitle">{customers.length} รายการ</div>
                </div>
                <button className="btn btn-primary" onClick={openNew}>+ เพิ่มลูกค้า</button>
            </div>

            <div className="filter-bar">
                <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input
                        className="form-control"
                        placeholder="ค้นหาชื่อหรือรหัสลูกค้า..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ paddingLeft: "2.25rem" }}
                    />
                </div>
            </div>

            <div className="card">
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>รหัส</th>
                                <th>ชื่อ</th>
                                <th>ที่อยู่</th>
                                <th>เลขผู้เสียภาษี</th>
                                <th className="td-number">ยอดค้างชำระ</th>
                                <th>สถานะ</th>
                                <th className="td-center">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} className="td-center"><span className="spinner" /> กำลังโหลด...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7}>
                                        <div className="empty-state">
                                            <div className="empty-state-icon">👥</div>
                                            <div className="empty-state-title">ไม่พบข้อมูลลูกค้า</div>
                                            <div className="empty-state-desc">ยังไม่มีลูกค้าในระบบ หรือไม่ตรงคำค้นหา</div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((c) => (
                                    <tr key={c.id}>
                                        <td style={{ fontWeight: 500 }}>{c.code}</td>
                                        <td>{c.name}</td>
                                        <td style={{ fontSize: "0.8rem", color: "var(--text-muted)", maxWidth: "250px" }}>
                                            {[c.address, c.address2].filter(Boolean).join(", ")}
                                        </td>
                                        <td style={{ fontSize: "0.82rem" }}>{c.taxId || "—"}</td>
                                        <td className="td-number" style={{ fontWeight: 600, color: c.totalDebt > 0 ? "var(--danger)" : "var(--text)" }}>
                                            {Number(c.totalDebt).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                                        </td>
                                        <td>
                                            <span className={`badge ${c.active ? "badge-success" : "badge-gray"}`}>
                                                {c.active ? "ใช้งาน" : "ปิด"}
                                            </span>
                                        </td>
                                        <td className="td-center">
                                            <button className="btn btn-ghost btn-sm" onClick={() => openEdit(c)}>✏️ แก้ไข</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">{editingCustomer ? "แก้ไขลูกค้า" : "เพิ่มลูกค้าใหม่"}</div>
                            <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">รหัสลูกค้า <span className="required">*</span></label>
                                        <input className="form-control" required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="เช่น 00305" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">ชื่อลูกค้า <span className="required">*</span></label>
                                        <input className="form-control" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="หจก./บจก./..." />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">ที่อยู่</label>
                                        <input className="form-control" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="ที่อยู่ บรรทัดที่ 1" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">ที่อยู่ (ต่อ)</label>
                                        <input className="form-control" value={form.address2} onChange={(e) => setForm({ ...form, address2: e.target.value })} placeholder="อำเภอ/จังหวัด" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">เลขผู้เสียภาษี</label>
                                        <input className="form-control" value={form.taxId} onChange={(e) => setForm({ ...form, taxId: e.target.value })} placeholder="13 หลัก" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">โทรศัพท์</label>
                                        <input className="form-control" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">ประเภท</label>
                                        <select className="form-control" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                                            <option value="1">นิติบุคคล</option>
                                            <option value="2">บุคคลธรรมดา</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>ยกเลิก</button>
                                <button type="submit" className="btn btn-primary">{editingCustomer ? "บันทึก" : "เพิ่มลูกค้า"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
