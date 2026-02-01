export function StatCard({ icon, value, label, gradientColor = "#d84315" }) {
    return (
        <div
            style={{
                background: "#fff",
                borderRadius: 12,
                padding: 20,
                boxShadow: "0 2px 8px rgba(45,27,16,.08)",
                border: "1px solid #d4c5ad",
                position: "relative",
                overflow: "hidden",
            }}
        >
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg,${gradientColor},#ffa726)` }} />
            <div
                style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: "linear-gradient(135deg,#ff7043,#ffa726)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    marginBottom: 12,
                }}
            >
                {icon}
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#2d1b10" }}>{value}</div>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, color: "#5d4e37" }}>{label}</div>
        </div>
    );
}
