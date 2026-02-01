import { useState, useMemo } from "react";
import { getMembersBySHG, getTrainingForMember } from "../data/dataService";
import { Badge } from "../components/Badge";
import { StatCard } from "../components/StatCard";
import { ProgressBar } from "../components/ProgressBar";

export default function TrainingPage({ selectedSHG, role, memberName }) {
    const members = useMemo(() => getMembersBySHG(selectedSHG), [selectedSHG]);
    // leader sees all members; member sees only self
    const viewMembers = role === "member" && memberName
        ? members.filter(m => m.Name === memberName)
        : members;

    const [selected, setSelected] = useState(viewMembers[0]?.Name || null);
    // keep selection valid when SHG switches
    const activeName = viewMembers.find(m => m.Name === selected) ? selected : (viewMembers[0]?.Name || null);

    const training = useMemo(() => activeName ? getTrainingForMember(activeName) : [], [activeName]);
    const totalLessons = training.reduce((s, t) => s + t.totalLessons, 0);
    const doneLessons = training.reduce((s, t) => s + t.completed, 0);
    const doneModules = training.filter(t => t.status === "done").length;
    const overallPct = totalLessons > 0 ? Math.round((doneLessons / totalLessons) * 100) : 0;

    function statusStyle(status) {
        if (status === "done") return { bg: "rgba(46,125,50,.12)", color: "#2e7d32", icon: "✓" };
        if (status === "in-progress") return { bg: "rgba(245,124,0,.12)", color: "#f57c00", icon: "◐" };
        return { bg: "rgba(0,0,0,.06)", color: "#8b7355", icon: "🔒" };
    }

    return (
        <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#2d1b10", marginBottom: 4 }}>Training Progress</h1>
            <p style={{ color: "#5d4e37", marginBottom: 20 }}>
                {role === "member" ? "Your training modules and lesson completion." : "View every member's training status."}
            </p>

            {/* member tabs (leader only) */}
            {role === "leader" && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 22 }}>
                    {viewMembers.map(m => {
                        const active = activeName === m.Name;
                        return (
                            <button key={m.Name} onClick={() => setSelected(m.Name)} style={{
                                display: "flex", alignItems: "center", gap: 8, padding: "7px 14px", borderRadius: 22,
                                border: active ? "2px solid #d84315" : "2px solid #d4c5ad",
                                background: active ? "linear-gradient(135deg,rgba(216,67,21,.1),rgba(255,167,38,.1))" : "#fff",
                                color: active ? "#d84315" : "#5d4e37",
                                fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all .2s",
                            }}>
                                <span style={{
                                    width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                                    background: "linear-gradient(135deg,#d84315,#ffa726)", color: "#fff", fontSize: 10, fontWeight: 700,
                                }}>{m.Name[0]}</span>
                                {m.Name}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* summary cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
                <StatCard icon="📊" value={overallPct + "%"} label="Overall Progress" />
                <StatCard icon="📚" value={doneModules + "/" + training.length} label="Modules Done" gradientColor="#00897b" />
                <StatCard icon="✓" value={doneLessons + "/" + totalLessons} label="Lessons Done" gradientColor="#00897b" />
            </div>

            {/* overall progress bar */}
            <div style={{ background: "#fff", borderRadius: 12, padding: 18, border: "1px solid #d4c5ad", boxShadow: "0 2px 8px rgba(45,27,16,.08)", marginBottom: 20, display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#2d1b10", minWidth: 80 }}>{activeName}</span>
                <div style={{ flex: 1 }}><ProgressBar value={overallPct} maxW="100%" /></div>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#d84315" }}>{overallPct}%</span>
                <Badge type={overallPct >= 75 ? "success" : overallPct >= 40 ? "warning" : "danger"}>
                    {overallPct >= 75 ? "On Track" : overallPct >= 40 ? "In Progress" : "Just Started"}
                </Badge>
            </div>

            {/* module list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {training.map((t, idx) => {
                    const s = statusStyle(t.status);
                    const pct = t.totalLessons > 0 ? Math.round((t.completed / t.totalLessons) * 100) : 0;
                    const locked = t.status === "locked";
                    return (
                        <div key={t.id} style={{
                            background: t.status === "done" ? "rgba(46,125,50,.04)" : "#fff",
                            border: t.status === "done" ? "1px solid rgba(46,125,50,.25)" : "1px solid #d4c5ad",
                            borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16,
                            boxShadow: "0 2px 8px rgba(45,27,16,.06)", opacity: locked ? 0.55 : 1,
                        }}>
                            {/* icon circle */}
                            <div style={{
                                width: 42, height: 42, borderRadius: 10, background: s.bg,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 18, color: s.color, flexShrink: 0,
                            }}>
                                {s.icon}
                            </div>
                            {/* info */}
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 14, fontWeight: 700, color: locked ? "#8b7355" : "#2d1b10", marginBottom: 6 }}>
                                    {t.title}
                                    {locked && <span style={{ fontSize: 11, fontWeight: 500, color: "#8b7355", marginLeft: 8 }}>(complete previous module first)</span>}
                                </div>
                                <div style={{ height: 6, background: "#d4c5ad", borderRadius: 3, overflow: "hidden" }}>
                                    <div style={{
                                        height: "100%", width: locked ? "0%" : pct + "%",
                                        background: t.status === "done" ? "linear-gradient(90deg,#2e7d32,#66bb6a)"
                                            : t.status === "in-progress" ? "linear-gradient(90deg,#f57c00,#ffb74d)"
                                                : "#d4c5ad",
                                        borderRadius: 3, transition: "width .4s",
                                    }} />
                                </div>
                            </div>
                            {/* right: count + badge */}
                            <div style={{ textAlign: "right", flexShrink: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: "#2d1b10" }}>{t.completed} / {t.totalLessons}</div>
                                <div style={{ fontSize: 11, color: s.color, fontWeight: 600, marginTop: 2 }}>
                                    {t.status === "done" ? "Completed" : t.status === "in-progress" ? "In Progress" : "Locked"}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
