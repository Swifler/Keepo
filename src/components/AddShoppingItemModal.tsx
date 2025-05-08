"use client"

import { useState } from "react"
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity } from "react-native"
import { useTranslation } from "react-i18next"
import { useTheme } from "../contexts/ThemeContext"
import { useShoppingList } from "../hooks/useShoppingList"

interface AddShoppingItemModalProps {
  visible: boolean
  onClose: () => void
}

export default function AddShoppingItemModal({ visible, onClose }: AddShoppingItemModalProps) {
  const { t } = useTranslation()
  const { colors } = useTheme()
  const { addItem } = useShoppingList()

  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!name.trim()) return

    setIsSubmitting(true)

    try {
      await addItem({
        name: name.trim(),
        menge: amount.trim() || "1 Stk.",
        gekauft: false,
      })

      // Zurücksetzen und schließen
      setName("")
      setAmount("")
      onClose()
    } catch (error) {
      console.error("Fehler beim Hinzufügen des Elements:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>{t("shoppingList.addNewItem")}</Text>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>{t("shoppingList.itemName")}</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                value={name}
                onChangeText={setName}
                placeholder={t("shoppingList.itemNamePlaceholder")}
                placeholderTextColor={colors.textSecondary}
                autoFocus
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>{t("shoppingList.amount")}</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                value={amount}
                onChangeText={setAmount}
                placeholder={t("shoppingList.amountPlaceholder")}
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
              onPress={onClose}
              disabled={isSubmitting}
            >
              <Text style={[styles.buttonText, { color: colors.text }]}>{t("actions.cancel")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.addButton,
                { backgroundColor: colors.primary },
                !name.trim() && styles.disabledButton,
              ]}
              onPress={handleSubmit}
              disabled={!name.trim() || isSubmitting}
            >
              <Text style={styles.addButtonText}>{t("actions.add")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  formContainer: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
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
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
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
  addButton: {
    marginLeft: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  disabledButton: {
    opacity: 0.5,
  },
})
