import { useMemo } from "react";
import { getSHGStats, getAllSHGSummaries, getMembersBySHG, getHealthStatus, fmt } from "../data/dataService";
import { Badge } from "../components/Badge";
import { StatCard } from "../components/StatCard";
import { DataTable } from "../components/DataTable";

export default function ReportsPage({ selectedSHG }) {
    const stats = useMemo(() => getSHGStats(selectedSHG), [selectedSHG]);
    const summaries = useMemo(() => getAllSHGSummaries(), []);
    const members = useMemo(() => getMembersBySHG(selectedSHG), [selectedSHG]);
    const avgSavings = Math.round(stats.totalSavings / stats.totalMembers);
    const onTimePct = stats.activeLoans > 0 ? Math.round((stats.onTimeEMI / stats.activeLoans) * 100) : 100;

    const roleBreakdown = {};
    members.forEach((m) => { roleBreakdown[m.Role] = (roleBreakdown[m.Role] || 0) + 1; });

    return (
        <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#2d1b10", marginBottom: 4 }}>Reports & Analytics</h1>
            <p style={{ color: "#5d4e37", marginBottom: 20 }}>Comprehensive reports for all SHGs</p>

            {/* current SHG report */}
            <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #d4c5ad", boxShadow: "0 2px 8px rgba(45,27,16,.08)", marginBottom: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#2d1b10", marginBottom: 16, paddingBottom: 10, borderBottom: "2px solid #d4c5ad" }}>
                    Current SHG Report: <span style={{ color: "#d84315" }}>{selectedSHG}</span>
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 16, marginBottom: 20 }}>
                    <StatCard icon="👥" value={stats.totalMembers} label="Members" />
                    <StatCard icon="💰" value={fmt(stats.totalSavings)} label="Savings" />
                    <StatCard icon="📋" value={stats.activeLoans} label="Active Loans" />
                    <StatCard icon="📊" value={stats.avgAttendance + "%"} label="Attendance" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div style={{ background: "#f5f1e8", borderRadius: 10, padding: 16 }}>
                        <h4 style={{ fontSize: 14, fontWeight: 700, color: "#2d1b10", marginBottom: 10 }}>Financial Metrics</h4>
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #d4c5ad", fontSize: 13 }}>
                            <span style={{ color: "#5d4e37" }}>Avg Savings / Member</span>
                            <strong>{fmt(avgSavings)}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13 }}>
                            <span style={{ color: "#5d4e37" }}>EMI On-Time Rate</span>
                            <strong>{onTimePct}%</strong>
                        </div>
                    </div>
                    <div style={{ background: "#f5f1e8", borderRadius: 10, padding: 16 }}>
                        <h4 style={{ fontSize: 14, fontWeight: 700, color: "#2d1b10", marginBottom: 10 }}>Role Breakdown</h4>
                        {Object.entries(roleBreakdown).map(([role, count]) => (
                            <div key={role} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #d4c5ad", fontSize: 13 }}>
                                <span>{role}</span>
                                <strong>{count}</strong>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* all SHGs comparison */}
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#2d1b10", marginBottom: 10 }}>All SHGs Comparison</h3>
            <DataTable
                headers={["SHG Name", "Members", "Savings", "Active Loans", "Attendance", "Health Score"]}
                rows={summaries.map((s) => {
                    const hs = getHealthStatus(s.healthScore);
                    return {
                        cells: [
                            <strong>{s.name}</strong>,
                            s.totalMembers,
                            <strong>{fmt(s.totalSavings)}</strong>,
                            s.activeLoans,
                            s.avgAttendance + "%",
                            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <strong>{s.healthScore}</strong> <Badge type={hs.cls}>{hs.status}</Badge>
                            </span>,
                        ],
                    };
                })}
            />
        </div>
    );
}
