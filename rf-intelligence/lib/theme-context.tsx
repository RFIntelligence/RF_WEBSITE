"use client";

/**
 * ThemeProvider — dark-only for this pass.
 * The toggle UI has been removed per the client's instruction in Hero Revision v2.
 * NOTE: This contradicts requirements.md §10 (dark/light theme with toggle).
 * The conflict is documented here for the Phase 1 full design-system pass,
 * when the toggle and light-mode tokens will be re-introduced.
 *
 * The provider shell is kept so future phases can add toggleTheme back
 * without restructuring the component tree.
 */

import React, { createContext, useContext } from "react";

interface ThemeContextValue {
  theme: "dark";
}

const ThemeContext = createContext<ThemeContextValue>({ theme: "dark" });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeContext.Provider value={{ theme: "dark" }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
