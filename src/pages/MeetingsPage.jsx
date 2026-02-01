import { MEETINGS } from "../data/mockData";
import { Badge } from "../components/Badge";
import { StatCard } from "../components/StatCard";

export default function MeetingsPage() {
    return (
        <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#2d1b10", marginBottom: 4 }}>Meeting Records</h1>
            <p style={{ color: "#5d4e37", marginBottom: 20 }}>Document and track SHG meetings</p>

            {MEETINGS.map((m, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #d4c5ad", boxShadow: "0 2px 8px rgba(45,27,16,.08)", marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                        <div>
                            <h4 style={{ fontSize: 16, fontWeight: 700, color: "#2d1b10", marginBottom: 2 }}>{m.title}</h4>
                            <span style={{ color: "#8b7355", fontSize: 12 }}>{m.date}</span>
                        </div>
                        <Badge type={m.badge.type}>{m.badge.label}</Badge>
                    </div>
                    <div style={{ marginBottom: 10 }}>
                        <strong style={{ color: "#2d1b10", fontSize: 13 }}>Agenda:</strong>
                        <ul style={{ paddingLeft: 18, color: "#5d4e37", fontSize: 12.5, marginTop: 4 }}>
                            {m.agenda.map((a, j) => <li key={j}>{a}</li>)}
                        </ul>
                    </div>
                    <p style={{ fontSize: 12.5, color: "#5d4e37", marginBottom: 8 }}>
                        <strong style={{ color: "#2d1b10" }}>Attendance:</strong> {m.attendance}
                    </p>
                    <div>
                        <strong style={{ color: "#2d1b10", fontSize: 13 }}>Key Decisions:</strong>
                        <ul style={{ paddingLeft: 18, color: "#5d4e37", fontSize: 12.5, marginTop: 4 }}>
                            {m.decisions.map((d, j) => <li key={j}>{d}</li>)}
                        </ul>
                    </div>
                </div>
            ))}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginTop: 8 }}>
                <StatCard icon="📅" value="3" label="Meetings This Quarter" />
                <StatCard icon="✓" value="90%" label="Avg Attendance" />
                <StatCard icon="📋" value="8" label="Decisions Made" />
                <StatCard icon="🎯" value="100%" label="Action Items Done" />
            </div>
        </div>
    );
}
