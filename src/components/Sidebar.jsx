const ALL_NAV_ITEMS = [
    { key: "dashboard", label: "Dashboard", icon: "📊", roles: ["leader", "member"] },
    { key: "members", label: "Members", icon: "👥", roles: ["leader"] },
    { key: "savings", label: "Savings & Attendance", icon: "💰", roles: ["leader", "member"] },
    { key: "loans", label: "Loans", icon: "📋", roles: ["leader", "member"] },
    { key: "meetings", label: "Meetings", icon: "📅", roles: ["leader", "member"] },
    { key: "notifications", label: "Notifications", icon: "🔔", roles: ["leader", "member"] },
    { key: "training", label: "Training", icon: "🎓", roles: ["leader", "member"] },
    { key: "ngolocator", label: "NGO Locator", icon: "🏢", roles: ["leader"] },
    { key: "reports", label: "Reports", icon: "📈", roles: ["leader"] },
    { key: "insights", label: "Insights", icon: "🧠", roles: ["leader"] },
    { key: "superadmin", label: "Loan Sanctions", icon: "🛡️", roles: ["superadmin"] },
];

export function Sidebar({ selectedSHG, role, memberName, page, setPage, onSwitchSHG, onLogout }) {
    const navItems = ALL_NAV_ITEMS.filter((it) => it.roles.includes(role));
    const displayName = role === "superadmin" ? "Super Admin"
        : role === "member" && memberName ? memberName
            : selectedSHG || "—";
    const displaySub = role === "superadmin" ? "Full System Access"
        : role === "member" ? "Member · " + (selectedSHG || "")
            : "SHG Leader";
    const avatarChar = role === "superadmin" ? "SA"
        : role === "member" && memberName ? memberName[0]
            : selectedSHG ? selectedSHG[0] : "S";

    return (
        <aside
            style={{
                width: 248,
                minWidth: 248,
                background: "linear-gradient(180deg,#bf360c,#d84315)",
                color: "#fff",
                padding: "24px 0",
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
                boxShadow: "4px 0 12px rgba(45,27,16,.15)",
            }}
        >
            {/* logo */}
            <div style={{ padding: "0 20px 20px", borderBottom: "1px solid rgba(255,255,255,.2)", marginBottom: 16 }}>
                <span style={{ fontSize: 20, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "#ffa726", fontSize: 24 }}>◆</span> SHG Platform
                </span>
            </div>
            {/* user */}
            <div style={{ margin: "0 16px 16px", padding: 16, background: "rgba(255,255,255,.1)", borderRadius: 12 }}>
                <div
                    style={{
                        width: 48, height: 48, borderRadius: "50%",
                        background: "linear-gradient(135deg,#ffa726,#4db6ac)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 700, fontSize: 18, marginBottom: 8,
                    }}
                >
                    {avatarChar}
                </div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{displayName}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.65)", marginTop: 2 }}>{displaySub}</div>
            </div>
            {/* nav */}
            <nav style={{ flex: 1 }}>
                {navItems.map((item) => (
                    <button
                        key={item.key}
                        onClick={() => setPage(item.key)}
                        style={{
                            display: "flex", alignItems: "center", gap: 10, width: "100%",
                            padding: "10px 20px",
                            background: page === item.key ? "rgba(255,255,255,.15)" : "transparent",
                            border: "none",
                            borderLeft: page === item.key ? "3px solid #ffa726" : "3px solid transparent",
                            color: page === item.key ? "#fff" : "rgba(255,255,255,.82)",
                            fontFamily: "inherit", fontSize: 14, fontWeight: 500,
                            cursor: "pointer", textAlign: "left", transition: "all .2s",
                        }}
                    >
                        <span>{item.icon}</span> {item.label}
                    </button>
                ))}
                <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,.15)", margin: "12px 0" }} />
                {role === "leader" && (
                    <button
                        onClick={onSwitchSHG}
                        style={{
                            display: "flex", alignItems: "center", gap: 10, width: "100%",
                            padding: "10px 20px", background: "transparent", border: "none",
                            borderLeft: "3px solid transparent", color: "rgba(255,255,255,.7)",
                            fontFamily: "inherit", fontSize: 14, cursor: "pointer",
                        }}
                    >
                        <span>🔄</span> Switch SHG
                    </button>
                )}
                <button
                    onClick={onLogout}
                    style={{
                        display: "flex", alignItems: "center", gap: 10, width: "100%",
                        padding: "10px 20px", background: "transparent", border: "none",
                        borderLeft: "3px solid transparent", color: "rgba(255,255,255,.7)",
                        fontFamily: "inherit", fontSize: 14, cursor: "pointer",
                    }}
                >
                    <span>🚪</span> Logout
                </button>
            </nav>
        </aside>
    );
}
