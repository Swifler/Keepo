import type { RecipeType, InventoryItemType } from "../types"

// Extrahiere alle Zutaten aus einem Rezept
export const extractIngredients = (recipe: RecipeType): string[] => {
  return recipe.zutaten.map((ingredient) => {
    // Extrahiere nur den Namen der Zutat (ohne Mengenangabe)
    const match = ingredient.match(/[0-9]+\s*[a-zA-ZäöüÄÖÜß]*\s+(.*)/)
    if (match && match[1]) {
      return match[1].trim().toLowerCase()
    }
    return ingredient.toLowerCase()
  })
}

// Finde fehlende Zutaten für Rezepte
export const findMissingIngredients = (recipes: RecipeType[], inventoryItems: InventoryItemType[]): string[] => {
  // Alle Zutaten aus allen Rezepten extrahieren
  const allIngredients: string[] = []
  recipes.forEach((recipe) => {
    const ingredients = extractIngredients(recipe)
    allIngredients.push(...ingredients)
  })

  // Duplikate entfernen
  const uniqueIngredients = [...new Set(allIngredients)]

  // Inventar-Elemente in Kleinbuchstaben umwandeln
  const inventoryNames = inventoryItems.map((item) => item.name.toLowerCase())

  // Fehlende Zutaten finden
  const missingIngredients = uniqueIngredients.filter((ingredient) => {
    // Prüfen, ob die Zutat im Inventar vorhanden ist
    return !inventoryNames.some((name) => {
      // Teilweise Übereinstimmung (z.B. "Apfel" sollte "Äpfel" abdecken)
      return name.includes(ingredient) || ingredient.includes(name)
    })
  })

  // Zutaten in lesbarer Form zurückgeben
  return missingIngredients.map((ingredient) => ingredient.charAt(0).toUpperCase() + ingredient.slice(1))
}
