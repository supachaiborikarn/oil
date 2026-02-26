"use client";
import { useState } from "react";
import { format } from "date-fns";
import Link from "next/link";

export default function TaxCenterPage() {
    const [month, setMonth] = useState(format(new Date(), "yyyy-MM"));
    const [dailyDate, setDailyDate] = useState(format(new Date(), "yyyy-MM-dd"));

    return (
        <div>
            <div className="page-header">
                <div>
                    <div className="page-title">📁 ศูนย์รวมเอกสารบัญชีและภาษี</div>
                    <div className="page-subtitle">รวบรวมรายงานที่จำเป็นสำหรับการปิดงบและนำส่งสรรพากร</div>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>

                {/* 1. รายงานภาษีขาย */}
                <div className="card" style={{ display: "flex", flexDirection: "column" }}>
                    <div className="card-header" style={{ borderBottom: "none", paddingBottom: 0 }}>
                        <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🧾</div>
                        <h3 style={{ margin: 0, color: "var(--text-color)" }}>รายงานภาษีขาย</h3>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: "0.5rem 0 0 0" }}>
                            สรุปยอดขายจากใบกำกับภาษีเต็มรูป เพื่อนำส่งภาษีขายประจำเดือน
                        </p>
                    </div>
                    <div className="card-body" style={{ marginTop: "auto", display: "flex", gap: "0.5rem", flexDirection: "column" }}>
                        <label style={{ fontSize: "0.85rem", color: "var(--text-light)" }}>เลือกเดือน</label>
                        <input type="month" className="form-control" value={month} onChange={(e) => setMonth(e.target.value)} />
                        <button
                            className="btn btn-primary"
                            style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }}
                            onClick={() => {
                                const [y, m] = month.split("-");
                                const lastDay = new Date(parseInt(y), parseInt(m), 0).getDate();
                                window.open(`/dashboard/reports/sales/print?from=${month}-01&to=${month}-${lastDay}`, "_blank");
                            }}
                        >
                            🖨️ พิมพ์รายงานภาษีขาย
                        </button>
                    </div>
                </div>

                {/* 2. รายงานภาษีซื้อ */}
                <div className="card" style={{ display: "flex", flexDirection: "column" }}>
                    <div className="card-header" style={{ borderBottom: "none", paddingBottom: 0 }}>
                        <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🚛</div>
                        <h3 style={{ margin: 0, color: "var(--text-color)" }}>รายงานภาษีซื้อ</h3>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: "0.5rem 0 0 0" }}>
                            สรุปยอดซื้อน้ำมันและการขอคืนภาษีมูลค่าเพิ่มประจำเดือน
                        </p>
                    </div>
                    <div className="card-body" style={{ marginTop: "auto", display: "flex", gap: "0.5rem", flexDirection: "column" }}>
                        <label style={{ fontSize: "0.85rem", color: "var(--text-light)" }}>เลือกเดือน</label>
                        <input type="month" className="form-control" value={month} onChange={(e) => setMonth(e.target.value)} />
                        <button
                            className="btn btn-primary"
                            style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }}
                            onClick={() => window.open(`/dashboard/reports/vat/print-purchases?month=${month}`, "_blank")}
                        >
                            🖨️ พิมพ์รายงานภาษีซื้อ
                        </button>
                    </div>
                </div>

                {/* 3. รายงานสินค้าและวัตถุดิบ */}
                <div className="card" style={{ display: "flex", flexDirection: "column" }}>
                    <div className="card-header" style={{ borderBottom: "none", paddingBottom: 0 }}>
                        <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🛢️</div>
                        <h3 style={{ margin: 0, color: "var(--text-color)" }}>รายงานสินค้าคงเหลือ</h3>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: "0.5rem 0 0 0" }}>
                            บัญชีคุมสต็อกน้ำมัน (ยอดยกมา รับเข้า จ่ายออก คงเหลือ)
                        </p>
                    </div>
                    <div className="card-body" style={{ marginTop: "auto", display: "flex", gap: "0.5rem", flexDirection: "column" }}>
                        <label style={{ fontSize: "0.85rem", color: "var(--text-light)" }}>เลือกเดือน</label>
                        <input type="month" className="form-control" value={month} onChange={(e) => setMonth(e.target.value)} />
                        <button
                            className="btn btn-primary"
                            style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }}
                            onClick={() => window.open(`/dashboard/reports/stock/print?month=${month}`, "_blank")}
                        >
                            🖨️ พิมพ์รายงานสต็อก
                        </button>
                    </div>
                </div>

                {/* 4. รายงาน ก.ข.ค. */}
                <div className="card" style={{ display: "flex", flexDirection: "column", border: "2px solid var(--primary)", gridColumn: "1 / -1" }}>
                    <div className="card-header" style={{ borderBottom: "none", paddingBottom: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📊</div>
                                <h3 style={{ margin: 0, color: "var(--text-color)" }}>เอกสารสรุปยอดขายประจำวัน (ก.ข.ค.)</h3>
                                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: "0.5rem 0 0 0" }}>
                                    ใบสรุปปิดกะรายวัน แสดงข้อมูลรวมมิเตอร์, สต็อกไม้หยั่งถัง และยอดขายทั้งหมดในหน้าเดียว (เพื่อแนบส่งสำนักงานบัญชีทุกวัน)
                                </p>
                            </div>
                            <span className="badge badge-primary">ใหม่ล่าสุด</span>
                        </div>
                    </div>
                    <div className="card-body" style={{ marginTop: "auto", display: "flex", gap: "1rem", alignItems: "flex-end" }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: "0.85rem", color: "var(--text-light)" }}>เลือกวันที่ต้องการสรุป</label>
                            <input type="date" className="form-control" value={dailyDate} onChange={(e) => setDailyDate(e.target.value)} />
                        </div>
                        <button
                            className="btn btn-primary"
                            style={{ padding: "0.6rem 1.5rem" }}
                            onClick={() => window.open(`/dashboard/tax/print-daily?date=${dailyDate}`, "_blank")}
                        >
                            🖨️ พิมพ์สรุปยอดใบ ก.ข.ค.
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
