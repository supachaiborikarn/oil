import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OIL SEVE — ระบบจัดการน้ำมัน",
  description: "ระบบบริหารจัดการน้ำมันเชื้อเพลิง",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
