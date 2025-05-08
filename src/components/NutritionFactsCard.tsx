"use client"

import { View, Text, StyleSheet, ScrollView } from "react-native"
import { useTheme } from "../contexts/ThemeContext"
import { useTranslation } from "react-i18next"
import { openFoodFactsService, type NutritionFacts } from "../services/openFoodFacts"

interface NutritionFactsCardProps {
  nutritionFacts: NutritionFacts
  nutritionGrade?: string
  ecoScore?: string
  novaGroup?: number
}

export default function NutritionFactsCard({
  nutritionFacts,
  nutritionGrade,
  ecoScore,
  novaGroup,
}: NutritionFactsCardProps) {
  const { colors } = useTheme()
  const { t } = useTranslation()

  const nutritionGradeInfo = openFoodFactsService.getNutritionGradeInfo(nutritionGrade)
  const ecoScoreInfo = openFoodFactsService.getEcoScoreInfo(ecoScore)
  const novaGroupInfo = openFoodFactsService.getNovaGroupInfo(novaGroup)

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBackground }]}>
      <Text style={[styles.title, { color: colors.text }]}>{t("nutrition.facts")}</Text>

      <View style={styles.scoreContainer}>
        {nutritionGrade && (
          <View style={styles.scoreItem}>
            <View style={[styles.scoreCircle, { backgroundColor: nutritionGradeInfo.color }]}>
              <Text style={styles.scoreText}>{nutritionGrade.toUpperCase()}</Text>
            </View>
            <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>{t("nutrition.nutriscore")}</Text>
            <Text style={[styles.scoreDescription, { color: colors.text }]}>{nutritionGradeInfo.label}</Text>
          </View>
        )}

        {ecoScore && (
          <View style={styles.scoreItem}>
            <View style={[styles.scoreCircle, { backgroundColor: ecoScoreInfo.color }]}>
              <Text style={styles.scoreText}>{ecoScore.toUpperCase()}</Text>
            </View>
            <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>{t("nutrition.ecoscore")}</Text>
            <Text style={[styles.scoreDescription, { color: colors.text }]}>{ecoScoreInfo.label}</Text>
          </View>
        )}

        {novaGroup && (
          <View style={styles.scoreItem}>
            <View style={[styles.scoreCircle, { backgroundColor: novaGroupInfo.color }]}>
              <Text style={styles.scoreText}>{novaGroup}</Text>
            </View>
            <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>{t("nutrition.nova")}</Text>
            <Text style={[styles.scoreDescription, { color: colors.text }]}>{novaGroupInfo.label}</Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.nutritionTable}>
        <NutritionRow
          label={t("nutrition.energy")}
          value={nutritionFacts.energy_100g}
          unit={nutritionFacts.energy_unit || "kcal"}
          colors={colors}
        />
        <NutritionRow label={t("nutrition.fat")} value={nutritionFacts.fat_100g} unit="g" colors={colors} />
        <NutritionRow
          label={t("nutrition.saturatedFat")}
          value={nutritionFacts.saturated_fat_100g}
          unit="g"
          isSubItem
          colors={colors}
        />
        <NutritionRow label={t("nutrition.carbs")} value={nutritionFacts.carbohydrates_100g} unit="g" colors={colors} />
        <NutritionRow
          label={t("nutrition.sugar")}
          value={nutritionFacts.sugars_100g}
          unit="g"
          isSubItem
          colors={colors}
        />
        <NutritionRow label={t("nutrition.fiber")} value={nutritionFacts.fiber_100g} unit="g" colors={colors} />
        <NutritionRow label={t("nutrition.proteins")} value={nutritionFacts.proteins_100g} unit="g" colors={colors} />
        <NutritionRow label={t("nutrition.salt")} value={nutritionFacts.salt_100g} unit="g" colors={colors} />
        <NutritionRow
          label={t("nutrition.sodium")}
          value={nutritionFacts.sodium_100g}
          unit="g"
          isSubItem
          colors={colors}
        />
      </ScrollView>

      <Text style={[styles.disclaimer, { color: colors.textSecondary }]}>{t("nutrition.disclaimer")}</Text>
    </View>
  )
}

interface NutritionRowProps {
  label: string
  value?: number
  unit: string
  isSubItem?: boolean
  colors: any
}

function NutritionRow({ label, value, unit, isSubItem = false, colors }: NutritionRowProps) {
  if (value === undefined) return null

  return (
    <View style={[styles.nutritionRow, isSubItem && styles.subItem]}>
      <Text style={[styles.nutritionLabel, { color: colors.text }, isSubItem && { color: colors.textSecondary }]}>
        {label}
      </Text>
      <Text style={[styles.nutritionValue, { color: colors.text }]}>
        {value.toFixed(1)} {unit}
      </Text>
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
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  scoreContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  scoreItem: {
    alignItems: "center",
    width: "30%",
  },
  scoreCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  scoreText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
  scoreLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  scoreDescription: {
    fontSize: 10,
    textAlign: "center",
  },
  nutritionTable: {
    maxHeight: 200,
  },
  nutritionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  subItem: {
    paddingLeft: 16,
  },
  nutritionLabel: {
    fontSize: 14,
  },
  nutritionValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  disclaimer: {
    fontSize: 10,
    fontStyle: "italic",
    marginTop: 12,
    textAlign: "center",
  },
})
