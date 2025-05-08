export interface ThemeColors {
  primary: string
  secondary: string
  background: string
  backgroundGradient: string[]
  cardBackground: string
  text: string
  textSecondary: string
  border: string
  error: string
  warning: string
  success: string
  expiryGreen: string
  expiryYellow: string
  expiryRed: string
}

// Helles Theme mit neuer Farbpalette
export const lightTheme: ThemeColors = {
  primary: "#0E8345", // Keepo-Grün
  secondary: "#7D6161", // Sekundärfarbe
  background: "#FFFFFF", // Weißer Hintergrund
  backgroundGradient: ["#FFFFFF", "#E9FFE0"], // Verlauf von Weiß zu hellem Grün
  cardBackground: "#FFFFFF", // Weiße Karten
  text: "#173D00", // Dunkelgrüner Text
  textSecondary: "#7D6161", // Sekundärer Text
  border: "#E0E9E0", // Hellgrüne Ränder
  error: "#E53935", // Rot für Fehler
  warning: "#FFA726", // Orange für Warnungen
  success: "#43A047", // Grün für Erfolg
  expiryGreen: "#43A047", // Grün für gute Haltbarkeit
  expiryYellow: "#FFA726", // Gelb für mittlere Haltbarkeit
  expiryRed: "#E53935", // Rot für kurze Haltbarkeit
}

// Dunkles Theme
export const darkTheme: ThemeColors = {
  primary: "#26A96C", // Helleres Keepo-Grün für besseren Kontrast
  secondary: "#9D8181", // Hellere Sekundärfarbe
  background: "#121212", // Dunkler Hintergrund
  backgroundGradient: ["#121212", "#1A2E1A"], // Verlauf von Dunkel zu dunkelgrün
  cardBackground: "#1E1E1E", // Dunkelgraue Karten
  text: "#E9FFE0", // Hellgrüner Text
  textSecondary: "#B0B0B0", // Hellgrauer sekundärer Text
  border: "#333333", // Dunkelgraue Ränder
  error: "#EF5350", // Helleres Rot
  warning: "#FFCA28", // Helleres Gelb
  success: "#66BB6A", // Helleres Grün
  expiryGreen: "#66BB6A", // Helleres Grün
  expiryYellow: "#FFCA28", // Helleres Gelb
  expiryRed: "#EF5350", // Helleres Rot
}
