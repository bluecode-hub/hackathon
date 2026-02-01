export function ProgressBar({ value, maxW = 120 }) {
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
