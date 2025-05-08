"use client"
import { useState } from "react"
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useTranslation } from "react-i18next"
import { useTheme } from "../contexts/ThemeContext"
import { useInventory } from "../hooks/useInventory"
import QuickEditModal from "./QuickEditModal"
import type { InventoryItemType } from "../types"
import { getDaysUntilExpiry, getExpiryStatusColor } from "../utils/dateUtils"

interface InventoryItemProps {
  item: InventoryItemType
}

export default function InventoryItem({ item }: InventoryItemProps) {
  const { t } = useTranslation()
  const { colors } = useTheme()
  const navigation = useNavigation()
  const { deleteItem, updateItem } = useInventory()
  const [quickEditVisible, setQuickEditVisible] = useState(false)

  const daysUntilExpiry = getDaysUntilExpiry(item.haltbarBis)
  const expiryStatusColor = getExpiryStatusColor(daysUntilExpiry, colors)

  const handlePress = () => {
    navigation.navigate("InventoryDetail" as never, { itemId: item.id } as never)
  }

  const handleLongPress = () => {
    setQuickEditVisible(true)
  }

  const handleMarkConsumed = async (itemId: string) => {
    await deleteItem(itemId)
  }

  const handleUpdateAmount = async (itemId: string, newAmount: string) => {
    await updateItem(itemId, { menge: newAmount })
  }

  const handleMarkOpened = async (itemId: string, newExpiryDate: string) => {
    await updateItem(itemId, { haltbarBis: newExpiryDate })
  }

  return (
    <>
      <TouchableOpacity
        style={[styles.container, { backgroundColor: colors.cardBackground }]}
        onPress={handlePress}
        onLongPress={handleLongPress}
        activeOpacity={0.7}
      >
        <View style={styles.imageContainer}>
          {item.bildUrl ? (
            <Image source={{ uri: item.bildUrl }} style={styles.image} />
          ) : (
            <View style={[styles.imagePlaceholder, { backgroundColor: colors.border }]} />
          )}
        </View>

        <View style={styles.contentContainer}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {item.name}
          </Text>

          <View style={styles.detailsContainer}>
            <Text style={[styles.category, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.kategorie}
            </Text>

            <Text style={[styles.amount, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.menge}
            </Text>
          </View>
        </View>

        <View style={[styles.expiryContainer, { backgroundColor: expiryStatusColor }]}>
          <Text style={styles.expiryText}>
            {daysUntilExpiry > 0
              ? t("inventory.expiresInDays", { days: daysUntilExpiry })
              : daysUntilExpiry === 0
                ? t("inventory.expiresInToday")
                : t("inventory.expired", { days: Math.abs(daysUntilExpiry) })}
          </Text>
        </View>
      </TouchableOpacity>

      <QuickEditModal
        visible={quickEditVisible}
        item={item}
        onClose={() => setQuickEditVisible(false)}
        onMarkConsumed={handleMarkConsumed}
        onUpdateAmount={handleUpdateAmount}
        onMarkOpened={handleMarkOpened}
      />
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 12,
    marginVertical: 6,
    marginHorizontal: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  imageContainer: {
    marginRight: 12,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  detailsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  category: {
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  amount: {
    fontSize: 14,
  },
  expiryContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginLeft: 8,
  },
  expiryText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
})
