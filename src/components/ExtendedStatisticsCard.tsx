"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native"
import { useTheme } from "../contexts/ThemeContext"
import { useTranslation } from "react-i18next"
import { BarChart, LineChart, PieChart } from "react-native-chart-kit"
import { Dimensions } from "react-native"
import { ChevronDown, ChevronUp } from "lucide-react-native"
import type { ExtendedStats } from "../types"

interface ExtendedStatisticsCardProps {
  stats: ExtendedStats
}

export default function ExtendedStatisticsCard({ stats }: ExtendedStatisticsCardProps) {
  const { colors } = useTheme()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<"nutrition" | "eco" | "trends">("nutrition")
  const [expanded, setExpanded] = useState(false)

  const screenWidth = Dimensions.get("window").width - 40

  const nutritionData = {
    labels: [
      t("nutrition.proteins"),
      t("nutrition.carbs"),
      t("nutrition.fat"),
      t("nutrition.sugar"),
      t("nutrition.salt"),
    ],
    datasets: [
      {
        data: [
          stats.nutritionStats.protein,
          stats.nutritionStats.carbs,
          stats.nutritionStats.fat,
          stats.nutritionStats.sugar,
          stats.nutritionStats.salt,
        ],
      },
    ],
  }

  const ecoScoreData = [
    {
      name: "A",
      population: stats.ecoScore.a,
      color: "#1E8F4E",
      legendFontColor: colors.text,
    },
    {
      name: "B",
      population: stats.ecoScore.b,
      color: "#7AC547",
      legendFontColor: colors.text,
    },
    {
      name: "C",
      population: stats.ecoScore.c,
      color: "#FFC734",
      legendFontColor: colors.text,
    },
    {
      name: "D",
      population: stats.ecoScore.d,
      color: "#FF7D24",
      legendFontColor: colors.text,
    },
    {
      name: "E",
      population: stats.ecoScore.e,
      color: "#FF421A",
      legendFontColor: colors.text,
    },
    {
      name: t("common.unknown"),
      population: stats.ecoScore.unknown,
      color: "#CCCCCC",
      legendFontColor: colors.text,
    },
  ]

  const trendData = {
    labels: stats.monthlyTrend.map((item) => item.month),
    datasets: [
      {
        data: stats.monthlyTrend.map((item) => item.savedItems),
        color: () => colors.primary,
        strokeWidth: 2,
      },
    ],
    legend: [t("stats.savedItems")],
  }

  const chartConfig = {
    backgroundGradientFrom: colors.cardBackground,
    backgroundGradientTo: colors.cardBackground,
    decimalPlaces: 0,
    color: () => colors.primary,
    labelColor: () => colors.text,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: colors.primary,
    },
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBackground }]}>
      <TouchableOpacity style={styles.headerContainer} onPress={() => setExpanded(!expanded)}>
        <Text style={[styles.title, { color: colors.text }]}>{t("stats.extendedTitle")}</Text>
        {expanded ? <ChevronUp size={20} color={colors.text} /> : <ChevronDown size={20} color={colors.text} />}
      </TouchableOpacity>

      {expanded && (
        <View style={styles.content}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "nutrition" && {
                  borderBottomColor: colors.primary,
                  borderBottomWidth: 2,
                },
              ]}
              onPress={() => setActiveTab("nutrition")}
            >
              <Text
                style={[styles.tabText, { color: colors.text }, activeTab === "nutrition" && { color: colors.primary }]}
              >
                {t("stats.nutrition")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "eco" && {
                  borderBottomColor: colors.primary,
                  borderBottomWidth: 2,
                },
              ]}
              onPress={() => setActiveTab("eco")}
            >
              <Text style={[styles.tabText, { color: colors.text }, activeTab === "eco" && { color: colors.primary }]}>
                {t("stats.eco")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "trends" && {
                  borderBottomColor: colors.primary,
                  borderBottomWidth: 2,
                },
              ]}
              onPress={() => setActiveTab("trends")}
            >
              <Text
                style={[styles.tabText, { color: colors.text }, activeTab === "trends" && { color: colors.primary }]}
              >
                {t("stats.trends")}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {activeTab === "nutrition" && (
              <View style={styles.chartContainer}>
                <Text style={[styles.chartTitle, { color: colors.text }]}>{t("stats.nutritionDistribution")}</Text>
                <BarChart
                  data={nutritionData}
                  width={screenWidth}
                  height={220}
                  chartConfig={chartConfig}
                  style={styles.chart}
                  yAxisLabel=""
                  yAxisSuffix="g"
                  fromZero
                />
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.text }]}>
                      {stats.nutritionStats.calories.toFixed(0)}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t("nutrition.calories")}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.text }]}>
                      {stats.nutritionStats.protein.toFixed(1)}g
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t("nutrition.proteins")}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.text }]}>
                      {stats.nutritionStats.carbs.toFixed(1)}g
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t("nutrition.carbs")}</Text>
                  </View>
                </View>
              </View>
            )}

            {activeTab === "eco" && (
              <View style={styles.chartContainer}>
                <Text style={[styles.chartTitle, { color: colors.text }]}>{t("stats.ecoScoreDistribution")}</Text>
                <PieChart
                  data={ecoScoreData}
                  width={screenWidth}
                  height={220}
                  chartConfig={chartConfig}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                />
                <View style={styles.novaContainer}>
                  <Text style={[styles.novaTitle, { color: colors.text }]}>{t("stats.novaDistribution")}</Text>
                  <View style={styles.novaRow}>
                    <NovaGroupBar
                      label="1"
                      value={stats.novaGroups.group1}
                      total={
                        stats.novaGroups.group1 +
                        stats.novaGroups.group2 +
                        stats.novaGroups.group3 +
                        stats.novaGroups.group4 +
                        stats.novaGroups.unknown
                      }
                      color="#1E8F4E"
                      colors={colors}
                    />
                    <NovaGroupBar
                      label="2"
                      value={stats.novaGroups.group2}
                      total={
                        stats.novaGroups.group1 +
                        stats.novaGroups.group2 +
                        stats.novaGroups.group3 +
                        stats.novaGroups.group4 +
                        stats.novaGroups.unknown
                      }
                      color="#7AC547"
                      colors={colors}
                    />
                    <NovaGroupBar
                      label="3"
                      value={stats.novaGroups.group3}
                      total={
                        stats.novaGroups.group1 +
                        stats.novaGroups.group2 +
                        stats.novaGroups.group3 +
                        stats.novaGroups.group4 +
                        stats.novaGroups.unknown
                      }
                      color="#FF7D24"
                      colors={colors}
                    />
                    <NovaGroupBar
                      label="4"
                      value={stats.novaGroups.group4}
                      total={
                        stats.novaGroups.group1 +
                        stats.novaGroups.group2 +
                        stats.novaGroups.group3 +
                        stats.novaGroups.group4 +
                        stats.novaGroups.unknown
                      }
                      color="#FF421A"
                      colors={colors}
                    />
                  </View>
                </View>
              </View>
            )}

            {activeTab === "trends" && (
              <View style={styles.chartContainer}>
                <Text style={[styles.chartTitle, { color: colors.text }]}>{t("stats.monthlyTrend")}</Text>
                <LineChart
                  data={trendData}
                  width={screenWidth}
                  height={220}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chart}
                />
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.text }]}>{stats.savedItems}</Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t("stats.savedItems")}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.text }]}>{stats.savedMoney.toFixed(2)} €</Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t("stats.savedMoney")}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.text }]}>{stats.co2Saved.toFixed(1)} kg</Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t("stats.co2Saved")}</Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  )
}

interface NovaGroupBarProps {
  label: string
  value: number
  total: number
  color: string
  colors: any
}

function NovaGroupBar({ label, value, total, color, colors }: NovaGroupBarProps) {
  const percentage = total > 0 ? (value / total) * 100 : 0

  return (
    <View style={styles.novaBarContainer}>
      <Text style={[styles.novaLabel, { color: colors.text }]}>{label}</Text>
      <View style={[styles.novaBarBackground, { backgroundColor: colors.border }]}>
        <View style={[styles.novaBarFill, { backgroundColor: color, width: `${percentage}%` }]} />
      </View>
      <Text style={[styles.novaValue, { color: colors.textSecondary }]}>
        {value} ({percentage.toFixed(0)}%)
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  content: {
    paddingBottom: 16,
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
  },
  chartContainer: {
    paddingHorizontal: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    textAlign: "center",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  novaContainer: {
    marginTop: 16,
  },
  novaTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  novaRow: {
    marginTop: 8,
  },
  novaBarContainer: {
    marginBottom: 8,
  },
  novaLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  novaBarBackground: {
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  novaBarFill: {
    height: 8,
    borderRadius: 4,
  },
  novaValue: {
    fontSize: 12,
    textAlign: "right",
  },
})
