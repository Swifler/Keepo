"use client"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Check, Circle } from "lucide-react-native"
import { useTheme } from "../contexts/ThemeContext"
import type { ShoppingItemType } from "../types"

interface ShoppingListItemProps {
  item: ShoppingItemType
  onToggle: () => void
}

export default function ShoppingListItem({ item, onToggle }: ShoppingListItemProps) {
  const { colors } = useTheme()

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.cardBackground,
          opacity: item.gekauft ? 0.7 : 1,
        },
      ]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={styles.checkboxContainer}>
        {item.gekauft ? (
          <View style={[styles.checkbox, { backgroundColor: colors.primary }]}>
            <Check size={16} color="white" />
          </View>
        ) : (
          <View style={[styles.checkbox, { borderColor: colors.border }]}>
            <Circle size={16} color={colors.border} />
          </View>
        )}
      </View>

      <View style={styles.contentContainer}>
        <Text
          style={[
            styles.name,
            {
              color: colors.text,
              textDecorationLine: item.gekauft ? "line-through" : "none",
            },
          ]}
        >
          {item.name}
        </Text>

        <Text
          style={[
            styles.amount,
            {
              color: colors.textSecondary,
              textDecorationLine: item.gekauft ? "line-through" : "none",
            },
          ]}
        >
          {item.menge}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  checkboxContainer: {
    marginRight: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
    marginRight: 8,
  },
  amount: {
    fontSize: 14,
  },
})
