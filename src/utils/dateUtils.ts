import { format } from "date-fns"
import { de } from "date-fns/locale"
import type { ThemeColors } from "../constants/theme"

// Datum formatieren (z.B. "01.05.2023")
export const formatDate = (date: Date | string): string => {
  if (typeof date === "string") {
    date = new Date(date)
  }

  return format(date, "dd.MM.yyyy", { locale: de })
}

// Tage bis zum Ablaufdatum berechnen
export const getDaysUntilExpiry = (expiryDate: string): number => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const expiry = new Date(expiryDate)
  expiry.setHours(0, 0, 0, 0)

  const diffTime = expiry.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

// Farbe basierend auf Ablaufdatum bestimmen
export const getExpiryStatusColor = (daysUntilExpiry: number, colors: ThemeColors): string => {
  if (daysUntilExpiry <= 0) {
    return colors.expiryRed // Abgelaufen oder heute
  } else if (daysUntilExpiry <= 2) {
    return colors.expiryRed // Läuft in 1-2 Tagen ab
  } else if (daysUntilExpiry <= 5) {
    return colors.expiryYellow // Läuft in 3-5 Tagen ab
  } else {
    return colors.expiryGreen // Läuft in mehr als 5 Tagen ab
  }
}
