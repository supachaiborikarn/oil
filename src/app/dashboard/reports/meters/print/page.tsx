"use client";
import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

function MetersReportPrintContent() {
    const searchParams = useSearchParams();
    const from = searchParams.get("from") || "";
    const to = searchParams.get("to") || "";

    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [from, to]);

    async function fetchData() {
        setLoading(true);
        try {
            const url = `/api/reports/meters?from=${from}&to=${to}`;
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

    if (!report || !report.byOilType) {
        return <div style={{ padding: "2rem", textAlign: "center" }}>ไม่พบข้อมูลมิเตอร์</div>;
    }

    const { office, totalLiters, totalDays, byOilType } = report;

    const fromDateStr = from ? new Date(from).toLocaleDateString("th-TH") : "-";
    const toDateStr = to ? new Date(to).toLocaleDateString("th-TH") : "-";

    return (
        <div style={{ maxWidth: "210mm", margin: "0 auto", padding: "10mm", background: "white", color: "black", fontSize: "12pt", fontFamily: "'Sarabun', sans-serif" }}>
            <div className="no-print" style={{ marginBottom: "1rem", textAlign: "right" }}>
                <button className="btn btn-primary" onClick={() => window.print()}>
                    🖨️ พิมพ์หน้านี้
                </button>
            </div>

            <div className="print-report-header" style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                <div style={{ fontSize: "16pt", fontWeight: "bold" }}>รายงานสรุปยอดมิเตอร์น้ำมันเชื้อเพลิง</div>
                <div style={{ fontSize: "12pt", marginTop: "0.25rem" }}>
                    ตั้งแต่วันที่ {fromDateStr} ถึง {toDateStr}
                </div>
            </div>

            <div style={{ marginBottom: "1rem", fontSize: "11pt", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                    <div><strong>ชื่อผู้ประกอบการ:</strong> {office?.name || "-"}</div>
                    <div><strong>สถานประกอบการ:</strong> {office?.name || "-"}</div>
                    <div><strong>ที่อยู่:</strong> {office?.address || "-"}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                    <div><strong>เลขประจำตัวผู้เสียภาษีอากร:</strong> {office?.taxId || "-"}</div>
                    <div><strong>สำนักงานใหญ่ / สาขาที่:</strong> 00000</div>
                </div>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11pt", border: "1px solid black", marginBottom: "1rem" }}>
                <thead>
                    <tr style={{ backgroundColor: "#f3f4f6" }}>
                        <th style={{ border: "1px solid black", padding: "8px", textAlign: "left" }}>ประเภทน้ำมัน</th>
                        <th style={{ border: "1px solid black", padding: "8px", textAlign: "right" }}>ปริมาณรวม (ลิตร)</th>
                        <th style={{ border: "1px solid black", padding: "8px", textAlign: "right" }}>เฉลี่ยต่อวัน (ลิตร)</th>
                    </tr>
                </thead>
                <tbody>
                    {byOilType.map((r: any) => (
                        <tr key={r.oilType}>
                            <td style={{ border: "1px solid black", padding: "8px" }}>{r.oilType}</td>
                            <td style={{ border: "1px solid black", padding: "8px", textAlign: "right", fontWeight: "bold" }}>{Number(r.totalLiters).toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
                            <td style={{ border: "1px solid black", padding: "8px", textAlign: "right" }}>{Number(r.avgPerDay).toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr style={{ backgroundColor: "#f3f4f6" }}>
                        <th style={{ border: "1px solid black", padding: "8px", textAlign: "right", fontWeight: "bold" }}>รวมยอดสุทธิ ({totalDays} วัน)</th>
                        <th style={{ border: "1px solid black", padding: "8px", textAlign: "right", fontWeight: "bold", fontSize: "12pt" }}>
                            {Number(totalLiters).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                        </th>
                        <th style={{ border: "1px solid black", padding: "8px", textAlign: "center" }}>-</th>
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

export default function MetersReportPrintPage() {
    return (
        <Suspense fallback={<div style={{ padding: "2rem", textAlign: "center" }}>กำลังเตรียมรายงานสำหรับพิมพ์...</div>}>
            <MetersReportPrintContent />
        </Suspense>
    );
}
