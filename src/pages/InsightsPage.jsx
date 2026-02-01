import { useMemo } from "react";
import { calculateHealthScore, getHealthStatus, getSHGStats, getAllSHGSummaries, getMembersBySHG, fmt } from "../data/dataService";
import { Badge } from "../components/Badge";
import { ProgressBar } from "../components/ProgressBar";
import { DataTable } from "../components/DataTable";

export default function InsightsPage({ selectedSHG }) {
    const healthScore = useMemo(() => calculateHealthScore(selectedSHG), [selectedSHG]);
    const healthStatus = getHealthStatus(healthScore);
    const stats = useMemo(() => getSHGStats(selectedSHG), [selectedSHG]);
    const summaries = useMemo(() => getAllSHGSummaries(), []);
    const sorted = [...summaries].sort((a, b) => b.healthScore - a.healthScore);

    const emiComp = stats.activeLoans > 0 ? Math.round((stats.onTimeEMI / stats.activeLoans) * 100) : 100;

    // risk
    const risky = summaries.filter((s) => s.healthScore < 80);
    // recommendations
    const recs = [];
    if (stats.avgAttendance < 90) recs.push({ icon: "📊", title: "Improve Attendance", text: `Current: ${stats.avgAttendance}%. Consider convenient meeting times or incentives.`, priority: "warning" });
    if (stats.delayedEMI > 0) recs.push({ icon: "⚠", title: "Address Delayed EMIs", text: `${stats.delayedEMI} member(s) delayed. Follow up or consider restructuring.`, priority: "danger" });
    const avgSav = stats.totalSavings / stats.totalMembers;
    if (avgSav < 15000) recs.push({ icon: "💰", title: "Increase Savings", text: `Avg savings: ${fmt(Math.round(avgSav))}. Encourage higher contributions.`, priority: "info" });
    if (stats.avgAttendance >= 90 && stats.delayedEMI === 0) recs.push({ icon: "🎉", title: "Excellent Performance!", text: "Your SHG is doing exceptionally well. Share best practices with others.", priority: "success" });

    function calcEMIRate(shg) {
        const active = getMembersBySHG(shg).filter((m) => m.LoanStatus === "Active");
        if (!active.length) return "N/A";
        return Math.round((active.filter((m) => m.EMIStatus === "On Time").length / active.length) * 100) + "%";
    }

    return (
        <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#2d1b10", marginBottom: 4 }}>Insights & Health Scores</h1>
            <p style={{ color: "#5d4e37", marginBottom: 20 }}>Analysis of SHG performance and health</p>

            {/* health score card */}
            <div style={{ background: "#fff", borderRadius: 12, padding: 28, border: "1px solid #d4c5ad", boxShadow: "0 2px 8px rgba(45,27,16,.08)", marginBottom: 20, textAlign: "center" }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#2d1b10", marginBottom: 16, paddingBottom: 10, borderBottom: "2px solid #d4c5ad" }}>Your SHG Health Score</h3>
                <div style={{ fontSize: 56, fontWeight: 700, color: "#d84315", lineHeight: 1 }}>{healthScore}</div>
                <div style={{ marginTop: 8, marginBottom: 16 }}>
                    <Badge type={healthStatus.cls}>{healthStatus.status}</Badge>
                </div>
                <div style={{ maxWidth: 360, margin: "0 auto 16px", height: 18, background: "#d4c5ad", borderRadius: 9, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${healthScore}%`, background: "linear-gradient(90deg,#00897b,#4db6ac)", borderRadius: 9, transition: "width .5s" }} />
                </div>
                <p style={{ color: "#8b7355", fontSize: 12, marginBottom: 16 }}>Health Score = (Avg Attendance + % On-Time EMI) / 2</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, maxWidth: 360, margin: "0 auto" }}>
                    {[
                        { label: "Attendance Rate", value: stats.avgAttendance + "%" },
                        { label: "On-Time EMI %", value: emiComp + "%" },
                    ].map((item) => (
                        <div key={item.label} style={{ background: "#f5f1e8", borderRadius: 10, padding: 14 }}>
                            <div style={{ fontSize: 22, fontWeight: 700, color: "#00897b" }}>{item.value}</div>
                            <div style={{ color: "#5d4e37", fontSize: 12, marginTop: 4 }}>{item.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ranking table */}
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#2d1b10", marginBottom: 10 }}>All SHGs Health Ranking</h3>
            <DataTable
                headers={["Rank", "SHG Name", "Health Score", "Attendance", "On-Time EMI", "Status"]}
                rows={sorted.map((s, i) => {
                    const hs = getHealthStatus(s.healthScore);
                    return {
                        _highlight: s.name === selectedSHG ? "rgba(216,67,21,.05)" : undefined,
                        cells: [
                            <strong>{i + 1}</strong>,
                            <span>
                                <strong>{s.name}</strong> {s.name === selectedSHG && <Badge type="info">Current</Badge>}
                            </span>,
                            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <ProgressBar value={s.healthScore} maxW={100} /> <strong>{s.healthScore}</strong>
                            </span>,
                            s.avgAttendance + "%",
                            calcEMIRate(s.name),
                            <Badge type={hs.cls}>{hs.status}</Badge>,
                        ],
                    };
                })}
            />

            {/* risk */}
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#2d1b10", marginTop: 24, marginBottom: 10 }}>Risk Analysis</h3>
            <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #d4c5ad", boxShadow: "0 2px 8px rgba(45,27,16,.08)", marginBottom: 20 }}>
                {risky.length === 0 ? (
                    <div style={{ padding: "10px 14px", borderRadius: 8, borderLeft: "4px solid #2e7d32", background: "rgba(46,125,50,.06)", color: "#2e7d32", fontSize: 13 }}>
                        ✓ <strong>Excellent!</strong> All SHGs are performing well (health score ≥ 80).
                    </div>
                ) : (
                    <>
                        <div style={{ padding: "10px 14px", borderRadius: 8, borderLeft: "4px solid #f57c00", background: "rgba(245,124,0,.06)", color: "#f57c00", fontSize: 13, marginBottom: 12 }}>
                            ⚠ <strong>{risky.length} SHG(s)</strong> have health scores below 80.
                        </div>
                        {risky.map((s) => (
                            <div key={s.name} style={{ background: "#f5f1e8", borderRadius: 10, padding: 14, marginBottom: 8 }}>
                                <strong style={{ color: "#2d1b10" }}>{s.name}</strong> — Health: <strong>{s.healthScore}</strong>
                                <span style={{ marginLeft: 8 }}>
                                    <Badge type="warning">Needs Attention</Badge>
                                </span>
                            </div>
                        ))}
                    </>
                )}
            </div>

            {/* recommendations */}
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#2d1b10", marginBottom: 10 }}>Recommendations</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {recs.map((r, i) => (
                    <div key={i} style={{ background: "#fff", borderRadius: 12, padding: 18, border: "1px solid #d4c5ad", boxShadow: "0 2px 8px rgba(45,27,16,.08)", display: "flex", gap: 14 }}>
                        <span style={{ fontSize: 28 }}>{r.icon}</span>
                        <div style={{ flex: 1 }}>
                            <h4 style={{ fontSize: 15, fontWeight: 700, color: "#2d1b10", marginBottom: 4 }}>{r.title}</h4>
                            <p style={{ fontSize: 12.5, color: "#5d4e37", marginBottom: 6 }}>{r.text}</p>
                            <Badge type={r.priority}>{r.priority === "success" ? "Success" : r.priority.toUpperCase() + " PRIORITY"}</Badge>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
