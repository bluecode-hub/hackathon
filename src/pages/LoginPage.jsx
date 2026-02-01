import { useState, useEffect } from "react";

export default function LoginPage({ onLogin, onBack }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [demoUsers, setDemoUsers] = useState([]);

    // Fetch demo users for convenience (optional, for hackathon demo)
    useEffect(() => {
        fetch('http://localhost:3001/api/users')
            .then(res => res.json())
            .then(data => setDemoUsers(data.slice(0, 5))) // Show first 5 as hints
            .catch(err => console.error("Backend not running?", err));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('http://localhost:3001/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();

            if (data.success) {
                // Pass the full user object to parent
                onLogin(data.user);
            } else {
                setError(data.message || "Login failed");
            }
        } catch (err) {
            setError("Network error. Ensure server is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,rgba(216,67,21,.06),rgba(255,167,38,.06))", fontFamily: "'Poppins', sans-serif" }}>
            <div style={{ background: "#fff", padding: 40, borderRadius: 24, boxShadow: "0 12px 40px rgba(45,27,16,.1)", width: "100%", maxWidth: 420, textAlign: "center", position: "relative" }}>
                <button onClick={onBack} style={{ position: "absolute", top: 20, left: 20, background: "none", border: "none", fontSize: 24, color: "#8b7355", cursor: "pointer" }}>←</button>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔐</div>
                <h1 style={{ fontSize: 28, fontWeight: 700, color: "#2d1b10", marginBottom: 8 }}>Welcome Back</h1>
                <p style={{ color: "#5d4e37", marginBottom: 24 }}>Enter your credentials to continue</p>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        style={{ padding: 14, borderRadius: 12, border: "1px solid #d4c5ad", fontSize: 15 }}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        style={{ padding: 14, borderRadius: 12, border: "1px solid #d4c5ad", fontSize: 15 }}
                    />

                    {error && <div style={{ color: "#c62828", fontSize: 13 }}>{error}</div>}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: 16, background: loading ? "#ccc" : "#d84315", color: "#fff",
                            border: "none", borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: loading ? "wait" : "pointer"
                        }}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                {/* Demo Hints */}
                <div style={{ marginTop: 24, borderTop: "1px solid #eee", paddingTop: 16 }}>
                    <p style={{ fontSize: 12, color: "#8b7355", marginBottom: 8 }}>Demo Accounts (Password: <strong>password123</strong>):</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                        {demoUsers.length > 0 ? demoUsers.map(u => (
                            <span key={u.username} onClick={() => setUsername(u.username)} style={{ fontSize: 11, padding: "4px 8px", background: "#f5f1e8", borderRadius: 4, cursor: "pointer", color: "#d84315" }}>
                                {u.username} ({u.role})
                            </span>
                        )) : <span style={{ fontSize: 11, color: "#8b7355" }}>Start backend server to see users</span>}
                    </div>
                </div>
            </div>
        </div>
    );
}
