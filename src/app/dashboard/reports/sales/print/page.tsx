"use client";
import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

function SalesReportPrintContent() {
    const searchParams = useSearchParams();
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (from && to) fetchData();
    }, [from, to]);

    async function fetchData() {
        setLoading(true);
        try {
            const reportRes = await fetch(`/api/reports/sales?from=${from}&to=${to}`);
            if (reportRes.ok) setReport(await reportRes.json());
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    }

    if (loading) {
        return <div style={{ padding: "2rem", textAlign: "center" }}>กำลังเตรียมรายงานสำหรับพิมพ์...</div>;
    }

    if (!report || !report.invoices) {
        return <div style={{ padding: "2rem", textAlign: "center" }}>ไม่พบข้อมูลบิลขาย</div>;
    }

    // Sort invoices sequentially
    const sortedInvoices = [...report.invoices].sort((a, b) => {
        // Sort by invoiceNo or date
        return a.invoiceNo.localeCompare(b.invoiceNo);
    });

    let cumulativeTotal = 0;
    let cumulativeVat = 0;

    return (
        <div style={{ maxWidth: "210mm", margin: "0 auto", padding: "10mm", background: "white", color: "black", fontSize: "12pt", fontFamily: "'Sarabun', sans-serif" }}>
            <div className="no-print" style={{ marginBottom: "1rem", textAlign: "right" }}>
                <button className="btn btn-primary" onClick={() => window.print()}>
                    🖨️ พิมพ์หน้านี้
                </button>
            </div>

            <div className="print-report-header" style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                <div style={{ fontSize: "16pt", fontWeight: "bold" }}>รายงานภาษีขาย</div>
                <div style={{ fontSize: "12pt", marginTop: "0.25rem" }}>
                    เดือน {new Date(from || "").toLocaleDateString("th-TH", { month: "long" })} ปี {new Date(from || "").toLocaleDateString("th-TH", { year: "numeric" })}
                </div>
            </div>

            <div style={{ marginBottom: "1rem", fontSize: "11pt", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                    <div><strong>ชื่อผู้ประกอบการ:</strong> {report?.office?.name || "-"}</div>
                    <div><strong>ชื่อสถานประกอบการ:</strong> {report?.office?.name || "-"}</div>
                    <div><strong>ที่อยู่:</strong> {report?.office?.address || "-"}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                    <div><strong>เลขประจำตัวผู้เสียภาษีอากร:</strong> {report?.office?.taxId || "-"}</div>
                    <div><strong>สำนักงานใหญ่ / สาขาที่:</strong> 00000</div>
                </div>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10pt", border: "1px solid black" }}>
                <thead>
                    <tr>
                        <th rowSpan={2} style={{ border: "1px solid black", padding: "4px" }}>ลำดับที่</th>
                        <th rowSpan={2} style={{ border: "1px solid black", padding: "4px" }}>วัน เดือน ปี</th>
                        <th rowSpan={2} style={{ border: "1px solid black", padding: "4px" }}>เล่มที่/เลขที่</th>
                        <th rowSpan={2} style={{ border: "1px solid black", padding: "4px" }}>ชื่อผู้ซื้อสินค้า/บริการ</th>
                        <th rowSpan={2} style={{ border: "1px solid black", padding: "4px" }}>เลขประจำตัวผู้เสียภาษีผู้ซื้อ</th>
                        <th colSpan={2} style={{ border: "1px solid black", padding: "4px" }}>สถานประกอบการ</th>
                        <th rowSpan={2} style={{ border: "1px solid black", padding: "4px" }}>มูลค่าสินค้า<br />หรือบริการ</th>
                        <th rowSpan={2} style={{ border: "1px solid black", padding: "4px" }}>จำนวนเงิน<br />ภาษีมูลค่าเพิ่ม</th>
                    </tr>
                    <tr>
                        <th style={{ border: "1px solid black", padding: "4px" }}>สนญ.</th>
                        <th style={{ border: "1px solid black", padding: "4px" }}>สาขาที่</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedInvoices.map((inv, idx) => {
                        const totalWithoutVat = Number(inv.total) - Number(inv.vatAmount);
                        cumulativeTotal += totalWithoutVat;
                        cumulativeVat += Number(inv.vatAmount);
                        const customerType = inv.customer?.type === "1" ? "สนญ." : "สาขา";

                        return (
                            <tr key={inv.id}>
                                <td style={{ border: "1px solid black", padding: "4px", textAlign: "center" }}>{idx + 1}</td>
                                <td style={{ border: "1px solid black", padding: "4px", textAlign: "center" }}>{new Date(inv.date).toLocaleDateString("th-TH")}</td>
                                <td style={{ border: "1px solid black", padding: "4px" }}>{inv.invoiceNo}</td>
                                <td style={{ border: "1px solid black", padding: "4px" }}>{inv.customer?.name || "เงินสด"}</td>
                                <td style={{ border: "1px solid black", padding: "4px", textAlign: "center" }}>{inv.customer?.taxId || "-"}</td>
                                <td style={{ border: "1px solid black", padding: "4px", textAlign: "center" }}>{inv.customer?.type === "1" ? "/" : ""}</td>
                                <td style={{ border: "1px solid black", padding: "4px", textAlign: "center" }}>{inv.customer?.type === "1" ? "" : "-"}</td>
                                <td style={{ border: "1px solid black", padding: "4px", textAlign: "right" }}>{totalWithoutVat.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
                                <td style={{ border: "1px solid black", padding: "4px", textAlign: "right" }}>{Number(inv.vatAmount).toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
                            </tr>
                        );
                    })}
                </tbody>
                <tfoot>
                    <tr>
                        <th colSpan={7} style={{ border: "1px solid black", padding: "4px", textAlign: "right", fontWeight: "bold" }}>
                            รวมยอดสุทธิ
                        </th>
                        <th style={{ border: "1px solid black", padding: "4px", textAlign: "right", fontWeight: "bold" }}>
                            {cumulativeTotal.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                        </th>
                        <th style={{ border: "1px solid black", padding: "4px", textAlign: "right", fontWeight: "bold" }}>
                            {cumulativeVat.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                        </th>
                    </tr>
                </tfoot>
            </table>

            <div style={{ marginTop: "2rem", display: "flex", justifyContent: "end" }}>
                <div style={{ textAlign: "center" }}>
                    <div>ผู้จัดทำ ...........................................................</div>
                    <div style={{ marginTop: "0.25rem" }}>( ........................................................... )</div>
                    <div style={{ marginTop: "0.25rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>วันที่พิมพ์: {new Date().toLocaleDateString("th-TH")}</div>
                </div>
            </div>

            <style jsx global>{`
                @media print {
                   @page { margin: 10mm; size: A4 landscape; }
                   body { background: white !important; }
                   .no-print { display: none !important; }
                   .sidebar, .topbar { display: none !important; }
                   .main-content { margin-left: 0 !important; }
                }
            `}</style>
        </div>
    );
}

export default function SalesReportPrintPage() {
    return (
        <Suspense fallback={<div style={{ padding: "2rem", textAlign: "center" }}>กำลังเตรียมรายงานสำหรับพิมพ์...</div>}>
            <SalesReportPrintContent />
        </Suspense>
    );
}
