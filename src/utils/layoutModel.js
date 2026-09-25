// layoutModel.js
// Data model/schema for a generated layout/design object

/**
 * Example layout data model. Fields:
 * - plotInfo: { area, length, width, orientation, roadFacingSide, setbacks }
 * - requirements: buildingType, room breakdown, counts
 * - rooms: [ { name, area, length, width, x, y } ]
 * - builtUpArea: number
 * - openArea: number
 * - parkingArea: number (optional)
 * - trafficFlow: string (optional)
 * - tradeoffs: string (optional)
 * - explanation: string (AI rationale for this layout)
 * - timestamp, version
 */
const layoutModel = {
  example: function({ plotInfo, requirements, rooms, builtUpArea, openArea, tradeoffs }) {
    return {
      plotInfo, // area, length, width, orientation, setbacks, roadFacingSide
      requirements, // full requirements object submitted
      rooms: rooms?.map((r)=>({ ...r })), // each: name, area, length, width, (x,y)
      builtUpArea,
      openArea,
      tradeoffs,
      explanation: '',
      timestamp: null,
      version: 1,
    };
  },
};
export default layoutModel;
