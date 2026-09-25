// designStorage.js
// Simple local storage for MVP (could be swapped for remote or indexedDB in future)
const DESIGN_KEY = 'smart_space_designs_v1';

const designStorage = {
  saveDesign: function(layoutObj) {
    try {
      const all = designStorage.getAllDesigns();
      // Add timestamp/version
      const now = new Date();
      const doc = { ...layoutObj, timestamp: now.toISOString(), version: 1 };
      all.push(doc);
      window.localStorage.setItem(DESIGN_KEY, JSON.stringify(all));
    } catch (e) {
      // Ignore storage errors for now
    }
  },
  getAllDesigns: function() {
    try {
      const arr = window.localStorage.getItem(DESIGN_KEY);
      if (!arr) return [];
      return JSON.parse(arr);
    } catch (e) {
      return [];
    }
  },
  clearAll: function() {
    try {
      window.localStorage.removeItem(DESIGN_KEY);
    } catch (e) {}
  },
};
export default designStorage;
