import React, { useState } from "react";

const defaultState = {
  area: "",
  length: "",
  width: "",
  dimensionsKnown: false,
  roadFacingSide: "",
  orientation: "",
  setbacks: "",
};

const LayoutInputCard = ({ onSubmit }) => {
  const [state, setState] = useState(defaultState);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setState((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic validation: Require at least area OR both dimensions
    if (!state.dimensionsKnown && !state.area) return;
    if (state.dimensionsKnown && (!state.length || !state.width)) return;
    onSubmit({
      area: state.dimensionsKnown ? state.length * state.width : state.area,
      length: state.dimensionsKnown ? state.length : undefined,
      width: state.dimensionsKnown ? state.width : undefined,
      roadFacingSide: state.roadFacingSide,
      orientation: state.orientation,
      setbacks: state.setbacks,
      dimensionsKnown: state.dimensionsKnown,
    });
    setState(defaultState);
  };

  return (
    <div className="layout-input-card">
      <h2>Plot/Space Parameters</h2>
      <form onSubmit={handleSubmit}>
        <label>
          <input
            name="dimensionsKnown"
            type="checkbox"
            checked={state.dimensionsKnown}
            onChange={handleChange}
          />
          I know the exact plot dimensions (length & width)
        </label>
        {state.dimensionsKnown ? (
          <>
            <label>
              Length (ft):
              <input
                type="number"
                name="length"
                min={1}
                value={state.length}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Width (ft):
              <input
                type="number"
                name="width"
                min={1}
                value={state.width}
                onChange={handleChange}
                required
              />
            </label>
          </>
        ) : (
          <label>
            Total Plot Area (sq. ft):
            <input
              type="number"
              name="area"
              min={50}
              value={state.area}
              onChange={handleChange}
              required
            />
          </label>
        )}
        <label>
          Road Facing Side:
          <select name="roadFacingSide" value={state.roadFacingSide} onChange={handleChange} required>
            <option value="">Select</option>
            <option value="North">North</option>
            <option value="East">East</option>
            <option value="South">South</option>
            <option value="West">West</option>
          </select>
        </label>
        <label>
          Plot Orientation:
          <select name="orientation" value={state.orientation} onChange={handleChange} required>
            <option value="">Select</option>
            <option value="North">North</option>
            <option value="East">East</option>
            <option value="South">South</option>
            <option value="West">West</option>
          </select>
        </label>
        <label>
          Building Setbacks (open area around plot, in ft or list):
          <input
            name="setbacks"
            type="text"
            placeholder="e.g., Front: 5, Sides: 3, Rear: 4"
            value={state.setbacks}
            onChange={handleChange}
          />
        </label>
        <button type="submit">Continue</button>
      </form>
    </div>
  );
};

export default LayoutInputCard;
