import { RAW_CSV, TRAINING_CATALOG, TRAINING_PROGRESS } from "./mockData";

export function parseCSV(text) {
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

export const ALL_MEMBERS = parseCSV(RAW_CSV);

export function getMembersBySHG(shg) {
    return ALL_MEMBERS.filter((m) => m.SHGName === shg);
}

export function getAllSHGs() {
    return [...new Set(ALL_MEMBERS.map((m) => m.SHGName))].sort();
}

export function getSHGStats(shg) {
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

export function calculateHealthScore(shg) {
    const stats = getSHGStats(shg);
    const activeLoans = getMembersBySHG(shg).filter((m) => m.LoanStatus === "Active");
    let onTimePct = 100;
    if (activeLoans.length > 0)
        onTimePct = (activeLoans.filter((m) => m.EMIStatus === "On Time").length / activeLoans.length) * 100;
    return Math.round(((stats.avgAttendance + onTimePct) / 2) * 10) / 10;
}

export function getHealthStatus(score) {
    if (score >= 90) return { status: "Excellent", cls: "success" };
    if (score >= 80) return { status: "Good", cls: "info" };
    if (score >= 70) return { status: "Fair", cls: "warning" };
    return { status: "Needs Attention", cls: "danger" };
}

export function getAllSHGSummaries() {
    return getAllSHGs().map((name) => {
        const stats = getSHGStats(name);
        return { name, ...stats, healthScore: calculateHealthScore(name) };
    });
}

export function fmt(n) {
    return "₹" + n.toLocaleString("en-IN");
}

export function getTrainingForMember(name) {
    const prog = TRAINING_PROGRESS[name] || [0, 0, 0, 0];
    return TRAINING_CATALOG.map((m, i) => {
        const completed = prog[i];
        const total = m.totalLessons;
        let status = completed === total ? "done"
            : completed > 0 ? "in-progress"
                : i === 0 ? "in-progress"
                    : (prog[i - 1] < TRAINING_CATALOG[i - 1].totalLessons) ? "locked"
                        : "in-progress";
        return { ...m, completed, status };
    });
}
