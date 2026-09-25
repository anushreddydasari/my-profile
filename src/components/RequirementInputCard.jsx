import React, { useState } from "react";

const buildingTypes = [
  "Home",
  "Office",
  "Shop",
  "Home+Office",
  "Rental property",
  "Custom",
];

const defaultReqHome = {
  bedrooms: 2,
  bathrooms: 2,
  kitchen: 1,
  living: 1,
  parking: 1,
};
const defaultReqOffice = {
  workstations: 4,
  reception: 1,
  meetingRooms: 1,
  pantry: 1,
  toilets: 1,
};
const defaultReqShop = {
  shopArea: 1,
  storage: 1,
  toilet: 1,
};
const defaultReqRental = {
  units: 2,
  bedroomsPerUnit: 1,
  bathroomsPerUnit: 1,
};
const defaultReqCustom = {
  description: "",
};

function getDefaultReq(type) {
  switch (type) {
    case "Home":
      return defaultReqHome;
    case "Office":
      return defaultReqOffice;
    case "Shop":
      return defaultReqShop;
    case "Home+Office":
      return { ...defaultReqHome, ...defaultReqOffice };
    case "Rental property":
      return defaultReqRental;
    default:
      return defaultReqCustom;
  }
}

const RequirementInputCard = ({ plotInfo, onSubmit, onBack }) => {
  const [buildingType, setBuildingType] = useState("");
  const [requirements, setRequirements] = useState({});

  const handleBuildingTypeChange = (e) => {
    setBuildingType(e.target.value);
    setRequirements(getDefaultReq(e.target.value));
  };

  const handleRequirementChange = (e) => {
    const { name, value } = e.target;
    setRequirements((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!buildingType) return;
    onSubmit({ ...requirements, buildingType });
  };

  return (
    <div className="requirement-input-card">
      <h2>Building Type & Space Requirements</h2>
      <button type="button" onClick={onBack}>&larr; Back to Plot Input</button>
      <form onSubmit={handleSubmit}>
        <label>
          Building Type:
          <select value={buildingType} onChange={handleBuildingTypeChange} required>
            <option value="">Select type</option>
            {buildingTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </label>
        {buildingType === "Home" && (
          <>
            <label>
              Bedrooms:
              <input
                name="bedrooms"
                type="number"
                min={1}
                value={requirements.bedrooms || ""}
                onChange={handleRequirementChange}
                required
              />
            </label>
            <label>
              Bathrooms:
              <input
                name="bathrooms"
                type="number"
                min={1}
                value={requirements.bathrooms || ""}
                onChange={handleRequirementChange}
                required
              />
            </label>
            <label>
              Kitchen:
              <input
                name="kitchen"
                type="number"
                min={0}
                value={requirements.kitchen || ""}
                onChange={handleRequirementChange}
                required
              />
            </label>
            <label>
              Living Rooms:
              <input
                name="living"
                type="number"
                min={0}
                value={requirements.living || ""}
                onChange={handleRequirementChange}
                required
              />
            </label>
            <label>
              Parking Spots:
              <input
                name="parking"
                type="number"
                min={0}
                value={requirements.parking || ""}
                onChange={handleRequirementChange}
                required
              />
            </label>
          </>
        )}
        {buildingType === "Office" && (
          <>
            <label>
              Workstations:
              <input
                name="workstations"
                type="number"
                min={1}
                value={requirements.workstations || ""}
                onChange={handleRequirementChange}
                required
              />
            </label>
            <label>
              Reception Areas:
              <input
                name="reception"
                type="number"
                min={0}
                value={requirements.reception || ""}
                onChange={handleRequirementChange}
                required
              />
            </label>
            <label>
              Meeting Rooms:
              <input
                name="meetingRooms"
                type="number"
                min={0}
                value={requirements.meetingRooms || ""}
                onChange={handleRequirementChange}
                required
              />
            </label>
            <label>
              Pantry:
              <input
                name="pantry"
                type="number"
                min={0}
                value={requirements.pantry || ""}
                onChange={handleRequirementChange}
                required
              />
            </label>
            <label>
              Toilets:
              <input
                name="toilets"
                type="number"
                min={0}
                value={requirements.toilets || ""}
                onChange={handleRequirementChange}
                required
              />
            </label>
          </>
        )}
        {buildingType === "Shop" && (
          <>
            <label>
              Shops:
              <input
                name="shopArea"
                type="number"
                min={1}
                value={requirements.shopArea || ""}
                onChange={handleRequirementChange}
                required
              />
            </label>
            <label>
              Storage Areas:
              <input
                name="storage"
                type="number"
                min={0}
                value={requirements.storage || ""}
                onChange={handleRequirementChange}
                required
              />
            </label>
            <label>
              Toilets:
              <input
                name="toilet"
                type="number"
                min={0}
                value={requirements.toilet || ""}
                onChange={handleRequirementChange}
                required
              />
            </label>
          </>
        )}
        {buildingType === "Rental property" && (
          <>
            <label>
              Units:
              <input
                name="units"
                type="number"
                min={1}
                value={requirements.units || ""}
                onChange={handleRequirementChange}
                required
              />
            </label>
            <label>
              Bedrooms per Unit:
              <input
                name="bedroomsPerUnit"
                type="number"
                min={1}
                value={requirements.bedroomsPerUnit || ""}
                onChange={handleRequirementChange}
                required
              />
            </label>
            <label>
              Bathrooms per Unit:
              <input
                name="bathroomsPerUnit"
                type="number"
                min={1}
                value={requirements.bathroomsPerUnit || ""}
                onChange={handleRequirementChange}
                required
              />
            </label>
          </>
        )}
        {buildingType === "Home+Office" && (
          <>
            {/* Both Home and Office fields */}
            {Object.keys(defaultReqHome).map((key) => (
              <label key={key}>
                {key.charAt(0).toUpperCase() + key.slice(1)}:
                <input
                  name={key}
                  type="number"
                  min={0}
                  value={requirements[key] || ""}
                  onChange={handleRequirementChange}
                  required
                />
              </label>
            ))}
            {Object.keys(defaultReqOffice).map((key) => (
              <label key={key}>
                {key.charAt(0).toUpperCase() + key.replace(/([A-Z])/g, " $1").slice(1)}:
                <input
                  name={key}
                  type="number"
                  min={0}
                  value={requirements[key] || ""}
                  onChange={handleRequirementChange}
                  required
                />
              </label>
            ))}
          </>
        )}
        {buildingType === "Custom" && (
          <label>
            Space Requirements Description:
            <textarea
              name="description"
              rows={3}
              value={requirements.description || ""}
              onChange={handleRequirementChange}
              required
            />
          </label>
        )}
        <button type="submit" disabled={!buildingType}>Generate Layouts</button>
      </form>
    </div>
  );
};

export default RequirementInputCard;
