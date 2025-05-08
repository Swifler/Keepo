"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useColorScheme } from "react-native"
import { type ThemeColors, lightTheme, darkTheme } from "../constants/theme"

interface ThemeContextType {
  isDark: boolean
  colors: ThemeColors
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  colors: lightTheme,
  toggleTheme: () => {},
})

export const useTheme = () => useContext(ThemeContext)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const colorScheme = useColorScheme()
  const [isDark, setIsDark] = useState(colorScheme === "dark")

  // Aktualisiere den Theme-Modus, wenn sich das System-Farbschema ändert
  useEffect(() => {
    setIsDark(colorScheme === "dark")
  }, [colorScheme])

  // Theme umschalten
  const toggleTheme = () => {
    setIsDark((prev) => !prev)
  }

  const colors = isDark ? darkTheme : lightTheme

  return <ThemeContext.Provider value={{ isDark, colors, toggleTheme }}>{children}</ThemeContext.Provider>
}
