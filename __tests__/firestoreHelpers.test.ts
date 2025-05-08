import { groupByCategory, sortByExpiryDate } from "../src/utils/inventoryUtils"
import { findMissingIngredients } from "../src/utils/recipeUtils"
import type { InventoryItemType, RecipeType } from "../src/types"

// Mock-Daten für Tests
const mockInventoryItems: InventoryItemType[] = [
  {
    id: "1",
    name: "Apfel",
    kategorie: "Obst",
    menge: "3 Stk.",
    haltbarBis: "2023-06-01",
    bildUrl: null,
    userId: "user1",
    erstelltAm: new Date("2023-05-20"),
  },
  {
    id: "2",
    name: "Milch",
    kategorie: "Milchprodukte",
    menge: "1 L",
    haltbarBis: "2023-05-25",
    bildUrl: null,
    userId: "user1",
    erstelltAm: new Date("2023-05-20"),
  },
  {
    id: "3",
    name: "Brot",
    kategorie: "Backwaren",
    menge: "1 Stk.",
    haltbarBis: "2023-05-23",
    bildUrl: null,
    userId: "user1",
    erstelltAm: new Date("2023-05-20"),
  },
]

const mockRecipes: RecipeType[] = [
  {
    id: "1",
    titel: "Apfelkuchen",
    zubereitungszeit: "45 Minuten",
    zutaten: ["3 Äpfel", "200g Mehl", "100g Zucker", "2 Eier"],
    anleitung: "Schritt 1: Äpfel schälen...",
    userId: "user1",
    erstelltAm: new Date("2023-05-20"),
  },
]

// Tests für inventoryUtils
describe("inventoryUtils", () => {
  test("groupByCategory sollte Elemente korrekt nach Kategorie gruppieren", () => {
    const grouped = groupByCategory(mockInventoryItems)

    expect(Object.keys(grouped).length).toBe(3)
    expect(grouped["Obst"].length).toBe(1)
    expect(grouped["Milchprodukte"].length).toBe(1)
    expect(grouped["Backwaren"].length).toBe(1)
    expect(grouped["Obst"][0].name).toBe("Apfel")
  })

  test("sortByExpiryDate sollte Elemente nach Ablaufdatum sortieren", () => {
    const sorted = sortByExpiryDate(mockInventoryItems)

    expect(sorted[0].id).toBe("3") // Brot (23.05)
    expect(sorted[1].id).toBe("2") // Milch (25.05)
    expect(sorted[2].id).toBe("1") // Apfel (01.06)
  })
})

// Tests für recipeUtils
describe("recipeUtils", () => {
  test("findMissingIngredients sollte fehlende Zutaten korrekt identifizieren", () => {
    const missing = findMissingIngredients(mockRecipes, mockInventoryItems)

    // Äpfel sind vorhanden (Apfel im Inventar), aber Mehl, Zucker und Eier fehlen
    expect(missing.length).toBe(3)
    expect(missing).toContain("Mehl")
    expect(missing).toContain("Zucker")
    expect(missing).toContain("Eier")
    expect(missing).not.toContain("Äpfel")
  })
})
