"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native"
import { useTranslation } from "react-i18next"
import { useTheme } from "../contexts/ThemeContext"
import CategoryPicker from "./CategoryPicker"
import DateTimePicker from "@react-native-community/datetimepicker"
import type { DetectedItem } from "../types"

interface ManualItemEntryProps {
  barcode: string | null
  onSave: (item: DetectedItem) => void
  onCancel: () => void
}

export default function ManualItemEntry({ barcode, onSave, onCancel }: ManualItemEntryProps) {
  const { t } = useTranslation()
  const { colors } = useTheme()

  const [name, setName] = useState("")
  const [category, setCategory] = useState("Sonstiges")
  const [amount, setAmount] = useState("1 Stk.")
  const [expiryDate, setExpiryDate] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)

  // Standardablaufdatum (1 Monat in der Zukunft)
  const defaultExpiryDate = new Date()
  defaultExpiryDate.setMonth(defaultExpiryDate.getMonth() + 1)

  const handleSave = () => {
    if (!name.trim()) {
      alert(t("camera.nameRequired"))
      return
    }

    const item: DetectedItem = {
      name: name.trim(),
      kategorie: category,
      menge: amount.trim() || "1 Stk.",
      haltbarBis: expiryDate.toISOString().split("T")[0],
      bildUrl: null,
    }

    onSave(item)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  return (
    <View style={styles.container}>
      {barcode && (
        <View style={[styles.barcodeContainer, { backgroundColor: colors.background }]}>
          <Text style={[styles.barcodeLabel, { color: colors.textSecondary }]}>{t("camera.barcode")}:</Text>
          <Text style={[styles.barcodeValue, { color: colors.text }]}>{barcode}</Text>
        </View>
      )}

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>{t("camera.itemName")}*</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          value={name}
          onChangeText={setName}
          placeholder={t("camera.itemNamePlaceholder")}
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>{t("camera.category")}</Text>
        <CategoryPicker selectedCategory={category} onCategoryChange={setCategory} />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>{t("camera.amount")}</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          value={amount}
          onChangeText={setAmount}
          placeholder={t("camera.amountPlaceholder")}
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>{t("camera.expiryDate")}</Text>
        <TouchableOpacity
          style={[styles.dateButton, { borderColor: colors.border }]}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={[styles.dateButtonText, { color: colors.text }]}>{formatDate(expiryDate)}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={expiryDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false)
              if (selectedDate) {
                setExpiryDate(selectedDate)
              }
            }}
            minimumDate={new Date()}
          />
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
          onPress={onCancel}
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>{t("actions.cancel")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.saveButton, { backgroundColor: colors.primary }]}
          onPress={handleSave}
        >
          <Text style={[styles.saveButtonText]}>{t("actions.save")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  barcodeContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  barcodeLabel: {
    fontSize: 14,
    marginRight: 10,
  },
  barcodeValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  dateButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dateButtonText: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    marginRight: 8,
    borderWidth: 1,
  },
  saveButton: {
    marginLeft: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
})
