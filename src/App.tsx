import { useState, useCallback } from "react";
// @ts-ignore
import { RAW_CSV } from "./data/mockData";

// Components
import { Sidebar } from "./components/Sidebar";
import { SHGChatbot } from "./components/SHGChatbot";

// Pages
import DashboardPage from "./pages/DashboardPage";
import MembersPage from "./pages/MembersPage";
import SavingsPage from "./pages/SavingsPage";
import LoansPage from "./pages/LoansPage";
import MeetingsPage from "./pages/MeetingsPage";
import NotificationsPage from "./pages/NotificationsPage";
import ReportsPage from "./pages/ReportsPage";
import InsightsPage from "./pages/InsightsPage";
import NGOLocatorPage from "./pages/NGOLocatorPage";
import TrainingPage from "./pages/TrainingPage";
import SuperAdminPage from "./pages/SuperAdminPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SHGSelectPage from "./pages/SHGSelectPage";

export default function App() {
  const [flow, setFlow] = useState("landing");   // landing → login → select → app
  const [user, setUser] = useState(null);        // Full user object from backend
  const [role, setRole] = useState(null);        // "leader" | "member" | "superadmin"
  const [selectedSHG, setSelectedSHG] = useState(null);
  const [memberName, setMemberName] = useState(null);        // only set when role==="member"
  const [page, setPage] = useState("dashboard");

  // called by LoginPage with backend user object
  const handleLogin = useCallback((userData: any) => {
    setRole(userData.role);
    setUser(userData); // Store full user if needed (you might need to add `user` state later, but for now we use individual states)

    if (userData.role === "superadmin") {
      setFlow("app");
      setPage("superadmin");
    } else {
      // Direct redirect based on data
      setSelectedSHG(userData.shg);
      if (userData.role === "member") {
        setMemberName(userData.name);
      } else {
        setMemberName(null);
      }
      setFlow("app"); // Go straight to app, skipping selection screen
      setPage("dashboard");
    }
  }, []);

  // called by SHGSelectPage with (shg, name|null)
  const handleSelect = useCallback((shg: any, name: any) => {
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
  if (flow === "login") return <LoginPage onLogin={handleLogin} onBack={() => setFlow("landing")} />;
  if (flow === "select") return <SHGSelectPage role={role} onSelect={handleSelect} onBack={() => setFlow("login")} />;

  // ── MAIN APP ──
  // Member-role guard: if somehow a member tries to hit a leader-only page, bounce to dashboard
  const LEADER_ONLY = new Set(["members", "reports", "insights", "ngolocator"]);
  const safePage = (role === "member" && LEADER_ONLY.has(page)) ? "dashboard"
    : (role === "superadmin" && page !== "superadmin") ? "superadmin"
      : page;

  const pageContent = (() => {
    switch (safePage) {
      case "dashboard": return <DashboardPage selectedSHG={selectedSHG} role={role} memberName={memberName} setPage={setPage} />;
      case "members": return <MembersPage selectedSHG={selectedSHG} />;
      case "savings": return <SavingsPage selectedSHG={selectedSHG} role={role} memberName={memberName} />;
      case "loans": return <LoansPage selectedSHG={selectedSHG} role={role} memberName={memberName} />;
      case "meetings": return <MeetingsPage />;
      case "notifications": return <NotificationsPage selectedSHG={selectedSHG} role={role} memberName={memberName} />;
      case "training": return <TrainingPage selectedSHG={selectedSHG} role={role} memberName={memberName} />;
      case "ngolocator": return <NGOLocatorPage />;
      case "reports": return <ReportsPage selectedSHG={selectedSHG} />;
      case "insights": return <InsightsPage selectedSHG={selectedSHG} />;
      case "superadmin": return <SuperAdminPage />;
      default: return <DashboardPage selectedSHG={selectedSHG} role={role} memberName={memberName} setPage={setPage} />;
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
      <SHGChatbot csvData={RAW_CSV} />
    </div>
  );
}
