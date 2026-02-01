export const BADGE_COLORS = {
    success: { bg: "rgba(46,125,50,.15)", color: "#2e7d32", border: "#2e7d32" },
    warning: { bg: "rgba(245,124,0,.15)", color: "#f57c00", border: "#f57c00" },
    danger: { bg: "rgba(198,40,40,.15)", color: "#c62828", border: "#c62828" },
    info: { bg: "rgba(2,119,189,.15)", color: "#0277bd", border: "#0277bd" },
    secondary: { bg: "rgba(0,137,123,.15)", color: "#00897b", border: "#00897b" },
};

export function Badge({ type = "info", children }) {
    const c = BADGE_COLORS[type] || BADGE_COLORS.info;
    return (
        <span
            style={{
                display: "inline-block",
                padding: "3px 10px",
                fontSize: 11,
                fontWeight: 600,
                borderRadius: 20,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                background: c.bg,
                color: c.color,
                border: `1px solid ${c.border}`,
            }}
        >
            {children}
        </span>
    );
}

export function loanBadge(status) {
    const map = { Active: "info", Closed: "success", None: "secondary" };
    return <Badge type={map[status] || "secondary"}>{status}</Badge>;
}

export function emiBadge(status) {
    const map = { "On Time": "success", Delayed: "danger", Completed: "success", "N/A": "secondary" };
    const icons = { "On Time": "✓ ", Delayed: "⚠ ", Completed: "✓ " };
    return <Badge type={map[status] || "secondary"}>{(icons[status] || "") + status}</Badge>;
}

export function attendanceBadge(att) {
    if (att >= 90) return <Badge type="success">Excellent</Badge>;
    if (att >= 80) return <Badge type="info">Good</Badge>;
    if (att >= 70) return <Badge type="warning">Fair</Badge>;
    return <Badge type="danger">Poor</Badge>;
}
