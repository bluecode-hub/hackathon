import { useState, useEffect } from "react";
import { Badge } from "../components/Badge";

// Helper for tabs
const TabButton = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        style={{
            padding: "10px 20px",
            background: active ? "#2d1b10" : "transparent",
            color: active ? "#fff" : "#8b7355",
            border: "none", borderRadius: 24,
            fontWeight: 600, cursor: "pointer", transition: "all .2s"
        }}
    >
        {children}
    </button>
);

export default function LoansPage({ selectedSHG, role, memberName }) {
    const [activeTab, setActiveTab] = useState("active");

    // Real Data State
    const [currentUser, setCurrentUser] = useState(null);
    const [shgMembers, setShgMembers] = useState([]);
    const [walletBalance, setWalletBalance] = useState(0);

    // Modal State
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [assignTarget, setAssignTarget] = useState("");
    const [assignAmount, setAssignAmount] = useState("");

    const fetchData = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/users');
            const users = await res.json();

            if (role === 'leader') {
                const me = users.find(u => u.role === 'leader' && u.shg === selectedSHG);
                if (me) {
                    setCurrentUser(me);
                    setWalletBalance(me.walletBalance || 0);
                }
                const myMembers = users.filter(u => u.role === 'member' && u.shg === selectedSHG);
                setShgMembers(myMembers);
            } else {
                // I am a member
                const me = users.find(u => u.role === 'member' && u.name === memberName); // Using name match for now as ID isn't in props easily
                if (me) setCurrentUser(me);
            }
        } catch (err) {
            console.error("Fetch error", err);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedSHG, role, memberName]);

    const handleAssignLoan = async (e) => {
        e.preventDefault();
        if (!currentUser || !assignTarget || !assignAmount) return;

        try {
            const res = await fetch('http://localhost:3001/api/loans/assign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    leaderUsername: currentUser.username,
                    memberUsername: assignTarget,
                    amount: assignAmount
                })
            });
            const json = await res.json();
            if (json.success) {
                alert("Loan assigned successfully!");
                setShowAssignModal(false);
                setAssignAmount("");
                setAssignTarget("");
                fetchData(); // Refresh data
            } else {
                alert("Failed: " + json.message);
            }
        } catch (err) {
            alert("Error assigning loan");
        }
    };

    // ─── LEADER VIEW ───
    if (role === "leader") {
        return (
            <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: "#2d1b10", margin: 0 }}>Loans & Requests</h1>
                    <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 12, color: "#8b7355" }}>Available Budget</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: "#00897b" }}>₹{walletBalance.toLocaleString()}</div>
                    </div>
                </div>

                <div style={{ display: "flex", gap: 12, marginBottom: 24, padding: 4, background: "#fff", borderRadius: 28, width: "fit-content" }}>
                    <TabButton active={activeTab === "active"} onClick={() => setActiveTab("active")}>My Members</TabButton>
                    <TabButton active={activeTab === "requests"} onClick={() => setActiveTab("requests")}>Requests</TabButton>
                </div>

                {activeTab === "active" ? (
                    <>
                        <div style={{ marginBottom: 16 }}>
                            <button
                                onClick={() => setShowAssignModal(true)}
                                style={{ padding: "12px 24px", background: "#d84315", color: "#fff", border: "none", borderRadius: 12, fontWeight: 600, cursor: "pointer" }}
                            >
                                + Assign New Loan
                            </button>
                        </div>

                        <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", border: "1px solid #eee" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead style={{ background: "#fdfbf7" }}>
                                    <tr>
                                        <th style={{ textAlign: "left", padding: 16, fontSize: 13, color: "#8b7355" }}>Member</th>
                                        <th style={{ textAlign: "left", padding: 16, fontSize: 13, color: "#8b7355" }}>Active Loan</th>
                                        <th style={{ textAlign: "left", padding: 16, fontSize: 13, color: "#8b7355" }}>Status</th>
                                        <th style={{ textAlign: "left", padding: 16, fontSize: 13, color: "#8b7355" }}>EMI Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {shgMembers.map(m => (
                                        <tr key={m.username} style={{ borderBottom: "1px solid #f9f9f9" }}>
                                            <td style={{ padding: 16, fontWeight: 500 }}>{m.name}</td>
                                            <td style={{ padding: 16 }}>₹{(m.fullProfile?.LoanAmount || 0).toLocaleString()}</td>
                                            <td style={{ padding: 16 }}><Badge type="loan" status={m.fullProfile?.LoanStatus || 'None'} /></td>
                                            <td style={{ padding: 16 }}><Badge type="emi" status={m.fullProfile?.EMIStatus || 'N/A'} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <div style={{ padding: 40, textAlign: "center", color: "#888" }}>No pending requests from members.</div>
                )}

                {/* Assign Modal */}
                {showAssignModal && (
                    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
                        <div style={{ background: "#fff", padding: 32, borderRadius: 24, width: 400 }}>
                            <h2 style={{ marginTop: 0 }}>Assign Loan</h2>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Select Member</label>
                                <select
                                    style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid #ddd" }}
                                    onChange={e => setAssignTarget(e.target.value)}
                                    value={assignTarget}
                                >
                                    <option value="">-- Choose Member --</option>
                                    {shgMembers.map(m => (
                                        <option key={m.username} value={m.username}>{m.name} (Curr: ₹{m.fullProfile?.LoanAmount || 0})</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ marginBottom: 24 }}>
                                <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Amount (₹)</label>
                                <input
                                    type="number"
                                    style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid #ddd" }}
                                    value={assignAmount}
                                    onChange={e => setAssignAmount(e.target.value)}
                                />
                                <div style={{ fontSize: 11, marginTop: 4, color: Number(assignAmount) > walletBalance ? "red" : "#888" }}>
                                    Max available: ₹{walletBalance.toLocaleString()}
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: 12 }}>
                                <button onClick={() => setShowAssignModal(false)} style={{ flex: 1, padding: 12, border: "none", background: "#f5f5f5", borderRadius: 12, cursor: "pointer" }}>Cancel</button>
                                <button
                                    onClick={handleAssignLoan}
                                    disabled={!assignTarget || !assignAmount || Number(assignAmount) > walletBalance}
                                    style={{ flex: 1, padding: 12, border: "none", background: "#d84315", color: "#fff", borderRadius: 12, cursor: "pointer", opacity: (!assignTarget || Number(assignAmount) > walletBalance) ? 0.5 : 1 }}
                                >
                                    Assign
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ─── MEMBER VIEW ───
    // Use fetched currentUser for latest stats
    const memberStats = currentUser?.fullProfile || {}; // Fallback

    return (
        <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#2d1b10", marginBottom: 24 }}>My Loan Details</h1>

            {/* Active Loan Card */}
            <div style={{ background: "linear-gradient(135deg, #2d1b10, #4a3b32)", color: "#fff", borderRadius: 24, padding: 32, position: "relative", overflow: "hidden", marginBottom: 32 }}>
                <div style={{ position: "relative", zIndex: 1 }}>
                    <div style={{ fontSize: 14, opacity: 0.8, marginBottom: 8 }}>Active Loan Amount</div>
                    <div style={{ fontSize: 42, fontWeight: 700, marginBottom: 24 }}>₹{(memberStats.LoanAmount || 0).toLocaleString()}</div>

                    <div style={{ display: "flex", gap: 32 }}>
                        <div>
                            <div style={{ fontSize: 12, opacity: 0.6 }}>Status</div>
                            <div style={{ fontSize: 16, fontWeight: 600, color: "#ffecb3" }}>{memberStats.LoanStatus || "None"}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: 12, opacity: 0.6 }}>EMI Status</div>
                            <div style={{ fontSize: 16, fontWeight: 600, color: "#a5d6a7" }}>{memberStats.EMIStatus || "N/A"}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
