import { useMemo } from "react";
import { getMembersBySHG, fmt } from "../data/dataService";
import { Badge, attendanceBadge, loanBadge, emiBadge } from "../components/Badge";
import { ProgressBar } from "../components/ProgressBar";
import { DataTable } from "../components/DataTable";

export default function MembersPage({ selectedSHG }) {
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
