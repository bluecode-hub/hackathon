import { useState, useMemo, useCallback } from "react";

// ─────────────────────────────────────────────
// EMBEDDED CSV BACKEND – single source of truth
// ─────────────────────────────────────────────
const RAW_CSV = `MemberID,Name,Age,SHGName,Role,Attendance,Savings,LoanStatus,LoanAmount,EMIStatus,JoinDate
SHG001,Sita Devi,34,Shakti Mahila SHG,President,96,18500,Active,50000,On Time,2023-01-15
SHG002,Rani Kumari,29,Shakti Mahila SHG,Treasurer,90,15200,Active,30000,On Time,2023-02-10
SHG003,Lakshmi Bai,41,Shakti Mahila SHG,Secretary,92,22300,None,0,N/A,2022-11-20
SHG004,Meena Devi,35,Shakti Mahila SHG,Member,85,12800,Closed,20000,Completed,2023-04-05
SHG005,Sunita Yadav,27,Ujjwala SHG,President,94,19400,Active,40000,On Time,2022-08-18
SHG006,Anjali Patel,32,Ujjwala SHG,Treasurer,88,14700,None,0,N/A,2023-03-11
SHG007,Kavita Singh,38,Ujjwala SHG,Secretary,91,21000,Active,60000,Delayed,2022-06-09
SHG008,Pooja Sharma,30,Ujjwala SHG,Member,82,10500,Closed,25000,Completed,2023-01-22
SHG009,Rekha Devi,45,Pragati SHG,President,98,30500,Active,100000,On Time,2020-07-19
SHG010,Nirmala Joshi,35,Pragati SHG,Treasurer,92,18900,None,0,N/A,2023-02-11
SHG011,Asha Kumari,28,Pragati SHG,Secretary,87,13600,Active,20000,On Time,2023-05-03
SHG012,Radha Mishra,40,Pragati SHG,Member,84,11200,Closed,35000,Completed,2022-09-01
SHG013,Savita Rao,37,Saraswati SHG,President,95,26700,Active,80000,On Time,2021-10-14
SHG014,Geeta Nair,33,Saraswati SHG,Treasurer,89,17500,None,0,N/A,2023-03-29
SHG015,Latha Iyer,42,Saraswati SHG,Secretary,93,24300,Active,50000,Delayed,2022-05-17
SHG016,Rukmini Das,31,Saraswati SHG,Member,86,12900,Closed,30000,Completed,2023-01-08
SHG017,Kamala Reddy,39,Nirmala SHG,President,97,28800,Active,90000,On Time,2021-12-02
SHG018,Bhavya Jain,26,Nirmala SHG,Treasurer,85,11400,None,0,N/A,2023-06-21
SHG019,Shobha Patil,44,Nirmala SHG,Secretary,90,20600,Active,45000,On Time,2022-07-30
SHG020,Neha Kulkarni,34,Nirmala SHG,Member,83,13200,Closed,25000,Completed,2023-02-14`;

// ─────────────────────────────────────────────
// CSV PARSER  (mirrors original csvLoader.js)
// ─────────────────────────────────────────────
function parseCSV(text) {
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim());
  const numericCols = new Set(["Age", "Attendance", "Savings", "LoanAmount"]);
  return lines.slice(1).map((line) => {
    const vals = line.split(",").map((v) => v.trim());
    const row = {};
    headers.forEach((h, i) => {
      row[h] = numericCols.has(h) ? parseFloat(vals[i]) || 0 : vals[i];
    });
    return row;
  });
}

const ALL_MEMBERS = parseCSV(RAW_CSV);

// ─────────────────────────────────────────────
// DATA SERVICE  (mirrors original dataService.js)
// ─────────────────────────────────────────────
function getMembersBySHG(shg) {
  return ALL_MEMBERS.filter((m) => m.SHGName === shg);
}
function getAllSHGs() {
  return [...new Set(ALL_MEMBERS.map((m) => m.SHGName))].sort();
}
function getSHGStats(shg) {
  const members = getMembersBySHG(shg);
  const n = members.length;
  const totalSavings = members.reduce((s, m) => s + m.Savings, 0);
  const activeLoans = members.filter((m) => m.LoanStatus === "Active");
  const avgAttendance = members.reduce((s, m) => s + m.Attendance, 0) / n;
  const onTimeEMI = activeLoans.filter((m) => m.EMIStatus === "On Time").length;
  const delayedEMI = activeLoans.filter((m) => m.EMIStatus === "Delayed").length;
  return {
    totalMembers: n,
    totalSavings,
    activeLoans: activeLoans.length,
    avgAttendance: Math.round(avgAttendance * 10) / 10,
    totalLoanAmount: activeLoans.reduce((s, m) => s + m.LoanAmount, 0),
    onTimeEMI,
    delayedEMI,
  };
}
function calculateHealthScore(shg) {
  const stats = getSHGStats(shg);
  const activeLoans = getMembersBySHG(shg).filter((m) => m.LoanStatus === "Active");
  let onTimePct = 100;
  if (activeLoans.length > 0)
    onTimePct = (activeLoans.filter((m) => m.EMIStatus === "On Time").length / activeLoans.length) * 100;
  return Math.round(((stats.avgAttendance + onTimePct) / 2) * 10) / 10;
}
function getHealthStatus(score) {
  if (score >= 90) return { status: "Excellent", cls: "success" };
  if (score >= 80) return { status: "Good", cls: "info" };
  if (score >= 70) return { status: "Fair", cls: "warning" };
  return { status: "Needs Attention", cls: "danger" };
}
function getAllSHGSummaries() {
  return getAllSHGs().map((name) => {
    const stats = getSHGStats(name);
    return { name, ...stats, healthScore: calculateHealthScore(name) };
  });
}
function fmt(n) {
  return "₹" + n.toLocaleString("en-IN");
}

// ─────────────────────────────────────────────
// SHARED UI HELPERS
// ─────────────────────────────────────────────
const BADGE_COLORS = {
  success: { bg: "rgba(46,125,50,.15)", color: "#2e7d32", border: "#2e7d32" },
  warning: { bg: "rgba(245,124,0,.15)", color: "#f57c00", border: "#f57c00" },
  danger: { bg: "rgba(198,40,40,.15)", color: "#c62828", border: "#c62828" },
  info: { bg: "rgba(2,119,189,.15)", color: "#0277bd", border: "#0277bd" },
  secondary: { bg: "rgba(0,137,123,.15)", color: "#00897b", border: "#00897b" },
};

