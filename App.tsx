"use client"

import { useEffect } from "react"
import { StatusBar } from "expo-status-bar"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { NavigationContainer } from "@react-navigation/native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import * as Notifications from "expo-notifications"
import { useAuth } from "./src/hooks/useAuth"
import Navigation from "./src/navigation"
import { ThemeProvider } from "./src/contexts/ThemeContext"
import { I18nProvider } from "./src/i18n"
import { initializeFirebase } from "./src/services/firebase"

// Konfiguriere Benachrichtigungen
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

export default function App() {
  const { initializeAuth } = useAuth()

  useEffect(() => {
    // Firebase initialisieren
    initializeFirebase()

    // Anonyme Authentifizierung initialisieren
    initializeAuth()

    // Benachrichtigungsberechtigungen anfordern
    ;(async () => {
      const { status } = await Notifications.requestPermissionsAsync()
      if (status !== "granted") {
        console.log("Benachrichtigungsberechtigungen nicht erteilt!")
      }
    })()
  }, [initializeAuth])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <I18nProvider>
            <NavigationContainer>
              <Navigation />
              <StatusBar style="auto" />
            </NavigationContainer>
          </I18nProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
