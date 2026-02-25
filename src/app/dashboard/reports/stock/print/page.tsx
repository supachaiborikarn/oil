"use client";
import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

function StockReportPrintContent() {
    const searchParams = useSearchParams();
    const month = searchParams.get("month");

    const [report, setReport] = useState<{ office: any, stock: any[] } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (month !== null) fetchData();
    }, [month]);

    async function fetchData() {
        setLoading(true);
        try {
            const url = month ? `/api/reports/stock?month=${month}` : "/api/reports/stock";
            const res = await fetch(url);
            if (res.ok) setReport(await res.json());
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    }

    if (loading) {
        return <div style={{ padding: "2rem", textAlign: "center" }}>กำลังเตรียมรายงานสำหรับพิมพ์...</div>;
    }

    if (!report || !report.stock) {
        return <div style={{ padding: "2rem", textAlign: "center" }}>ไม่พบข้อมูลสต็อก</div>;
    }

    let totalOpening = 0;
    let totalIncoming = 0;
    let totalOutgoing = 0;
    let totalRemaining = 0;

    const dateStr = month ? new Date(month + "-01") : new Date();

    return (
        <div style={{ maxWidth: "210mm", margin: "0 auto", padding: "10mm", background: "white", color: "black", fontSize: "12pt", fontFamily: "'Sarabun', sans-serif" }}>
            <div className="no-print" style={{ marginBottom: "1rem", textAlign: "right" }}>
                <button className="btn btn-primary" onClick={() => window.print()}>
                    🖨️ พิมพ์หน้านี้
                </button>
            </div>

            <div className="print-report-header" style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                <div style={{ fontSize: "16pt", fontWeight: "bold" }}>รายงานสรุปสินค้าและวัตถุดิบ (น้ำมันเชื้อเพลิง)</div>
                <div style={{ fontSize: "12pt", marginTop: "0.25rem" }}>
                    เดือน {dateStr.toLocaleDateString("th-TH", { month: "long" })} ปี {dateStr.toLocaleDateString("th-TH", { year: "numeric" })}
                </div>
            </div>

            <div style={{ marginBottom: "1rem", fontSize: "11pt", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                    <div><strong>ชื่อผู้ประกอบการ:</strong> {report?.office?.name || "-"}</div>
                    <div><strong>สถานประกอบการ:</strong> {report?.office?.name || "-"}</div>
                    <div><strong>ที่อยู่:</strong> {report?.office?.address || "-"}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                    <div><strong>เลขประจำตัวผู้เสียภาษีอากร:</strong> {report?.office?.taxId || "-"}</div>
                    <div><strong>สำนักงานใหญ่ / สาขาที่:</strong> 00000</div>
                </div>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11pt", border: "1px solid black" }}>
                <thead>
                    <tr>
                        <th style={{ border: "1px solid black", padding: "6px" }}>ลำดับที่</th>
                        <th style={{ border: "1px solid black", padding: "6px" }}>รายการ (ชนิดสินค้า)</th>
                        <th style={{ border: "1px solid black", padding: "6px" }}>ยอดยกมา (ลิตร)</th>
                        <th style={{ border: "1px solid black", padding: "6px" }}>รับเข้า (ลิตร)</th>
                        <th style={{ border: "1px solid black", padding: "6px" }}>จ่ายออก (ลิตร)</th>
                        <th style={{ border: "1px solid black", padding: "6px" }}>คงเหลือ (ลิตร)</th>
                    </tr>
                </thead>
                <tbody>
                    {report.stock.map((s, idx) => {
                        totalOpening += Number(s.openingBalance);
                        totalIncoming += Number(s.incoming);
                        totalOutgoing += Number(s.outgoing);
                        totalRemaining += Number(s.remaining);

                        return (
                            <tr key={s.oilType}>
                                <td style={{ border: "1px solid black", padding: "6px", textAlign: "center" }}>{idx + 1}</td>
                                <td style={{ border: "1px solid black", padding: "6px" }}>{s.label}</td>
                                <td style={{ border: "1px solid black", padding: "6px", textAlign: "right" }}>{Number(s.openingBalance).toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
                                <td style={{ border: "1px solid black", padding: "6px", textAlign: "right" }}>{Number(s.incoming).toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
                                <td style={{ border: "1px solid black", padding: "6px", textAlign: "right" }}>{Number(s.outgoing).toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
                                <td style={{ border: "1px solid black", padding: "6px", textAlign: "right", fontWeight: "bold" }}>{Number(s.remaining).toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
                            </tr>
                        );
                    })}
                </tbody>
                <tfoot>
                    <tr>
                        <th colSpan={2} style={{ border: "1px solid black", padding: "6px", textAlign: "right", fontWeight: "bold" }}>
                            รวมยอดสุทธิ
                        </th>
                        <th style={{ border: "1px solid black", padding: "6px", textAlign: "right", fontWeight: "bold" }}>
                            {totalOpening.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                        </th>
                        <th style={{ border: "1px solid black", padding: "6px", textAlign: "right", fontWeight: "bold" }}>
                            {totalIncoming.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                        </th>
                        <th style={{ border: "1px solid black", padding: "6px", textAlign: "right", fontWeight: "bold" }}>
                            {totalOutgoing.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                        </th>
                        <th style={{ border: "1px solid black", padding: "6px", textAlign: "right", fontWeight: "bold" }}>
                            {totalRemaining.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                        </th>
                    </tr>
                </tfoot>
            </table>

            <div style={{ marginTop: "2.5rem", display: "flex", justifyContent: "end" }}>
                <div style={{ textAlign: "center" }}>
                    <div>ผู้ตรวจสอบ ...........................................................</div>
                    <div style={{ marginTop: "0.25rem" }}>( ........................................................... )</div>
                    <div style={{ marginTop: "0.25rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>วันที่พิมพ์: {new Date().toLocaleDateString("th-TH")}</div>
                </div>
            </div>

            <style jsx global>{`
                @media print {
                   @page { margin: 15mm; size: A4 portrait; }
                   body { background: white !important; }
                   .no-print { display: none !important; }
                   .sidebar, .topbar { display: none !important; }
                   .main-content { margin-left: 0 !important; }
                }
            `}</style>
        </div>
    );
}

export default function StockReportPrintPage() {
    return (
        <Suspense fallback={<div style={{ padding: "2rem", textAlign: "center" }}>กำลังเตรียมรายงานสำหรับพิมพ์...</div>}>
            <StockReportPrintContent />
        </Suspense>
    );
}
