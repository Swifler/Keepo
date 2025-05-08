"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native"
import { useTranslation } from "react-i18next"
import { useTheme } from "../contexts/ThemeContext"
import { useAuth } from "../hooks/useAuth"
import { useSubscription } from "../hooks/useSubscription"
import StatisticsCard from "../components/StatisticsCard"
import ExtendedStatisticsCard from "../components/ExtendedStatisticsCard"
import { statisticsService } from "../services/statistics"
import { Home, LogOut, Settings, CreditCard, ChevronRight, UserPlus, Lock } from "lucide-react-native"
import type { ExtendedStats } from "../types"

export default function ProfileScreen() {
  const { t } = useTranslation()
  const { colors } = useTheme()
  const { user, userProfile, logout } = useAuth()
  const { subscriptionTier, isPremium } = useSubscription()

  const [showLoginModal, setShowLoginModal] = useState(false)
  const [basicStats, setBasicStats] = useState({ savedItems: 0, savedMoney: 0, co2Saved: 0, streakDays: 0 })
  const [extendedStats, setExtendedStats] = useState<ExtendedStats | null>(null)
  const [loading, setLoading] = useState(true)

  // Statistiken laden
  useEffect(() => {
    const loadStats = async () => {
      if (!user) return

      setLoading(true)
      try {
        // Grundlegende Statistiken laden
        const stats = await statisticsService.getBasicStats(user.uid)
        setBasicStats(stats)

        // Erweiterte Statistiken für Premium-Nutzer laden
        if (isPremium) {
          try {
            const extended = await statisticsService.getExtendedStats(user.uid)
            setExtendedStats(extended)
          } catch (error) {
            console.error("Fehler beim Laden der erweiterten Statistiken:", error)
          }
        }
      } catch (error) {
        console.error("Fehler beim Laden der Statistiken:", error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [user, isPremium])

  const handleLogout = async () => {
    Alert.alert(t("auth.logout"), t("auth.logoutConfirm"), [
      {
        text: t("actions.cancel"),
        style: "cancel",
      },
      {
        text: t("auth.logout"),
        onPress: async () => {
          try {
            await logout()
          } catch (error) {
            console.error("Fehler beim Abmelden:", error)
          }
        },
      },
    ])
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Profilkopf */}
      <View style={[styles.profileHeader, { backgroundColor: colors.cardBackground }]}>
        <View style={[styles.avatarContainer, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>
            {userProfile?.displayName
              ? userProfile.displayName.charAt(0).toUpperCase()
              : user?.email
                ? user.email.charAt(0).toUpperCase()
                : "G"}
          </Text>
        </View>

        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, { color: colors.text }]}>
            {userProfile?.displayName || user?.email || t("auth.guestUser")}
          </Text>

          <View style={styles.subscriptionBadge}>
            <Text style={[styles.subscriptionText, { color: isPremium ? colors.primary : colors.textSecondary }]}>
              {isPremium ? t("subscription.familyPlan") : t("subscription.freePlan")}
            </Text>
          </View>
        </View>
      </View>

      {/* Statistiken */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <>
          <StatisticsCard {...basicStats} />

          {isPremium && extendedStats && <ExtendedStatisticsCard stats={extendedStats} />}

          {!isPremium && (
            <View style={[styles.premiumCard, { backgroundColor: colors.cardBackground }]}>
              <Text style={[styles.premiumTitle, { color: colors.text }]}>{t("stats.premiumRequired")}</Text>
              <Text style={[styles.premiumDescription, { color: colors.textSecondary }]}>
                {t("subscription.feature.weeklyReports")}
              </Text>
              <TouchableOpacity
                style={[styles.premiumButton, { backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate("Subscription" as never)}
              >
                <Text style={styles.premiumButtonText}>{t("subscription.viewPlans")}</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}

      {/* Menüoptionen */}
      <View style={[styles.menuContainer, { backgroundColor: colors.cardBackground }]}>
        {/* Haushalt */}
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuItemIcon, { backgroundColor: `${colors.primary}20` }]}>
              <Home size={20} color={colors.primary} />
            </View>
            <Text style={[styles.menuItemText, { color: colors.text }]}>{t("navigation.household")}</Text>
          </View>
          <ChevronRight size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* Abonnement */}
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Subscription" as never)}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuItemIcon, { backgroundColor: `${colors.success}20` }]}>
              <CreditCard size={20} color={colors.success} />
            </View>
            <Text style={[styles.menuItemText, { color: colors.text }]}>{t("navigation.subscription")}</Text>
          </View>
          <ChevronRight size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* Einstellungen */}
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuItemIcon, { backgroundColor: `${colors.textSecondary}20` }]}>
              <Settings size={20} color={colors.textSecondary} />
            </View>
            <Text style={[styles.menuItemText, { color: colors.text }]}>{t("navigation.settings")}</Text>
          </View>
          <ChevronRight size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* Konto upgraden (nur für anonyme Benutzer) */}
        {user?.isAnonymous && (
          <TouchableOpacity style={styles.menuItem} onPress={() => setShowLoginModal(true)}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: `${colors.secondary}20` }]}>
                <UserPlus size={20} color={colors.secondary} />
              </View>
              <Text style={[styles.menuItemText, { color: colors.text }]}>{t("auth.upgradeAccount")}</Text>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}

        {/* Abmelden */}
        {!user?.isAnonymous && (
          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: `${colors.error}20` }]}>
                <LogOut size={20} color={colors.error} />
              </View>
              <Text style={[styles.menuItemText, { color: colors.error }]}>{t("auth.logout")}</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Datenschutzhinweis */}
      <View style={styles.privacyContainer}>
        <Lock size={16} color={colors.textSecondary} />
        <Text style={[styles.privacyText, { color: colors.textSecondary }]}>{t("common.privacyInfo")}</Text>
      </View>

      {/* Version */}
      <Text style={[styles.versionText, { color: colors.textSecondary }]}>Version 1.0.0</Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    color: "white",
    fontSize: 24,
    fontWeight: "600",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  subscriptionBadge: {
    alignSelf: "flex-start",
  },
  subscriptionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  menuContainer: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
  },
  privacyContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 8,
  },
  privacyText: {
    fontSize: 12,
    marginLeft: 6,
    textAlign: "center",
  },
  versionText: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 20,
  },
  premiumCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  premiumDescription: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  premiumButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  premiumButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
})
