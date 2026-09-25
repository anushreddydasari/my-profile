import React, { useState } from "react";

const Legend = () => (
  <div className="legend">
    <strong>Legend:</strong> <span style={{ background: '#333', color: '#fff', padding: '0 6px' }}>Boundary</span>
    <span style={{ background: '#e2e2e2', marginLeft: 10, padding: '0 6px' }}>Room/Area</span>
    <span style={{ background: '#8ecae6', marginLeft: 10, padding: '0 6px' }}>Open/Parking</span>
    <span style={{ border: '2px solid blue', marginLeft: 10, padding: '0 6px' }}>Door/Window</span>
    <span style={{ color: 'red', marginLeft: 10 }}>N (North)</span>
    <span style={{ background: '#666', color: '#fff', marginLeft: 10, padding: '0 6px' }}>Road</span>
  </div>
);

function render2DLayout(layout) {
  // This is a placeholder stub using HTML5 Canvas
  // In production, would use dynamic drawing or a diagram library
  // For now, displays a static SVG example based on layout.rooms
  const width = 320;
  const height = 220;
  const roomColors = ["#e2e2e2", "#fff9c4", "#b7e4c7", "#cce3f6", "#ffb4a2", "#ffc6ff"];
  return (
    <svg width={width} height={height} style={{ margin: 10, border: "2px solid #333", background: "#fcfcfc" }}>
      {/* Plot boundary */}
      <rect x="5" y="5" width={width - 10} height={height - 10} fill="none" stroke="#333" strokeWidth={3} />
      {/* North direction */}
      <text x={width - 32} y={22} fill="red" fontWeight="bold">N</text>
      {/* Example: draw rooms (simplified rectangles, not to scale) */}
      {layout.rooms?.map((room, idx) => (
        <rect
          key={idx}
          x={20 + idx * 32}
          y={60 + idx * 12}
          width={46}
          height={30}
          fill={roomColors[idx % roomColors.length]}
          stroke="#888"
        />
      ))}
      {/* Example: basic icons for doors/windows/parking etc. */}
      <rect x={18} y={height - 30} width={60} height={18} fill="#8ecae6" />
      {/* Road on one side (bottom) */}
      <rect x={5} y={height - 12} width={width - 10} height={8} fill="#666" />
    </svg>
  );
}

const LayoutResultPage = ({ layouts, explanations, plotInfo, requirements, onEdit, onRegenerate, onCompare }) => {
  const [show3D, setShow3D] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);

  // Stub 3D viewer - In full implementation, use Three.js or similar
  const render3DView = () => (
    <div style={{ border: "2px solid #446", background: "#eee", margin: 10, minHeight: 220, textAlign: "center", color: '#666' }}>
      <p>[3D visualization concept coming soon...]</p>
    </div>
  );

  return (
    <div className="layout-result-page">
      <Legend />
      <div className="layout-tabs">
        {layouts.map((_, idx) => (
          <button
            key={"tab-"+idx}
            className={selectedIdx === idx ? "active" : ""}
            onClick={() => setSelectedIdx(idx)}>
            Alternative {idx + 1}
          </button>
        ))}
      </div>
      <div className="layout-visualization">
        {show3D ? render3DView() : render2DLayout(layouts[selectedIdx])}
      </div>
      <div className="layout-explanation">
        <h3>AI Explanation</h3>
        <p>{explanations[selectedIdx]}</p>
      </div>
      <div className="layout-actions">
        <button onClick={onEdit}>Edit Parameters</button>
        <button onClick={onRegenerate}>Regenerate</button>
        <button onClick={onCompare}>Compare Designs</button>
        <button onClick={() => setShow3D((v) => !v)}>{show3D ? "View 2D" : "View 3D Concept"}</button>
        <button onClick={() => window.print()}>Export / Print</button>
      </div>
    </div>
  );
};

export default LayoutResultPage;
