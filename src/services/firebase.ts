import { Platform } from "react-native"
import firebase from "@react-native-firebase/app"
import "@react-native-firebase/auth"
import "@react-native-firebase/firestore"

declare const __DEV__: boolean

// Firebase-Konfiguration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
}

// Firebase initialisieren
export const initializeFirebase = () => {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig)
  }

  // Firestore-Einstellungen
  const firestore = firebase.firestore()

  // Für Entwicklungszwecke: Verbindung zum lokalen Emulator, falls vorhanden
  if (__DEV__) {
    // Nur im Entwicklungsmodus und auf bestimmten Plattformen
    if (Platform.OS === "ios" || Platform.OS === "android") {
      // Lokale IP-Adresse für den Emulator
      // firestore.useEmulator('localhost', 8080);
      // firebase.auth().useEmulator('localhost', 9099);
    }
  }

  return firebase
}

// Firestore-Timestamp in Date konvertieren
export const timestampToDate = (timestamp: firebase.firestore.Timestamp): Date => {
  return timestamp.toDate()
}

// Date in Firestore-Timestamp konvertieren
export const dateToTimestamp = (date: Date): firebase.firestore.Timestamp => {
  return firebase.firestore.Timestamp.fromDate(date)
}
