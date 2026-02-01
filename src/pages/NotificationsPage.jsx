import { useMemo } from "react";
import { getMembersBySHG, fmt } from "../data/dataService";

export default function NotificationsPage({ selectedSHG, role, memberName }) {
    const members = useMemo(() => getMembersBySHG(selectedSHG), [selectedSHG]);
    const me = useMemo(() => members.find((m) => m.Name === memberName) || null, [members, memberName]);

    // Build notifications scoped by role
    const notifications = [];
    const source = role === "member" && me ? [me] : members;   // member sees only own; leader sees all

    source.filter((m) => m.EMIStatus === "Delayed").forEach((m) => {
        notifications.push({ icon: "⚠", iconType: "warning", title: "EMI Payment Reminder", text: role === "member" ? `Your EMI payment for loan ${fmt(m.LoanAmount)} is delayed. Please contact your leader.` : `${m.Name}'s EMI payment for loan ${fmt(m.LoanAmount)} is delayed. Please follow up.`, time: "Recent" });
    });
    source.filter((m) => m.LoanStatus === "Active" && m.EMIStatus === "On Time").forEach((m) => {
        notifications.push({ icon: "✓", iconType: "success", title: "Loan On Track", text: role === "member" ? `Your loan of ${fmt(m.LoanAmount)} — EMI is on time. Great job!` : `${m.Name}'s loan of ${fmt(m.LoanAmount)} — EMI is on time.`, time: "This month" });
    });
    source.filter((m) => m.Savings >= 20000).forEach((m) => {
        notifications.push({ icon: "💰", iconType: "success", title: "Savings Milestone", text: role === "member" ? `Congratulations! You have crossed ₹20,000 in savings.` : `${m.Name} has crossed ₹20,000 in savings. Great progress!`, time: "Recent" });
    });
    if (role === "member" && me && me.LoanStatus === "Closed") {
        notifications.push({ icon: "🎉", iconType: "success", title: "Loan Completed", text: `You successfully completed your loan of ${fmt(me.LoanAmount)}.`, time: "Recent" });
    }
    notifications.push({ icon: "📅", iconType: "info", title: "Upcoming Meeting", text: "Monthly general meeting scheduled for February 15, 2026 at 10:00 AM.", time: "2 days ago" });

    const iconBg = { warning: "rgba(245,124,0,.15)", info: "rgba(2,119,189,.15)", success: "rgba(46,125,50,.15)" };
    const iconCol = { warning: "#f57c00", info: "#0277bd", success: "#2e7d32" };

    return (
        <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#2d1b10", marginBottom: 4 }}>{role === "member" ? "My Notifications" : "Notifications"}</h1>
            <p style={{ color: "#5d4e37", marginBottom: 20 }}>{role === "member" ? "Your personal alerts and reminders" : "Stay updated with important alerts and reminders"}</p>

            <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #d4c5ad", boxShadow: "0 2px 8px rgba(45,27,16,.08)" }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#2d1b10", marginBottom: 16, paddingBottom: 10, borderBottom: "2px solid #d4c5ad" }}>Recent Notifications</h3>
                {notifications.map((n, i) => (
                    <div key={i} style={{ display: "flex", gap: 14, padding: "12px 0", borderBottom: i < notifications.length - 1 ? "1px solid #eee" : "none" }}>
                        <div
                            style={{
                                width: 42,
                                height: 42,
                                borderRadius: "50%",
                                background: iconBg[n.iconType],
                                color: iconCol[n.iconType],
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 18,
                                flexShrink: 0,
                            }}
                        >
                            {n.icon}
                        </div>
                        <div>
                            <div style={{ fontWeight: 600, color: "#2d1b10", fontSize: 13.5 }}>{n.title}</div>
                            <div style={{ color: "#5d4e37", fontSize: 12.5, margin: "2px 0" }}>{n.text}</div>
                            <div style={{ color: "#8b7355", fontSize: 11 }}>{n.time}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
