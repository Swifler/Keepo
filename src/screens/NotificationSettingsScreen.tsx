"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView } from "react-native"
import { useTranslation } from "react-i18next"
import { useTheme } from "../contexts/ThemeContext"
import GradientBackground from "../components/GradientBackground"
import { Bell, Clock, ChevronDown, ChevronUp, Check } from "lucide-react-native"
import DateTimePicker from "@react-native-community/datetimepicker"
import {
  getNotificationSettings,
  saveNotificationSettings,
  DEFAULT_NOTIFICATION_SETTINGS,
  updateAllExpiryNotifications,
} from "../services/notifications"
import { useInventory } from "../hooks/useInventory"

export default function NotificationSettingsScreen({ navigation }) {
  const { t } = useTranslation()
  const { colors } = useTheme()
  const { items } = useInventory()
  const [settings, setSettings] = useState(DEFAULT_NOTIFICATION_SETTINGS)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [showDaysOptions, setShowDaysOptions] = useState(false)
  const [availableDays, setAvailableDays] = useState([1, 2, 3, 5, 7, 14])

  // Einstellungen beim Laden abrufen
  useEffect(() => {
    const loadSettings = async () => {
      const savedSettings = await getNotificationSettings()
      setSettings(savedSettings)
    }
    loadSettings()
  }, [])

  // Einstellungen speichern und Benachrichtigungen aktualisieren
  const handleSaveSettings = async () => {
    await saveNotificationSettings(settings)
    await updateAllExpiryNotifications(items)
    navigation.goBack()
  }

  // Toggle für Benachrichtigungen
  const toggleNotifications = (value) => {
    setSettings((prev) => ({ ...prev, enabled: value }))
  }

  // Toggle für tägliche Zusammenfassung
  const toggleDailyDigest = (value) => {
    setSettings((prev) => ({ ...prev, dailyDigest: value }))
  }

  // Zeit für tägliche Zusammenfassung ändern
  const handleTimeChange = (event, selectedDate) => {
    setShowTimePicker(false)
    if (selectedDate) {
      const hours = selectedDate.getHours().toString().padStart(2, "0")
      const minutes = selectedDate.getMinutes().toString().padStart(2, "0")
      setSettings((prev) => ({ ...prev, dailyDigestTime: `${hours}:${minutes}` }))
    }
  }

  // Tag für Benachrichtigung hinzufügen/entfernen
  const toggleDayBeforeExpiry = (day) => {
    setSettings((prev) => {
      const currentDays = [...prev.daysBeforeExpiry]
      const index = currentDays.indexOf(day)

      if (index >= 0) {
        // Tag entfernen, wenn er bereits vorhanden ist
        currentDays.splice(index, 1)
      } else {
        // Tag hinzufügen und sortieren
        currentDays.push(day)
        currentDays.sort((a, b) => a - b)
      }

      return { ...prev, daysBeforeExpiry: currentDays }
    })
  }

  // Zeit für Picker vorbereiten
  const getTimeForPicker = () => {
    const [hours, minutes] = settings.dailyDigestTime.split(":").map(Number)
    const date = new Date()
    date.setHours(hours, minutes, 0, 0)
    return date
  }

  return (
    <GradientBackground>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Bell size={24} color={colors.text} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t("notifications.settings")}</Text>
        </View>

        {/* Benachrichtigungen aktivieren/deaktivieren */}
        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.settingRow}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>{t("notifications.enable")}</Text>
            <Switch
              value={settings.enabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="white"
            />
          </View>
          <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
            {t("notifications.enableDescription")}
          </Text>
        </View>

        {settings.enabled && (
          <>
            {/* Benachrichtigungstage */}
            <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
              <TouchableOpacity style={styles.settingRow} onPress={() => setShowDaysOptions(!showDaysOptions)}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>{t("notifications.daysBeforeExpiry")}</Text>
                {showDaysOptions ? (
                  <ChevronUp size={20} color={colors.text} />
                ) : (
                  <ChevronDown size={20} color={colors.text} />
                )}
              </TouchableOpacity>

              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                {settings.daysBeforeExpiry.length > 0
                  ? t("notifications.selectedDays", { days: settings.daysBeforeExpiry.join(", ") })
                  : t("notifications.noDaysSelected")}
              </Text>

              {showDaysOptions && (
                <View style={styles.daysGrid}>
                  {availableDays.map((day) => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.dayButton,
                        {
                          backgroundColor: settings.daysBeforeExpiry.includes(day) ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => toggleDayBeforeExpiry(day)}
                    >
                      <Text
                        style={[
                          styles.dayButtonText,
                          { color: settings.daysBeforeExpiry.includes(day) ? "white" : colors.text },
                        ]}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Tägliche Zusammenfassung */}
            <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
              <View style={styles.settingRow}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>{t("notifications.dailyDigest")}</Text>
                <Switch
                  value={settings.dailyDigest}
                  onValueChange={toggleDailyDigest}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="white"
                />
              </View>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                {t("notifications.dailyDigestDescription")}
              </Text>

              {settings.dailyDigest && (
                <TouchableOpacity
                  style={[styles.timeButton, { borderColor: colors.border }]}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Clock size={20} color={colors.text} />
                  <Text style={[styles.timeButtonText, { color: colors.text }]}>{settings.dailyDigestTime}</Text>
                </TouchableOpacity>
              )}

              {showTimePicker && (
                <DateTimePicker
                  value={getTimeForPicker()}
                  mode="time"
                  is24Hour={true}
                  display="default"
                  onChange={handleTimeChange}
                />
              )}
            </View>
          </>
        )}

        {/* Speichern-Button */}
        <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={handleSaveSettings}>
          <Check size={20} color="white" />
          <Text style={styles.saveButtonText}>{t("actions.save")}</Text>
        </TouchableOpacity>
      </ScrollView>
    </GradientBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginLeft: 10,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  settingDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  timeButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 8,
  },
  timeButtonText: {
    marginLeft: 8,
    fontSize: 16,
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  dayButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
  },
  dayButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  saveButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginTop: 20,
    marginBottom: 40,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
})
