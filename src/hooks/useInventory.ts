"use client"

import { useCallback, useState } from "react"
import firestore from "@react-native-firebase/firestore"
import auth from "@react-native-firebase/auth"
import type { InventoryItemType, DetectedItem } from "../types"
import { scheduleExpiryNotification, cancelNotificationForItem } from "../services/notifications"
import { statisticsService } from "../services/statistics"

export function useInventory() {
  const [items, setItems] = useState<InventoryItemType[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Alle Inventar-Elemente abrufen
  const fetchItems = useCallback(async () => {
    const userId = auth().currentUser?.uid
    if (!userId) return

    setLoading(true)
    setError(null)

    try {
      const snapshot = await firestore().collection("items").where("userId", "==", userId).get()

      const fetchedItems: InventoryItemType[] = []
      snapshot.forEach((doc) => {
        fetchedItems.push({
          id: doc.id,
          ...doc.data(),
        } as InventoryItemType)
      })

      setItems(fetchedItems)
    } catch (err) {
      console.error("Fehler beim Abrufen der Inventar-Elemente:", err)
      setError("Fehler beim Laden der Daten")
    } finally {
      setLoading(false)
    }
  }, [])

  // Ein einzelnes Element hinzufügen
  const addItem = useCallback(async (item: Omit<InventoryItemType, "id" | "userId">) => {
    const userId = auth().currentUser?.uid
    if (!userId) return

    try {
      // Aktuelles Datum für Erstellung
      const now = new Date()

      // Dokument in Firestore erstellen
      const docRef = await firestore()
        .collection("items")
        .add({
          ...item,
          userId,
          erstelltAm: now,
        })

      // Benachrichtigung für Ablaufdatum planen
      if (item.haltbarBis) {
        await scheduleExpiryNotification(docRef.id, item.name, new Date(item.haltbarBis))
      }

      // Lokalen State aktualisieren
      const newItem: InventoryItemType = {
        id: docRef.id,
        ...item,
        userId,
        erstelltAm: now,
      }

      setItems((prevItems) => [...prevItems, newItem])

      // Statistiken aktualisieren
      await statisticsService.updateStatsForNewItem(userId, newItem)
      await statisticsService.updateStreak(userId)

      return newItem
    } catch (err) {
      console.error("Fehler beim Hinzufügen des Elements:", err)
      throw err
    }
  }, [])

  // Mehrere Elemente hinzufügen (z.B. nach Kamera-Erkennung)
  const addItems = useCallback(async (detectedItems: DetectedItem[]) => {
    const userId = auth().currentUser?.uid
    if (!userId) return

    try {
      const batch = firestore().batch()
      const newItemRefs: firestore.DocumentReference[] = []

      // Aktuelles Datum
      const now = new Date()

      // Standard-Ablaufdatum (7 Tage in der Zukunft)
      const defaultExpiryDate = new Date()
      defaultExpiryDate.setDate(defaultExpiryDate.getDate() + 7)

      // Batch-Operation für alle Elemente
      detectedItems.forEach((item) => {
        const docRef = firestore().collection("items").doc()
        newItemRefs.push(docRef)

        batch.set(docRef, {
          name: item.name,
          kategorie: item.kategorie,
          menge: item.menge || "1 Stk.",
          haltbarBis: item.haltbarBis || defaultExpiryDate.toISOString().split("T")[0],
          bildUrl: item.bildUrl || null,
          productInfo: item.productInfo || null,
          userId,
          erstelltAm: now,
        })
      })

      // Batch ausführen
      await batch.commit()

      // Benachrichtigungen planen und lokalen State aktualisieren
      const newItems: InventoryItemType[] = []

      for (let i = 0; i < detectedItems.length; i++) {
        const item = detectedItems[i]
        const docRef = newItemRefs[i]
        const expiryDate = item.haltbarBis ? new Date(item.haltbarBis) : defaultExpiryDate

        // Benachrichtigung planen
        await scheduleExpiryNotification(docRef.id, item.name, expiryDate)

        // Neues Element zum lokalen State hinzufügen
        const newItem: InventoryItemType = {
          id: docRef.id,
          name: item.name,
          kategorie: item.kategorie,
          menge: item.menge || "1 Stk.",
          haltbarBis: item.haltbarBis || defaultExpiryDate.toISOString().split("T")[0],
          bildUrl: item.bildUrl || null,
          productInfo: item.productInfo || null,
          userId,
          erstelltAm: now,
        }

        newItems.push(newItem)

        // Statistiken für jedes Element aktualisieren
        await statisticsService.updateStatsForNewItem(userId, newItem)
      }

      setItems((prevItems) => [...prevItems, ...newItems])

      // Streak aktualisieren (nur einmal für alle Elemente)
      await statisticsService.updateStreak(userId)

      return newItems
    } catch (err) {
      console.error("Fehler beim Hinzufügen mehrerer Elemente:", err)
      throw err
    }
  }, [])

  // Element aktualisieren
  const updateItem = useCallback(
    async (id: string, updates: Partial<InventoryItemType>) => {
      try {
        await firestore().collection("items").doc(id).update(updates)

        // Wenn das Ablaufdatum aktualisiert wurde, Benachrichtigung neu planen
        if (updates.haltbarBis) {
          const item = items.find((item) => item.id === id)
          if (item) {
            await scheduleExpiryNotification(id, updates.name || item.name, new Date(updates.haltbarBis))
          }
        }

        // Lokalen State aktualisieren
        setItems((prevItems) => prevItems.map((item) => (item.id === id ? { ...item, ...updates } : item)))
      } catch (err) {
        console.error("Fehler beim Aktualisieren des Elements:", err)
        throw err
      }
    },
    [items],
  )

  // Element als verbraucht markieren
  const markItemAsConsumed = useCallback(async (id: string) => {
    try {
      // Benachrichtigungen für dieses Element abbrechen
      await cancelNotificationForItem(id)

      // Element aus der Datenbank löschen
      await firestore().collection("items").doc(id).delete()

      // Lokalen State aktualisieren
      setItems((prevItems) => prevItems.filter((item) => item.id !== id))
    } catch (err) {
      console.error("Fehler beim Markieren des Elements als verbraucht:", err)
      throw err
    }
  }, [])

  // Element löschen
  const deleteItem = useCallback(async (id: string) => {
    try {
      // Benachrichtigungen für dieses Element abbrechen
      await cancelNotificationForItem(id)

      // Element aus der Datenbank löschen
      await firestore().collection("items").doc(id).delete()

      // Lokalen State aktualisieren
      setItems((prevItems) => prevItems.filter((item) => item.id !== id))
    } catch (err) {
      console.error("Fehler beim Löschen des Elements:", err)
      throw err
    }
  }, [])

  return {
    items,
    loading,
    error,
    fetchItems,
    addItem,
    addItems,
    updateItem,
    markItemAsConsumed,
    deleteItem,
  }
}
