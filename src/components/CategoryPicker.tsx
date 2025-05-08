"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from "react-native"
import { ChevronDown } from "lucide-react-native"
import { useTranslation } from "react-i18next"
import { useTheme } from "../contexts/ThemeContext"
import { FOOD_CATEGORIES } from "../constants/foodCategories"

interface CategoryPickerProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

export default function CategoryPicker({ selectedCategory, onCategoryChange }: CategoryPickerProps) {
  const { t } = useTranslation()
  const { colors } = useTheme()
  const [modalVisible, setModalVisible] = useState(false)

  const handleSelectCategory = (category: string) => {
    onCategoryChange(category)
    setModalVisible(false)
  }

  const renderCategoryItem = ({ item }: { item: string }) => {
    const isSelected = item === selectedCategory

    return (
      <TouchableOpacity
        style={[styles.categoryItem, isSelected && { backgroundColor: `${colors.primary}20` }]}
        onPress={() => handleSelectCategory(item)}
      >
        <Text style={[styles.categoryItemText, { color: isSelected ? colors.primary : colors.text }]}>{item}</Text>

        {isSelected && <View style={[styles.selectedIndicator, { backgroundColor: colors.primary }]} />}
      </TouchableOpacity>
    )
  }

  return (
    <View>
      <TouchableOpacity
        style={[styles.pickerButton, { borderColor: colors.border }]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.selectedText, { color: colors.text }]}>
          {selectedCategory || t("common.selectCategory")}
        </Text>
        <ChevronDown size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t("common.selectCategory")}</Text>

              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: colors.border }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={{ color: colors.text }}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={FOOD_CATEGORIES}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item}
              contentContainerStyle={styles.categoryList}
            />
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  pickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  selectedText: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 30,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryList: {
    paddingHorizontal: 20,
  },
  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  categoryItemText: {
    fontSize: 16,
  },
  selectedIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
})
