import { useState, useMemo } from "react";
import { NGOS } from "../data/mockData";
import { StatCard } from "../components/StatCard";

export default function NGOLocatorPage() {
    const [search, setSearch] = useState("");
    const [sortNearest, setSortNearest] = useState(true);
    const [toast, setToast] = useState(null);

    const filtered = useMemo(() => {
        let list = NGOS.filter(n =>
            n.name.toLowerCase().includes(search.toLowerCase()) ||
            n.city.toLowerCase().includes(search.toLowerCase()) ||
            n.focus.toLowerCase().includes(search.toLowerCase())
        );
        return sortNearest ? [...list].sort((a, b) => a.dist - b.dist) : list;
    }, [search, sortNearest]);

    function copyVal(text, label) {
        navigator.clipboard.writeText(text).catch(() => { });
        setToast(label + " copied!");
        setTimeout(() => setToast(null), 1800);
    }

    return (
        <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#2d1b10", marginBottom: 4 }}>NGO Locator</h1>
            <p style={{ color: "#5d4e37", marginBottom: 20 }}>Find nearby NGO partners and grab their contact details.</p>

            {/* search + sort row */}
            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                <input
                    placeholder="Search by name, city, or focus…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{
                        flex: 1, padding: "10px 14px", border: "2px solid #d4c5ad", borderRadius: 8,
                        fontSize: 14, fontFamily: "inherit", outline: "none", background: "#fff",
                    }}
                    onFocus={e => e.target.style.borderColor = "#d84315"}
                    onBlur={e => e.target.style.borderColor = "#d4c5ad"}
                />
                <button
                    onClick={() => setSortNearest(!sortNearest)}
                    style={{
                        padding: "10px 16px", border: sortNearest ? "2px solid #d84315" : "2px solid #d4c5ad",
                        borderRadius: 8, background: sortNearest ? "linear-gradient(135deg,rgba(216,67,21,.1),rgba(255,167,38,.1))" : "#fff",
                        color: sortNearest ? "#d84315" : "#5d4e37", fontWeight: 600, fontSize: 13,
                        cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", transition: "all .2s",
                    }}
                >
                    📍 {sortNearest ? "Nearest First" : "Default Order"}
                </button>
            </div>

            {/* summary strip */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
                <StatCard icon="🏢" value={NGOS.length} label="Total NGO Partners" />
                <StatCard icon="📍" value={filtered.length > 0 ? filtered[0].dist + " km" : "—"} label="Nearest NGO" gradientColor="#00897b" />
                <StatCard icon="📞" value="Ready" label="Contact Available" gradientColor="#00897b" />
            </div>

            {/* grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {filtered.map(ngo => (
                    <div key={ngo.id} style={{
                        background: "#fff", border: "1px solid #d4c5ad", borderRadius: 12,
                        padding: 20, boxShadow: "0 2px 8px rgba(45,27,16,.08)", transition: "all .2s",
                    }}>
                        {/* header row */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                            <h4 style={{ fontSize: 15, fontWeight: 700, color: "#2d1b10", margin: 0 }}>{ngo.name}</h4>
                            <span style={{
                                fontSize: 11, fontWeight: 700, color: "#fff", background: "linear-gradient(135deg,#00897b,#4db6ac)",
                                padding: "3px 9px", borderRadius: 20, whiteSpace: "nowrap",
                            }}>
                                {ngo.dist} km
                            </span>
                        </div>
                        {/* focus tag */}
                        <div style={{ fontSize: 12, color: "#d84315", fontWeight: 600, marginBottom: 6 }}>🎯 {ngo.focus}</div>
                        {/* address */}
                        <div style={{ fontSize: 12, color: "#8b7355", marginBottom: 14 }}>📌 {ngo.addr}, {ngo.city}, {ngo.state}</div>
                        {/* contact buttons */}
                        <div style={{ display: "flex", gap: 8 }}>
                            <button
                                onClick={() => copyVal(ngo.phone, "Phone")}
                                style={{
                                    flex: 1, display: "flex", alignItems: "center", gap: 6, padding: "8px 10px",
                                    border: "2px solid #d4c5ad", borderRadius: 8, background: "transparent",
                                    color: "#5d4e37", fontSize: 12, fontWeight: 600, cursor: "pointer",
                                    fontFamily: "inherit", transition: "all .2s",
                                }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = "#d84315"; e.currentTarget.style.color = "#d84315"; e.currentTarget.style.background = "rgba(216,67,21,.06)"; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = "#d4c5ad"; e.currentTarget.style.color = "#5d4e37"; e.currentTarget.style.background = "transparent"; }}
                            >
                                📞 {ngo.phone}
                            </button>
                            <button
                                onClick={() => copyVal(ngo.email, "Email")}
                                style={{
                                    flex: 1, display: "flex", alignItems: "center", gap: 6, padding: "8px 10px",
                                    border: "2px solid #d4c5ad", borderRadius: 8, background: "transparent",
                                    color: "#5d4e37", fontSize: 11.5, fontWeight: 600, cursor: "pointer",
                                    fontFamily: "inherit", transition: "all .2s", wordBreak: "break-all",
                                }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = "#00897b"; e.currentTarget.style.color = "#00897b"; e.currentTarget.style.background = "rgba(0,137,123,.06)"; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = "#d4c5ad"; e.currentTarget.style.color = "#5d4e37"; e.currentTarget.style.background = "transparent"; }}
                            >
                                ✉ {ngo.email}
                            </button>
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && (
                    <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 40, color: "#8b7355", fontSize: 14 }}>
                        No NGOs match your search. Try a different keyword.
                    </div>
                )}
            </div>

            {/* copy toast */}
            {toast && (
                <div style={{
                    position: "fixed", bottom: 30, left: "50%", transform: "translateX(-50%)",
                    background: "linear-gradient(135deg,#d84315,#ff7043)", color: "#fff",
                    padding: "10px 24px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                    boxShadow: "0 4px 16px rgba(216,67,21,.35)", zIndex: 100,
                }}>
                    ✓ {toast}
                </div>
            )}
        </div>
    );
}
