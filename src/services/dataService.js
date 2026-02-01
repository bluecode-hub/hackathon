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
