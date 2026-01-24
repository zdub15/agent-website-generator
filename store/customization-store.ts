import { create } from "zustand";

interface CustomizationState {
  // Theme
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;

  // Stats
  familiesHelped: string;
  satisfactionRate: string;
  coverageIssued: string;

  // Integrations
  calendlyUrl: string;
  headshotUrl: string;

  // Dirty state
  isDirty: boolean;

  // Actions
  setColor: (key: "primaryColor" | "secondaryColor" | "accentColor", value: string) => void;
  setStat: (key: "familiesHelped" | "satisfactionRate" | "coverageIssued", value: string) => void;
  setCalendlyUrl: (url: string) => void;
  setHeadshotUrl: (url: string) => void;
  loadFromSite: (customization: Partial<CustomizationState>) => void;
  reset: () => void;
  markClean: () => void;
}

const defaultState = {
  primaryColor: "#003478",
  secondaryColor: "#ffc440",
  accentColor: "#042b2b",
  familiesHelped: "150+",
  satisfactionRate: "98%",
  coverageIssued: "$1M+",
  calendlyUrl: "",
  headshotUrl: "",
  isDirty: false,
};

export const useCustomizationStore = create<CustomizationState>((set) => ({
  ...defaultState,

  setColor: (key, value) =>
    set((state) => ({ ...state, [key]: value, isDirty: true })),

  setStat: (key, value) =>
    set((state) => ({ ...state, [key]: value, isDirty: true })),

  setCalendlyUrl: (url) =>
    set((state) => ({ ...state, calendlyUrl: url, isDirty: true })),

  setHeadshotUrl: (url) =>
    set((state) => ({ ...state, headshotUrl: url, isDirty: true })),

  loadFromSite: (customization) =>
    set((state) => ({
      ...state,
      ...customization,
      isDirty: false,
    })),

  reset: () => set(defaultState),

  markClean: () => set((state) => ({ ...state, isDirty: false })),
}));
