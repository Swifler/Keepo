"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native"
import { useTranslation } from "react-i18next"
import { useTheme } from "../contexts/ThemeContext"
import { useSubscription } from "../hooks/useSubscription"
import { SubscriptionTier, SUBSCRIPTION_PRICES } from "../services/subscription"
import { iapService } from "../services/iap"
import { Check, X } from "lucide-react-native"

export default function SubscriptionScreen() {
  const { t } = useTranslation()
  const { colors } = useTheme()
  const { subscriptionTier, loading, purchaseSubscription, cancelSubscription, refreshSubscription } = useSubscription()

  const [selectedInterval, setSelectedInterval] = useState<"monthly" | "yearly">("monthly")
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [storeConnected, setStoreConnected] = useState(false)

  // Store-Verbindung herstellen und Produkte abrufen
  useEffect(() => {
    const connectStore = async () => {
      try {
        const connected = await iapService.connectToStore()
        setStoreConnected(connected)

        if (connected) {
          const availableProducts = await iapService.getAvailableProducts()
          setProducts(availableProducts)
        }
      } catch (error) {
        console.error("Fehler beim Verbinden mit dem Store:", error)
      }
    }

    connectStore()

    // Kauf-Listener einrichten
    const removeListeners = iapService.setupPurchaseListeners(
      (purchase) => {
        // Erfolgreicher Kauf
        setIsPurchasing(false)
        Alert.alert(t("subscription.purchaseSuccess"))
        refreshSubscription()
      },
      (error) => {
        // Fehler beim Kauf
        setIsPurchasing(false)
        Alert.alert(t("subscription.purchaseError"), error.message)
      },
    )

    return () => {
      // Listener entfernen
      removeListeners()
    }
  }, [t, refreshSubscription])

  // Preis für das ausgewählte Abonnement abrufen
  const getProductPrice = (interval: "monthly" | "yearly") => {
    const sku = iapService.getSubscriptionSku(SubscriptionTier.FAMILY, interval)
    if (!sku) return null

    const product = products.find((p) => p.productId === sku)
    return product ? product.localizedPrice : null
  }

  const handlePurchase = async () => {
    setIsPurchasing(true)

    try {
      if (!storeConnected) {
        const connected = await iapService.connectToStore()
        if (!connected) {
          throw new Error(t("subscription.storeConnectionError"))
        }
        setStoreConnected(connected)
      }

      const sku = iapService.getSubscriptionSku(SubscriptionTier.FAMILY, selectedInterval)
      if (!sku) {
        throw new Error(t("subscription.productNotAvailable"))
      }

      // Kauf starten
      await iapService.purchaseSubscription(sku)

      // Der Kauf wird über den Listener abgeschlossen
    } catch (error) {
      console.error("Fehler beim Kauf des Abonnements:", error)
      Alert.alert(t("subscription.purchaseError"), error.message)
      setIsPurchasing(false)
    }
  }

  const handleCancel = async () => {
    setIsCancelling(true)

    try {
      const success = await cancelSubscription()

      if (success) {
        Alert.alert(t("subscription.cancelSuccess"))
      } else {
        Alert.alert(t("subscription.cancelError"))
      }
    } catch (error) {
      console.error("Fehler bei der Kündigung des Abonnements:", error)
      Alert.alert(t("subscription.cancelError"))
    } finally {
      setIsCancelling(false)
    }
  }

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  // Preise aus dem Store oder Fallback-Werte verwenden
  const monthlyPrice =
    getProductPrice("monthly") || `${SUBSCRIPTION_PRICES[SubscriptionTier.FAMILY].monthly} €/${t("subscription.month")}`
  const yearlyPrice =
    getProductPrice("yearly") || `${SUBSCRIPTION_PRICES[SubscriptionTier.FAMILY].yearly} €/${t("subscription.year")}`

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>{t("subscription.title")}</Text>

      <View style={styles.plansContainer}>
        {/* Kostenloser Plan */}
        <View
          style={[
            styles.planCard,
            { backgroundColor: colors.cardBackground },
            subscriptionTier === SubscriptionTier.FREE && { borderColor: colors.primary, borderWidth: 2 },
          ]}
        >
          <View style={styles.planHeader}>
            <Text style={[styles.planTitle, { color: colors.text }]}>🥦 {t("subscription.freePlan")}</Text>
            <Text style={[styles.planPrice, { color: colors.primary }]}>{t("subscription.freePrice")}</Text>
          </View>

          <View style={styles.planFeatures}>
            <FeatureItem text={t("subscription.feature.singleUser")} included />
            <FeatureItem text={t("subscription.feature.barcodeScanning")} included />
            <FeatureItem text={t("subscription.feature.expiryReminders")} included />
            <FeatureItem text={t("subscription.feature.basicAI")} included />
            <FeatureItem text={t("subscription.feature.recipes")} included />
            <FeatureItem text={t("subscription.feature.singleDevice")} included />
            <FeatureItem text={t("subscription.feature.noSubscription")} included />
          </View>

          {subscriptionTier === SubscriptionTier.FAMILY && (
            <TouchableOpacity
              style={[styles.planButton, { backgroundColor: colors.error }]}
              onPress={handleCancel}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.planButtonText}>{t("subscription.downgrade")}</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Premium-Plan */}
        <View
          style={[
            styles.planCard,
            { backgroundColor: colors.cardBackground },
            subscriptionTier === SubscriptionTier.FAMILY && { borderColor: colors.primary, borderWidth: 2 },
          ]}
        >
          <View style={styles.planHeader}>
            <Text style={[styles.planTitle, { color: colors.text }]}>👨‍👩‍👧‍👦 {t("subscription.familyPlan")}</Text>

            <View style={styles.intervalSelector}>
              <TouchableOpacity
                style={[styles.intervalButton, selectedInterval === "monthly" && { backgroundColor: colors.primary }]}
                onPress={() => setSelectedInterval("monthly")}
              >
                <Text
                  style={[styles.intervalButtonText, { color: selectedInterval === "monthly" ? "white" : colors.text }]}
                >
                  {t("subscription.monthly")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.intervalButton, selectedInterval === "yearly" && { backgroundColor: colors.primary }]}
                onPress={() => setSelectedInterval("yearly")}
              >
                <Text
                  style={[styles.intervalButtonText, { color: selectedInterval === "yearly" ? "white" : colors.text }]}
                >
                  {t("subscription.yearly")}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.planPrice, { color: colors.primary }]}>
              {selectedInterval === "monthly" ? monthlyPrice : yearlyPrice}
            </Text>

            {selectedInterval === "yearly" && (
              <Text style={[styles.savingsText, { color: colors.success }]}>{t("subscription.yearlySavings")}</Text>
            )}
          </View>

          <View style={styles.planFeatures}>
            <FeatureItem text={t("subscription.feature.fiveUsers")} included />
            <FeatureItem text={t("subscription.feature.sharedInventory")} included />
            <FeatureItem text={t("subscription.feature.advancedAI")} included />
            <FeatureItem text={t("subscription.feature.weeklyReports")} included />
            <FeatureItem text={t("subscription.feature.familyShopping")} included />
            <FeatureItem text={t("subscription.feature.prioritySupport")} included />
            <FeatureItem text={t("subscription.feature.freeTrial")} included />
          </View>

          {subscriptionTier !== SubscriptionTier.FAMILY && (
            <TouchableOpacity
              style={[styles.planButton, { backgroundColor: colors.primary }]}
              onPress={handlePurchase}
              disabled={isPurchasing}
            >
              {isPurchasing ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.planButtonText}>{t("subscription.subscribe")}</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  )
}

// Komponente für Funktionsmerkmale
interface FeatureItemProps {
  text: string
  included: boolean
}

function FeatureItem({ text, included }: FeatureItemProps) {
  const { colors } = useTheme()

  return (
    <View style={styles.featureItem}>
      {included ? <Check size={20} color={colors.success} /> : <X size={20} color={colors.error} />}
      <Text style={[styles.featureText, { color: colors.text }]}>{text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 24,
    textAlign: "center",
  },
  plansContainer: {
    marginBottom: 20,
  },
  planCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  planHeader: {
    marginBottom: 16,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  intervalSelector: {
    flexDirection: "row",
    marginVertical: 10,
  },
  intervalButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  intervalButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  savingsText: {
    fontSize: 14,
    fontStyle: "italic",
    marginBottom: 8,
  },
  planFeatures: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    marginLeft: 10,
  },
  planButton: {
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
  },
  planButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
})
