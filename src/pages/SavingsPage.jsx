import { useMemo } from "react";
import { getSHGStats, getMembersBySHG, fmt } from "../data/dataService";
import { Badge, attendanceBadge } from "../components/Badge";
import { StatCard } from "../components/StatCard";
import { ProgressBar } from "../components/ProgressBar";
import { DataTable } from "../components/DataTable";

export default function SavingsPage({ selectedSHG, role, memberName }) {
    const members = useMemo(() => getMembersBySHG(selectedSHG), [selectedSHG]);
    const stats = useMemo(() => getSHGStats(selectedSHG), [selectedSHG]);
    const me = useMemo(() => members.find((m) => m.Name === memberName) || null, [members, memberName]);
    const excellentCount = members.filter((m) => m.Attendance >= 90).length;
    const avgSavings = Math.round(stats.totalSavings / stats.totalMembers);

    const savingsSorted = [...members].sort((a, b) => b.Savings - a.Savings);
    const attSorted = [...members].sort((a, b) => b.Attendance - a.Attendance);

    function savingStatus(s) {
        if (s >= 20000) return { label: "Excellent", type: "success" };
        if (s >= 15000) return { label: "Good", type: "info" };
        if (s >= 10000) return { label: "Fair", type: "warning" };
        return { label: "Growing", type: "secondary" };
    }

    /* ─── MEMBER VIEW ─── */
    if (role === "member" && me) {
        const savPct = ((me.Savings / stats.totalSavings) * 100).toFixed(1);
        const ss = savingStatus(me.Savings);
        const myRank = savingsSorted.findIndex((m) => m.Name === me.Name) + 1;
        const attRank = attSorted.findIndex((m) => m.Name === me.Name) + 1;
        return (
            <div>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: "#2d1b10", marginBottom: 4 }}>My Savings & Attendance</h1>
                <p style={{ color: "#5d4e37", marginBottom: 20 }}>Your personal savings and participation overview</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 16, marginBottom: 24 }}>
                    <StatCard icon="💰" value={fmt(me.Savings)} label="My Savings" />
                    <StatCard icon="📊" value={me.Attendance + "%"} label="My Attendance" />
                    <StatCard icon="📈" value={savPct + "%"} label="Group Contribution" />
                    <StatCard icon="🏅" value={"#" + myRank} label="Savings Rank" gradientColor="#00897b" />
                </div>

                {/* savings card */}
                <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #d4c5ad", boxShadow: "0 2px 8px rgba(45,27,16,.08)", marginBottom: 20 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#2d1b10", marginBottom: 14 }}>Savings Details</h3>
                    <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                        <div style={{ flex: 1, minWidth: 140, background: "#f5f1e8", borderRadius: 10, padding: 16 }}>
                            <div style={{ fontSize: 11, color: "#8b7355", textTransform: "uppercase", letterSpacing: 0.5 }}>Total Saved</div>
                            <div style={{ fontSize: 24, fontWeight: 700, color: "#2d1b10", marginTop: 4 }}>{fmt(me.Savings)}</div>
                            <div style={{ marginTop: 6 }}><Badge type={ss.type}>{ss.label}</Badge></div>
                        </div>
                        <div style={{ flex: 1, minWidth: 140, background: "#f5f1e8", borderRadius: 10, padding: 16 }}>
                            <div style={{ fontSize: 11, color: "#8b7355", textTransform: "uppercase", letterSpacing: 0.5 }}>% of Group Total</div>
                            <div style={{ fontSize: 24, fontWeight: 700, color: "#2d1b10", marginTop: 4 }}>{savPct}%</div>
                            <div style={{ marginTop: 8 }}><ProgressBar value={parseFloat(savPct) * 5} maxW={120} /></div>
                        </div>
                        <div style={{ flex: 1, minWidth: 140, background: "#f5f1e8", borderRadius: 10, padding: 16 }}>
                            <div style={{ fontSize: 11, color: "#8b7355", textTransform: "uppercase", letterSpacing: 0.5 }}>Savings Rank</div>
                            <div style={{ fontSize: 24, fontWeight: 700, color: "#00897b", marginTop: 4 }}>#{myRank} <span style={{ fontSize: 13, color: "#5d4e37" }}>of {members.length}</span></div>
                        </div>
                    </div>
                </div>

                {/* attendance card */}
                <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #d4c5ad", boxShadow: "0 2px 8px rgba(45,27,16,.08)" }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#2d1b10", marginBottom: 14 }}>Attendance Details</h3>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
                        <ProgressBar value={me.Attendance} maxW={260} />
                        <span style={{ fontSize: 16, fontWeight: 700, color: "#2d1b10" }}>{me.Attendance}%</span>
                        {attendanceBadge(me.Attendance)}
                    </div>
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                        <div style={{ background: "#f5f1e8", borderRadius: 10, padding: "10px 16px", flex: 1, minWidth: 140 }}>
                            <div style={{ fontSize: 11, color: "#8b7355", textTransform: "uppercase" }}>Attendance Rank</div>
                            <div style={{ fontSize: 20, fontWeight: 700, color: "#00897b", marginTop: 2 }}>#{attRank} <span style={{ fontSize: 12, color: "#5d4e37" }}>of {members.length}</span></div>
                        </div>
                        <div style={{ background: "#f5f1e8", borderRadius: 10, padding: "10px 16px", flex: 1, minWidth: 140 }}>
                            <div style={{ fontSize: 11, color: "#8b7355", textTransform: "uppercase" }}>Group Average</div>
                            <div style={{ fontSize: 20, fontWeight: 700, color: "#2d1b10", marginTop: 2 }}>{stats.avgAttendance}%</div>
                        </div>
                    </div>
                    <p style={{ fontSize: 12, color: "#8b7355", marginTop: 12 }}>
                        {me.Attendance >= 90 ? "Excellent attendance! You are among the top contributors." : me.Attendance >= 80 ? "Good attendance. A few more meetings will get you to Excellent." : "Try attending more meetings to improve your record."}
                    </p>
                </div>
            </div>
        );
    }

    /* ─── LEADER VIEW (full group) ─── */
    return (
        <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#2d1b10", marginBottom: 4 }}>Savings & Attendance</h1>
            <p style={{ color: "#5d4e37", marginBottom: 20 }}>Track member savings and meeting participation</p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 16, marginBottom: 24 }}>
                <StatCard icon="💰" value={fmt(stats.totalSavings)} label="Total Savings" />
                <StatCard icon="📊" value={fmt(avgSavings)} label="Avg Savings" />
                <StatCard icon="✓" value={stats.avgAttendance + "%"} label="Avg Attendance" />
                <StatCard icon="⭐" value={excellentCount} label="Excellent Attendance" />
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#2d1b10", marginBottom: 10 }}>Member Savings</h3>
            <DataTable
                headers={["Name", "Role", "Savings", "Contribution %", "Status"]}
                rows={savingsSorted.map((m) => {
                    const pct = ((m.Savings / stats.totalSavings) * 100).toFixed(1);
                    const s = savingStatus(m.Savings);
                    return {
                        cells: [<strong>{m.Name}</strong>, <Badge type="info">{m.Role}</Badge>, <strong>{fmt(m.Savings)}</strong>, pct + "%", <Badge type={s.type}>{s.label}</Badge>],
                    };
                })}
            />

            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#2d1b10", marginTop: 24, marginBottom: 10 }}>Attendance Summary</h3>
            <DataTable
                headers={["Name", "Role", "Rate", "Progress", "Status"]}
                rows={attSorted.map((m) => ({
                    cells: [<strong>{m.Name}</strong>, <Badge type="info">{m.Role}</Badge>, m.Attendance + "%", <ProgressBar value={m.Attendance} maxW={140} />, attendanceBadge(m.Attendance)],
                }))}
            />
        </div>
    );
}
