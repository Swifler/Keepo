"use client"

import type React from "react"
import { createContext, useContext } from "react"
import { I18n } from "i18n-js"
import { de } from "./locales/de"

// Erstelle eine neue I18n-Instanz
const i18n = new I18n({
  de,
})

// Standardsprache festlegen
i18n.locale = "de"
i18n.enableFallback = true

// Kontext für die Übersetzungen
const I18nContext = createContext<{
  t: (key: string, options?: Record<string, any>) => string
  locale: string
  setLocale: (locale: string) => void
}>({
  t: (key: string, options?: Record<string, any>) => key,
  locale: "de",
  setLocale: () => {},
})

// Provider-Komponente
export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Übersetzen
  const t = (key: string, options?: Record<string, any>) => {
    return i18n.t(key, options)
  }

  // Sprache ändern
  const setLocale = (locale: string) => {
    i18n.locale = locale
  }

  return <I18nContext.Provider value={{ t, locale: i18n.locale, setLocale }}>{children}</I18nContext.Provider>
}

// Hook für den Zugriff auf die Übersetzungen
export const useTranslation = () => {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error("useTranslation muss innerhalb eines I18nProviders verwendet werden")
  }
  return context
}
