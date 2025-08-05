import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

import type { ReactNode, Dispatch, SetStateAction } from "react";
import type { ThemeColor } from "../utils/colorClasses.js";

type ThemeContextType = {
  primaryColor: ThemeColor;
  setPrimaryColor: Dispatch<SetStateAction<ThemeColor>>;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

type ThemeProviderProps = {
  children: ReactNode;
};

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [primaryColor, setPrimaryColor] = useState<ThemeColor>(() => {
    const stored = localStorage.getItem("primaryColor");
    return stored !== null ? stored as ThemeColor : "cyan";
  });
  

  useEffect(() => {
    if (typeof primaryColor === "string") {
      localStorage.setItem("primaryColor", primaryColor);
    }
  }, [primaryColor]);  

  return (
    <ThemeContext.Provider value={{ primaryColor, setPrimaryColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
