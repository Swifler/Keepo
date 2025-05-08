"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput } from "react-native"
import { useTranslation } from "react-i18next"
import { useTheme } from "../contexts/ThemeContext"
import { Minus, Plus, Package, Check } from "lucide-react-native"
import type { InventoryItemType } from "../types"
import { useInventory } from "../hooks/useInventory"

interface QuickEditModalProps {
  visible: boolean
  item: InventoryItemType | null
  onClose: () => void
}

export default function QuickEditModal({ visible, item, onClose }: QuickEditModalProps) {
  const { t } = useTranslation()
  const { colors } = useTheme()
  const { updateItem, markItemAsConsumed } = useInventory()
  const [amount, setAmount] = useState("")

  // Wenn sich das Item ändert, setze die Menge zurück
  useEffect(() => {
    if (item) {
      setAmount(item.menge)
    } else {
      setAmount("")
    }
  }, [item])

  // Berechne ein neues Ablaufdatum für geöffnete Packungen (z.B. 3 Tage ab heute)
  const calculateNewExpiryDate = () => {
    const date = new Date()
    date.setDate(date.getDate() + 3) // 3 Tage ab heute
    return date.toISOString().split("T")[0] // Format: YYYY-MM-DD
  }

  const handleMarkConsumed = async () => {
    if (item) {
      await markItemAsConsumed(item.id)
      onClose()
    }
  }

  const handleUpdateAmount = async () => {
    if (item) {
      await updateItem(item.id, { menge: amount })
      onClose()
    }
  }

  const handleMarkOpened = async () => {
    if (item) {
      await updateItem(item.id, { haltbarBis: calculateNewExpiryDate() })
      onClose()
    }
  }

  if (!item) return null

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>{item.name}</Text>

          <View style={styles.optionsContainer}>
            {/* Verbraucht markieren */}
            <TouchableOpacity
              style={[styles.optionButton, { backgroundColor: colors.success }]}
              onPress={handleMarkConsumed}
            >
              <Check size={24} color="white" />
              <Text style={styles.optionButtonText}>{t("inventory.consumed")}</Text>
            </TouchableOpacity>

            {/* Packung geöffnet markieren */}
            <TouchableOpacity
              style={[styles.optionButton, { backgroundColor: colors.warning }]}
              onPress={handleMarkOpened}
            >
              <Package size={24} color="white" />
              <Text style={styles.optionButtonText}>{t("inventory.openPackage")}</Text>
            </TouchableOpacity>
          </View>

          {/* Menge aktualisieren */}
          <View style={styles.amountContainer}>
            <Text style={[styles.amountLabel, { color: colors.text }]}>{t("inventory.updateAmount")}</Text>

            <View style={styles.amountInputContainer}>
              <TouchableOpacity
                style={[styles.amountButton, { backgroundColor: colors.border }]}
                onPress={() => {
                  // Extrahiere Zahl und Einheit
                  const match = amount.match(/(\d+)(.*)/)
                  if (match) {
                    const num = Number.parseInt(match[1])
                    const unit = match[2]
                    if (num > 1) {
                      setAmount(`${num - 1}${unit}`)
                    }
                  }
                }}
              >
                <Minus size={20} color={colors.text} />
              </TouchableOpacity>

              <TextInput
                style={[styles.amountInput, { borderColor: colors.border, color: colors.text }]}
                value={amount}
                onChangeText={setAmount}
                keyboardType="default"
              />

              <TouchableOpacity
                style={[styles.amountButton, { backgroundColor: colors.border }]}
                onPress={() => {
                  // Extrahiere Zahl und Einheit
                  const match = amount.match(/(\d+)(.*)/)
                  if (match) {
                    const num = Number.parseInt(match[1])
                    const unit = match[2]
                    setAmount(`${num + 1}${unit}`)
                  }
                }}
              >
                <Plus size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.updateButton, { backgroundColor: colors.primary }]}
              onPress={handleUpdateAmount}
            >
              <Text style={styles.updateButtonText}>{t("actions.save")}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.cancelButton, { borderColor: colors.border }]} onPress={onClose}>
            <Text style={[styles.cancelButtonText, { color: colors.text }]}>{t("actions.cancel")}</Text>
          </TouchableOpacity>
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
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  optionButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 8,
  },
  optionButtonText: {
    color: "white",
    fontWeight: "500",
    marginTop: 8,
  },
  amountContainer: {
    marginBottom: 20,
  },
  amountLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 10,
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  amountButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  amountInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 10,
    fontSize: 16,
    textAlign: "center",
  },
  updateButton: {
    padding: 12,
    borderRadius: 16,
    alignItems: "center",
  },
  updateButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  cancelButton: {
    padding: 12,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
})
