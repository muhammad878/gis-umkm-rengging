// Layout dimensions
export const SIDEBAR_WIDTH = 64;
export const PANEL_WIDTH = 256;
export const TOGGLE_BUTTON_SIZE = 36;

// Map configuration - Desa Rengging, Kecamatan Tahunan, Kabupaten Jepara
export const MAP_CENTER: [number, number] = [-6.680, 110.720];
export const DEFAULT_ZOOM = 15;

// Category colors for markers
export const CATEGORY_COLORS = [
  "#a5b4fc",
  "#f9a8d4",
  "#bbf7d0",
  "#fde68a",
  "#c4b5fd",
  "#fbcfe8",
  "#fed7aa",
  "#bae6fd",
] as const;

// Map style options
export const MAP_STYLES = [
  { id: "streets", name: "Streets" },
  { id: "outdoor", name: "Outdoor" },
  { id: "dark", name: "Dark" },
  { id: "light", name: "Light" },
  { id: "satellite", name: "Satellite" },
] as const;

// View types
export type ViewType = "layers" | "list" | "settings" | "statistics";
