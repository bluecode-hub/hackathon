export function DataTable({ headers, rows }) {
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
