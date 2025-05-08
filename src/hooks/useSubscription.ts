"use client"

import { useState, useEffect, useCallback } from "react"
import { subscriptionService, SubscriptionTier } from "../services/subscription"
import { useAuth } from "./useAuth"

export function useSubscription() {
  const { user } = useAuth()
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>(SubscriptionTier.FREE)
  const [loading, setLoading] = useState(true)

  // Abonnement-Status laden
  const loadSubscriptionStatus = useCallback(async () => {
    if (!user) {
      setSubscriptionTier(SubscriptionTier.FREE)
      setLoading(false)
      return
    }

    setLoading(true)

    try {
      const tier = await subscriptionService.getSubscriptionStatus(user.uid)
      setSubscriptionTier(tier)
    } catch (error) {
      console.error("Fehler beim Laden des Abonnement-Status:", error)
      setSubscriptionTier(SubscriptionTier.FREE)
    } finally {
      setLoading(false)
    }
  }, [user])

  // Abonnement-Status laden, wenn sich der Benutzer ändert
  useEffect(() => {
    loadSubscriptionStatus()
  }, [loadSubscriptionStatus])

  // Abonnement kaufen
  const purchaseSubscription = useCallback(
    async (interval: "monthly" | "yearly") => {
      if (!user) return false

      try {
        const success = await subscriptionService.purchaseSubscription(SubscriptionTier.FAMILY, interval)

        if (success) {
          setSubscriptionTier(SubscriptionTier.FAMILY)
        }

        return success
      } catch (error) {
        console.error("Fehler beim Kauf des Abonnements:", error)
        return false
      }
    },
    [user],
  )

  // Abonnement kündigen
  const cancelSubscription = useCallback(async () => {
    if (!user) return false

    try {
      const success = await subscriptionService.cancelSubscription()

      if (success) {
        setSubscriptionTier(SubscriptionTier.FREE)
      }

      return success
    } catch (error) {
      console.error("Fehler bei der Kündigung des Abonnements:", error)
      return false
    }
  }, [user])

  // Prüfen, ob eine Funktion verfügbar ist
  const isFeatureAvailable = useCallback(
    async (feature: string) => {
      if (!user) return false

      return await subscriptionService.isFeatureAvailable(feature, user.uid)
    },
    [user],
  )

  return {
    subscriptionTier,
    loading,
    isPremium: subscriptionTier === SubscriptionTier.FAMILY,
    purchaseSubscription,
    cancelSubscription,
    isFeatureAvailable,
    refreshSubscription: loadSubscriptionStatus,
  }
}
