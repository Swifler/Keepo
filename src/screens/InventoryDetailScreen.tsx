"use client"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native"
import { useRoute, useNavigation } from "@react-navigation/native"
import { Edit, Trash2, ArrowLeft } from "lucide-react-native"
import { useTranslation } from "react-i18next"
import { useTheme } from "../contexts/ThemeContext"
import { useInventory } from "../hooks/useInventory"
import { useSubscription } from "../hooks/useSubscription"
import NutritionFactsCard from "../components/NutritionFactsCard"
import { formatDate } from "../utils/dateUtils"
import type { InventoryItemType } from "../types"
import type { InventoryStackParamList } from "../navigation/types"
import type { RouteProp } from "@react-navigation/native"

type InventoryDetailRouteProp = RouteProp<InventoryStackParamList, "InventoryDetail">

export default function InventoryDetailScreen() {
  const { t } = useTranslation()
  const { colors } = useTheme()
  const route = useRoute<InventoryDetailRouteProp>()
  const navigation = useNavigation()
  const { items, deleteItem } = useInventory()
  const { isPremium, isFeatureAvailable } = useSubscription()

  const [item, setItem] = useState<InventoryItemType | null>(null)
  const [loading, setLoading] = useState(true)
  const [canViewNutrition, setCanViewNutrition] = useState(false)

  const { itemId } = route.params

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true)
      const foundItem = items.find((i) => i.id === itemId)
      setItem(foundItem || null)

      // Prüfen, ob der Benutzer Zugriff auf Nährwertinformationen hat
      if (isPremium) {
        setCanViewNutrition(true)
      } else {
        const hasAccess = await isFeatureAvailable("nutrition_info")
        setCanViewNutrition(hasAccess)
      }

      setLoading(false)
    }

    fetchItem()
  }, [itemId, items, isPremium, isFeatureAvailable])

  const handleEdit = () => {
    navigation.navigate("EditInventoryItem" as never, { itemId } as never)
  }

  const handleDelete = async () => {
    await deleteItem(itemId)
    navigation.goBack()
  }

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  if (!item) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>{t("inventory.itemNotFound")}</Text>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={20} color="white" />
          <Text style={styles.backButtonText}>{t("actions.back")}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const hasProductInfo = !!item.productInfo

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.headerButton, { backgroundColor: colors.cardBackground }]}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: colors.cardBackground }]}
            onPress={handleEdit}
          >
            <Edit size={20} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: colors.cardBackground }]}
            onPress={handleDelete}
          >
            <Trash2 size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.imageContainer, { backgroundColor: colors.cardBackground }]}>
        {item.bildUrl ? (
          <Image source={{ uri: item.bildUrl }} style={styles.image} resizeMode="contain" />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: colors.border }]}>
            <Text style={[styles.imagePlaceholderText, { color: colors.textSecondary }]}>{t("inventory.noImage")}</Text>
          </View>
        )}
      </View>

      <View style={[styles.infoCard, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>

        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{t("inventory.category")}:</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{item.kategorie}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{t("inventory.amount")}:</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{item.menge}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{t("inventory.expiryDate")}:</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{formatDate(item.haltbarBis)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{t("inventory.addedOn")}:</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{formatDate(item.erstelltAm)}</Text>
        </View>
      </View>

      {hasProductInfo && canViewNutrition ? (
        <NutritionFactsCard
          nutritionFacts={item.productInfo.nutrition_facts}
          nutritionGrade={item.productInfo.nutrition_facts.nutrition_grade}
          ecoScore={item.productInfo.eco_score}
          novaGroup={item.productInfo.nova_group}
        />
      ) : hasProductInfo && !canViewNutrition ? (
        <View style={[styles.premiumCard, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.premiumTitle, { color: colors.text }]}>{t("nutrition.premiumRequired")}</Text>
          <Text style={[styles.premiumDescription, { color: colors.textSecondary }]}>
            {t("nutrition.premiumDescription")}
          </Text>
          <TouchableOpacity
            style={[styles.premiumButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate("Profile" as never)}
          >
            <Text style={styles.premiumButtonText}>{t("subscription.viewPlans")}</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {hasProductInfo && (
        <View style={[styles.infoCard, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("nutrition.productInfo")}</Text>

          {item.productInfo.brand && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{t("nutrition.brand")}:</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{item.productInfo.brand}</Text>
            </View>
          )}

          {item.productInfo.ingredients && item.productInfo.ingredients.length > 0 && (
            <View style={styles.ingredientsContainer}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{t("nutrition.ingredients")}:</Text>
              <Text style={[styles.ingredientsText, { color: colors.text }]}>
                {item.productInfo.ingredients.join(", ")}
              </Text>
            </View>
          )}

          {item.productInfo.allergens && item.productInfo.allergens.length > 0 && (
            <View style={styles.ingredientsContainer}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{t("nutrition.allergens")}:</Text>
              <Text style={[styles.allergensText, { color: colors.error }]}>
                {item.productInfo.allergens.join(", ")}
              </Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    margin: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 20,
  },
  backButtonText: {
    color: "white",
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "500",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
  },
  headerActions: {
    flexDirection: "row",
  },
  imageContainer: {
    height: 200,
    margin: 16,
    borderRadius: 16,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholderText: {
    fontSize: 16,
  },
  infoCard: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
  },
  itemName: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 16,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  ingredientsContainer: {
    marginTop: 12,
  },
  ingredientsText: {
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
  allergensText: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: "500",
  },
  premiumCard: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
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
