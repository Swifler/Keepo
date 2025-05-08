import { Platform } from "react-native"
import {
  initConnection,
  getProducts,
  requestPurchase,
  finishTransaction,
  purchaseUpdatedListener,
  purchaseErrorListener,
  type ProductPurchase,
  type SubscriptionPurchase,
  type PurchaseError,
} from "react-native-iap"
import { subscriptionService, SubscriptionTier } from "./subscription"

// Produkt-IDs für In-App-Käufe
const SUBSCRIPTION_SKUS = Platform.select({
  ios: {
    FAMILY_MONTHLY: "com.keepo.subscription.family.monthly",
    FAMILY_YEARLY: "com.keepo.subscription.family.yearly",
  },
  android: {
    FAMILY_MONTHLY: "com.keepo.subscription.family.monthly",
    FAMILY_YEARLY: "com.keepo.subscription.family.yearly",
  },
  default: {
    FAMILY_MONTHLY: "com.keepo.subscription.family.monthly",
    FAMILY_YEARLY: "com.keepo.subscription.family.yearly",
  },
})

export const iapService = {
  // Verbindung zum Store herstellen
  async connectToStore() {
    try {
      await initConnection()
      return true
    } catch (error) {
      console.error("Fehler bei der Verbindung zum Store:", error)
      return false
    }
  },

  // Verfügbare Produkte abrufen
  async getAvailableProducts() {
    try {
      const skus = Object.values(SUBSCRIPTION_SKUS || {})
      if (skus.length === 0) {
        throw new Error("Keine Produkt-SKUs definiert")
      }

      const products = await getProducts({ skus })
      return products
    } catch (error) {
      console.error("Fehler beim Abrufen der Produkte:", error)
      throw error
    }
  },

  // Abonnement kaufen
  async purchaseSubscription(sku: string) {
    try {
      // Kauf anfordern
      const purchase = await requestPurchase({ sku })
      return purchase
    } catch (error) {
      console.error("Fehler beim Kauf des Abonnements:", error)
      throw error
    }
  },

  // Transaktion abschließen
  async finishTransaction(purchase: ProductPurchase | SubscriptionPurchase, isConsumable = false) {
    try {
      const result = await finishTransaction({ purchase, isConsumable })
      return result
    } catch (error) {
      console.error("Fehler beim Abschließen der Transaktion:", error)
      throw error
    }
  },

  // Kauf-Listener einrichten
  setupPurchaseListeners(
    onPurchaseSuccess: (purchase: ProductPurchase | SubscriptionPurchase) => void,
    onPurchaseError: (error: PurchaseError) => void,
  ) {
    const purchaseUpdateSubscription = purchaseUpdatedListener(async (purchase) => {
      // Kauf erfolgreich
      onPurchaseSuccess(purchase)

      // Abonnement-Typ und Intervall bestimmen
      let tier = SubscriptionTier.FREE
      let interval: "monthly" | "yearly" = "monthly"

      if (purchase.productId === SUBSCRIPTION_SKUS?.FAMILY_MONTHLY) {
        tier = SubscriptionTier.FAMILY
        interval = "monthly"
      } else if (purchase.productId === SUBSCRIPTION_SKUS?.FAMILY_YEARLY) {
        tier = SubscriptionTier.FAMILY
        interval = "yearly"
      }

      // Abonnement in der Datenbank aktualisieren
      await subscriptionService.purchaseSubscription(tier, interval)

      // Transaktion abschließen
      await this.finishTransaction(purchase)
    })

    const purchaseErrorSubscription = purchaseErrorListener(onPurchaseError)

    // Funktion zum Entfernen der Listener zurückgeben
    return () => {
      purchaseUpdateSubscription.remove()
      purchaseErrorSubscription.remove()
    }
  },

  // SKU für ein bestimmtes Abonnement und Intervall abrufen
  getSubscriptionSku(tier: SubscriptionTier, interval: "monthly" | "yearly"): string | null {
    if (tier === SubscriptionTier.FAMILY) {
      if (interval === "monthly") {
        return SUBSCRIPTION_SKUS?.FAMILY_MONTHLY || null
      } else {
        return SUBSCRIPTION_SKUS?.FAMILY_YEARLY || null
      }
    }
    return null
  },
}
