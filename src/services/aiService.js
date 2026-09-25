import layoutModel from "../utils/layoutModel";

// Mock feasibility validation and layout generation AI logic
function validateFeasibility(plotInfo, requirements) {
  // Toy rule: Fit allowed if (required rooms*100 < plot area)
  let requiredArea = 0;
  if (requirements.buildingType === "Home") {
    requiredArea = 250 * (parseInt(requirements.bedrooms || 0) + parseInt(requirements.living || 0))
      + 110 * (parseInt(requirements.bathrooms || 0) + parseInt(requirements.kitchen || 0));
    requiredArea += 150 * (parseInt(requirements.parking || 0));
  } else if (requirements.buildingType === "Office") {
    requiredArea = 80 * parseInt(requirements.workstations || 0)
      + 120 * parseInt(requirements.meetingRooms || 0)
      + 60 * parseInt(requirements.reception || 0)
      + 60 * parseInt(requirements.pantry || 0)
      + 45 * parseInt(requirements.toilets || 0);
  } else if (requirements.buildingType === "Shop") {
    requiredArea = 120 * parseInt(requirements.shopArea || 0)
      + 80 * parseInt(requirements.storage || 0)
      + 45 * parseInt(requirements.toilet || 0);
  } else if (requirements.buildingType === "Rental property") {
    requiredArea = (parseInt(requirements.units || 0)) *
                  (250 * (parseInt(requirements.bedroomsPerUnit || 1)) +
                  110 * (parseInt(requirements.bathroomsPerUnit || 1)));
  } else {
    requiredArea = 250; // Arbitrary min for custom
  }
  if (plotInfo.area && (plotInfo.area < requiredArea)) {
    return {
      feasible: false,
      message: `Requested spaces need about ${Math.ceil(requiredArea)} sq.ft; plot allows only ${Math.ceil(plotInfo.area)} sq.ft. Try reducing room/area counts or enlarging plot.`
    };
  }
  return { feasible: true, message: "Feasible" };
}

// Mock layout alternative generator
function generateAlternatives(plotInfo, requirements) {
  // We produce three alternative mocks for demo
  // In real scenario, call AI/model API
  const baseRooms = [];
  if (requirements.buildingType === "Home") {
    for (let i = 0; i < (parseInt(requirements.bedrooms)||0); i++) baseRooms.push({ name: `Bedroom ${i+1}`, area: 120, width: 10, length: 12 });
    for (let i = 0; i < (parseInt(requirements.bathrooms)||0); i++) baseRooms.push({ name: `Bath ${i+1}`, area: 45, width: 5, length: 9 });
    if (parseInt(requirements.kitchen || 0)) baseRooms.push({ name: "Kitchen", area: 70, width: 7, length: 10 });
    if (parseInt(requirements.living || 0)) baseRooms.push({ name: "Living", area: 170, width: 10, length: 17 });
    if (parseInt(requirements.parking || 0)) baseRooms.push({ name: "Parking", area: 140, width: 10, length: 14 });
  } else {
    // For other types, similar approach... (simplified)
    baseRooms.push({ name: 'Area', area: 200, width: 10, length: 20 });
  }
  const alternatives = [1,2,3].map((idx) => {
    const variantRooms = baseRooms.map((r, ridx) => ({ ...r, x: 20+idx*15+ridx*10, y: 40+idx*12+ridx*8 }));
    return layoutModel.example({
      plotInfo,
      requirements,
      rooms: variantRooms,
      openArea: Math.round(plotInfo.area - baseRooms.reduce((a,r) => a+r.area, 0)),
      builtUpArea: baseRooms.reduce((a,r) => a+r.area, 0),
      tradeoffs: idx===2 ? "More open area" : (idx===0 ? "Max room compactness" : "Balanced"),
    });
  });
  return alternatives;
}

// Generate explanations for each layout
function makeAIExplanations(plot, req, alternatives, validationMsg) {
  return alternatives.map((alt, idx) => {
    return (
      `This layout assigns approximately ${alt.builtUpArea} sq.ft built-up area and ${alt.openArea} sq.ft as open/parking. Rooms: ${alt.rooms?.map(r=>r.name).join(', ')}. ` +
      `Design rationale: ${alt.tradeoffs}. ${validationMsg}`
    );
  });
}

const aiService = {
  generateLayouts: async ({ plotInfo, requirements }) => {
    // 1. Validate fit
    const { feasible, message } = validateFeasibility(plotInfo, requirements);
    if (!feasible) {
      return { alternatives: [], explanations: [], validationError: message };
    }
    // 2. Generate alternative layouts (mock logic here)
    const alternatives = generateAlternatives(plotInfo, requirements);
    // 3. For each, generate textual explanation
    const explanations = makeAIExplanations(plotInfo, requirements, alternatives, message);
    return { alternatives, explanations, validationError: null };
  },
};

export default aiService;
