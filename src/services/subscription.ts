import firestore from "@react-native-firebase/firestore"
import { authService } from "./auth"

// Abonnement-Typen
export enum SubscriptionTier {
  FREE = "free",
  FAMILY = "family",
}

// Abonnement-Preise
export const SUBSCRIPTION_PRICES = {
  [SubscriptionTier.FAMILY]: {
    monthly: 4.99,
    yearly: 49.99,
  },
}

// Abonnement-Funktionen
export const subscriptionService = {
  // Abonnement-Status abrufen
  async getSubscriptionStatus(userId: string): Promise<SubscriptionTier> {
    try {
      const userDoc = await firestore().collection("users").doc(userId).get()

      if (!userDoc.exists) {
        return SubscriptionTier.FREE
      }

      const userData = userDoc.data()

      if (userData?.isPremium) {
        return SubscriptionTier.FAMILY
      }

      return SubscriptionTier.FREE
    } catch (error) {
      console.error("Fehler beim Abrufen des Abonnement-Status:", error)
      return SubscriptionTier.FREE
    }
  },

  // Abonnement kaufen (Simuliert für die Entwicklung)
  async purchaseSubscription(tier: SubscriptionTier, interval: "monthly" | "yearly"): Promise<boolean> {
    try {
      const user = authService.getCurrentUser()

      if (!user) {
        throw new Error("Benutzer nicht angemeldet")
      }

      // In einer echten App würde hier die In-App-Kauf-API aufgerufen werden
      // z.B. mit react-native-iap oder react-native-purchases

      // Simuliere einen erfolgreichen Kauf
      await firestore()
        .collection("users")
        .doc(user.uid)
        .update({
          isPremium: tier === SubscriptionTier.FAMILY,
          subscriptionTier: tier,
          subscriptionInterval: interval,
          subscriptionPurchaseDate: new Date(),
          subscriptionExpiryDate: new Date(Date.now() + (interval === "yearly" ? 365 : 30) * 24 * 60 * 60 * 1000),
        })

      // Wenn der Benutzer einen Haushalt hat, aktualisiere auch den Haushalt
      const userProfile = await authService.getUserProfile(user.uid)

      if (userProfile?.householdId) {
        await firestore()
          .collection("households")
          .doc(userProfile.householdId)
          .update({
            isPremium: tier === SubscriptionTier.FAMILY,
          })
      }

      return true
    } catch (error) {
      console.error("Fehler beim Kauf des Abonnements:", error)
      return false
    }
  },

  // Abonnement kündigen (Simuliert für die Entwicklung)
  async cancelSubscription(): Promise<boolean> {
    try {
      const user = authService.getCurrentUser()

      if (!user) {
        throw new Error("Benutzer nicht angemeldet")
      }

      // In einer echten App würde hier die In-App-Kauf-API aufgerufen werden

      // Simuliere eine erfolgreiche Kündigung
      await firestore().collection("users").doc(user.uid).update({
        isPremium: false,
        subscriptionTier: SubscriptionTier.FREE,
        subscriptionCancelDate: new Date(),
      })

      // Wenn der Benutzer ein Haushaltsbesitzer ist, aktualisiere auch den Haushalt
      const userProfile = await authService.getUserProfile(user.uid)

      if (userProfile?.householdId && userProfile?.role === "owner") {
        await firestore().collection("households").doc(userProfile.householdId).update({
          isPremium: false,
        })
      }

      return true
    } catch (error) {
      console.error("Fehler bei der Kündigung des Abonnements:", error)
      return false
    }
  },

  // Prüfen, ob eine Funktion für den aktuellen Abonnement-Typ verfügbar ist
  async isFeatureAvailable(feature: string, userId: string): Promise<boolean> {
    try {
      const tier = await this.getSubscriptionStatus(userId)

      // Funktionen, die nur im Family-Abonnement verfügbar sind
      const familyOnlyFeatures = [
        "household_members",
        "advanced_ai",
        "weekly_reports",
        "co2_savings",
        "family_shopping_mode",
        "priority_support",
      ]

      // Wenn die Funktion nur im Family-Abonnement verfügbar ist und der Benutzer kein Family-Abonnement hat
      if (familyOnlyFeatures.includes(feature) && tier !== SubscriptionTier.FAMILY) {
        return false
      }

      return true
    } catch (error) {
      console.error("Fehler beim Prüfen der Funktionsverfügbarkeit:", error)
      return false
    }
  },
}
