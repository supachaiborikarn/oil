import Providers from "@/components/Providers";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <Providers>
            <div className="app-layout">
                <Sidebar />
                <main className="main-content">
                    <div className="page-content">{children}</div>
                </main>
            </div>
        </Providers>
    );
}
