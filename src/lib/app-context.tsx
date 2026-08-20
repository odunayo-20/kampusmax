"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Campus } from "@/types";
import { defaultCampus } from "@/data/campus";

interface AppState {
  hasCompletedOnboarding: boolean;
  selectedCampus: Campus;
  setHasCompletedOnboarding: (v: boolean) => void;
  setSelectedCampus: (c: Campus) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [selectedCampus, setSelectedCampus] = useState<Campus>(defaultCampus);

  return (
    <AppContext.Provider
      value={{
        hasCompletedOnboarding,
        selectedCampus,
        setHasCompletedOnboarding,
        setSelectedCampus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
