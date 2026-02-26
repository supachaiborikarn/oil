"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

const navItems = [
    {
        section: "ภาพรวม",
        items: [
            { href: "/dashboard", icon: "📊", label: "แดชบอร์ด" },
        ],
    },
    {
        section: "งานประจำวัน",
        items: [
            { href: "/dashboard/meters", icon: "⏱️", label: "บันทึกมิเตอร์" },
            { href: "/dashboard/oil-prices", icon: "💰", label: "ราคาน้ำมันวันนี้" },
            { href: "/dashboard/invoices", icon: "🧾", label: "ออกบิลขาย" },
            { href: "/dashboard/purchases", icon: "🚛", label: "รับน้ำมันเข้า" },
            { href: "/dashboard/stocks/tanks", icon: "📏", label: "ไม้หยั่งถัง" },
            { href: "/dashboard/stocks/adjustments", icon: "⚖️", label: "เกลี่ยยอดน้ำมัน" },
        ],
    },
    {
        section: "ข้อมูลหลัก",
        items: [
            { href: "/dashboard/customers", icon: "👥", label: "ลูกค้า" },
            { href: "/dashboard/suppliers", icon: "🏭", label: "ผู้จัดจำหน่าย" },
            { href: "/dashboard/products", icon: "⛽", label: "น้ำมัน/สินค้า" },
        ],
    },
    {
        section: "รายงาน",
        items: [
            { href: "/dashboard/reports/sales", icon: "📈", label: "ยอดขาย" },
            { href: "/dashboard/reports/meters", icon: "📉", label: "สรุปมิเตอร์" },
            { href: "/dashboard/reports/vat", icon: "📋", label: "ภาษี VAT" },
            { href: "/dashboard/reports/stock", icon: "🛢️", label: "สต็อกน้ำมัน" },
            { href: "/dashboard/reports/debt", icon: "⚠️", label: "ยอดค้างชำระ" },
            { href: "/dashboard/tax", icon: "📁", label: "เอกสารทางบัญชี/ภาษี" },
        ],
    },
    {
        section: "ตั้งค่า",
        items: [
            { href: "/dashboard/settings", icon: "⚙️", label: "ตั้งค่าระบบ" },
            { href: "/dashboard/users", icon: "👤", label: "ผู้ใช้งาน" },
        ],
    },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <h1>⛽ OIL SEVE</h1>
                <p>ระบบจัดการน้ำมันเชื้อเพลิง</p>
            </div>

            {session?.user && (
                <div className="sidebar-office">
                    สาขา: <span>{(session.user as any).officeName || "—"}</span>
                </div>
            )}

            <nav className="sidebar-nav">
                {navItems.map((group) => {
                    // Hide "ตั้งค่า" section for STAFF
                    if (group.section === "ตั้งค่า" && (session?.user as any)?.role === "STAFF") {
                        return null;
                    }

                    return (
                        <div key={group.section}>
                            <div className="nav-section-title">{group.section}</div>
                            {group.items.map((item) => {
                                const isActive = item.href === "/dashboard"
                                    ? pathname === "/dashboard"
                                    : pathname.startsWith(item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`nav-item${isActive ? " active" : ""}`}
                                    >
                                        <span className="nav-icon">{item.icon}</span>
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>
                    );
                })}
            </nav>

            <div className="sidebar-footer">
                <div style={{ marginBottom: "0.5rem", color: "rgba(255,255,255,0.55)", fontSize: "0.8rem" }}>
                    {session?.user?.name || session?.user?.email}
                </div>
                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    style={{
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: "6px",
                        color: "rgba(255,255,255,0.6)",
                        padding: "0.4rem 0.75rem",
                        fontSize: "0.78rem",
                        cursor: "pointer",
                        width: "100%",
                        textAlign: "left",
                    }}
                >
                    🚪 ออกจากระบบ
                </button>
            </div>
        </aside>
    );
}
