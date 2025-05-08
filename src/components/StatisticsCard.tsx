"use client"

import { View, Text, StyleSheet } from "react-native"
import { useTheme } from "../contexts/ThemeContext"
import { useTranslation } from "react-i18next"
import { Award, DollarSign, Leaf, Flame } from "lucide-react-native"

interface StatisticsCardProps {
  savedItems: number
  savedMoney: number
  co2Saved: number
  streakDays: number
}

export default function StatisticsCard({ savedItems, savedMoney, co2Saved, streakDays }: StatisticsCardProps) {
  const { colors } = useTheme()
  const { t } = useTranslation()

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBackground }]}>
      <Text style={[styles.title, { color: colors.text }]}>{t("stats.title")}</Text>

      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]}>
            <Award size={24} color={colors.primary} />
          </View>
          <Text style={[styles.statValue, { color: colors.text }]}>{savedItems}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t("stats.savedItems")}</Text>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.iconContainer, { backgroundColor: `${colors.success}20` }]}>
            <DollarSign size={24} color={colors.success} />
          </View>
          <Text style={[styles.statValue, { color: colors.text }]}>{savedMoney.toFixed(2)} €</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t("stats.savedMoney")}</Text>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.iconContainer, { backgroundColor: `${colors.secondary}20` }]}>
            <Leaf size={24} color={colors.secondary} />
          </View>
          <Text style={[styles.statValue, { color: colors.text }]}>{co2Saved.toFixed(1)} kg</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t("stats.co2Saved")}</Text>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.streakContainer, { backgroundColor: colors.primary }]}>
            <Flame size={20} color="white" />
            <Text style={styles.streakValue}>{streakDays}</Text>
          </View>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t("stats.streakDays")}</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statItem: {
    width: "48%",
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  streakContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  streakValue: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: "center",
  },
})
