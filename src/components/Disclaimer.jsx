import React from "react";

const Disclaimer = () => (
  <div className="designer-disclaimer" style={{margin:'16px 0',padding:10,background:'#fdeec0',color:'#876003',border:'1.5px solid #dda100',borderRadius:8,fontWeight:'bold'}}>
    <p style={{margin:0}}>
      <span style={{fontWeight:700}}>Disclaimer:</span> The Smart Space Designer generates AI-driven conceptual layouts for general informational purposes only. Results are NOT certified architectural or engineering documents. <br/>
      <span style={{fontStyle:'italic'}}>No regulatory approval is claimed.</span>If location-specific building regulations are required and cannot be confirmed, please consult a qualified professional for legal design compliance.
    </p>
  </div>
);
export default Disclaimer;
