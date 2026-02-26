"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function UsersPage() {
    const { data: session } = useSession();
    const [users, setUsers] = useState<Record<string, unknown>[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
    const [form, setForm] = useState({ name: "", email: "", password: "", role: "STAFF", active: true });

    // Only Admin & Manager can view this page
    const canManageUsers = (session?.user as Record<string, unknown>)?.role === "ADMIN" || (session?.user as Record<string, unknown>)?.role === "SUPERADMIN";

    async function fetchData() {
        setLoading(true);
        try {
            const res = await fetch("/api/users");
            if (res.ok) setUsers(await res.json());
        } catch (e) { console.error(e); }
        setLoading(false);
    }

    useEffect(() => { fetchData(); }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const method = editing ? "PUT" : "POST";
        const url = editing ? `/api/users/${editing.id}` : "/api/users";

        // Remove password if it's empty during edit
        const payload = { ...form };
        if (editing && !payload.password) {
            delete (payload as Record<string, unknown>).password;
        }

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            setShowModal(false);
            setEditing(null);
            fetchData();
        } else {
            const data = await res.json();
            alert(data.error || "Failed to save user");
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("ต้องการลบผู้ใช้งานนี้ใช่หรือไม่?")) return;
        const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
        if (res.ok) fetchData();
        else {
            const data = await res.json();
            alert(data.error || "Failed to delete user");
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function openEdit(u: any) {
        setEditing(u);
        setForm({ name: u.name, email: u.email, password: "", role: u.role, active: u.active });
        setShowModal(true);
    }

    function openNew() {
        setEditing(null);
        setForm({ name: "", email: "", password: "", role: "STAFF", active: true });
        setShowModal(true);
    }

    const roleColors: Record<string, string> = {
        SUPERADMIN: "var(--danger)",
        ADMIN: "var(--primary)",
        MANAGER: "var(--warning)",
        STAFF: "var(--success)"
    };

    const roleLabels: Record<string, string> = {
        SUPERADMIN: "Super Admin",
        ADMIN: "แอดมิน (Admin)",
        MANAGER: "ผู้จัดการ (Manager)",
        STAFF: "พนักงาน (Staff)"
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <div className="page-title">👥 ผู้ใช้งาน (Users)</div>
                    <div className="page-subtitle">{users.length} บัญชี</div>
                </div>
                {canManageUsers && (
                    <button className="btn btn-primary" onClick={openNew}>+ เพิ่มผู้ใช้งาน</button>
                )}
            </div>

            <div className="card">
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>ชื่อ</th>
                                <th>อีเมล</th>
                                <th>สิทธิ์ (Role)</th>
                                <th>สถานะ</th>
                                <th>วันที่สร้าง</th>
                                {canManageUsers && <th className="td-center">จัดการ</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="td-center"><span className="spinner" /></td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan={6}>
                                    <div className="empty-state">
                                        <div className="empty-state-icon">👥</div>
                                        <div className="empty-state-title">ยังไม่มีข้อมูล</div>
                                    </div>
                                </td></tr>
                            ) : users.map(userItem => {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                const u: any = userItem;
                                return (
                                    <tr key={u.id} className={!u.active ? "opacity-50" : ""}>
                                        <td style={{ fontWeight: 500 }}>{u.name}</td>
                                        <td>{u.email}</td>
                                        <td>
                                            <span className="badge" style={{ backgroundColor: roleColors[u.role] + "20", color: roleColors[u.role] }}>
                                                {roleLabels[u.role] || u.role}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${u.active ? "badge-success" : "badge-secondary"}`}>
                                                {u.active ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                                            {new Date(u.createdAt).toLocaleDateString("th-TH")}
                                        </td>
                                        {canManageUsers && (
                                            <td className="td-center">
                                                <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                                                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(u)}>✏️</button>
                                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                    {(session?.user as any)?.id !== u.id && (
                                                        <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(u.id)} style={{ color: "var(--danger)" }}>🗑️</button>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && canManageUsers && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">{editing ? "แก้ไข" : "เพิ่ม"}ผู้ใช้งาน</div>
                            <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">ชื่อ-นามสกุล <span className="required">*</span></label>
                                        <input className="form-control" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">อีเมล (ใช้สำหรับ Login) <span className="required">*</span></label>
                                        <input className="form-control" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">
                                            รหัสผ่าน {editing ? <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>(เว้นว่างไว้ถ้าไม่ต้องการเปลี่ยน)</span> : <span className="required">*</span>}
                                        </label>
                                        <input className="form-control" type="password" required={!editing} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} minLength={6} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">สิทธิ์การใช้งาน (Role) <span className="required">*</span></label>
                                        <select className="form-control" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                                            <option value="ADMIN">แอดมิน (Admin) - จัดการได้ทุกอย่าง</option>
                                            <option value="MANAGER">ผู้จัดการ (Manager) - ดูรายงานได้</option>
                                            <option value="STAFF">พนักงาน (Staff) - บันทึกข้อมูลได้</option>
                                        </select>
                                    </div>
                                    <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                                        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                                            <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} style={{ width: "1.2rem", height: "1.2rem" }} />
                                            <span>เปิดใช้งานบัญชีนี้ (Active)</span>
                                        </label>
                                    </div>
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
