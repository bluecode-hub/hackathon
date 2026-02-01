import { useState } from "react";
import { getMembersBySHG, getAllSHGs } from "../data/dataService";

export default function SHGSelectPage({ role, onSelect, onBack }) {
    const allSHGs = getAllSHGs();
    const [step, setStep] = useState(1); // 1: Select SHG, 2: Select Member (if role=member)
    const [selectedSHG, setSelectedSHG] = useState(null);

    const handleSHGClick = (shg) => {
        setSelectedSHG(shg);
        if (role === "leader") {
            onSelect(shg, null); // Leader doesn't need specific member profile
        } else {
            setStep(2);
        }
    };

    const handleMemberClick = (name) => {
        onSelect(selectedSHG, name);
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,rgba(216,67,21,.06),rgba(255,167,38,.06))", fontFamily: "'Poppins', sans-serif" }}>
            <div style={{ background: "#fff", padding: 32, borderRadius: 24, boxShadow: "0 12px 40px rgba(45,27,16,.1)", width: "100%", maxWidth: 480, maxHeight: "80vh", display: "flex", flexDirection: "column" }}>
                {/* header */}
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                    <button onClick={step === 1 ? onBack : () => setStep(1)} style={{ background: "none", border: "none", fontSize: 24, color: "#8b7355", cursor: "pointer" }}>←</button>
                    <div>
                        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#2d1b10", margin: 0 }}>
                            {step === 1 ? "Select Self-Help Group" : "Select Your Profile"}
                        </h1>
                        <p style={{ fontSize: 13, color: "#5d4e37", margin: 0 }}>
                            {step === 1 ? "Choose your group to proceed" : `Members of ${selectedSHG}`}
                        </p>
                    </div>
                </div>

                {/* list */}
                <div style={{ overflowY: "auto", paddingRight: 8, display: "flex", flexDirection: "column", gap: 10 }}>
                    {step === 1 ? (
                        // SHG List
                        allSHGs.map(shg => (
                            <button
                                key={shg}
                                onClick={() => handleSHGClick(shg)}
                                style={{
                                    padding: "16px 20px", background: "#fffbf0", border: "1px solid #f0dcc0", borderRadius: 12,
                                    textAlign: "left", cursor: "pointer", transition: "all .2s", fontFamily: "inherit"
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = "#d84315"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "#d84315"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "#fffbf0"; e.currentTarget.style.color = "inherit"; e.currentTarget.style.borderColor = "#f0dcc0"; }}
                            >
                                <div style={{ fontSize: 15, fontWeight: 600 }}>{shg}</div>
                                <div style={{ fontSize: 12, opacity: 0.8 }}>{getMembersBySHG(shg).length} Members</div>
                            </button>
                        ))
                    ) : (
                        // Member List
                        getMembersBySHG(selectedSHG).map(m => (
                            <button
                                key={m.Name}
                                onClick={() => handleMemberClick(m.Name)}
                                style={{
                                    display: "flex", alignItems: "center", gap: 12,
                                    padding: "12px 16px", background: "#fff", border: "1px solid #eee", borderRadius: 12,
                                    textAlign: "left", cursor: "pointer", transition: "all .2s", fontFamily: "inherit"
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = "rgba(216,67,21,.05)"}
                                onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                            >
                                <div style={{
                                    width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#d84315,#ffa726)",
                                    display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14
                                }}>{m.Name[0]}</div>
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: "#2d1b10" }}>{m.Name}</div>
                                    <div style={{ fontSize: 11, color: "#8b7355" }}>{m.Role}</div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
