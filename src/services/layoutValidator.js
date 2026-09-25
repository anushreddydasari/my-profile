// layoutValidator.js
// Module to validate the logical and structural integrity of a floorplan/layout json object

const layoutValidator = {
  isValidLayout: function(layout) {
    // Check minimally required layout fields and relationships
    if (!layout || typeof layout !== 'object') return false;
    if (!layout.plotInfo || !layout.rooms || !Array.isArray(layout.rooms)) return false;
    if (!layout.builtUpArea || layout.builtUpArea < 1) return false;
    if (!layout.openArea || layout.openArea < 0) return false;
    let totalRoomArea = layout.rooms.reduce((s, r) => s+(r.area||0), 0);
    if (Math.abs(totalRoomArea - layout.builtUpArea) > 50) return false;
    // Validate no negative room dimensions, and all rooms fit inside plot
    for (let r of layout.rooms) {
      if (r.width < 1 || r.length < 1 || r.area < 8) return false;
      // Optionally: validate coordinates nonnegative
      if (r.x !== undefined && r.x < 0) return false;
      if (r.y !== undefined && r.y < 0) return false;
    }
    // Optionally: check plot/room sum not exceeding plot area
    if (layout.plotInfo && layout.plotInfo.area && (layout.builtUpArea > layout.plotInfo.area+60)) return false;
    return true;
  },
};
export default layoutValidator;
