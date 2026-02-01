export default function LandingPage({ onGetStarted }) {
    const features = [
        { icon: "👥", title: "Member Management", text: "Track all member details, roles, and participation in one centralized system." },
        { icon: "💰", title: "Savings Tracking", text: "Monitor individual and group savings with real-time updates and reports." },
        { icon: "📋", title: "Loan Management", text: "Track loan applications, EMI payments, and identify delays instantly." },
        { icon: "📊", title: "Reports & Insights", text: "Generate comprehensive reports and health scores to measure performance." },
        { icon: "📅", title: "Meeting Records", text: "Document meeting agendas, attendance, and decisions for full transparency." },
        { icon: "🔔", title: "Notifications", text: "Stay informed with alerts for EMI due dates, meetings, and updates." },
    ];
    const problems = [
        { icon: "📊", title: "Manual Record Keeping", text: "Paper records lead to errors and lost information." },
        { icon: "💰", title: "Loan Tracking Issues", text: "Difficult to monitor EMI payments and identify defaulters." },
        { icon: "📉", title: "Low Transparency", text: "Members lack clear visibility into group finances." },
        { icon: "⏰", title: "Attendance Management", text: "Hard to track meeting participation and engagement." },
    ];
    return (
        <div style={{ fontFamily: "'Poppins', sans-serif", background: "#fdfbf7", minHeight: "100vh" }}>
            {/* hero */}
            <section
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    background: "linear-gradient(135deg,rgba(216,67,21,.06),rgba(255,167,38,.06))",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                <div style={{ position: "absolute", top: "-40%", right: "-15%", width: "70%", height: "180%", background: "radial-gradient(circle,rgba(216,67,21,.08) 0%,transparent 70%)", pointerEvents: "none" }} />
                <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px", position: "relative", zIndex: 1 }}>
                    <div
                        style={{
                            display: "inline-block",
                            background: "linear-gradient(135deg,#d84315,#ffa726)",
                            color: "#fff",
                            padding: "6px 20px",
                            borderRadius: 30,
                            fontSize: 14,
                            fontWeight: 600,
                            marginBottom: 20,
                            boxShadow: "0 4px 12px rgba(216,67,21,.3)",
                        }}
                    >
                        🌟 Hackathon Project 2026
                    </div>
                    <h1
                        style={{
                            fontSize: 56,
                            fontWeight: 700,
                            lineHeight: 1.15,
                            marginBottom: 20,
                            background: "linear-gradient(135deg,#d84315,#ffa726)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
                        Strength in Numbers
                    </h1>
                    <p style={{ fontSize: 19, color: "#5d4e37", maxWidth: 580, marginBottom: 32, lineHeight: 1.6 }}>
                        Empowering Women's Self-Help Groups through digital transformation. Manage savings, track loans, and build stronger communities together.
                    </p>
                    <div style={{ display: "flex", gap: 16 }}>
                        <button
                            onClick={onGetStarted}
                            style={{
                                padding: "12px 28px",
                                background: "linear-gradient(135deg,#d84315,#ff7043)",
                                color: "#fff",
                                border: "none",
                                borderRadius: 8,
                                fontSize: 16,
                                fontWeight: 600,
                                cursor: "pointer",
                                boxShadow: "0 4px 12px rgba(216,67,21,.3)",
                                fontFamily: "inherit",
                            }}
                        >
                            Get Started
                        </button>
                        <button
                            style={{
                                padding: "12px 28px",
                                background: "transparent",
                                color: "#d84315",
                                border: "2px solid #d84315",
                                borderRadius: 8,
                                fontSize: 16,
                                fontWeight: 600,
                                cursor: "pointer",
                                fontFamily: "inherit",
                            }}
                        >
                            Learn More
                        </button>
                    </div>
                </div>
            </section>

            {/* problems */}
            <section style={{ padding: "80px 32px", background: "#fff" }}>
                <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
                    <h2 style={{ fontSize: 36, fontWeight: 700, color: "#2d1b10", marginBottom: 12 }}>The Challenge</h2>
                    <p style={{ color: "#5d4e37", fontSize: 17, marginBottom: 40, maxWidth: 580, margin: "0 auto 40px" }}>
                        Women's SHGs face significant barriers in managing financial operations. Traditional paper-based systems are inefficient and error-prone.
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16, textAlign: "left" }}>
                        {problems.map((p, i) => (
                            <div key={i} style={{ background: "#f5f1e8", padding: 18, borderRadius: 10, borderLeft: "4px solid #d84315" }}>
                                <h4 style={{ color: "#d84315", fontSize: 14, marginBottom: 6 }}>
                                    {p.icon} {p.title}
                                </h4>
                                <p style={{ color: "#5d4e37", fontSize: 13 }}>{p.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* features */}
            <section style={{ padding: "80px 32px", background: "#f5f1e8" }}>
                <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                    <h2 style={{ fontSize: 36, fontWeight: 700, color: "#2d1b10", textAlign: "center", marginBottom: 12 }}>Our Solution</h2>
                    <p style={{ color: "#5d4e37", fontSize: 17, textAlign: "center", maxWidth: 580, margin: "0 auto 40px" }}>
                        A comprehensive digital platform designed specifically for Women's SHGs.
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
                        {features.map((f, i) => (
                            <div
                                key={i}
                                style={{
                                    background: "#fff",
                                    padding: 24,
                                    borderRadius: 12,
                                    border: "1px solid #d4c5ad",
                                    boxShadow: "0 2px 8px rgba(45,27,16,.08)",
                                    transition: "transform .2s, box-shadow .2s",
                                }}
                            >
                                <div
                                    style={{
                                        width: 52,
                                        height: 52,
                                        borderRadius: 12,
                                        background: "linear-gradient(135deg,#ff7043,#ffa726)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: 24,
                                        marginBottom: 14,
                                    }}
                                >
                                    {f.icon}
                                </div>
                                <h3 style={{ fontSize: 17, fontWeight: 700, color: "#2d1b10", marginBottom: 6 }}>{f.title}</h3>
                                <p style={{ color: "#5d4e37", fontSize: 13, lineHeight: 1.5 }}>{f.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section style={{ padding: "80px 32px", background: "linear-gradient(135deg,rgba(216,67,21,.06),rgba(255,167,38,.06))", textAlign: "center" }}>
                <h2 style={{ fontSize: 36, fontWeight: 700, color: "#2d1b10", marginBottom: 12 }}>Ready to Transform Your SHG?</h2>
                <p style={{ color: "#5d4e37", fontSize: 17, maxWidth: 560, margin: "0 auto 28px" }}>
                    Join the digital revolution and empower your community with better financial management.
                </p>
                <button
                    onClick={onGetStarted}
                    style={{
                        padding: "12px 32px",
                        background: "linear-gradient(135deg,#d84315,#ff7043)",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        fontSize: 16,
                        fontWeight: 600,
                        cursor: "pointer",
                        boxShadow: "0 4px 12px rgba(216,67,21,.3)",
                        fontFamily: "inherit",
                    }}
                >
                    Start Your Journey
                </button>
            </section>
        </div>
    );
}
