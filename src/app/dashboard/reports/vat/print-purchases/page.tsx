"use client";
import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

function PurchaseTaxReportPrintContent() {
    const searchParams = useSearchParams();
    const month = searchParams.get("month");

    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (month) fetchData();
    }, [month]);

    async function fetchData() {
        setLoading(true);
        try {
            const res = await fetch(`/api/reports/vat?month=${month}`);
            if (res.ok) setReport(await res.json());
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    }

    if (loading) {
        return <div style={{ padding: "2rem", textAlign: "center" }}>กำลังเตรียมรายงานสำหรับพิมพ์...</div>;
    }

    if (!report || !report.purchaseInvoices) {
        return <div style={{ padding: "2rem", textAlign: "center" }}>ไม่พบข้อมูลบิลซื้อ</div>;
    }

    // Sort purchase invoices sequentially by date, then purchaseNo
    const sortedInvoices = [...report.purchaseInvoices].sort((a, b) => {
        const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
        if (dateDiff === 0) return (a.purchaseNo || "").localeCompare(b.purchaseNo || "");
        return dateDiff;
    });

    let cumulativeTotal = 0;
    let cumulativeVat = 0;

    const dateStr = month ? new Date(month + "-01") : new Date();

    return (
        <div style={{ maxWidth: "210mm", margin: "0 auto", padding: "10mm", background: "white", color: "black", fontSize: "12pt", fontFamily: "'Sarabun', sans-serif" }}>
            <div className="no-print" style={{ marginBottom: "1rem", textAlign: "right" }}>
                <button className="btn btn-primary" onClick={() => window.print()}>
                    🖨️ พิมพ์หน้านี้
                </button>
            </div>

            <div className="print-report-header" style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                <div style={{ fontSize: "16pt", fontWeight: "bold" }}>รายงานภาษีซื้อ</div>
                <div style={{ fontSize: "12pt", marginTop: "0.25rem" }}>
                    เดือน {dateStr.toLocaleDateString("th-TH", { month: "long" })} ปี {dateStr.toLocaleDateString("th-TH", { year: "numeric" })}
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
                        <th rowSpan={2} style={{ border: "1px solid black", padding: "4px" }}>วัน เดือน ปี<br />ที่ออกใบกำกับภาษี</th>
                        <th rowSpan={2} style={{ border: "1px solid black", padding: "4px" }}>เล่มที่/เลขที่</th>
                        <th rowSpan={2} style={{ border: "1px solid black", padding: "4px" }}>ชื่อผู้ขายสินค้า/บริการ</th>
                        <th rowSpan={2} style={{ border: "1px solid black", padding: "4px" }}>เลขประจำตัวผู้เสียภาษีผู้ขาย</th>
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
                        const totalWithoutVat = Number(inv.subtotal);
                        cumulativeTotal += totalWithoutVat;
                        cumulativeVat += Number(inv.vatAmount);
                        const isHQ = inv.supplier?.vatType !== "BRANCH"; // Assuming if not specified it is HQ, or you can map from vatType

                        return (
                            <tr key={inv.id}>
                                <td style={{ border: "1px solid black", padding: "4px", textAlign: "center" }}>{idx + 1}</td>
                                <td style={{ border: "1px solid black", padding: "4px", textAlign: "center" }}>{new Date(inv.date).toLocaleDateString("th-TH")}</td>
                                <td style={{ border: "1px solid black", padding: "4px" }}>{inv.purchaseNo}</td>
                                <td style={{ border: "1px solid black", padding: "4px" }}>{inv.supplier?.name || "-"}</td>
                                <td style={{ border: "1px solid black", padding: "4px", textAlign: "center" }}>{inv.supplier?.taxId || "-"}</td>
                                <td style={{ border: "1px solid black", padding: "4px", textAlign: "center" }}>{isHQ ? "/" : ""}</td>
                                <td style={{ border: "1px solid black", padding: "4px", textAlign: "center" }}>{isHQ ? "" : "-"}</td>
                                <td style={{ border: "1px solid black", padding: "4px", textAlign: "right" }}>{totalWithoutVat.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
                                <td style={{ border: "1px solid black", padding: "4px", textAlign: "right" }}>{Number(inv.vatAmount).toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
                            </tr>
                        );
                    })}
                    {sortedInvoices.length === 0 && (
                        <tr>
                            <td colSpan={9} style={{ border: "1px solid black", padding: "10px", textAlign: "center", color: "var(--text-muted)" }}>ไม่มีรายการภาษีซื้อในเดือนนี้</td>
                        </tr>
                    )}
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

export default function PurchaseTaxReportPrintPage() {
    return (
        <Suspense fallback={<div style={{ padding: "2rem", textAlign: "center" }}>กำลังเตรียมรายงานสำหรับพิมพ์...</div>}>
            <PurchaseTaxReportPrintContent />
        </Suspense>
    );
}
