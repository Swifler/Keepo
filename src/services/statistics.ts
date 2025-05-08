import firestore from "@react-native-firebase/firestore"
import { authService } from "./auth"
import type { ExtendedStats, NutritionStats } from "../types"

export const statisticsService = {
  // Grundlegende Statistiken abrufen
  async getBasicStats(userId: string) {
    try {
      const statsDoc = await firestore().collection("statistics").doc(userId).get()

      if (!statsDoc.exists) {
        // Standardwerte zurückgeben, wenn keine Statistiken vorhanden sind
        return {
          savedItems: 0,
          savedMoney: 0,
          co2Saved: 0,
          streakDays: 0,
        }
      }

      const stats = statsDoc.data()
      return {
        savedItems: stats?.savedItems || 0,
        savedMoney: stats?.savedMoney || 0,
        co2Saved: stats?.co2Saved || 0,
        streakDays: stats?.streakDays || 0,
      }
    } catch (error) {
      console.error("Fehler beim Abrufen der Statistiken:", error)
      throw error
    }
  },

  // Erweiterte Statistiken für Premium-Nutzer abrufen
  async getExtendedStats(userId: string): Promise<ExtendedStats> {
    try {
      // Grundlegende Statistiken abrufen
      const basicStats = await this.getBasicStats(userId)

      // Prüfen, ob der Benutzer ein Premium-Abonnement hat
      const userProfile = await authService.getUserProfile(userId)
      if (!userProfile?.isPremium) {
        throw new Error("Premium-Abonnement erforderlich")
      }

      // Erweiterte Statistiken abrufen
      const extendedStatsDoc = await firestore().collection("extendedStatistics").doc(userId).get()

      // Standardwerte für erweiterte Statistiken
      const defaultExtendedStats: ExtendedStats = {
        ...basicStats,
        nutritionStats: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          sugar: 0,
          salt: 0,
        },
        ecoScore: {
          a: 0,
          b: 0,
          c: 0,
          d: 0,
          e: 0,
          unknown: 0,
        },
        novaGroups: {
          group1: 0,
          group2: 0,
          group3: 0,
          group4: 0,
          unknown: 0,
        },
        categories: {},
        monthlyTrend: [
          { month: "Jan", savedItems: 0, savedMoney: 0 },
          { month: "Feb", savedItems: 0, savedMoney: 0 },
          { month: "Mär", savedItems: 0, savedMoney: 0 },
          { month: "Apr", savedItems: 0, savedMoney: 0 },
          { month: "Mai", savedItems: 0, savedMoney: 0 },
          { month: "Jun", savedItems: 0, savedMoney: 0 },
        ],
      }

      if (!extendedStatsDoc.exists) {
        return defaultExtendedStats
      }

      const extendedStats = extendedStatsDoc.data() as ExtendedStats
      return {
        ...basicStats,
        nutritionStats: extendedStats.nutritionStats || defaultExtendedStats.nutritionStats,
        ecoScore: extendedStats.ecoScore || defaultExtendedStats.ecoScore,
        novaGroups: extendedStats.novaGroups || defaultExtendedStats.novaGroups,
        categories: extendedStats.categories || defaultExtendedStats.categories,
        monthlyTrend: extendedStats.monthlyTrend || defaultExtendedStats.monthlyTrend,
      }
    } catch (error) {
      console.error("Fehler beim Abrufen der erweiterten Statistiken:", error)
      throw error
    }
  },

  // Statistiken aktualisieren, wenn ein Lebensmittel hinzugefügt wird
  async updateStatsForNewItem(userId: string, item: any) {
    try {
      const statsRef = firestore().collection("statistics").doc(userId)
      const statsDoc = await statsRef.get()

      // Grundlegende Statistiken aktualisieren
      if (statsDoc.exists) {
        await statsRef.update({
          savedItems: firestore.FieldValue.increment(1),
          // Geschätzter Wert für gesparte Kosten (kann angepasst werden)
          savedMoney: firestore.FieldValue.increment(2.5),
          // Geschätzter Wert für CO2-Einsparung (kann angepasst werden)
          co2Saved: firestore.FieldValue.increment(0.5),
        })
      } else {
        await statsRef.set({
          savedItems: 1,
          savedMoney: 2.5,
          co2Saved: 0.5,
          streakDays: 1,
        })
      }

      // Prüfen, ob der Benutzer ein Premium-Abonnement hat
      const userProfile = await authService.getUserProfile(userId)
      if (!userProfile?.isPremium) {
        // Für Nicht-Premium-Nutzer keine erweiterten Statistiken aktualisieren
        return
      }

      // Erweiterte Statistiken aktualisieren
      const extendedStatsRef = firestore().collection("extendedStatistics").doc(userId)
      const extendedStatsDoc = await extendedStatsRef.get()

      // Nährwertinformationen aus dem Produkt extrahieren
      const nutritionUpdate: Partial<NutritionStats> = {}
      if (item.productInfo?.nutrition_facts) {
        const facts = item.productInfo.nutrition_facts
        if (facts.energy_100g) nutritionUpdate.calories = facts.energy_100g
        if (facts.proteins_100g) nutritionUpdate.protein = facts.proteins_100g
        if (facts.carbohydrates_100g) nutritionUpdate.carbs = facts.carbohydrates_100g
        if (facts.fat_100g) nutritionUpdate.fat = facts.fat_100g
        if (facts.sugars_100g) nutritionUpdate.sugar = facts.sugars_100g
        if (facts.salt_100g) nutritionUpdate.salt = facts.salt_100g
      }

      // Eco-Score und NOVA-Gruppe aktualisieren
      const ecoScoreUpdate: Record<string, number> = {}
      if (item.productInfo?.eco_score) {
        const score = item.productInfo.eco_score.toLowerCase()
        ecoScoreUpdate[score] = 1
      } else {
        ecoScoreUpdate.unknown = 1
      }

      const novaGroupUpdate: Record<string, number> = {}
      if (item.productInfo?.nova_group) {
        const group = `group${item.productInfo.nova_group}`
        novaGroupUpdate[group] = 1
      } else {
        novaGroupUpdate.unknown = 1
      }

      // Kategorie aktualisieren
      const categoryUpdate: Record<string, number> = {}
      if (item.kategorie) {
        categoryUpdate[item.kategorie] = 1
      }

      // Aktueller Monat für Trend-Aktualisierung
      const currentDate = new Date()
      const monthNames = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"]
      const currentMonth = monthNames[currentDate.getMonth()]

      if (extendedStatsDoc.exists) {
        const extendedStats = extendedStatsDoc.data()

        // Nährwertstatistiken aktualisieren
        const updatedNutritionStats = { ...extendedStats.nutritionStats }
        Object.keys(nutritionUpdate).forEach((key) => {
          updatedNutritionStats[key] = (updatedNutritionStats[key] || 0) + nutritionUpdate[key]
        })

        // Eco-Score aktualisieren
        const updatedEcoScore = { ...extendedStats.ecoScore }
        Object.keys(ecoScoreUpdate).forEach((key) => {
          updatedEcoScore[key] = (updatedEcoScore[key] || 0) + ecoScoreUpdate[key]
        })

        // NOVA-Gruppe aktualisieren
        const updatedNovaGroups = { ...extendedStats.novaGroups }
        Object.keys(novaGroupUpdate).forEach((key) => {
          updatedNovaGroups[key] = (updatedNovaGroups[key] || 0) + novaGroupUpdate[key]
        })

        // Kategorien aktualisieren
        const updatedCategories = { ...extendedStats.categories }
        Object.keys(categoryUpdate).forEach((key) => {
          updatedCategories[key] = (updatedCategories[key] || 0) + categoryUpdate[key]
        })

        // Monatlichen Trend aktualisieren
        const updatedMonthlyTrend = [...extendedStats.monthlyTrend]
        const monthIndex = updatedMonthlyTrend.findIndex((item) => item.month === currentMonth)
        if (monthIndex !== -1) {
          updatedMonthlyTrend[monthIndex] = {
            ...updatedMonthlyTrend[monthIndex],
            savedItems: updatedMonthlyTrend[monthIndex].savedItems + 1,
            savedMoney: updatedMonthlyTrend[monthIndex].savedMoney + 2.5,
          }
        }

        // Aktualisierte Statistiken speichern
        await extendedStatsRef.update({
          nutritionStats: updatedNutritionStats,
          ecoScore: updatedEcoScore,
          novaGroups: updatedNovaGroups,
          categories: updatedCategories,
          monthlyTrend: updatedMonthlyTrend,
        })
      } else {
        // Neue erweiterte Statistiken erstellen
        const defaultMonthlyTrend = monthNames.map((month) => ({
          month,
          savedItems: 0,
          savedMoney: 0,
        }))
        const monthIndex = defaultMonthlyTrend.findIndex((item) => item.month === currentMonth)
        if (monthIndex !== -1) {
          defaultMonthlyTrend[monthIndex] = {
            ...defaultMonthlyTrend[monthIndex],
            savedItems: 1,
            savedMoney: 2.5,
          }
        }

        await extendedStatsRef.set({
          nutritionStats: {
            calories: nutritionUpdate.calories || 0,
            protein: nutritionUpdate.protein || 0,
            carbs: nutritionUpdate.carbs || 0,
            fat: nutritionUpdate.fat || 0,
            sugar: nutritionUpdate.sugar || 0,
            salt: nutritionUpdate.salt || 0,
          },
          ecoScore: {
            a: ecoScoreUpdate.a || 0,
            b: ecoScoreUpdate.b || 0,
            c: ecoScoreUpdate.c || 0,
            d: ecoScoreUpdate.d || 0,
            e: ecoScoreUpdate.e || 0,
            unknown: ecoScoreUpdate.unknown || 0,
          },
          novaGroups: {
            group1: novaGroupUpdate.group1 || 0,
            group2: novaGroupUpdate.group2 || 0,
            group3: novaGroupUpdate.group3 || 0,
            group4: novaGroupUpdate.group4 || 0,
            unknown: novaGroupUpdate.unknown || 0,
          },
          categories: categoryUpdate,
          monthlyTrend: defaultMonthlyTrend,
        })
      }
    } catch (error) {
      console.error("Fehler beim Aktualisieren der Statistiken:", error)
      throw error
    }
  },

  // Streak aktualisieren
  async updateStreak(userId: string) {
    try {
      const statsRef = firestore().collection("statistics").doc(userId)
      const statsDoc = await statsRef.get()

      if (!statsDoc.exists) {
        await statsRef.set({
          savedItems: 0,
          savedMoney: 0,
          co2Saved: 0,
          streakDays: 1,
          lastActivity: new Date(),
        })
        return
      }

      const stats = statsDoc.data()
      const lastActivity = stats?.lastActivity?.toDate() || new Date()
      const today = new Date()

      // Prüfen, ob der letzte Aktivitätstag gestern war
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      const lastActivityDate = new Date(lastActivity)
      lastActivityDate.setHours(0, 0, 0, 0)

      const yesterdayDate = new Date(yesterday)
      yesterdayDate.setHours(0, 0, 0, 0)

      const todayDate = new Date(today)
      todayDate.setHours(0, 0, 0, 0)

      // Wenn die letzte Aktivität heute war, nichts tun
      if (lastActivityDate.getTime() === todayDate.getTime()) {
        return
      }

      // Wenn die letzte Aktivität gestern war, Streak erhöhen
      if (lastActivityDate.getTime() === yesterdayDate.getTime()) {
        await statsRef.update({
          streakDays: firestore.FieldValue.increment(1),
          lastActivity: today,
        })
      } else {
        // Wenn die letzte Aktivität länger her ist, Streak zurücksetzen
        await statsRef.update({
          streakDays: 1,
          lastActivity: today,
        })
      }
    } catch (error) {
      console.error("Fehler beim Aktualisieren des Streaks:", error)
      throw error
    }
  },
}
