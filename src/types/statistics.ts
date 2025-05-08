export interface NutritionStats {
  calories: number
  protein: number
  carbs: number
  fat: number
  sugar: number
  salt: number
  [key: string]: number
}

export interface EcoScore {
  a: number
  b: number
  c: number
  d: number
  e: number
  unknown: number
  [key: string]: number
}

export interface NovaGroups {
  group1: number
  group2: number
  group3: number
  group4: number
  unknown: number
  [key: string]: number
}

export interface MonthlyTrend {
  month: string
  savedItems: number
  savedMoney: number
}

export interface ExtendedStats {
  savedItems: number
  savedMoney: number
  co2Saved: number
  streakDays: number
  nutritionStats: NutritionStats
  ecoScore: EcoScore
  novaGroups: NovaGroups
  categories: Record<string, number>
  monthlyTrend: MonthlyTrend[]
}
