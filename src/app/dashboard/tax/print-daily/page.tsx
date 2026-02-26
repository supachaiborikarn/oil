"use client";
import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

function DailyReportPrintContent() {
   const searchParams = useSearchParams();
   const dateParam = searchParams.get("date");

   const [report, setReport] = useState<any>(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      if (dateParam) fetchData();
   }, [dateParam]);

   async function fetchData() {
      setLoading(true);
      try {
         const res = await fetch(`/api/tax/daily?date=${dateParam}`);
         if (res.ok) setReport(await res.json());
      } catch (e) {
         console.error(e);
      }
      setLoading(false);
   }

   if (loading) return <div style={{ padding: "2rem", textAlign: "center" }}>กำลังเตรียมสรุปเอกสารประจำวัน...</div>;
   if (!report) return <div style={{ padding: "2rem", textAlign: "center" }}>ไม่พบข้อมูลของวันดังกล่าว</div>;

   const dateStr = new Date(dateParam || "").toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });

   return (
      <div style={{ maxWidth: "210mm", margin: "0 auto", padding: "10mm", background: "white", color: "black", fontSize: "11pt", fontFamily: "'Sarabun', sans-serif" }}>
         <div className="no-print" style={{ marginBottom: "1rem", textAlign: "right" }}>
            <button className="btn btn-primary" onClick={() => window.print()}>
               🖨️ พิมพ์หน้านี้
            </button>
         </div>

         <div className="print-report-header" style={{ textAlign: "center", marginBottom: "1rem" }}>
            <div style={{ fontSize: "16pt", fontWeight: "bold" }}>รายงานสรุปยอดขายประจำวัน (ก.ข.ค.)</div>
            <div style={{ fontSize: "12pt", marginTop: "0.25rem" }}>
               ประจำวันที่ {dateStr}
            </div>
         </div>

         <div style={{ marginBottom: "1rem", fontSize: "10pt", borderBottom: "1px solid #ccc", paddingBottom: "0.5rem" }}>
            <div><strong>ชื่อผู้ประกอบการ:</strong> {report?.office?.name || "-"} &nbsp;&nbsp; <strong>สถานประกอบการ:</strong> {report?.office?.name || "-"}</div>
         </div>

         {/* ส่วน ก. มิเตอร์ */}
         <div style={{ marginBottom: "1rem" }}>
            <div style={{ fontWeight: "bold", marginBottom: "0.5rem", fontSize: "12pt" }}>ส่วนที่ 1 (ก.): รายงานการขายน้ำมันเชื้อเพลิงทางมิเตอร์หัวจ่าย</div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9pt", border: "1px solid black" }}>
               <thead>
                  <tr>
                     <th style={{ border: "1px solid black", padding: "4px" }}>เบอร์ถัง/ตู้อ้างอิง</th>
                     <th style={{ border: "1px solid black", padding: "4px" }}>ประเภทน้ำมัน</th>
                     <th style={{ border: "1px solid black", padding: "4px" }}>เลขมาตรวัดเริ่มต้น</th>
                     <th style={{ border: "1px solid black", padding: "4px" }}>เลขมาตรวัดสิ้นสุด</th>
                     <th style={{ border: "1px solid black", padding: "4px" }}>ยอดขาย (ลิตร)</th>
                  </tr>
               </thead>
               <tbody>
                  {report.partA_meters?.length === 0 ? (
                     <tr><td colSpan={5} style={{ border: "1px solid black", padding: "4px", textAlign: "center" }}>ไม่มีการจดมิเตอร์ในวันนี้</td></tr>
                  ) : (
                     report.partA_meters?.map((m: any, idx: number) => (
                        <tr key={idx}>
                           <td style={{ border: "1px solid black", padding: "4px", textAlign: "center" }}>{m.tankNumber}</td>
                           <td style={{ border: "1px solid black", padding: "4px", textAlign: "center" }}>{m.oilType}</td>
                           <td style={{ border: "1px solid black", padding: "4px", textAlign: "right" }}>{Number(m.startMeter).toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
                           <td style={{ border: "1px solid black", padding: "4px", textAlign: "right" }}>{Number(m.endMeter).toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
                           <td style={{ border: "1px solid black", padding: "4px", textAlign: "right", fontWeight: "bold" }}>{Number(m.liters).toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
                        </tr>
                     ))
                  )}
               </tbody>
            </table>
         </div>

         {/* ส่วน ข. สต็อกและไม้หยั่ง */}
         <div style={{ marginBottom: "1rem", display: "flex", gap: "1rem" }}>
            <div style={{ flex: 1 }}>
               <div style={{ fontWeight: "bold", marginBottom: "0.5rem", fontSize: "12pt" }}>ส่วนที่ 2 (ข.): ปริมาณน้ำมันรับเข้า/จ่ายออกรายชนิด</div>
               <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9pt", border: "1px solid black" }}>
                  <thead>
                     <tr>
                        <th style={{ border: "1px solid black", padding: "4px" }}>ประเภทน้ำมัน</th>
                        <th style={{ border: "1px solid black", padding: "4px" }}>รับเข้า (ลิตร)</th>
                        <th style={{ border: "1px solid black", padding: "4px" }}>ขายหน้าลาน/ออกบิล</th>
                        <th style={{ border: "1px solid black", padding: "4px" }}>เกลี่ยสต็อก</th>
                     </tr>
                  </thead>
                  <tbody>
                     {report.partB_stock?.map((s: any, idx: number) => (
                        <tr key={idx}>
                           <td style={{ border: "1px solid black", padding: "4px" }}>{s.label}</td>
                           <td style={{ border: "1px solid black", padding: "4px", textAlign: "right" }}>{Number(s.incoming).toLocaleString("th-TH")}</td>
                           <td style={{ border: "1px solid black", padding: "4px", textAlign: "right" }}>{Number(s.outgoing).toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
                           <td style={{ border: "1px solid black", padding: "4px", textAlign: "right" }}>{s.adjustments > 0 ? "+" : ""}{Number(s.adjustments).toLocaleString("th-TH")}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>

            <div style={{ flex: 1 }}>
               <div style={{ fontWeight: "bold", marginBottom: "0.5rem", fontSize: "12pt" }}>ส่วนที่ 2 (ข.): ระดับไม้หยั่งถัง (TUNG) ปลายกะ</div>
               <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9pt", border: "1px solid black" }}>
                  <thead>
                     <tr>
                        <th style={{ border: "1px solid black", padding: "4px" }}>ถังเก็บใต้ดิน</th>
                        <th style={{ border: "1px solid black", padding: "4px" }}>ระดับน้ำมัน (มม.)</th>
                        <th style={{ border: "1px solid black", padding: "4px" }}>ปริมาตร (ลิตร)</th>
                     </tr>
                  </thead>
                  <tbody>
                     {report.partB_dips?.length === 0 ? (
                        <tr><td colSpan={3} style={{ border: "1px solid black", padding: "4px", textAlign: "center" }}>ยังไม่มีการจดไม้หยั่งถังวันนี้</td></tr>
                     ) : (
                        report.partB_dips?.map((d: any, idx: number) => (
                           <tr key={idx}>
                              <td style={{ border: "1px solid black", padding: "4px", textAlign: "center" }}>ถังที่ {d.tankNumber} ({d.oilType})</td>
                              <td style={{ border: "1px solid black", padding: "4px", textAlign: "right" }}>{Number(d.dipLevel || 0).toLocaleString("th-TH")}</td>
                              <td style={{ border: "1px solid black", padding: "4px", textAlign: "right", fontWeight: "bold" }}>{Number(d.volume).toLocaleString("th-TH")}</td>
                           </tr>
                        ))
                     )}
                  </tbody>
               </table>
            </div>
         </div>

         {/* ส่วน ค. การเงิน */}
         <div style={{ marginBottom: "1rem" }}>
            <div style={{ fontWeight: "bold", marginBottom: "0.5rem", fontSize: "12pt" }}>ส่วนที่ 3 (ค.): สรุปรายงานการขายและการรับเงินประจำวัน</div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10pt", border: "1px solid black" }}>
               <tbody>
                  <tr>
                     <td style={{ border: "1px solid black", padding: "6px", width: "70%" }}>ยอดรวมใบกำกับภาษีขาย (เงินสด) ประจำวัน (บาท)</td>
                     <td style={{ border: "1px solid black", padding: "6px", textAlign: "right", fontWeight: "bold" }}>
                        {Number(report.partC_financials?.cashSales || 0).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                     </td>
                  </tr>
                  <tr>
                     <td style={{ border: "1px solid black", padding: "6px" }}>ยอดรวมใบกำกับภาษีขาย (เงินเชื่อ/เครดิต) ประจำวัน (บาท)</td>
                     <td style={{ border: "1px solid black", padding: "6px", textAlign: "right", fontWeight: "bold" }}>
                        {Number(report.partC_financials?.creditSales || 0).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                     </td>
                  </tr>
                  <tr style={{ backgroundColor: "#f9f9f9" }}>
                     <td style={{ border: "1px solid black", padding: "6px", fontWeight: "bold" }}>รวมยอดบิลขาย (Invoices) ทั้งหมด ประจำวัน {report.partC_financials?.invoicesCount} ใบ (บาท)</td>
                     <td style={{ border: "1px solid black", padding: "6px", textAlign: "right", fontWeight: "bold", fontSize: "12pt" }}>
                        {Number(report.partC_financials?.totalSalesAmount || 0).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                     </td>
                  </tr>
               </tbody>
            </table>
         </div>

         <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between" }}>
            <div style={{ textAlign: "center", width: "30%" }}>
               <div>พนักงานบัญชี / แคชเชียร์</div>
               <div style={{ marginTop: "1rem" }}>...........................................................</div>
               <div style={{ marginTop: "0.25rem" }}>( ........................................................... )</div>
            </div>
            <div style={{ textAlign: "center", width: "30%" }}>
               <div>ผู้ตรวจสอบ / ผู้จัดการ</div>
               <div style={{ marginTop: "1rem" }}>...........................................................</div>
               <div style={{ marginTop: "0.25rem" }}>( ........................................................... )</div>
            </div>
         </div>

         <style jsx global>{`
                @media print {
                   @page { margin: 10mm; size: A4 portrait; }
                   body { background: white !important; }
                   .no-print { display: none !important; }
                   .sidebar, .topbar { display: none !important; }
                   .main-content { margin-left: 0 !important; }
                }
            `}</style>
      </div>
   );
}

export default function DailyReportPage() {
   return (
      <Suspense fallback={<div style={{ padding: "2rem", textAlign: "center" }}>กำลังเตรียมรายงานสำหรับพิมพ์...</div>}>
         <DailyReportPrintContent />
      </Suspense>
   );
}
