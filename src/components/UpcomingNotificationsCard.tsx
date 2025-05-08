"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native"
import { useTranslation } from "react-i18next"
import { useTheme } from "../contexts/ThemeContext"
import { Bell, ChevronRight } from "lucide-react-native"
import { getAllScheduledNotifications } from "../services/notifications"

export default function UpcomingNotificationsCard({ navigation }) {
  const { t } = useTranslation()
  const { colors } = useTheme()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    setLoading(true)
    const scheduledNotifications = await getAllScheduledNotifications()

    // Nur Ablaufbenachrichtigungen filtern
    const expiryNotifications = scheduledNotifications.filter(
      (notification) => notification.content.data?.type === "expiry",
    )

    // Nach Datum sortieren
    expiryNotifications.sort((a, b) => {
      const dateA = new Date(a.trigger.date)
      const dateB = new Date(b.trigger.date)
      return dateA.getTime() - dateB.getTime()
    })

    // Auf maximal 3 Benachrichtigungen beschränken
    setNotifications(expiryNotifications.slice(0, 3))
    setLoading(false)
  }

  const formatNotificationDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  const handleOpenSettings = () => {
    navigation.navigate("NotificationSettings")
  }

  if (loading) {
    return (
      <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
        <View style={styles.header}>
          <Bell size={20} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>{t("notifications.upcoming")}</Text>
        </View>
        <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />
      </View>
    )
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
      <View style={styles.header}>
        <Bell size={20} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>{t("notifications.upcoming")}</Text>
      </View>

      {notifications.length > 0 ? (
        <>
          {notifications.map((notification, index) => (
            <View key={index} style={styles.notificationItem}>
              <Text style={[styles.notificationTitle, { color: colors.text }]}>{notification.content.title}</Text>
              <Text style={[styles.notificationDate, { color: colors.textSecondary }]}>
                {formatNotificationDate(notification.trigger.date)}
              </Text>
            </View>
          ))}
        </>
      ) : (
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t("notifications.noUpcoming")}</Text>
      )}

      <TouchableOpacity style={styles.settingsButton} onPress={handleOpenSettings}>
        <Text style={[styles.settingsButtonText, { color: colors.primary }]}>{t("notifications.manageSettings")}</Text>
        <ChevronRight size={16} color={colors.primary} />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  loader: {
    marginVertical: 20,
  },
  notificationItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  notificationDate: {
    fontSize: 12,
    marginTop: 4,
  },
  emptyText: {
    textAlign: "center",
    padding: 20,
    fontSize: 14,
  },
  settingsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  settingsButtonText: {
    fontSize: 14,
    fontWeight: "500",
    marginRight: 4,
  },
})
