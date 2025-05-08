"use client"
import { View, Text, StyleSheet, TextInput, FlatList } from "react-native"
import { Trash2 } from "lucide-react-native"
import { TouchableOpacity } from "react-native-gesture-handler"
import { useTranslation } from "react-i18next"
import { useTheme } from "../contexts/ThemeContext"
import CategoryPicker from "./CategoryPicker"
import type { DetectedItem } from "../types"

interface RecognizedItemsListProps {
  items: DetectedItem[]
  onItemsChange: (items: DetectedItem[]) => void
}

export default function RecognizedItemsList({ items, onItemsChange }: RecognizedItemsListProps) {
  const { t } = useTranslation()
  const { colors } = useTheme()

  const updateItemName = (index: number, name: string) => {
    const updatedItems = [...items]
    updatedItems[index] = { ...updatedItems[index], name }
    onItemsChange(updatedItems)
  }

  const updateItemCategory = (index: number, kategorie: string) => {
    const updatedItems = [...items]
    updatedItems[index] = { ...updatedItems[index], kategorie }
    onItemsChange(updatedItems)
  }

  const updateItemAmount = (index: number, menge: string) => {
    const updatedItems = [...items]
    updatedItems[index] = { ...updatedItems[index], menge }
    onItemsChange(updatedItems)
  }

  const removeItem = (index: number) => {
    const updatedItems = [...items]
    updatedItems.splice(index, 1)
    onItemsChange(updatedItems)
  }

  const renderItem = ({ item, index }: { item: DetectedItem; index: number }) => {
    return (
      <View style={[styles.itemContainer, { backgroundColor: colors.cardBackground }]}>
        <View style={styles.itemHeader}>
          <TextInput
            style={[styles.nameInput, { color: colors.text, borderColor: colors.border }]}
            value={item.name}
            onChangeText={(text) => updateItemName(index, text)}
            placeholder={t("camera.itemName")}
            placeholderTextColor={colors.textSecondary}
          />

          <TouchableOpacity onPress={() => removeItem(index)}>
            <Trash2 size={20} color={colors.error} />
          </TouchableOpacity>
        </View>

        <View style={styles.itemDetails}>
          <View style={styles.categoryContainer}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{t("camera.category")}:</Text>
            <CategoryPicker
              selectedCategory={item.kategorie}
              onCategoryChange={(category) => updateItemCategory(index, category)}
            />
          </View>

          <View style={styles.amountContainer}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{t("camera.amount")}:</Text>
            <TextInput
              style={[styles.amountInput, { color: colors.text, borderColor: colors.border }]}
              value={item.menge}
              onChangeText={(text) => updateItemAmount(index, text)}
              placeholder="1 Stk."
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </View>
      </View>
    )
  }

  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={(_, index) => index.toString()}
      contentContainerStyle={styles.listContainer}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t("camera.noItemsRecognized")}</Text>
        </View>
      }
    />
  )
}

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: 20,
  },
  itemContainer: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  nameInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  categoryContainer: {
    flex: 1,
    marginRight: 8,
  },
  amountContainer: {
    width: "40%",
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
  },
  amountInput: {
    fontSize: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
})
