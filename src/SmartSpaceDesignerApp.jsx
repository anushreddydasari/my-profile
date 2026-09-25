import React, { useState } from "react";
import LayoutInputCard from "./components/LayoutInputCard";
import RequirementInputCard from "./components/RequirementInputCard";
import LayoutResultPage from "./components/LayoutResultPage";
import LayoutComparison from "./components/LayoutComparison";
import Disclaimer from "./components/Disclaimer";
import aiService from "./services/aiService";
import designStorage from "./services/designStorage";
import layoutValidator from "./services/layoutValidator";

const SmartSpaceDesignerApp = () => {
  const [plotInfo, setPlotInfo] = useState(null);
  const [requirements, setRequirements] = useState(null);
  const [designs, setDesigns] = useState([]);
  const [aiExplanations, setAIExplanations] = useState([]);
  const [compareMode, setCompareMode] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handlePlotInfoSubmit = (info) => {
    setPlotInfo(info);
    setRequirements(null);
    setDesigns([]);
    setAIExplanations([]);
    setError("");
  };

  const handleRequirementsSubmit = async (req) => {
    setRequirements(req);
    setIsLoading(true);
    setError("");
    try {
      // Validate fit and generate layouts with AI
      const { alternatives, explanations, validationError } = await aiService.generateLayouts({ plotInfo, requirements: req });
      if (validationError) {
        setError(validationError);
        setIsLoading(false);
        return;
      }
      // Validate outputs for suspicious/incomplete layouts
      if (!alternatives.every((d) => layoutValidator.isValidLayout(d))) {
        setError("Layout data invalid or incomplete. Please review your input and try again.");
        setIsLoading(false);
        return;
      }
      setDesigns(alternatives);
      setAIExplanations(explanations);
      // Store all design alternatives
      alternatives.forEach((d, idx) => designStorage.saveDesign({ ...d, explanation: explanations[idx] }));
    } catch (e) {
      setError(e.message || "Unexpected error during processing.");
    }
    setIsLoading(false);
  };

  const handleEdit = () => {
    setDesigns([]);
    setAIExplanations([]);
    setCompareMode(false);
    setError("");
  };

  const handleRegenerate = () => {
    if (requirements) {
      handleRequirementsSubmit(requirements);
    }
  };

  const handleCompare = () => {
    setCompareMode(true);
  };

  const exitCompare = () => {
    setCompareMode(false);
  };

  return (
    <div className="smart-space-designer-dashboard">
      <h1>Smart Space Designer</h1>
      <Disclaimer />
      {!plotInfo ? (
        <LayoutInputCard onSubmit={handlePlotInfoSubmit} />
      ) : !requirements ? (
        <RequirementInputCard
          plotInfo={plotInfo}
          onSubmit={handleRequirementsSubmit}
          onBack={() => setPlotInfo(null)}
        />
      ) : isLoading ? (
        <div>Generating design alternatives...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : compareMode ? (
        <LayoutComparison
          designs={designs}
          explanations={aiExplanations}
          onExit={exitCompare}
        />
      ) : (
        <LayoutResultPage
          layouts={designs}
          explanations={aiExplanations}
          plotInfo={plotInfo}
          requirements={requirements}
          onEdit={handleEdit}
          onRegenerate={handleRegenerate}
          onCompare={handleCompare}
        />
      )}
    </div>
  );
};

export default SmartSpaceDesignerApp;
