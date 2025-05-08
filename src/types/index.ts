// Inventar-Element
export interface InventoryItemType {
  id: string
  name: string
  kategorie: string
  menge: string
  haltbarBis: string // ISO-Datumsformat: YYYY-MM-DD
  bildUrl: string | null
  userId: string
  erstelltAm: Date
  productInfo?: any // Produktinformationen von OpenFoodFacts
}

// Erkanntes Element (von Gemini Vision)
export interface DetectedItem {
  name: string
  kategorie: string
  menge?: string
  haltbarBis?: string
  bildUrl?: string
  productInfo?: any // Produktinformationen von OpenFoodFacts
}

// Rezept
export interface RecipeType {
  id: string
  titel: string
  zubereitungszeit?: string
  zutaten: string[]
  anleitung: string
  userId: string
  erstelltAm: Date
}

// Einkaufslisten-Element
export interface ShoppingItemType {
  id: string
  name: string
  menge: string
  gekauft: boolean
  userId: string
}

// Nährwertstatistik
export interface NutritionStats {
  calories: number
  protein: number
  carbs: number
  fat: number
  sugar: number
  salt: number
}

// Erweiterte Statistiken
export interface ExtendedStats {
  savedItems: number
  savedMoney: number
  co2Saved: number
  streakDays: number
  nutritionStats: NutritionStats
  ecoScore: {
    a: number
    b: number
    c: number
    d: number
    e: number
    unknown: number
  }
  novaGroups: {
    group1: number
    group2: number
    group3: number
    group4: number
    unknown: number
  }
  categories: Record<string, number>
  monthlyTrend: {
    month: string
    savedItems: number
    savedMoney: number
  }[]
}
