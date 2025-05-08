import * as Notifications from "expo-notifications"
import { Platform } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Schlüssel für AsyncStorage
const NOTIFICATION_SETTINGS_KEY = "notification_settings"

// Standard-Benachrichtigungseinstellungen
export const DEFAULT_NOTIFICATION_SETTINGS = {
  enabled: true,
  daysBeforeExpiry: [1, 3, 7], // Benachrichtigungen 1, 3 und 7 Tage vor Ablauf
  dailyDigest: true, // Tägliche Zusammenfassung
  dailyDigestTime: "08:00", // Uhrzeit für tägliche Zusammenfassung
}

// Benachrichtigungseinstellungen abrufen
export const getNotificationSettings = async () => {
  try {
    const settings = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY)
    return settings ? JSON.parse(settings) : DEFAULT_NOTIFICATION_SETTINGS
  } catch (error) {
    console.error("Fehler beim Abrufen der Benachrichtigungseinstellungen:", error)
    return DEFAULT_NOTIFICATION_SETTINGS
  }
}

// Benachrichtigungseinstellungen speichern
export const saveNotificationSettings = async (settings) => {
  try {
    await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings))
    return true
  } catch (error) {
    console.error("Fehler beim Speichern der Benachrichtigungseinstellungen:", error)
    return false
  }
}

// Benachrichtigungen konfigurieren
export const configureNotifications = async () => {
  // Benachrichtigungsberechtigungen anfordern
  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== "granted") {
    console.log("Benachrichtigungsberechtigungen nicht erteilt!")
    return false
  }

  // Benachrichtigungshandler konfigurieren
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  })

  return true
}

// Benachrichtigung für ablaufende Lebensmittel planen
export const scheduleExpiryNotification = async (
  itemId: string,
  itemName: string,
  expiryDate: Date,
): Promise<string[]> => {
  try {
    // Berechtigungen prüfen
    const { status } = await Notifications.getPermissionsAsync()
    if (status !== "granted") {
      console.log("Keine Benachrichtigungsberechtigungen")
      return []
    }

    // Einstellungen abrufen
    const settings = await getNotificationSettings()
    if (!settings.enabled) {
      return []
    }

    // Bestehende Benachrichtigungen für dieses Element löschen
    await cancelNotificationForItem(itemId)

    const notificationIds: string[] = []

    // Für jeden konfigurierten Tag vor Ablauf eine Benachrichtigung planen
    for (const daysBeforeExpiry of settings.daysBeforeExpiry) {
      const notificationDate = new Date(expiryDate)
      notificationDate.setDate(notificationDate.getDate() - daysBeforeExpiry)

      // Wenn das Datum in der Vergangenheit liegt, keine Benachrichtigung planen
      if (notificationDate <= new Date()) {
        continue
      }

      // Neue Benachrichtigung planen
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `Lebensmittel läuft ${daysBeforeExpiry === 1 ? "morgen" : `in ${daysBeforeExpiry} Tagen`} ab!`,
          body: `${itemName} läuft ${daysBeforeExpiry === 1 ? "morgen" : `in ${daysBeforeExpiry} Tagen`} ab. Vergiss nicht, es zu verbrauchen!`,
          data: { itemId, type: "expiry", daysBeforeExpiry },
          sound: true,
        },
        trigger:
          Platform.OS === "ios"
            ? {
                date: notificationDate,
              }
            : {
                seconds: Math.floor((notificationDate.getTime() - Date.now()) / 1000),
              },
      })

      notificationIds.push(notificationId)
    }

    return notificationIds
  } catch (error) {
    console.error("Fehler beim Planen der Benachrichtigung:", error)
    return []
  }
}

// Tägliche Zusammenfassung planen
export const scheduleDailyDigest = async (userId: string) => {
  try {
    // Einstellungen abrufen
    const settings = await getNotificationSettings()
    if (!settings.enabled || !settings.dailyDigest) {
      return null
    }

    // Bestehende tägliche Zusammenfassung abbrechen
    await cancelDailyDigest()

    // Zeit für die tägliche Zusammenfassung parsen (Format: "HH:MM")
    const [hours, minutes] = settings.dailyDigestTime.split(":").map(Number)

    // Trigger für die tägliche Benachrichtigung erstellen
    const trigger: Notifications.NotificationTriggerInput = {
      hour: hours,
      minute: minutes,
      repeats: true,
    }

    // Tägliche Zusammenfassung planen
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Tägliche Übersicht: Ablaufende Lebensmittel",
        body: "Tippe, um zu sehen, welche Lebensmittel bald ablaufen.",
        data: { type: "daily_digest", userId },
      },
      trigger,
    })

    return notificationId
  } catch (error) {
    console.error("Fehler beim Planen der täglichen Zusammenfassung:", error)
    return null
  }
}

// Tägliche Zusammenfassung abbrechen
export const cancelDailyDigest = async () => {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync()

    for (const notification of scheduledNotifications) {
      if (notification.content.data?.type === "daily_digest") {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier)
      }
    }
  } catch (error) {
    console.error("Fehler beim Abbrechen der täglichen Zusammenfassung:", error)
  }
}

// Benachrichtigung für ein bestimmtes Element abbrechen
export const cancelNotificationForItem = async (itemId: string): Promise<void> => {
  try {
    // Alle geplanten Benachrichtigungen abrufen
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync()

    // Benachrichtigung für das Element finden und abbrechen
    for (const notification of scheduledNotifications) {
      if (notification.content.data?.itemId === itemId) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier)
      }
    }
  } catch (error) {
    console.error("Fehler beim Abbrechen der Benachrichtigung:", error)
  }
}

// Alle geplanten Benachrichtigungen abbrechen
export const cancelAllNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync()
  } catch (error) {
    console.error("Fehler beim Abbrechen aller Benachrichtigungen:", error)
  }
}

// Alle geplanten Benachrichtigungen abrufen
export const getAllScheduledNotifications = async () => {
  try {
    return await Notifications.getAllScheduledNotificationsAsync()
  } catch (error) {
    console.error("Fehler beim Abrufen der geplanten Benachrichtigungen:", error)
    return []
  }
}

// Benachrichtigungen für alle ablaufenden Lebensmittel aktualisieren
export const updateAllExpiryNotifications = async (items) => {
  try {
    // Einstellungen abrufen
    const settings = await getNotificationSettings()
    if (!settings.enabled) {
      return
    }

    // Für jedes Element Benachrichtigungen planen
    for (const item of items) {
      if (item.haltbarBis) {
        await scheduleExpiryNotification(item.id, item.name, new Date(item.haltbarBis))
      }
    }
  } catch (error) {
    console.error("Fehler beim Aktualisieren aller Ablaufbenachrichtigungen:", error)
  }
}
