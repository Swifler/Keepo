"use client"

import { useCallback, useState } from "react"
import firestore from "@react-native-firebase/firestore"
import auth from "@react-native-firebase/auth"
import type { RecipeType } from "../types"

export function useRecipes() {
  const [recipes, setRecipes] = useState<RecipeType[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Alle Rezepte abrufen
  const fetchRecipes = useCallback(async () => {
    const userId = auth().currentUser?.uid
    if (!userId) return

    setLoading(true)
    setError(null)

    try {
      const snapshot = await firestore()
        .collection("recipes")
        .where("userId", "==", userId)
        .orderBy("erstelltAm", "desc")
        .get()

      const fetchedRecipes: RecipeType[] = []
      snapshot.forEach((doc) => {
        fetchedRecipes.push({
          id: doc.id,
          ...doc.data(),
        } as RecipeType)
      })

      setRecipes(fetchedRecipes)
    } catch (err) {
      console.error("Fehler beim Abrufen der Rezepte:", err)
      setError("Fehler beim Laden der Rezepte")
    } finally {
      setLoading(false)
    }
  }, [])

  // Ein einzelnes Rezept hinzufügen
  const addRecipe = useCallback(async (recipe: Omit<RecipeType, "id" | "userId" | "erstelltAm">) => {
    const userId = auth().currentUser?.uid
    if (!userId) return

    try {
      const now = new Date()

      const docRef = await firestore()
        .collection("recipes")
        .add({
          ...recipe,
          userId,
          erstelltAm: now,
        })

      const newRecipe: RecipeType = {
        id: docRef.id,
        ...recipe,
        userId,
        erstelltAm: now,
      }

      setRecipes((prevRecipes) => [newRecipe, ...prevRecipes])

      return newRecipe
    } catch (err) {
      console.error("Fehler beim Hinzufügen des Rezepts:", err)
      throw err
    }
  }, [])

  // Mehrere Rezepte hinzufügen (z.B. nach KI-Generierung)
  const addRecipes = useCallback(async (newRecipes: Omit<RecipeType, "id" | "userId" | "erstelltAm">[]) => {
    const userId = auth().currentUser?.uid
    if (!userId) return

    try {
      const batch = firestore().batch()
      const now = new Date()
      const addedRecipes: RecipeType[] = []

      newRecipes.forEach((recipe) => {
        const docRef = firestore().collection("recipes").doc()

        const recipeWithMetadata = {
          ...recipe,
          userId,
          erstelltAm: now,
        }

        batch.set(docRef, recipeWithMetadata)

        addedRecipes.push({
          id: docRef.id,
          ...recipeWithMetadata,
        })
      })

      await batch.commit()

      setRecipes((prevRecipes) => [...addedRecipes, ...prevRecipes])

      return addedRecipes
    } catch (err) {
      console.error("Fehler beim Hinzufügen mehrerer Rezepte:", err)
      throw err
    }
  }, [])

  // Rezept löschen
  const deleteRecipe = useCallback(async (id: string) => {
    try {
      await firestore().collection("recipes").doc(id).delete()

      setRecipes((prevRecipes) => prevRecipes.filter((recipe) => recipe.id !== id))
    } catch (err) {
      console.error("Fehler beim Löschen des Rezepts:", err)
      throw err
    }
  }, [])

  return {
    recipes,
    loading,
    error,
    fetchRecipes,
    addRecipe,
    addRecipes,
    deleteRecipe,
  }
}
