"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from "react-native"
import { Plus, ShoppingBag, Trash } from "lucide-react-native"
import { useTranslation } from "react-i18next"
import { useTheme } from "../contexts/ThemeContext"
import { useShoppingList } from "../hooks/useShoppingList"
import { useInventory } from "../hooks/useInventory"
import { useRecipes } from "../hooks/useRecipes"
import GradientBackground from "../components/GradientBackground"
import ShoppingListItem from "../components/ShoppingListItem"
import AddShoppingItemModal from "../components/AddShoppingItemModal"
import type { ShoppingItemType } from "../types"
import { findMissingIngredients } from "../utils/recipeUtils"

export default function ShoppingListScreen() {
  const { t } = useTranslation()
  const { colors } = useTheme()
  const { items: shoppingItems, fetchItems, toggleItemStatus, addItems, clearPurchasedItems } = useShoppingList()
  const { items: inventoryItems } = useInventory()
  const { recipes } = useRecipes()

  const [modalVisible, setModalVisible] = useState(false)
  const [sortedItems, setSortedItems] = useState<ShoppingItemType[]>([])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  useEffect(() => {
    // Sortiere Elemente: nicht gekaufte zuerst, dann alphabetisch
    const sorted = [...shoppingItems].sort((a, b) => {
      if (a.gekauft !== b.gekauft) {
        return a.gekauft ? 1 : -1
      }
      return a.name.localeCompare(b.name)
    })

    setSortedItems(sorted)
  }, [shoppingItems])

  const handleToggleItem = (id: string, currentStatus: boolean) => {
    toggleItemStatus(id, !currentStatus)
  }

  const handleAddMissingIngredients = () => {
    if (recipes.length === 0) {
      Alert.alert(t("shoppingList.noRecipesTitle"), t("shoppingList.noRecipesMessage"))
      return
    }

    const missingIngredients = findMissingIngredients(recipes, inventoryItems)

    if (missingIngredients.length === 0) {
      Alert.alert(t("shoppingList.noMissingTitle"), t("shoppingList.noMissingMessage"))
      return
    }

    // Fehlende Zutaten zur Einkaufsliste hinzufügen
    addItems(
      missingIngredients.map((ingredient) => ({
        name: ingredient,
        menge: "1 Stk.",
        gekauft: false,
      })),
    )

    Alert.alert(t("shoppingList.addedTitle"), t("shoppingList.addedMessage", { count: missingIngredients.length }))
  }

  const handleClearPurchased = () => {
    const purchasedCount = shoppingItems.filter((item) => item.gekauft).length

    if (purchasedCount === 0) {
      Alert.alert(t("shoppingList.noPurchasedTitle"), t("shoppingList.noPurchasedMessage"))
      return
    }

    Alert.alert(
      t("shoppingList.clearPurchasedTitle"),
      t("shoppingList.clearPurchasedConfirm", { count: purchasedCount }),
      [
        {
          text: t("actions.cancel"),
          style: "cancel",
        },
        {
          text: t("actions.confirm"),
          onPress: () => clearPurchasedItems(),
        },
      ],
    )
  }

  const renderItem = ({ item }: { item: ShoppingItemType }) => {
    return <ShoppingListItem item={item} onToggle={() => handleToggleItem(item.id, item.gekauft)} />
  }

  return (
    <GradientBackground>
      <View style={styles.container}>
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => setModalVisible(true)}
          >
            <Plus size={20} color="white" />
            <Text style={styles.actionButtonText}>{t("shoppingList.addItem")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.secondary }]}
            onPress={handleAddMissingIngredients}
          >
            <ShoppingBag size={20} color="white" />
            <Text style={styles.actionButtonText}>{t("shoppingList.addMissing")}</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={sortedItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t("shoppingList.empty")}</Text>
            </View>
          }
        />

        {sortedItems.some((item) => item.gekauft) && (
          <TouchableOpacity
            style={[styles.clearButton, { backgroundColor: colors.error }]}
            onPress={handleClearPurchased}
          >
            <Trash size={20} color="white" />
            <Text style={styles.clearButtonText}>{t("shoppingList.clearPurchased")}</Text>
          </TouchableOpacity>
        )}

        <AddShoppingItemModal visible={modalVisible} onClose={() => setModalVisible(false)} />
      </View>
    </GradientBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  actionsContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 16,
    flex: 1,
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    color: "white",
    marginLeft: 8,
    fontWeight: "500",
  },
  listContent: {
    paddingBottom: 80,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
  clearButton: {
    position: "absolute",
    bottom: 24,
    left: 24,
    right: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  clearButtonText: {
    color: "white",
    marginLeft: 8,
    fontWeight: "500",
  },
})
