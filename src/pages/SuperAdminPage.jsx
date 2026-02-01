import { useState, useEffect } from "react";
import { Sidebar } from "../components/Sidebar";

export default function SuperAdminPage() {
    const [data, setData] = useState({
        totalSanctioned: 0,
        leaders: []
    });
    const [loading, setLoading] = useState(true);
    const [selectedLeader, setSelectedLeader] = useState(null);
    const [amount, setAmount] = useState("");

    const fetchLeaders = () => {
        fetch('http://localhost:3001/api/users')
            .then(res => res.json())
            .then(users => {
                const leaders = users.filter(u => u.role === "leader");
                const total = leaders.reduce((acc, l) => acc + (l.walletBalance || 0), 0);
                setData({ totalSanctioned: total, leaders });
                setLoading(false);
            })
            .catch(err => console.error("Failed to fetch leaders", err));
    };

    useEffect(() => {
        fetchLeaders();
    }, []);

    const handleSanction = async (e) => {
        e.preventDefault();
        if (!selectedLeader || !amount) return;

        try {
            const res = await fetch('http://localhost:3001/api/admin/sanction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leaderUsername: selectedLeader.username, amount })
            });
            const json = await res.json();
            if (json.success) {
                alert(`Funds sanctioned to ${selectedLeader.shg}!`);
                setAmount("");
                setSelectedLeader(null);
                fetchLeaders(); // Refresh data
            } else {
                alert("Failed: " + json.message);
            }
        } catch (err) {
            alert("Error processing sanction");
        }
    };

    return (
        <div style={{ padding: 8 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#2d1b10", marginBottom: 24 }}>System Administration</h1>

            {/* Overview Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24, marginBottom: 32 }}>
                <div style={{ background: "#d84315", color: "#fff", padding: 24, borderRadius: 20 }}>
                    <div style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: 1, opacity: 0.9 }}>Total Funds Sanctioned</div>
                    <div style={{ fontSize: 32, fontWeight: 700, marginTop: 8 }}>₹{data.totalSanctioned.toLocaleString()}</div>
                </div>
                <div style={{ background: "#fff", padding: 24, borderRadius: 20, border: "1px solid #eee" }}>
                    <div style={{ fontSize: 13, color: "#8b7355", textTransform: "uppercase", letterSpacing: 1 }}>Active SHG Leaders</div>
                    <div style={{ fontSize: 32, fontWeight: 700, color: "#2d1b10", marginTop: 8 }}>{data.leaders.length}</div>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
                {/* Sanction Form */}
                <div style={{ background: "#fff", padding: 24, borderRadius: 20, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
                    <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Sanction New Funds</h2>
                    <form onSubmit={handleSanction} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div>
                            <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Select SHG Leader</label>
                            <select
                                style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid #ddd" }}
                                onChange={e => {
                                    const l = data.leaders.find(x => x.username === e.target.value);
                                    setSelectedLeader(l);
                                }}
                                value={selectedLeader ? selectedLeader.username : ""}
                            >
                                <option value="">-- Select Leader --</option>
                                {data.leaders.map(l => (
                                    <option key={l.username} value={l.username}>{l.shg} ({l.username})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Amount (₹)</label>
                            <input
                                type="number"
                                style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid #ddd" }}
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                placeholder="Ex. 500000"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={!selectedLeader || !amount}
                            style={{
                                marginTop: 8, padding: 16, background: "#d84315", color: "#fff", border: "none",
                                borderRadius: 12, fontWeight: 600, cursor: "pointer", opacity: (!selectedLeader || !amount) ? 0.5 : 1
                            }}
                        >
                            Confirm Sanction
                        </button>
                    </form>
                </div>

                {/* Leader Budgets List */}
                <div style={{ background: "#fff", padding: 24, borderRadius: 20, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
                    <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>SHG Wallet Balances</h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {loading ? <div>Loading...</div> : data.leaders.map(l => (
                            <div key={l.username} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12, background: "#fdfbf7", borderRadius: 12 }}>
                                <div>
                                    <div style={{ fontWeight: 600, color: "#2d1b10" }}>{l.shg}</div>
                                    <div style={{ fontSize: 12, color: "#8b7355" }}>@{l.username}</div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <div style={{ fontWeight: 700, color: "#00897b" }}>₹{(l.walletBalance || 0).toLocaleString()}</div>
                                    <div style={{ fontSize: 11, color: "#8b7355" }}>Available</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
