import { useMemo } from "react";
import { getSHGStats, getMembersBySHG, calculateHealthScore, getHealthStatus, fmt } from "../data/dataService";
import { Badge, attendanceBadge, loanBadge, emiBadge } from "../components/Badge";
import { StatCard } from "../components/StatCard";
import { ProgressBar } from "../components/ProgressBar";

export default function DashboardPage({ selectedSHG, role, memberName, setPage }) {
    const stats = useMemo(() => getSHGStats(selectedSHG), [selectedSHG]);
    const members = useMemo(() => getMembersBySHG(selectedSHG), [selectedSHG]);
    const me = useMemo(() => members.find((m) => m.Name === memberName) || null, [members, memberName]);

    /* ─── LEADER DASHBOARD ─── */
    if (role === "leader") {
        const activities = [];
        members.forEach((m) => {
            if (m.LoanStatus === "Active")
                activities.push({ text: `${m.Name} has an active loan of ${fmt(m.LoanAmount)}`, type: "info" });
            if (m.EMIStatus === "Delayed")
                activities.push({ text: `EMI payment delayed for ${m.Name}`, type: "warning" });
        });

        const quickActions = [
            { label: "View All Members", target: "members", icon: "👥" },
            { label: "Manage Loans", target: "loans", icon: "📋" },
            { label: "Generate Reports", target: "reports", icon: "📈" },
            { label: "View Insights", target: "insights", icon: "🧠" },
        ];

        return (
            <div>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: "#2d1b10", marginBottom: 4 }}>Leader Dashboard</h1>
                <p style={{ color: "#5d4e37", marginBottom: 20 }}>Group overview — <strong>{selectedSHG}</strong></p>

                {/* alerts */}
                {stats.delayedEMI > 0 && (
                    <div style={{ padding: "12px 16px", borderRadius: 8, borderLeft: "4px solid #f57c00", background: "rgba(245,124,0,.06)", color: "#f57c00", marginBottom: 16, fontSize: 13 }}>
                        ⚠ <strong>{stats.delayedEMI} member(s)</strong> have delayed EMI payments. Please follow up.
                    </div>
                )}
                {stats.delayedEMI === 0 && stats.onTimeEMI > 0 && (
                    <div style={{ padding: "12px 16px", borderRadius: 8, borderLeft: "4px solid #2e7d32", background: "rgba(46,125,50,.06)", color: "#2e7d32", marginBottom: 16, fontSize: 13 }}>
                        ✓ All <strong>{stats.onTimeEMI}</strong> active loan EMIs are on time.
                    </div>
                )}

                {/* stat cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16, marginBottom: 24 }}>
                    <StatCard icon="👥" value={stats.totalMembers} label="Total Members" />
                    <StatCard icon="💰" value={fmt(stats.totalSavings)} label="Total Savings" />
                    <StatCard icon="📋" value={stats.activeLoans} label="Active Loans" />
                    <StatCard icon="📊" value={stats.avgAttendance + "%"} label="Avg Attendance" />
                </div>

                {/* bottom grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                    {/* quick actions — WIRED */}
                    <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #d4c5ad", boxShadow: "0 2px 8px rgba(45,27,16,.08)" }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#2d1b10", marginBottom: 16, paddingBottom: 10, borderBottom: "2px solid #d4c5ad" }}>Quick Actions</h3>
                        {quickActions.map((qa) => (
                            <button
                                key={qa.target}
                                onClick={() => setPage(qa.target)}
                                style={{
                                    display: "flex", alignItems: "center", gap: 10, width: "100%", marginBottom: 8,
                                    padding: "10px 16px", background: "transparent",
                                    border: "2px solid #d84315", borderRadius: 8,
                                    color: "#d84315", fontWeight: 600, fontSize: 13,
                                    cursor: "pointer", fontFamily: "inherit", transition: "all .2s",
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = "#d84315"; e.currentTarget.style.color = "#fff"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#d84315"; }}
                            >
                                <span>{qa.icon}</span> {qa.label}
                            </button>
                        ))}
                    </div>
                    {/* recent activity */}
                    <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #d4c5ad", boxShadow: "0 2px 8px rgba(45,27,16,.08)" }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#2d1b10", marginBottom: 16, paddingBottom: 10, borderBottom: "2px solid #d4c5ad" }}>Recent Activities</h3>
                        {activities.slice(0, 5).map((a, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 10 }}>
                                <Badge type={a.type}>{a.type}</Badge>
                                <span style={{ fontSize: 12, color: "#5d4e37" }}>{a.text}</span>
                            </div>
                        ))}
                        {activities.length === 0 && <p style={{ color: "#8b7355", fontSize: 13 }}>No recent activities.</p>}
                    </div>
                </div>

                {/* health snapshot */}
                <div style={{ marginTop: 24, background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #d4c5ad", boxShadow: "0 2px 8px rgba(45,27,16,.08)" }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#2d1b10", marginBottom: 12 }}>SHG Health Snapshot</h3>
                    <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                        <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 36, fontWeight: 700, color: "#d84315" }}>{calculateHealthScore(selectedSHG)}</div>
                            <div style={{ fontSize: 11, color: "#5d4e37", textTransform: "uppercase", letterSpacing: 0.5 }}>Health Score</div>
                        </div>
                        <div style={{ flex: 1, minWidth: 160 }}>
                            <ProgressBar value={calculateHealthScore(selectedSHG)} maxW="100%" />
                        </div>
                        <Badge type={getHealthStatus(calculateHealthScore(selectedSHG)).cls}>{getHealthStatus(calculateHealthScore(selectedSHG)).status}</Badge>
                    </div>
                </div>
            </div>
        );
    }

    /* ─── MEMBER DASHBOARD ─── */
    if (!me) {
        return (
            <div style={{ padding: 40, textAlign: "center", color: "#5d4e37" }}>
                <p style={{ fontSize: 16 }}>Could not find your profile. Please log in again.</p>
            </div>
        );
    }

    const hasLoan = me.LoanStatus === "Active";
    const loanClosed = me.LoanStatus === "Closed";
    const savingPct = ((me.Savings / stats.totalSavings) * 100).toFixed(1);

    // personal activity
    const myActivity = [];
    if (hasLoan) myActivity.push({ text: `Your active loan: ${fmt(me.LoanAmount)}`, type: me.EMIStatus === "Delayed" ? "warning" : "info" });
    if (hasLoan && me.EMIStatus === "Delayed") myActivity.push({ text: "Your EMI payment is delayed. Please contact your leader.", type: "warning" });
    if (hasLoan && me.EMIStatus === "On Time") myActivity.push({ text: "Your EMI is on time. Great job!", type: "success" });
    if (loanClosed) myActivity.push({ text: `You successfully completed your loan of ${fmt(me.LoanAmount)}.`, type: "success" });
    if (me.Savings >= 20000) myActivity.push({ text: `Congratulations! Your savings crossed ₹20,000.`, type: "success" });
    myActivity.push({ text: `Next group meeting: February 15, 2026 at 10:00 AM.`, type: "info" });

    return (
        <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#2d1b10", marginBottom: 4 }}>My Dashboard</h1>
            <p style={{ color: "#5d4e37", marginBottom: 20 }}>Welcome, <strong>{me.Name}</strong> — {selectedSHG}</p>

            {/* profile card */}
            <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #d4c5ad", boxShadow: "0 2px 8px rgba(45,27,16,.08)", marginBottom: 24, display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
                {/* avatar */}
                <div style={{ textAlign: "center", minWidth: 100 }}>
                    <div style={{
                        width: 80, height: 80, borderRadius: "50%",
                        background: "linear-gradient(135deg,#d84315,#ffa726)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 32, fontWeight: 700, color: "#fff", margin: "0 auto 10px",
                    }}>
                        {me.Name[0]}
                    </div>
                    <Badge type="info">{me.Role}</Badge>
                </div>
                {/* details */}
                <div style={{ flex: 1, minWidth: 200 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: "#2d1b10", marginBottom: 2 }}>{me.Name}</h2>
                    <p style={{ color: "#5d4e37", fontSize: 13, marginBottom: 12 }}>Age {me.Age} · Joined {me.JoinDate} · {selectedSHG}</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        {[
                            { label: "Attendance", value: me.Attendance + "%", sub: me.Attendance >= 90 ? "Excellent" : me.Attendance >= 80 ? "Good" : "Fair" },
                            { label: "Savings", value: fmt(me.Savings), sub: savingPct + "% of group total" },
                        ].map((item) => (
                            <div key={item.label} style={{ background: "#f5f1e8", borderRadius: 10, padding: "10px 14px" }}>
                                <div style={{ fontSize: 11, color: "#8b7355", textTransform: "uppercase", letterSpacing: 0.5 }}>{item.label}</div>
                                <div style={{ fontSize: 18, fontWeight: 700, color: "#2d1b10", marginTop: 2 }}>{item.value}</div>
                                <div style={{ fontSize: 11, color: "#5d4e37" }}>{item.sub}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* stat cards – personal only */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 16, marginBottom: 24 }}>
                <StatCard icon="📊" value={me.Attendance + "%"} label="My Attendance" />
                <StatCard icon="💰" value={fmt(me.Savings)} label="My Savings" />
                <StatCard icon="📋" value={me.LoanStatus === "None" ? "None" : fmt(me.LoanAmount)} label="My Loan" />
                <StatCard icon="✓" value={me.EMIStatus === "N/A" ? "—" : me.EMIStatus} label="EMI Status" gradientColor={me.EMIStatus === "Delayed" ? "#c62828" : "#2e7d32"} />
            </div>

            {/* attendance progress */}
            <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #d4c5ad", boxShadow: "0 2px 8px rgba(45,27,16,.08)", marginBottom: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#2d1b10", marginBottom: 10 }}>Attendance Progress</h3>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <ProgressBar value={me.Attendance} maxW={240} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#2d1b10" }}>{me.Attendance}%</span>
                    {attendanceBadge(me.Attendance)}
                </div>
                <p style={{ fontSize: 12, color: "#8b7355", marginTop: 8 }}>
                    {me.Attendance >= 90 ? "Keep it up! You have excellent attendance." : me.Attendance >= 80 ? "Good attendance. Try to attend more meetings to reach Excellent." : "Consider attending more meetings to improve your record."}
                </p>
            </div>

            {/* loan status card (only if has/had loan) */}
            {me.LoanStatus !== "None" && (
                <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #d4c5ad", boxShadow: "0 2px 8px rgba(45,27,16,.08)", marginBottom: 20 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#2d1b10", marginBottom: 12 }}>Loan Details</h3>
                    <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                        <div style={{ flex: 1, minWidth: 140 }}>
                            <div style={{ fontSize: 11, color: "#8b7355", textTransform: "uppercase", letterSpacing: 0.5 }}>Loan Amount</div>
                            <div style={{ fontSize: 22, fontWeight: 700, color: "#2d1b10" }}>{fmt(me.LoanAmount)}</div>
                        </div>
                        <div style={{ flex: 1, minWidth: 140 }}>
                            <div style={{ fontSize: 11, color: "#8b7355", textTransform: "uppercase", letterSpacing: 0.5 }}>Status</div>
                            <div style={{ marginTop: 4 }}>{loanBadge(me.LoanStatus)}</div>
                        </div>
                        <div style={{ flex: 1, minWidth: 140 }}>
                            <div style={{ fontSize: 11, color: "#8b7355", textTransform: "uppercase", letterSpacing: 0.5 }}>EMI Status</div>
                            <div style={{ marginTop: 4 }}>{emiBadge(me.EMIStatus)}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* personal activity feed */}
            <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #d4c5ad", boxShadow: "0 2px 8px rgba(45,27,16,.08)" }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#2d1b10", marginBottom: 16, paddingBottom: 10, borderBottom: "2px solid #d4c5ad" }}>Your Activity</h3>
                {myActivity.map((a, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                        <Badge type={a.type}>{a.type}</Badge>
                        <span style={{ fontSize: 12.5, color: "#5d4e37" }}>{a.text}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
