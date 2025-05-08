"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native"
import { useTranslation } from "react-i18next"
import { useTheme } from "../contexts/ThemeContext"
import { useInventory } from "../hooks/useInventory"
import { useRecipes } from "../hooks/useRecipes"
import { useGemini } from "../hooks/useGemini"
import GradientBackground from "../components/GradientBackground"
import RecipeCard from "../components/RecipeCard"
import type { RecipeType } from "../types"

export default function RecipesScreen({ navigation }) {
  const { t } = useTranslation()
  const { colors } = useTheme()
  const { items } = useInventory()
  const { recipes, fetchRecipes, addRecipes } = useRecipes()
  const { generateRecipes } = useGemini()

  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRecipes()
  }, [fetchRecipes])

  const handleGenerateRecipes = async () => {
    if (items.length === 0) {
      setError(t("recipes.noItemsError"))
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      // Zutaten aus dem Inventar extrahieren
      const ingredients = items.map((item) => item.name)

      // Rezepte mit Gemini generieren
      const generatedRecipes = await generateRecipes(ingredients)

      // Rezepte in Firestore speichern
      await addRecipes(generatedRecipes)

      // Rezepte neu laden
      await fetchRecipes()
    } catch (error) {
      console.error("Fehler bei der Rezeptgenerierung:", error)
      setError(t("recipes.generationError"))
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRecipePress = (recipe: RecipeType) => {
    navigation.navigate("RecipeDetail", { recipeId: recipe.id })
  }

  const renderRecipeItem = ({ item }: { item: RecipeType }) => {
    return <RecipeCard recipe={item} onPress={() => handleRecipePress(item)} />
  }

  return (
    <GradientBackground>
      <View style={styles.container}>
        <TouchableOpacity
          style={[styles.generateButton, { backgroundColor: colors.primary }]}
          onPress={handleGenerateRecipes}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.generateButtonText}>{t("recipes.generate")}</Text>
          )}
        </TouchableOpacity>

        {error && (
          <View style={[styles.errorContainer, { backgroundColor: `${colors.error}10` }]}>
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          </View>
        )}

        <FlatList
          data={recipes}
          renderItem={renderRecipeItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.recipesList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t("recipes.empty")}</Text>
            </View>
          }
        />
      </View>
    </GradientBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  generateButton: {
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  generateButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  recipesList: {
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
  errorContainer: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    textAlign: "center",
  },
})
