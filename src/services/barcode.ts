// Barcode-Service mit OpenFoodFacts-Integration
import { openFoodFactsService } from "./openFoodFacts"

// Simulierte Produktdatenbank für Barcode-Lookups als Fallback
// In einer echten App würde hier eine API-Anfrage an eine Produktdatenbank erfolgen
const mockProductDatabase: Record<string, any> = {
  "4000417025005": {
    name: "Nutella",
    kategorie: "Süßigkeiten",
    menge: "450g",
    haltbarBis: "2024-12-31", // 1 Jahr ab heute
  },
  "4008400401621": {
    name: "Milka Alpenmilch",
    kategorie: "Süßigkeiten",
    menge: "100g",
    haltbarBis: "2023-10-15",
  },
  "4311501659717": {
    name: "Ja! Vollmilch",
    kategorie: "Milchprodukte",
    menge: "1L",
    haltbarBis: "2023-06-15",
  },
  // Weitere Produkte hier hinzufügen
}

export const barcodeService = {
  // Produkt anhand des Barcodes suchen
  async lookupBarcode(barcode: string): Promise<any> {
    try {
      // Zuerst in OpenFoodFacts suchen
      const product = await openFoodFactsService.getProductByBarcode(barcode)

      if (product) {
        // Kategorie aus OpenFoodFacts-Kategorien ableiten
        let kategorie = "Sonstiges"
        if (product.categories && product.categories.length > 0) {
          // Versuchen, eine passende Kategorie zu finden
          for (const category of product.categories) {
            const lowerCategory = category.toLowerCase()
            if (lowerCategory.includes("obst") || lowerCategory.includes("früchte")) {
              kategorie = "Obst"
              break
            } else if (lowerCategory.includes("gemüse")) {
              kategorie = "Gemüse"
              break
            } else if (lowerCategory.includes("fleisch")) {
              kategorie = "Fleisch"
              break
            } else if (lowerCategory.includes("fisch") || lowerCategory.includes("meeresfrüchte")) {
              kategorie = "Fisch"
              break
            } else if (
              lowerCategory.includes("milch") ||
              lowerCategory.includes("käse") ||
              lowerCategory.includes("joghurt")
            ) {
              kategorie = "Milchprodukte"
              break
            } else if (lowerCategory.includes("brot") || lowerCategory.includes("backwaren")) {
              kategorie = "Backwaren"
              break
            } else if (
              lowerCategory.includes("getränk") ||
              lowerCategory.includes("wasser") ||
              lowerCategory.includes("saft")
            ) {
              kategorie = "Getränke"
              break
            } else if (lowerCategory.includes("tiefkühl") || lowerCategory.includes("gefroren")) {
              kategorie = "Tiefkühlkost"
              break
            } else if (lowerCategory.includes("konserve")) {
              kategorie = "Konserven"
              break
            } else if (lowerCategory.includes("gewürz")) {
              kategorie = "Gewürze"
              break
            } else if (lowerCategory.includes("snack") || lowerCategory.includes("chips")) {
              kategorie = "Snacks"
              break
            } else if (
              lowerCategory.includes("süßigkeit") ||
              lowerCategory.includes("schokolade") ||
              lowerCategory.includes("zucker")
            ) {
              kategorie = "Süßigkeiten"
              break
            }
          }
        }

        // Standard-Ablaufdatum basierend auf der Kategorie
        const haltbarBis = getDefaultExpiryDate(kategorie)

        // Menge aus dem Produkt extrahieren oder Standardwert verwenden
        const menge = product.quantity || "1 Stk."

        // Produktinformationen zurückgeben
        return {
          name: product.name,
          kategorie: kategorie,
          menge: menge,
          haltbarBis: haltbarBis,
          bildUrl: product.image_url,
          productInfo: product, // Vollständige Produktinformationen für die Detailansicht
        }
      }

      // Fallback: In der lokalen Datenbank suchen
      if (barcode in mockProductDatabase) {
        return mockProductDatabase[barcode]
      }

      // Wenn das Produkt nicht gefunden wurde
      return null
    } catch (error) {
      console.error("Fehler bei der Barcode-Suche:", error)
      throw error
    }
  },

  // Barcode validieren
  validateBarcode(barcode: string): boolean {
    // EAN-13 Validierung
    if (barcode.length !== 13 || !/^\d+$/.test(barcode)) {
      return false
    }

    // Prüfziffer berechnen
    let sum = 0
    for (let i = 0; i < 12; i++) {
      sum += Number.parseInt(barcode[i]) * (i % 2 === 0 ? 1 : 3)
    }

    const checkDigit = (10 - (sum % 10)) % 10

    return checkDigit === Number.parseInt(barcode[12])
  },
}

// Hilfsfunktion: Standardablaufdatum basierend auf Kategorie
function getDefaultExpiryDate(category: string): string {
  const date = new Date()

  switch (category) {
    case "Obst":
    case "Gemüse":
      date.setDate(date.getDate() + 7) // 1 Woche
      break
    case "Milchprodukte":
      date.setDate(date.getDate() + 10) // 10 Tage
      break
    case "Fleisch":
    case "Fisch":
      date.setDate(date.getDate() + 3) // 3 Tage
      break
    case "Backwaren":
      date.setDate(date.getDate() + 5) // 5 Tage
      break
    case "Tiefkühlkost":
      date.setMonth(date.getMonth() + 3) // 3 Monate
      break
    case "Konserven":
    case "Gewürze":
    case "Getränke":
      date.setFullYear(date.getFullYear() + 1) // 1 Jahr
      break
    default:
      date.setDate(date.getDate() + 14) // 2 Wochen als Standard
  }

  return date.toISOString().split("T")[0] // Format: YYYY-MM-DD
}
