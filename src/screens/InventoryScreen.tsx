"use client"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native"
import { Swipeable } from "react-native-gesture-handler"
import { ChevronDown, ChevronUp, Edit2, Trash2, Plus, List, Calendar } from "lucide-react-native"
import { useTranslation } from "react-i18next"
import { useTheme } from "../contexts/ThemeContext"
import { useInventory } from "../hooks/useInventory"
import GradientBackground from "../components/GradientBackground"
import InventoryItem from "../components/InventoryItem"
import ExpiryCalendarView from "../components/ExpiryCalendarView"
import { groupByCategory } from "../utils/inventoryUtils"
import type { InventoryItemType } from "../types"

// Ansichtstypen
enum ViewType {
  LIST = "list",
  CALENDAR = "calendar",
}

export default function InventoryScreen({ navigation }) {
  const { t } = useTranslation()
  const { colors } = useTheme()
  const { items, fetchItems, deleteItem } = useInventory()
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})
  const [groupedItems, setGroupedItems] = useState<Record<string, InventoryItemType[]>>({})
  const [viewType, setViewType] = useState<ViewType>(ViewType.LIST)

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  useEffect(() => {
    if (items.length > 0) {
      const grouped = groupByCategory(items)
      setGroupedItems(grouped)

      // Standardmäßig alle Kategorien erweitern
      const expanded: Record<string, boolean> = {}
      Object.keys(grouped).forEach((category) => {
        expanded[category] = true
      })
      setExpandedCategories(expanded)
    }
  }, [items])

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }))
  }

  const handleEdit = (item: InventoryItemType) => {
    navigation.navigate("EditInventoryItem", { itemId: item.id })
  }

  const handleDelete = async (item: InventoryItemType) => {
    await deleteItem(item.id)
  }

  const handleAddItem = () => {
    navigation.navigate("EditInventoryItem")
  }

  const handleItemPress = (item: InventoryItemType) => {
    navigation.navigate("InventoryDetail", { itemId: item.id })
  }

  const renderSwipeableActions = (item: InventoryItemType) => {
    return (
      <View style={styles.swipeableContainer}>
        <TouchableOpacity style={[styles.swipeAction, styles.editAction]} onPress={() => handleEdit(item)}>
          <Edit2 color="white" size={20} />
          <Text style={styles.swipeActionText}>{t("actions.edit")}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.swipeAction, styles.deleteAction]} onPress={() => handleDelete(item)}>
          <Trash2 color="white" size={20} />
          <Text style={styles.swipeActionText}>{t("actions.delete")}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const renderCategoryHeader = (category: string, count: number) => {
    const isExpanded = expandedCategories[category] || false

    return (
      <TouchableOpacity
        style={[styles.categoryHeader, { backgroundColor: colors.cardBackground }]}
        onPress={() => toggleCategory(category)}
      >
        <Text style={[styles.categoryTitle, { color: colors.text }]}>
          {category} ({count})
        </Text>
        {isExpanded ? <ChevronUp size={20} color={colors.text} /> : <ChevronDown size={20} color={colors.text} />}
      </TouchableOpacity>
    )
  }

  const renderListView = () => {
    return (
      <FlatList
        data={Object.keys(groupedItems)}
        keyExtractor={(item) => item}
        renderItem={({ item: category }) => (
          <View style={styles.categoryContainer}>
            {renderCategoryHeader(category, groupedItems[category].length)}

            {expandedCategories[category] && (
              <View style={styles.itemsContainer}>
                {groupedItems[category].map((item) => (
                  <Swipeable key={item.id} renderRightActions={() => renderSwipeableActions(item)}>
                    <InventoryItem item={item} />
                  </Swipeable>
                ))}
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t("inventory.empty")}</Text>
          </View>
        }
      />
    )
  }

  return (
    <GradientBackground>
      <View style={styles.container}>
        {/* Ansichtsumschalter */}
        <View style={styles.viewToggleContainer}>
          <TouchableOpacity
            style={[
              styles.viewToggleButton,
              viewType === ViewType.LIST && { backgroundColor: colors.primary },
              viewType !== ViewType.LIST && { backgroundColor: colors.cardBackground },
            ]}
            onPress={() => setViewType(ViewType.LIST)}
          >
            <List size={20} color={viewType === ViewType.LIST ? "white" : colors.text} />
            <Text style={[styles.viewToggleText, { color: viewType === ViewType.LIST ? "white" : colors.text }]}>
              {t("inventory.listView")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.viewToggleButton,
              viewType === ViewType.CALENDAR && { backgroundColor: colors.primary },
              viewType !== ViewType.CALENDAR && { backgroundColor: colors.cardBackground },
            ]}
            onPress={() => setViewType(ViewType.CALENDAR)}
          >
            <Calendar size={20} color={viewType === ViewType.CALENDAR ? "white" : colors.text} />
            <Text style={[styles.viewToggleText, { color: viewType === ViewType.CALENDAR ? "white" : colors.text }]}>
              {t("inventory.calendarView")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Ansicht basierend auf dem ausgewählten Typ */}
        {viewType === ViewType.LIST ? (
          renderListView()
        ) : (
          <ExpiryCalendarView items={items} onItemPress={handleItemPress} />
        )}

        {/* Hinzufügen-Button */}
        <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]} onPress={handleAddItem}>
          <Plus size={24} color="white" />
        </TouchableOpacity>
      </View>
    </GradientBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  viewToggleContainer: {
    flexDirection: "row",
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  viewToggleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  viewToggleText: {
    marginLeft: 8,
    fontWeight: "500",
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  itemsContainer: {
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
  },
  swipeableContainer: {
    flexDirection: "row",
    width: 160,
  },
  swipeAction: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    marginVertical: 6,
    marginHorizontal: 2,
  },
  editAction: {
    backgroundColor: "#43A047",
  },
  deleteAction: {
    backgroundColor: "#E53935",
  },
  swipeActionText: {
    color: "white",
    fontSize: 12,
    marginTop: 4,
  },
  addButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
})
