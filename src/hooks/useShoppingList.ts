"use client"

import { useCallback, useState } from "react"
import firestore from "@react-native-firebase/firestore"
import auth from "@react-native-firebase/auth"
import type { ShoppingItemType } from "../types"

export function useShoppingList() {
  const [items, setItems] = useState<ShoppingItemType[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Alle Einkaufslisten-Elemente abrufen
  const fetchItems = useCallback(async () => {
    const userId = auth().currentUser?.uid
    if (!userId) return

    setLoading(true)
    setError(null)

    try {
      const snapshot = await firestore().collection("shoppingList").where("userId", "==", userId).get()

      const fetchedItems: ShoppingItemType[] = []
      snapshot.forEach((doc) => {
        fetchedItems.push({
          id: doc.id,
          ...doc.data(),
        } as ShoppingItemType)
      })

      setItems(fetchedItems)
    } catch (err) {
      console.error("Fehler beim Abrufen der Einkaufsliste:", err)
      setError("Fehler beim Laden der Einkaufsliste")
    } finally {
      setLoading(false)
    }
  }, [])

  // Ein einzelnes Element hinzufügen
  const addItem = useCallback(async (item: Omit<ShoppingItemType, "id" | "userId">) => {
    const userId = auth().currentUser?.uid
    if (!userId) return

    try {
      // Prüfen, ob das Element bereits in der Liste ist
      const existingItemSnapshot = await firestore()
        .collection("shoppingList")
        .where("userId", "==", userId)
        .where("name", "==", item.name)
        .limit(1)
        .get()

      // Wenn das Element bereits existiert, aktualisieren wir es
      if (!existingItemSnapshot.empty) {
        const existingDoc = existingItemSnapshot.docs[0]
        await existingDoc.ref.update({
          menge: item.menge,
          gekauft: false, // Zurücksetzen auf "nicht gekauft"
        })

        // Lokalen State aktualisieren
        setItems((prevItems) =>
          prevItems.map((prevItem) =>
            prevItem.id === existingDoc.id ? { ...prevItem, menge: item.menge, gekauft: false } : prevItem,
          ),
        )

        return {
          id: existingDoc.id,
          ...existingDoc.data(),
          menge: item.menge,
          gekauft: false,
        } as ShoppingItemType
      }

      // Neues Element hinzufügen
      const docRef = await firestore()
        .collection("shoppingList")
        .add({
          ...item,
          userId,
        })

      const newItem: ShoppingItemType = {
        id: docRef.id,
        ...item,
        userId,
      }

      setItems((prevItems) => [...prevItems, newItem])

      return newItem
    } catch (err) {
      console.error("Fehler beim Hinzufügen des Elements:", err)
      throw err
    }
  }, [])

  // Mehrere Elemente hinzufügen
  const addItems = useCallback(async (newItems: Omit<ShoppingItemType, "id" | "userId">[]) => {
    const userId = auth().currentUser?.uid
    if (!userId) return

    try {
      // Bestehende Elemente abrufen
      const existingItemsSnapshot = await firestore().collection("shoppingList").where("userId", "==", userId).get()

      const existingItemsByName: Record<string, { id: string; menge: string }> = {}
      existingItemsSnapshot.forEach((doc) => {
        const data = doc.data()
        existingItemsByName[data.name] = { id: doc.id, menge: data.menge }
      })

      // Batch-Operation vorbereiten
      const batch = firestore().batch()
      const addedItems: ShoppingItemType[] = []

      // Elemente verarbeiten
      for (const item of newItems) {
        // Prüfen, ob das Element bereits existiert
        if (existingItemsByName[item.name]) {
          const { id } = existingItemsByName[item.name]
          const docRef = firestore().collection("shoppingList").doc(id)

          batch.update(docRef, {
            menge: item.menge,
            gekauft: false, // Zurücksetzen auf "nicht gekauft"
          })

          addedItems.push({
            id,
            name: item.name,
            menge: item.menge,
            gekauft: false,
            userId,
          })
        } else {
          // Neues Element hinzufügen
          const docRef = firestore().collection("shoppingList").doc()

          batch.set(docRef, {
            name: item.name,
            menge: item.menge,
            gekauft: false,
            userId,
          })

          addedItems.push({
            id: docRef.id,
            name: item.name,
            menge: item.menge,
            gekauft: false,
            userId,
          })
        }
      }

      // Batch ausführen
      await batch.commit()

      // Lokalen State aktualisieren
      setItems((prevItems) => {
        // Neue Map erstellen, um Duplikate zu vermeiden
        const itemMap = new Map<string, ShoppingItemType>()

        // Bestehende Elemente hinzufügen
        prevItems.forEach((item) => {
          itemMap.set(item.id, item)
        })

        // Neue/aktualisierte Elemente hinzufügen
        addedItems.forEach((item) => {
          itemMap.set(item.id, item)
        })

        return Array.from(itemMap.values())
      })

      return addedItems
    } catch (err) {
      console.error("Fehler beim Hinzufügen mehrerer Elemente:", err)
      throw err
    }
  }, [])

  // Status eines Elements umschalten (gekauft/nicht gekauft)
  const toggleItemStatus = useCallback(async (id: string, gekauft: boolean) => {
    try {
      await firestore().collection("shoppingList").doc(id).update({ gekauft })

      // Lokalen State aktualisieren
      setItems((prevItems) => prevItems.map((item) => (item.id === id ? { ...item, gekauft } : item)))
    } catch (err) {
      console.error("Fehler beim Aktualisieren des Elements:", err)
      throw err
    }
  }, [])

  // Element löschen
  const deleteItem = useCallback(async (id: string) => {
    try {
      await firestore().collection("shoppingList").doc(id).delete()

      // Lokalen State aktualisieren
      setItems((prevItems) => prevItems.filter((item) => item.id !== id))
    } catch (err) {
      console.error("Fehler beim Löschen des Elements:", err)
      throw err
    }
  }, [])

  // Alle gekauften Elemente löschen
  const clearPurchasedItems = useCallback(async () => {
    const userId = auth().currentUser?.uid
    if (!userId) return

    try {
      // Alle gekauften Elemente abrufen
      const purchasedSnapshot = await firestore()
        .collection("shoppingList")
        .where("userId", "==", userId)
        .where("gekauft", "==", true)
        .get()

      if (purchasedSnapshot.empty) return

      // Batch-Operation zum Löschen
      const batch = firestore().batch()
      purchasedSnapshot.forEach((doc) => {
        batch.delete(doc.ref)
      })

      await batch.commit()

      // Lokalen State aktualisieren
      setItems((prevItems) => prevItems.filter((item) => !item.gekauft))
    } catch (err) {
      console.error("Fehler beim Löschen gekaufter Elemente:", err)
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
    toggleItemStatus,
    deleteItem,
    clearPurchasedItems,
  }
}
