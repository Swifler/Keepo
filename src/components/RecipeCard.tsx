"use client"
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native"
import { Clock, ChevronRight } from "lucide-react-native"
import { useTranslation } from "react-i18next"
import { useTheme } from "../contexts/ThemeContext"
import type { RecipeType } from "../types"
import { formatDate } from "../utils/dateUtils"

interface RecipeCardProps {
  recipe: RecipeType
  onPress?: () => void
}

export default function RecipeCard({ recipe, onPress }: RecipeCardProps) {
  const { t } = useTranslation()
  const { colors } = useTheme()

  // Generiere ein zufälliges Bild für das Rezept (in einer echten App würde hier ein echtes Bild verwendet)
  const getRandomImage = () => {
    const images = [
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
      "https://images.unsplash.com/photo-1473093295043-cdd812d0e601",
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1",
    ]
    return images[Math.floor(Math.random() * images.length)]
  }

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.cardBackground }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: getRandomImage() }} style={styles.image} />
        <View style={[styles.timeContainer, { backgroundColor: colors.primary }]}>
          <Clock size={14} color="white" />
          <Text style={styles.timeText}>{recipe.zubereitungszeit || t("recipes.unknownTime")}</Text>
        </View>
      </View>

      <View style={styles.contentContainer}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {recipe.titel}
        </Text>

        <View style={styles.ingredientsContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("recipes.ingredients")}</Text>

          <View style={styles.ingredientsList}>
            {recipe.zutaten.slice(0, 3).map((ingredient, index) => (
              <Text key={index} style={[styles.ingredient, { color: colors.textSecondary }]} numberOfLines={1}>
                • {ingredient}
              </Text>
            ))}

            {recipe.zutaten.length > 3 && (
              <Text style={[styles.moreIngredients, { color: colors.textSecondary }]}>
                {t("recipes.moreIngredients", { count: recipe.zutaten.length - 3 })}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.date, { color: colors.textSecondary }]}>
            {t("recipes.createdAt", { date: formatDate(recipe.erstelltAm) })}
          </Text>

          <ChevronRight size={20} color={colors.primary} />
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
    height: 160,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  timeContainer: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  ingredientsContainer: {
    marginBottom: 12,
  },
  ingredientsList: {
    marginLeft: 8,
  },
  ingredient: {
    fontSize: 14,
    marginBottom: 4,
  },
  moreIngredients: {
    fontSize: 14,
    fontStyle: "italic",
    marginTop: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
  },
  date: {
    fontSize: 12,
  },
})
