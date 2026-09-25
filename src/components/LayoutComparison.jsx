import React from "react";

function render2DPreview(layout) {
  // Minimal quick preview for comparison
  const boxSize = 110;
  return (
    <svg width={boxSize} height={boxSize} style={{ border: "2px solid #333", margin: 4, background: "#fafaff" }}>
      <rect x={4} y={4} width={boxSize-8} height={boxSize-8} fill="none" stroke="#333" strokeWidth={2}/>
      {/* Symbolic rooms */}
      {layout.rooms?.slice(0,5).map((room, idx) => (
        <rect key={idx} x={10+idx*10} y={30+idx*5} width={20} height={16} fill="#cce3f6" stroke="#888" />
      ))}
      {/* North marker */}
      <text x={boxSize-22} y={18} fill="red" fontWeight="bold">N</text>
      {/* Road edge */}
      <rect x={4} y={boxSize-10} width={boxSize-8} height={6} fill="#666" />
    </svg>
  );
}

const LayoutComparison = ({ designs, explanations, onExit }) => (
  <div className="layout-comparison">
    <h2>Compare Alternative Designs</h2>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
      {designs.map((d, idx) => (
        <div key={"alt-"+idx} style={{ flex: "1 1 240px", minWidth: 220, border: "1px solid #ccc", borderRadius: 10, margin: 8, background: "#fcfcfc" }}>
          <h4 style={{ textAlign: "center", margin: 8 }}>Alternative {idx+1}</h4>
          <div style={{ display: "flex", justifyContent: "center" }}>{render2DPreview(d)}</div>
          <div style={{ fontSize: ".97em", margin: 10, minHeight: 60 }}>{explanations[idx]}</div>
          <ul style={{ fontSize: ".9em", margin: 10 }}>
            <li><strong>Buildup:</strong> {d.builtUpArea} sq.ft</li>
            <li><strong>Open area:</strong> {d.openArea} sq.ft</li>
            <li><strong># Rooms:</strong> {d.rooms?.length ?? 0}</li>
            <li><strong>Tradeoffs:</strong> {d.tradeoffs ?? "-"}</li>
          </ul>
        </div>
      ))}
    </div>
    <div style={{ marginTop: 16 }}>
      <button onClick={onExit}>Back to Designs</button>
    </div>
  </div>
);

export default LayoutComparison;
