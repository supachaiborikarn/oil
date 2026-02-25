"use client";
import { useState, useEffect } from "react";
import { format } from "date-fns";

interface DashboardStats {
    todaySales: number;
    todayBillCount: number;
    monthSales: number;
    monthBillCount: number;
    unpaidCount: number;
    unpaidTotal: number;
    customerCount: number;
}

export default function DashboardPage() {
    const [stats] = useState<DashboardStats>({
        todaySales: 0, todayBillCount: 0,
        monthSales: 0, monthBillCount: 0,
        unpaidCount: 0, unpaidTotal: 0, customerCount: 0,
    });

    const today = format(new Date(), "dd/MM/yyyy");

    return (
        <div>
            <div className="page-header">
                <div>
                    <div className="page-title">แดชบอร์ด</div>
                    <div className="page-subtitle">วันที่ {today} · ภาพรวมธุรกิจ</div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <a href="/dashboard/invoices/new" className="btn btn-primary">+ ออกบิลใหม่</a>
                    <a href="/dashboard/meters" className="btn btn-secondary">⏱️ บันทึกมิเตอร์</a>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="stats-grid" style={{ marginBottom: "1.25rem" }}>
                <div className="stat-card">
                    <div className="stat-icon blue">📊</div>
                    <div>
                        <div className="stat-label">ยอดขายวันนี้</div>
                        <div className="stat-value">{stats.todaySales.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</div>
                        <div className="stat-sub">{stats.todayBillCount} บิล</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green">📈</div>
                    <div>
                        <div className="stat-label">ยอดขายเดือนนี้</div>
                        <div className="stat-value">{stats.monthSales.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</div>
                        <div className="stat-sub">{stats.monthBillCount} บิล</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon amber">⚠️</div>
                    <div>
                        <div className="stat-label">ยอดค้างชำระ</div>
                        <div className="stat-value">{stats.unpaidTotal.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</div>
                        <div className="stat-sub">{stats.unpaidCount} บิล</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon purple">👥</div>
                    <div>
                        <div className="stat-label">ลูกค้าทั้งหมด</div>
                        <div className="stat-value">{stats.customerCount}</div>
                        <div className="stat-sub">ราย</div>
                    </div>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                {/* Oil Prices Today */}
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">💰 ราคาน้ำมันวันนี้</span>
                        <a href="/dashboard/oil-prices" className="btn btn-ghost btn-sm">แก้ไข →</a>
                    </div>
                    <div className="card-body">
                        <div className="empty-state" style={{ padding: "2rem 1rem" }}>
                            <div className="empty-state-icon">💰</div>
                            <div className="empty-state-title">ยังไม่ได้กรอกราคาวันนี้</div>
                            <div className="empty-state-desc" style={{ marginTop: "0.75rem" }}>
                                <a href="/dashboard/oil-prices" className="btn btn-primary btn-sm">กรอกราคา</a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">⚡ ทำรายการด่วน</span>
                    </div>
                    <div className="card-body">
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                            {[
                                { href: "/dashboard/invoices/new", icon: "🧾", label: "ออกบิลขาย", desc: "สร้างใบแจ้งหนี้ใหม่" },
                                { href: "/dashboard/meters", icon: "⏱️", label: "บันทึกมิเตอร์", desc: "บันทึกเลขมิเตอร์วันนี้" },
                                { href: "/dashboard/purchases/new", icon: "🚛", label: "รับน้ำมันเข้า", desc: "บันทึกการสั่งซื้อ" },
                                { href: "/dashboard/oil-prices", icon: "💰", label: "อัปเดตราคาน้ำมัน", desc: "กำหนดราคาขายวันนี้" },
                                { href: "/dashboard/reports/debt", icon: "⚠️", label: "ตรวจสอบหนี้ค้าง", desc: "รายชื่อลูกค้าค้างชำระ" },
                            ].map((action) => (
                                <a key={action.href} href={action.href} className="quick-action-item">
                                    <span style={{ fontSize: "1.2rem" }}>{action.icon}</span>
                                    <div>
                                        <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text)" }}>{action.label}</div>
                                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{action.desc}</div>
                                    </div>
                                    <span style={{ marginLeft: "auto", color: "var(--text-light)" }}>›</span>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
