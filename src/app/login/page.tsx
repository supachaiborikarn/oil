"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");
        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });
        setLoading(false);
        if (result?.error) {
            setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        } else {
            router.push("/dashboard");
        }
    }

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-logo">
                    <h1>⛽ OIL SEVE</h1>
                    <p>ระบบบริหารจัดการน้ำมันเชื้อเพลิง</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {error && <div className="alert alert-danger">{error}</div>}

                    <div className="form-group">
                        <label className="form-label">อีเมล</label>
                        <input
                            type="email"
                            className="form-control"
                            placeholder="user@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">รหัสผ่าน</label>
                        <input
                            type="password"
                            className="form-control"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        disabled={loading}
                        style={{ marginTop: "0.5rem", justifyContent: "center" }}
                    >
                        {loading ? <span className="spinner" style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "#fff" }} /> : null}
                        {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
                    </button>
                </form>

                <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.72rem", color: "rgba(255,255,255,0.25)" }}>
                    OIL SEVE v2.0 · ระบบจัดการน้ำมัน
                </p>
            </div>
        </div>
    );
}