function Badge({ type = "info", children }) {
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

function ProgressBar({ value, maxW = 120 }) {
  return (
    <div style={{ height: 7, background: "#d4c5ad", borderRadius: 4, width: maxW, overflow: "hidden" }}>
      <div
        style={{
          height: "100%",
          width: `${Math.min(value, 100)}%`,
          background: "linear-gradient(90deg,#00897b,#4db6ac)",
          borderRadius: 4,
          transition: "width .5s",
        }}
      />
    </div>
  );
}

function loanBadge(status) {
  const map = { Active: "info", Closed: "success", None: "secondary" };
  return <Badge type={map[status] || "secondary"}>{status}</Badge>;
}
function emiBadge(status) {
  const map = { "On Time": "success", Delayed: "danger", Completed: "success", "N/A": "secondary" };
  const icons = { "On Time": "✓ ", Delayed: "⚠ ", Completed: "✓ " };
  return <Badge type={map[status] || "secondary"}>{(icons[status] || "") + status}</Badge>;
}
function attendanceBadge(att) {
  if (att >= 90) return <Badge type="success">Excellent</Badge>;
  if (att >= 80) return <Badge type="info">Good</Badge>;
  if (att >= 70) return <Badge type="warning">Fair</Badge>;
  return <Badge type="danger">Poor</Badge>;
}

// ─────────────────────────────────────────────
// LAYOUT SHELL
// ─────────────────────────────────────────────
const ALL_NAV_ITEMS = [
  { key: "dashboard",     label: "Dashboard",            icon: "📊", roles: ["leader","member"] },
  { key: "members",       label: "Members",              icon: "👥", roles: ["leader"] },
  { key: "savings",       label: "Savings & Attendance", icon: "💰", roles: ["leader","member"] },
  { key: "loans",         label: "Loans",                icon: "📋", roles: ["leader","member"] },
  { key: "meetings",      label: "Meetings",             icon: "📅", roles: ["leader","member"] },
  { key: "notifications", label: "Notifications",        icon: "🔔", roles: ["leader","member"] },
  { key: "reports",       label: "Reports",              icon: "📈", roles: ["leader"] },
  { key: "insights",      label: "Insights",             icon: "🧠", roles: ["leader"] },
];

function Sidebar({ selectedSHG, role, memberName, page, setPage, onSwitchSHG, onLogout }) {
  const navItems = ALL_NAV_ITEMS.filter((it) => it.roles.includes(role));
  const displayName = role === "member" && memberName ? memberName : selectedSHG || "—";
  const displaySub  = role === "member" ? "Member · " + (selectedSHG || "") : "SHG Leader";
  const avatarChar  = role === "member" && memberName ? memberName[0] : selectedSHG ? selectedSHG[0] : "S";

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

// ─────────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────────
function StatCard({ icon, value, label, gradientColor = "#d84315" }) {
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

// ─────────────────────────────────────────────
// TABLE WRAPPER
// ─────────────────────────────────────────────
function DataTable({ headers, rows }) {
  return (
    <div style={{ overflowX: "auto", background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(45,27,16,.08)", border: "1px solid #d4c5ad" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "linear-gradient(135deg,#d84315,#ff7043)" }}>
            {headers.map((h, i) => (
              <th key={i} style={{ padding: "10px 14px", textAlign: "left", color: "#fff", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, whiteSpace: "nowrap" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: "1px solid #d4c5ad", background: row._highlight || "transparent" }}>
              {row.cells.map((cell, j) => (
                <td key={j} style={{ padding: "10px 14px", color: "#5d4e37", fontSize: 13 }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────
// PAGE: DASHBOARD
// ─────────────────────────────────────────────
function DashboardPage({ selectedSHG, role, memberName, setPage }) {
  const stats   = useMemo(() => getSHGStats(selectedSHG), [selectedSHG]);
  const members = useMemo(() => getMembersBySHG(selectedSHG), [selectedSHG]);
  const me      = useMemo(() => members.find((m) => m.Name === memberName) || null, [members, memberName]);

  /* ─── LEADER DASHBOARD ─── */
  if (role === "leader") {
    const activities = [];
    members.forEach((m) => {
      if (m.LoanStatus === "Active")
        activities.push({ text: `${m.Name} has an active loan of ${fmt(m.LoanAmount)}`, type: "info" });
      if (m.EMIStatus === "Delayed")
        activities.push({ text: `EMI payment delayed for ${m.Name}`, type: "warning" });
    });

    const quickActions = [
      { label: "View All Members", target: "members",       icon: "👥" },
      { label: "Manage Loans",     target: "loans",         icon: "📋" },
      { label: "Generate Reports", target: "reports",       icon: "📈" },
      { label: "View Insights",    target: "insights",      icon: "🧠" },
    ];

    return (
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#2d1b10", marginBottom: 4 }}>Leader Dashboard</h1>
        <p style={{ color: "#5d4e37", marginBottom: 20 }}>Group overview — <strong>{selectedSHG}</strong></p>

        {/* alerts */}
        {stats.delayedEMI > 0 && (
          <div style={{ padding: "12px 16px", borderRadius: 8, borderLeft: "4px solid #f57c00", background: "rgba(245,124,0,.06)", color: "#f57c00", marginBottom: 16, fontSize: 13 }}>
            ⚠ <strong>{stats.delayedEMI} member(s)</strong> have delayed EMI payments. Please follow up.
          </div>
        )}
        {stats.delayedEMI === 0 && stats.onTimeEMI > 0 && (
          <div style={{ padding: "12px 16px", borderRadius: 8, borderLeft: "4px solid #2e7d32", background: "rgba(46,125,50,.06)", color: "#2e7d32", marginBottom: 16, fontSize: 13 }}>
            ✓ All <strong>{stats.onTimeEMI}</strong> active loan EMIs are on time.
          </div>
        )}

        {/* stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16, marginBottom: 24 }}>
          <StatCard icon="👥" value={stats.totalMembers} label="Total Members" />
          <StatCard icon="💰" value={fmt(stats.totalSavings)} label="Total Savings" />
          <StatCard icon="📋" value={stats.activeLoans} label="Active Loans" />
          <StatCard icon="📊" value={stats.avgAttendance + "%"} label="Avg Attendance" />
        </div>

        {/* bottom grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* quick actions — WIRED */}
          <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #d4c5ad", boxShadow: "0 2px 8px rgba(45,27,16,.08)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#2d1b10", marginBottom: 16, paddingBottom: 10, borderBottom: "2px solid #d4c5ad" }}>Quick Actions</h3>
            {quickActions.map((qa) => (
              <button
                key={qa.target}
                onClick={() => setPage(qa.target)}
                style={{
                  display: "flex", alignItems: "center", gap: 10, width: "100%", marginBottom: 8,
                  padding: "10px 16px", background: "transparent",
                  border: "2px solid #d84315", borderRadius: 8,
                  color: "#d84315", fontWeight: 600, fontSize: 13,
                  cursor: "pointer", fontFamily: "inherit", transition: "all .2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#d84315"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#d84315"; }}
              >
                <span>{qa.icon}</span> {qa.label}
              </button>
            ))}
          </div>
          {/* recent activity */}
          <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #d4c5ad", boxShadow: "0 2px 8px rgba(45,27,16,.08)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#2d1b10", marginBottom: 16, paddingBottom: 10, borderBottom: "2px solid #d4c5ad" }}>Recent Activities</h3>
            {activities.slice(0, 5).map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 10 }}>
                <Badge type={a.type}>{a.type}</Badge>
                <span style={{ fontSize: 12, color: "#5d4e37" }}>{a.text}</span>
              </div>
            ))}
            {activities.length === 0 && <p style={{ color: "#8b7355", fontSize: 13 }}>No recent activities.</p>}
          </div>
        </div>

        {/* health snapshot */}
        <div style={{ marginTop: 24, background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #d4c5ad", boxShadow: "0 2px 8px rgba(45,27,16,.08)" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#2d1b10", marginBottom: 12 }}>SHG Health Snapshot</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 36, fontWeight: 700, color: "#d84315" }}>{calculateHealthScore(selectedSHG)}</div>
              <div style={{ fontSize: 11, color: "#5d4e37", textTransform: "uppercase", letterSpacing: 0.5 }}>Health Score</div>
            </div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <ProgressBar value={calculateHealthScore(selectedSHG)} maxW="100%" />
            </div>
            <Badge type={getHealthStatus(calculateHealthScore(selectedSHG)).cls}>{getHealthStatus(calculateHealthScore(selectedSHG)).status}</Badge>
          </div>
        </div>
      </div>
    );
  }

  /* ─── MEMBER DASHBOARD ─── */
  if (!me) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#5d4e37" }}>
        <p style={{ fontSize: 16 }}>Could not find your profile. Please log in again.</p>
      </div>
    );
  }

  const hasLoan     = me.LoanStatus === "Active";
  const loanClosed  = me.LoanStatus === "Closed";
  const savingPct   = ((me.Savings / stats.totalSavings) * 100).toFixed(1);

  // personal activity
  const myActivity = [];
  if (hasLoan)      myActivity.push({ text: `Your active loan: ${fmt(me.LoanAmount)}`, type: me.EMIStatus === "Delayed" ? "warning" : "info" });
  if (hasLoan && me.EMIStatus === "Delayed") myActivity.push({ text: "Your EMI payment is delayed. Please contact your leader.", type: "warning" });
  if (hasLoan && me.EMIStatus === "On Time")  myActivity.push({ text: "Your EMI is on time. Great job!", type: "success" });
  if (loanClosed)   myActivity.push({ text: `You successfully completed your loan of ${fmt(me.LoanAmount)}.`, type: "success" });
  if (me.Savings >= 20000) myActivity.push({ text: `Congratulations! Your savings crossed ₹20,000.`, type: "success" });
  myActivity.push({ text: `Next group meeting: February 15, 2026 at 10:00 AM.`, type: "info" });

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: "#2d1b10", marginBottom: 4 }}>My Dashboard</h1>
      <p style={{ color: "#5d4e37", marginBottom: 20 }}>Welcome, <strong>{me.Name}</strong> — {selectedSHG}</p>

      {/* profile card */}
      <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #d4c5ad", boxShadow: "0 2px 8px rgba(45,27,16,.08)", marginBottom: 24, display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* avatar */}
        <div style={{ textAlign: "center", minWidth: 100 }}>
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            background: "linear-gradient(135deg,#d84315,#ffa726)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 32, fontWeight: 700, color: "#fff", margin: "0 auto 10px",
          }}>
            {me.Name[0]}
          </div>
          <Badge type="info">{me.Role}</Badge>
        </div>
        {/* details */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#2d1b10", marginBottom: 2 }}>{me.Name}</h2>
          <p style={{ color: "#5d4e37", fontSize: 13, marginBottom: 12 }}>Age {me.Age} · Joined {me.JoinDate} · {selectedSHG}</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { label: "Attendance", value: me.Attendance + "%", sub: me.Attendance >= 90 ? "Excellent" : me.Attendance >= 80 ? "Good" : "Fair" },
              { label: "Savings",    value: fmt(me.Savings),     sub: savingPct + "% of group total" },
            ].map((item) => (
              <div key={item.label} style={{ background: "#f5f1e8", borderRadius: 10, padding: "10px 14px" }}>
                <div style={{ fontSize: 11, color: "#8b7355", textTransform: "uppercase", letterSpacing: 0.5 }}>{item.label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#2d1b10", marginTop: 2 }}>{item.value}</div>
                <div style={{ fontSize: 11, color: "#5d4e37" }}>{item.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* stat cards – personal only */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 16, marginBottom: 24 }}>
        <StatCard icon="📊" value={me.Attendance + "%"} label="My Attendance" />
        <StatCard icon="💰" value={fmt(me.Savings)} label="My Savings" />
        <StatCard icon="📋" value={me.LoanStatus === "None" ? "None" : fmt(me.LoanAmount)} label="My Loan" />
        <StatCard icon="✓"  value={me.EMIStatus === "N/A" ? "—" : me.EMIStatus} label="EMI Status" gradientColor={me.EMIStatus === "Delayed" ? "#c62828" : "#2e7d32"} />
      </div>

      {/* attendance progress */}
      <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #d4c5ad", boxShadow: "0 2px 8px rgba(45,27,16,.08)", marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#2d1b10", marginBottom: 10 }}>Attendance Progress</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <ProgressBar value={me.Attendance} maxW={240} />
          <span style={{ fontSize: 14, fontWeight: 600, color: "#2d1b10" }}>{me.Attendance}%</span>
          {attendanceBadge(me.Attendance)}
        </div>
        <p style={{ fontSize: 12, color: "#8b7355", marginTop: 8 }}>
          {me.Attendance >= 90 ? "Keep it up! You have excellent attendance." : me.Attendance >= 80 ? "Good attendance. Try to attend more meetings to reach Excellent." : "Consider attending more meetings to improve your record."}
        </p>
      </div>

      {/* loan status card (only if has/had loan) */}
      {me.LoanStatus !== "None" && (
        <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #d4c5ad", boxShadow: "0 2px 8px rgba(45,27,16,.08)", marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#2d1b10", marginBottom: 12 }}>Loan Details</h3>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 140 }}>
              <div style={{ fontSize: 11, color: "#8b7355", textTransform: "uppercase", letterSpacing: 0.5 }}>Loan Amount</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#2d1b10" }}>{fmt(me.LoanAmount)}</div>
            </div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <div style={{ fontSize: 11, color: "#8b7355", textTransform: "uppercase", letterSpacing: 0.5 }}>Status</div>
              <div style={{ marginTop: 4 }}>{loanBadge(me.LoanStatus)}</div>
            </div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <div style={{ fontSize: 11, color: "#8b7355", textTransform: "uppercase", letterSpacing: 0.5 }}>EMI Status</div>
              <div style={{ marginTop: 4 }}>{emiBadge(me.EMIStatus)}</div>
            </div>
          </div>
        </div>
      )}

      {/* personal activity feed */}
      <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #d4c5ad", boxShadow: "0 2px 8px rgba(45,27,16,.08)" }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#2d1b10", marginBottom: 16, paddingBottom: 10, borderBottom: "2px solid #d4c5ad" }}>Your Activity</h3>
        {myActivity.map((a, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
            <Badge type={a.type}>{a.type}</Badge>
            <span style={{ fontSize: 12.5, color: "#5d4e37" }}>{a.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PAGE: MEMBERS
// ─────────────────────────────────────────────
function MembersPage({ selectedSHG }) {
  const members = useMemo(() => getMembersBySHG(selectedSHG), [selectedSHG]);
  const rows = members.map((m) => ({
    cells: [
      <strong>{m.Name}</strong>,
      <Badge type="info">{m.Role}</Badge>,
      m.Age,
      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {m.Attendance}% <ProgressBar value={m.Attendance} maxW={80} /> {attendanceBadge(m.Attendance)}
      </span>,
      <strong>{fmt(m.Savings)}</strong>,
      loanBadge(m.LoanStatus),
      emiBadge(m.EMIStatus),
      m.JoinDate,
    ],
  }));
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: "#2d1b10", marginBottom: 4 }}>Member Management</h1>
      <p style={{ color: "#5d4e37", marginBottom: 20 }}>
        {selectedSHG} — <strong>{members.length} members</strong>
      </p>
      <DataTable
        headers={["Name", "Role", "Age", "Attendance", "Savings", "Loan", "EMI", "Joined"]}
        rows={rows}
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// PAGE: SAVINGS & ATTENDANCE
// ─────────────────────────────────────────────
function SavingsPage({ selectedSHG, role, memberName }) {
  const members = useMemo(() => getMembersBySHG(selectedSHG), [selectedSHG]);
  const stats = useMemo(() => getSHGStats(selectedSHG), [selectedSHG]);
  const me = useMemo(() => members.find((m) => m.Name === memberName) || null, [members, memberName]);
  const excellentCount = members.filter((m) => m.Attendance >= 90).length;
  const avgSavings = Math.round(stats.totalSavings / stats.totalMembers);

  const savingsSorted = [...members].sort((a, b) => b.Savings - a.Savings);
  const attSorted = [...members].sort((a, b) => b.Attendance - a.Attendance);

  function savingStatus(s) {
    if (s >= 20000) return { label: "Excellent", type: "success" };
    if (s >= 15000) return { label: "Good", type: "info" };
    if (s >= 10000) return { label: "Fair", type: "warning" };
    return { label: "Growing", type: "secondary" };
  }

  /* ─── MEMBER VIEW ─── */
  if (role === "member" && me) {
    const savPct = ((me.Savings / stats.totalSavings) * 100).toFixed(1);
    const ss = savingStatus(me.Savings);
    const myRank = savingsSorted.findIndex((m) => m.Name === me.Name) + 1;
    const attRank = attSorted.findIndex((m) => m.Name === me.Name) + 1;
    return (
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#2d1b10", marginBottom: 4 }}>My Savings & Attendance</h1>
        <p style={{ color: "#5d4e37", marginBottom: 20 }}>Your personal savings and participation overview</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 16, marginBottom: 24 }}>
          <StatCard icon="💰" value={fmt(me.Savings)} label="My Savings" />
          <StatCard icon="📊" value={me.Attendance + "%"} label="My Attendance" />
          <StatCard icon="📈" value={savPct + "%"} label="Group Contribution" />
          <StatCard icon="🏅" value={"#" + myRank} label="Savings Rank" gradientColor="#00897b" />
        </div>

        {/* savings card */}
        <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #d4c5ad", boxShadow: "0 2px 8px rgba(45,27,16,.08)", marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#2d1b10", marginBottom: 14 }}>Savings Details</h3>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 140, background: "#f5f1e8", borderRadius: 10, padding: 16 }}>
              <div style={{ fontSize: 11, color: "#8b7355", textTransform: "uppercase", letterSpacing: 0.5 }}>Total Saved</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#2d1b10", marginTop: 4 }}>{fmt(me.Savings)}</div>
              <div style={{ marginTop: 6 }}><Badge type={ss.type}>{ss.label}</Badge></div>
            </div>
            <div style={{ flex: 1, minWidth: 140, background: "#f5f1e8", borderRadius: 10, padding: 16 }}>
              <div style={{ fontSize: 11, color: "#8b7355", textTransform: "uppercase", letterSpacing: 0.5 }}>% of Group Total</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#2d1b10", marginTop: 4 }}>{savPct}%</div>
              <div style={{ marginTop: 8 }}><ProgressBar value={parseFloat(savPct) * 5} maxW={120} /></div>
            </div>
            <div style={{ flex: 1, minWidth: 140, background: "#f5f1e8", borderRadius: 10, padding: 16 }}>
              <div style={{ fontSize: 11, color: "#8b7355", textTransform: "uppercase", letterSpacing: 0.5 }}>Savings Rank</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#00897b", marginTop: 4 }}>#{myRank} <span style={{ fontSize: 13, color: "#5d4e37" }}>of {members.length}</span></div>
            </div>
          </div>
        </div>

        {/* attendance card */}
        <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #d4c5ad", boxShadow: "0 2px 8px rgba(45,27,16,.08)" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#2d1b10", marginBottom: 14 }}>Attendance Details</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
            <ProgressBar value={me.Attendance} maxW={260} />
            <span style={{ fontSize: 16, fontWeight: 700, color: "#2d1b10" }}>{me.Attendance}%</span>
            {attendanceBadge(me.Attendance)}
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div style={{ background: "#f5f1e8", borderRadius: 10, padding: "10px 16px", flex: 1, minWidth: 140 }}>
              <div style={{ fontSize: 11, color: "#8b7355", textTransform: "uppercase" }}>Attendance Rank</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#00897b", marginTop: 2 }}>#{attRank} <span style={{ fontSize: 12, color: "#5d4e37" }}>of {members.length}</span></div>
            </div>
            <div style={{ background: "#f5f1e8", borderRadius: 10, padding: "10px 16px", flex: 1, minWidth: 140 }}>
              <div style={{ fontSize: 11, color: "#8b7355", textTransform: "uppercase" }}>Group Average</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#2d1b10", marginTop: 2 }}>{stats.avgAttendance}%</div>
            </div>
          </div>
          <p style={{ fontSize: 12, color: "#8b7355", marginTop: 12 }}>
            {me.Attendance >= 90 ? "Excellent attendance! You are among the top contributors." : me.Attendance >= 80 ? "Good attendance. A few more meetings will get you to Excellent." : "Try attending more meetings to improve your record."}
          </p>
        </div>
      </div>
    );
  }

  /* ─── LEADER VIEW (full group) ─── */
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: "#2d1b10", marginBottom: 4 }}>Savings & Attendance</h1>
      <p style={{ color: "#5d4e37", marginBottom: 20 }}>Track member savings and meeting participation</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 16, marginBottom: 24 }}>
        <StatCard icon="💰" value={fmt(stats.totalSavings)} label="Total Savings" />
        <StatCard icon="📊" value={fmt(avgSavings)} label="Avg Savings" />
        <StatCard icon="✓" value={stats.avgAttendance + "%"} label="Avg Attendance" />
        <StatCard icon="⭐" value={excellentCount} label="Excellent Attendance" />
      </div>

      <h3 style={{ fontSize: 16, fontWeight: 700, color: "#2d1b10", marginBottom: 10 }}>Member Savings</h3>
      <DataTable
        headers={["Name", "Role", "Savings", "Contribution %", "Status"]}
        rows={savingsSorted.map((m) => {
          const pct = ((m.Savings / stats.totalSavings) * 100).toFixed(1);
          const s = savingStatus(m.Savings);
          return {
            cells: [<strong>{m.Name}</strong>, <Badge type="info">{m.Role}</Badge>, <strong>{fmt(m.Savings)}</strong>, pct + "%", <Badge type={s.type}>{s.label}</Badge>],
          };
        })}
      />

      <h3 style={{ fontSize: 16, fontWeight: 700, color: "#2d1b10", marginTop: 24, marginBottom: 10 }}>Attendance Summary</h3>
      <DataTable
        headers={["Name", "Role", "Rate", "Progress", "Status"]}
        rows={attSorted.map((m) => ({
          cells: [<strong>{m.Name}</strong>, <Badge type="info">{m.Role}</Badge>, m.Attendance + "%", <ProgressBar value={m.Attendance} maxW={140} />, attendanceBadge(m.Attendance)],
        }))}
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// PAGE: LOANS
// ─────────────────────────────────────────────
function LoansPage({ selectedSHG, role, memberName }) {
  const members = useMemo(() => getMembersBySHG(selectedSHG), [selectedSHG]);
  const me = useMemo(() => members.find((m) => m.Name === memberName) || null, [members, memberName]);
  const loansData = members.filter((m) => m.LoanStatus !== "None");
  const stats = useMemo(() => getSHGStats(selectedSHG), [selectedSHG]);
  const closed = loansData.filter((l) => l.LoanStatus === "Closed").length;
  const totalAmt = loansData.reduce((s, l) => s + l.LoanAmount, 0);

  /* ─── MEMBER VIEW ─── */
  if (role === "member") {
    const hasLoan = me && me.LoanStatus !== "None";
    return (
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#2d1b10", marginBottom: 4 }}>My Loan</h1>
        <p style={{ color: "#5d4e37", marginBottom: 20 }}>Your personal loan and EMI status</p>

        {!hasLoan ? (
          <div style={{ background: "#fff", borderRadius: 12, padding: 32, border: "1px solid #d4c5ad", boxShadow: "0 2px 8px rgba(45,27,16,.08)", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#2d1b10", marginBottom: 6 }}>No Active Loan</h3>
            <p style={{ color: "#5d4e37", fontSize: 14 }}>You currently don't have any loan. Contact your SHG leader to apply for one.</p>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 16, marginBottom: 24 }}>
              <StatCard icon="💰" value={fmt(me.LoanAmount)} label="Loan Amount" />
              <StatCard icon="📋" value={me.LoanStatus} label="Loan Status" gradientColor={me.LoanStatus === "Active" ? "#0277bd" : "#2e7d32"} />
              <StatCard icon="✓" value={me.EMIStatus} label="EMI Status" gradientColor={me.EMIStatus === "Delayed" ? "#c62828" : me.EMIStatus === "Completed" ? "#2e7d32" : "#0277bd"} />
            </div>

            {me.EMIStatus === "Delayed" && (
              <div style={{ padding: "12px 16px", borderRadius: 8, borderLeft: "4px solid #c62828", background: "rgba(198,40,40,.06)", color: "#c62828", marginBottom: 16, fontSize: 13 }}>
                ⚠ <strong>Important:</strong> Your EMI payment is delayed. Please contact your SHG leader to resolve this.
              </div>
            )}
            {me.EMIStatus === "On Time" && (
              <div style={{ padding: "12px 16px", borderRadius: 8, borderLeft: "4px solid #2e7d32", background: "rgba(46,125,50,.06)", color: "#2e7d32", marginBottom: 16, fontSize: 13 }}>
                ✓ Your EMI payment is on time. Keep it up!
              </div>
            )}

            <div style={{ background: "#fff", borderRadius: 12, padding: 24, border: "1px solid #d4c5ad", boxShadow: "0 2px 8px rgba(45,27,16,.08)" }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#2d1b10", marginBottom: 16 }}>Loan Details</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {[
                  { label: "Loan Amount", value: fmt(me.LoanAmount), icon: "💰" },
                  { label: "Loan Status", value: me.LoanStatus, icon: "📋", badge: loanBadge(me.LoanStatus) },
                  { label: "EMI Status", value: me.EMIStatus, icon: "✓", badge: emiBadge(me.EMIStatus) },
                  { label: "Member Since", value: me.JoinDate, icon: "📅" },
                ].map((item) => (
                  <div key={item.label} style={{ background: "#f5f1e8", borderRadius: 10, padding: 16 }}>
                    <div style={{ fontSize: 11, color: "#8b7355", textTransform: "uppercase", letterSpacing: 0.5 }}>{item.icon} {item.label}</div>
                    <div style={{ marginTop: 6 }}>{item.badge || <span style={{ fontSize: 17, fontWeight: 700, color: "#2d1b10" }}>{item.value}</span>}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  /* ─── LEADER VIEW (full group) ─── */
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: "#2d1b10", marginBottom: 4 }}>Loan Management</h1>
      <p style={{ color: "#5d4e37", marginBottom: 20 }}>Track and manage member loans and EMI payments</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 16, marginBottom: 24 }}>
        <StatCard icon="📋" value={loansData.length} label="Total Loans" />
        <StatCard icon="📊" value={stats.activeLoans} label="Active Loans" />
        <StatCard icon="✓" value={closed} label="Closed Loans" />
        <StatCard icon="💰" value={fmt(totalAmt)} label="Total Loan Amount" />
      </div>

      {stats.delayedEMI > 0 && (
        <div style={{ padding: "10px 14px", borderRadius: 8, borderLeft: "4px solid #f57c00", background: "rgba(245,124,0,.06)", color: "#f57c00", marginBottom: 16, fontSize: 13 }}>
          ⚠ <strong>Important:</strong> Rows highlighted in red indicate members with delayed EMI payments.
        </div>
      )}

      <DataTable
        headers={["Member", "Role", "Amount", "Loan Status", "EMI Status", "Date"]}
        rows={loansData.map((m) => ({
          _highlight: m.EMIStatus === "Delayed" ? "rgba(198,40,40,.06)" : undefined,
          cells: [
            <strong>{m.Name}</strong>,
            <Badge type="info">{m.Role}</Badge>,
            <strong>{fmt(m.LoanAmount)}</strong>,
            loanBadge(m.LoanStatus),
            emiBadge(m.EMIStatus),
            m.JoinDate,
          ],
        }))}
      />

      {/* guide cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 24 }}>
        {[
          {
            title: "Loan Decision Process",
            items: ["Review member's savings & attendance", "Verify loan purpose and amount", "Group voting and decision", "Set EMI schedule and track payments"],
          },
          {
            title: "EMI Tracking Tips",
            items: ["Send reminders 3 days before due date", "Follow up immediately on delays", "Document all payment transactions", "Review loan portfolio monthly"],
          },
        ].map((card) => (
          <div key={card.title} style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #d4c5ad", boxShadow: "0 2px 8px rgba(45,27,16,.08)" }}>
            <h4 style={{ fontSize: 15, fontWeight: 700, color: "#2d1b10", marginBottom: 10 }}>{card.title}</h4>
            {card.items.map((it, i) => (
              <p key={i} style={{ fontSize: 12.5, color: "#5d4e37", marginBottom: 5 }}>
                <strong>Step {i + 1}:</strong> {it}
              </p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PAGE: MEETINGS (static, mirrors original)
// ─────────────────────────────────────────────
const MEETINGS = [
  {
    title: "Monthly General Meeting",
    date: "January 15, 2026 • 10:00 AM",
    badge: { label: "Completed", type: "success" },
    agenda: ["Review monthly savings contributions", "Discuss new loan applications", "Plan upcoming community event"],
    attendance: "18/20 members present (90%)",
    decisions: ["Approved loan of ₹40,000 for business expansion", "Decided to increase monthly savings target by ₹500", "Scheduled community health camp for Feb 10"],
  },
  {
    title: "Loan Review Meeting",
    date: "December 28, 2025 • 2:00 PM",
    badge: { label: "Completed", type: "success" },
    agenda: ["Review all active loans and EMI status", "Follow up on delayed payments", "Discuss loan policy updates"],
    attendance: "19/20 members present (95%)",
    decisions: ["Contacted members with delayed EMI payments", "Extended grace period for one member (medical)", "Updated loan interest rate policy"],
  },
  {
    title: "Financial Planning Workshop",
    date: "December 10, 2025 • 11:00 AM",
    badge: { label: "Workshop", type: "info" },
    agenda: ["Training on basic financial literacy", "Budgeting and savings strategies", "Understanding loan agreements"],
    attendance: "17/20 members present (85%)",
    decisions: ["Members gained financial planning understanding", "Created personal savings goals", "Discussed long-term group objectives"],
  },
];

function MeetingsPage() {
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

// ─────────────────────────────────────────────
// PAGE: NOTIFICATIONS (dynamic from CSV)
// ─────────────────────────────────────────────
function NotificationsPage({ selectedSHG, role, memberName }) {
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

// ─────────────────────────────────────────────
// PAGE: REPORTS
// ─────────────────────────────────────────────
function ReportsPage({ selectedSHG }) {
  const stats = useMemo(() => getSHGStats(selectedSHG), [selectedSHG]);
  const summaries = useMemo(() => getAllSHGSummaries(), []);
  const members = useMemo(() => getMembersBySHG(selectedSHG), [selectedSHG]);
  const avgSavings = Math.round(stats.totalSavings / stats.totalMembers);
  const onTimePct = stats.activeLoans > 0 ? Math.round((stats.onTimeEMI / stats.activeLoans) * 100) : 100;

  const roleBreakdown = {};
  members.forEach((m) => { roleBreakdown[m.Role] = (roleBreakdown[m.Role] || 0) + 1; });

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: "#2d1b10", marginBottom: 4 }}>Reports & Analytics</h1>
      <p style={{ color: "#5d4e37", marginBottom: 20 }}>Comprehensive reports for all SHGs</p>

      {/* current SHG report */}
      <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #d4c5ad", boxShadow: "0 2px 8px rgba(45,27,16,.08)", marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#2d1b10", marginBottom: 16, paddingBottom: 10, borderBottom: "2px solid #d4c5ad" }}>
          Current SHG Report: <span style={{ color: "#d84315" }}>{selectedSHG}</span>
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 16, marginBottom: 20 }}>
          <StatCard icon="👥" value={stats.totalMembers} label="Members" />
          <StatCard icon="💰" value={fmt(stats.totalSavings)} label="Savings" />
          <StatCard icon="📋" value={stats.activeLoans} label="Active Loans" />
          <StatCard icon="📊" value={stats.avgAttendance + "%"} label="Attendance" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ background: "#f5f1e8", borderRadius: 10, padding: 16 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: "#2d1b10", marginBottom: 10 }}>Financial Metrics</h4>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #d4c5ad", fontSize: 13 }}>
              <span style={{ color: "#5d4e37" }}>Avg Savings / Member</span>
              <strong>{fmt(avgSavings)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13 }}>
              <span style={{ color: "#5d4e37" }}>EMI On-Time Rate</span>
              <strong>{onTimePct}%</strong>
            </div>
          </div>
          <div style={{ background: "#f5f1e8", borderRadius: 10, padding: 16 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: "#2d1b10", marginBottom: 10 }}>Role Breakdown</h4>
            {Object.entries(roleBreakdown).map(([role, count]) => (
              <div key={role} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #d4c5ad", fontSize: 13 }}>
                <span>{role}</span>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* all SHGs comparison */}
      <h3 style={{ fontSize: 16, fontWeight: 700, color: "#2d1b10", marginBottom: 10 }}>All SHGs Comparison</h3>
      <DataTable
        headers={["SHG Name", "Members", "Savings", "Active Loans", "Attendance", "Health Score"]}
        rows={summaries.map((s) => {
          const hs = getHealthStatus(s.healthScore);
          return {
            cells: [
              <strong>{s.name}</strong>,
              s.totalMembers,
              <strong>{fmt(s.totalSavings)}</strong>,
              s.activeLoans,
              s.avgAttendance + "%",
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <strong>{s.healthScore}</strong> <Badge type={hs.cls}>{hs.status}</Badge>
              </span>,
            ],
          };
        })}
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// PAGE: INSIGHTS
// ─────────────────────────────────────────────
function InsightsPage({ selectedSHG }) {
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

// ─────────────────────────────────────────────
// PAGE: LANDING
// ─────────────────────────────────────────────
function LandingPage({ onGetStarted }) {
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

// ─────────────────────────────────────────────
// PAGE: LOGIN
// ─────────────────────────────────────────────
function LoginPage({ onLogin, onBack }) {
  const [role, setRole] = useState(null);
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,rgba(216,67,21,.06),rgba(255,167,38,.06))", fontFamily: "'Poppins', sans-serif" }}>
      <div style={{ background: "#fff", padding: 40, borderRadius: 16, boxShadow: "0 8px 32px rgba(45,27,16,.15)", width: "100%", maxWidth: 440, border: "1px solid #d4c5ad" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 36, marginBottom: 10, background: "linear-gradient(135deg,#d84315,#ffa726)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>◆</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#2d1b10", marginBottom: 6 }}>Welcome Back</h1>
          <p style={{ color: "#5d4e37" }}>Select your role to continue</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
          {[{ key: "member", icon: "👤", label: "Member" }, { key: "leader", icon: "⭐", label: "SHG Leader" }].map((r) => (
            <button key={r.key} onClick={() => setRole(r.key)} style={{ padding: "20px 12px", border: role === r.key ? "2px solid #d84315" : "2px solid #d4c5ad", borderRadius: 12, background: role === r.key ? "linear-gradient(135deg,rgba(216,67,21,.1),rgba(255,167,38,.1))" : "#fff", boxShadow: role === r.key ? "0 4px 12px rgba(216,67,21,.2)" : "none", cursor: "pointer", fontFamily: "inherit", transition: "all .2s" }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{r.icon}</div>
              <div style={{ fontWeight: 600, fontSize: 14, color: "#2d1b10" }}>{r.label}</div>
            </button>
          ))}
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontWeight: 600, fontSize: 13, color: "#2d1b10", marginBottom: 6 }}>Username</label>
          <input type="text" placeholder="Enter your username" style={{ width: "100%", padding: "10px 14px", border: "2px solid #d4c5ad", borderRadius: 8, fontSize: 14, fontFamily: "inherit", boxSizing: "border-box" }} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontWeight: 600, fontSize: 13, color: "#2d1b10", marginBottom: 6 }}>Password</label>
          <input type="password" placeholder="Enter your password" style={{ width: "100%", padding: "10px 14px", border: "2px solid #d4c5ad", borderRadius: 8, fontSize: 14, fontFamily: "inherit", boxSizing: "border-box" }} />
        </div>
        <button onClick={() => { if (role) onLogin(role); }} style={{ width: "100%", padding: "12px", background: role ? "linear-gradient(135deg,#d84315,#ff7043)" : "#ccc", color: "#fff", border: "none", borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: role ? "pointer" : "not-allowed", boxShadow: role ? "0 4px 12px rgba(216,67,21,.3)" : "none", fontFamily: "inherit", transition: "all .2s" }}>
          Login
        </button>
        {!role && <p style={{ textAlign: "center", fontSize: 12, color: "#c62828", marginTop: 8 }}>Please select a role first</p>}
        <div style={{ textAlign: "center", marginTop: 18 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: "#5d4e37", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>← Back to Home</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PAGE: SHG SELECT  (leader picks SHG; member picks SHG then picks themselves)
// ─────────────────────────────────────────────
function SHGSelectPage({ role, onSelect, onBack }) {
  const [chosenSHG, setChosenSHG]       = useState(null);
  const [chosenMember, setChosenMember] = useState(null);
  const [step, setStep]                 = useState(1); // 1 = pick SHG, 2 = pick member (member-role only)
  const shgs = useMemo(() => getAllSHGs(), []);

  const shgMembers = useMemo(() => chosenSHG ? getMembersBySHG(chosenSHG) : [], [chosenSHG]);

  function handleContinue() {
    if (role === "leader") {
      onSelect(chosenSHG, null);          // leader: no member identity needed
    } else {
      // member: first go to step 2
      if (step === 1) { setStep(2); setChosenMember(null); return; }
      onSelect(chosenSHG, chosenMember);  // member: pass both SHG + member name
    }
  }

  const canContinue = step === 1 ? !!chosenSHG : !!chosenMember;

  return (
    <div
      style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(135deg,rgba(216,67,21,.06),rgba(255,167,38,.06))",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <div style={{ background: "#fff", padding: 40, borderRadius: 16, boxShadow: "0 8px 32px rgba(45,27,16,.15)", width: "100%", maxWidth: 500, border: "1px solid #d4c5ad" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 36, marginBottom: 10, background: "linear-gradient(135deg,#d84315,#ffa726)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>◆</div>
          {step === 1 ? (
            <>
              <h1 style={{ fontSize: 26, fontWeight: 700, color: "#2d1b10", marginBottom: 6 }}>Select Your SHG</h1>
              <p style={{ color: "#5d4e37" }}>Choose a Self-Help Group {role === "member" ? "you belong to" : "to manage"}</p>
            </>
          ) : (
            <>
              <h1 style={{ fontSize: 26, fontWeight: 700, color: "#2d1b10", marginBottom: 6 }}>Select Your Profile</h1>
              <p style={{ color: "#5d4e37" }}>Choose your name from <strong>{chosenSHG}</strong></p>
            </>
          )}
        </div>

        {/* step indicator */}
        {role === "member" && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 20 }}>
            {[1, 2].map((s) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700,
                  background: step >= s ? "linear-gradient(135deg,#d84315,#ff7043)" : "#d4c5ad",
                  color: step >= s ? "#fff" : "#fff",
                }}>
                  {s}
                </div>
                <span style={{ fontSize: 12, color: step >= s ? "#d84315" : "#8b7355", fontWeight: 600 }}>
                  {s === 1 ? "Select SHG" : "Select Profile"}
                </span>
                {s < 2 && <span style={{ color: "#d4c5ad", margin: "0 4px" }}>→</span>}
              </div>
            ))}
          </div>
        )}

        {/* STEP 1: SHG list */}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            {shgs.map((name) => {
              const st = getSHGStats(name);
              const active = chosenSHG === name;
              return (
                <button
                  key={name}
                  onClick={() => setChosenSHG(name)}
                  style={{
                    padding: "16px 18px",
                    border: active ? "2px solid #d84315" : "2px solid #d4c5ad",
                    borderRadius: 12,
                    background: active ? "linear-gradient(135deg,rgba(216,67,21,.1),rgba(255,167,38,.1))" : "#fff",
                    boxShadow: active ? "0 4px 12px rgba(216,67,21,.2)" : "none",
                    cursor: "pointer", textAlign: "left", fontFamily: "inherit", transition: "all .2s",
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 15, color: "#2d1b10" }}>{name}</div>
                  <div style={{ color: "#5d4e37", fontSize: 13, marginTop: 2 }}>
                    {st.totalMembers} members · {fmt(st.totalSavings)} savings
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* STEP 2: member picker (member-role only) */}
        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24, maxHeight: 280, overflowY: "auto", paddingRight: 4 }}>
            {shgMembers.map((m) => {
              const active = chosenMember === m.Name;
              return (
                <button
                  key={m.MemberID}
                  onClick={() => setChosenMember(m.Name)}
                  style={{
                    padding: "12px 16px", display: "flex", alignItems: "center", gap: 14,
                    border: active ? "2px solid #d84315" : "2px solid #d4c5ad",
                    borderRadius: 12,
                    background: active ? "linear-gradient(135deg,rgba(216,67,21,.1),rgba(255,167,38,.1))" : "#fff",
                    boxShadow: active ? "0 4px 12px rgba(216,67,21,.2)" : "none",
                    cursor: "pointer", textAlign: "left", fontFamily: "inherit", transition: "all .2s",
                  }}
                >
                  <div style={{
                    width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
                    background: "linear-gradient(135deg,#d84315,#ffa726)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontWeight: 700, fontSize: 16,
                  }}>
                    {m.Name[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "#2d1b10" }}>{m.Name}</div>
                    <div style={{ fontSize: 12, color: "#5d4e37" }}>{m.Role} · Age {m.Age}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* continue button */}
        {canContinue && (
          <button
            onClick={handleContinue}
            style={{
              width: "100%", padding: "12px",
              background: "linear-gradient(135deg,#d84315,#ff7043)", color: "#fff",
              border: "none", borderRadius: 8, fontSize: 16, fontWeight: 600,
              cursor: "pointer", boxShadow: "0 4px 12px rgba(216,67,21,.3)", fontFamily: "inherit",
            }}
          >
            {step === 1 && role === "member" ? "Continue →" : "Continue to Dashboard"}
          </button>
        )}
        

        {/* back links */}
        <div style={{ textAlign: "center", marginTop: 18 }}>
          {step === 2 ? (
            <button onClick={() => { setStep(1); setChosenMember(null); }} style={{ background: "none", border: "none", color: "#5d4e37", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
              ← Back to SHG selection
            </button>
          ) : (
            <button onClick={onBack} style={{ background: "none", border: "none", color: "#5d4e37", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
              ← Back to Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────
export default function App() {
  const [flow, setFlow]               = useState("landing");   // landing → login → select → app
  const [role, setRole]               = useState(null);        // "leader" | "member"
  const [selectedSHG, setSelectedSHG] = useState(null);
  const [memberName, setMemberName]   = useState(null);        // only set when role==="member"
  const [page, setPage]               = useState("dashboard");

  // called by LoginPage with chosen role
  const handleLogin = useCallback((chosenRole) => {
    setRole(chosenRole);
    setFlow("select");
  }, []);

  // called by SHGSelectPage with (shg, name|null)
  const handleSelect = useCallback((shg, name) => {
    setSelectedSHG(shg);
    setMemberName(name);          // null for leader, member's name for member
    setFlow("app");
    setPage("dashboard");
  }, []);

  // Switch SHG → back to select screen (keeps role alive)
  const handleSwitchSHG = useCallback(() => {
    setSelectedSHG(null);
    setMemberName(null);
    setFlow("select");
    setPage("dashboard");
  }, []);

  // Logout → full reset
  const handleLogout = useCallback(() => {
    setSelectedSHG(null);
    setMemberName(null);
    setRole(null);
    setFlow("landing");
  }, []);

  // ── PRE-APP SCREENS ──
  if (flow === "landing") return <LandingPage onGetStarted={() => setFlow("login")} />;
  if (flow === "login")   return <LoginPage  onLogin={handleLogin}  onBack={() => setFlow("landing")} />;
  if (flow === "select")  return <SHGSelectPage role={role} onSelect={handleSelect} onBack={() => setFlow("login")} />;

  // ── MAIN APP ──
  // Member-role guard: if somehow a member tries to hit a leader-only page, bounce to dashboard
  const LEADER_ONLY = new Set(["members", "reports", "insights"]);
  const safePage = (role === "member" && LEADER_ONLY.has(page)) ? "dashboard" : page;

  const pageContent = (() => {
    switch (safePage) {
      case "dashboard":     return <DashboardPage selectedSHG={selectedSHG} role={role} memberName={memberName} setPage={setPage} />;
      case "members":       return <MembersPage   selectedSHG={selectedSHG} />;
      case "savings":       return <SavingsPage   selectedSHG={selectedSHG} role={role} memberName={memberName} />;
      case "loans":         return <LoansPage     selectedSHG={selectedSHG} role={role} memberName={memberName} />;
      case "meetings":      return <MeetingsPage />;
      case "notifications": return <NotificationsPage selectedSHG={selectedSHG} role={role} memberName={memberName} />;
      case "reports":       return <ReportsPage   selectedSHG={selectedSHG} />;
      case "insights":      return <InsightsPage  selectedSHG={selectedSHG} />;
      default:              return <DashboardPage selectedSHG={selectedSHG} role={role} memberName={memberName} setPage={setPage} />;
    }
  })();

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Poppins', sans-serif", background: "#fdfbf7" }}>
      <Sidebar
        selectedSHG={selectedSHG}
        role={role}
        memberName={memberName}
        page={safePage}
        setPage={setPage}
        onSwitchSHG={handleSwitchSHG}
        onLogout={handleLogout}
      />
      <main style={{ flex: 1, padding: 28, minWidth: 0, overflowX: "auto" }}>{pageContent}</main>
    </div>
  );
}
