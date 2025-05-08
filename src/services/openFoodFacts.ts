// OpenFoodFacts API Service
// Dokumentation: https://openfoodfacts.github.io/api-documentation/

const API_BASE_URL = "https://world.openfoodfacts.org/api/v2"

export interface NutritionFacts {
  energy_100g?: number
  energy_unit?: string
  proteins_100g?: number
  carbohydrates_100g?: number
  sugars_100g?: number
  fat_100g?: number
  saturated_fat_100g?: number
  fiber_100g?: number
  salt_100g?: number
  sodium_100g?: number
  nutrition_score?: number
  nutrition_grade?: string
}

export interface ProductInfo {
  id: string
  barcode: string
  name: string
  brand?: string
  image_url?: string
  image_nutrition_url?: string
  quantity?: string
  categories?: string[]
  ingredients?: string[]
  allergens?: string[]
  labels?: string[]
  nutrition_facts: NutritionFacts
  eco_score?: string
  nova_group?: number
}

export const openFoodFactsService = {
  // Produkt anhand des Barcodes suchen
  async getProductByBarcode(barcode: string): Promise<ProductInfo | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/product/${barcode}.json`)
      const data = await response.json()

      if (!response.ok || data.status !== 1) {
        console.log("Produkt nicht gefunden:", barcode)
        return null
      }

      const product = data.product

      // Nährwertinformationen extrahieren
      const nutritionFacts: NutritionFacts = {
        energy_100g: product.nutriments?.energy_100g,
        energy_unit: product.nutriments?.energy_unit,
        proteins_100g: product.nutriments?.proteins_100g,
        carbohydrates_100g: product.nutriments?.carbohydrates_100g,
        sugars_100g: product.nutriments?.sugars_100g,
        fat_100g: product.nutriments?.fat_100g,
        saturated_fat_100g: product.nutriments?.saturated_fat_100g,
        fiber_100g: product.nutriments?.fiber_100g,
        salt_100g: product.nutriments?.salt_100g,
        sodium_100g: product.nutriments?.sodium_100g,
        nutrition_score: product.nutriscore_score,
        nutrition_grade: product.nutriscore_grade,
      }

      return {
        id: product._id,
        barcode: barcode,
        name: product.product_name || product.product_name_de || "Unbekanntes Produkt",
        brand: product.brands,
        image_url: product.image_url,
        image_nutrition_url: product.image_nutrition_url,
        quantity: product.quantity,
        categories: product.categories_tags?.map((tag: string) => tag.replace("en:", "")),
        ingredients: product.ingredients_text_de ? product.ingredients_text_de.split(",") : [],
        allergens: product.allergens_tags?.map((tag: string) => tag.replace("en:", "")),
        labels: product.labels_tags?.map((tag: string) => tag.replace("en:", "")),
        nutrition_facts: nutritionFacts,
        eco_score: product.ecoscore_grade,
        nova_group: product.nova_group,
      }
    } catch (error) {
      console.error("Fehler bei der OpenFoodFacts API-Anfrage:", error)
      return null
    }
  },

  // Produkte anhand des Namens suchen
  async searchProducts(query: string, page = 1, pageSize = 10): Promise<ProductInfo[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/search?search_terms=${encodeURIComponent(query)}&page=${page}&page_size=${pageSize}&json=true`,
      )
      const data = await response.json()

      if (!response.ok || !data.products) {
        return []
      }

      return data.products.map((product: any) => {
        const nutritionFacts: NutritionFacts = {
          energy_100g: product.nutriments?.energy_100g,
          energy_unit: product.nutriments?.energy_unit,
          proteins_100g: product.nutriments?.proteins_100g,
          carbohydrates_100g: product.nutriments?.carbohydrates_100g,
          sugars_100g: product.nutriments?.sugars_100g,
          fat_100g: product.nutriments?.fat_100g,
          saturated_fat_100g: product.nutriments?.saturated_fat_100g,
          fiber_100g: product.nutriments?.fiber_100g,
          salt_100g: product.nutriments?.salt_100g,
          sodium_100g: product.nutriments?.sodium_100g,
          nutrition_score: product.nutriscore_score,
          nutrition_grade: product.nutriscore_grade,
        }

        return {
          id: product._id,
          barcode: product.code,
          name: product.product_name || product.product_name_de || "Unbekanntes Produkt",
          brand: product.brands,
          image_url: product.image_url,
          image_nutrition_url: product.image_nutrition_url,
          quantity: product.quantity,
          categories: product.categories_tags?.map((tag: string) => tag.replace("en:", "")),
          ingredients: product.ingredients_text_de ? product.ingredients_text_de.split(",") : [],
          allergens: product.allergens_tags?.map((tag: string) => tag.replace("en:", "")),
          labels: product.labels_tags?.map((tag: string) => tag.replace("en:", "")),
          nutrition_facts: nutritionFacts,
          eco_score: product.ecoscore_grade,
          nova_group: product.nova_group,
        }
      })
    } catch (error) {
      console.error("Fehler bei der OpenFoodFacts Suche:", error)
      return []
    }
  },

  // Nährwertbewertung interpretieren
  getNutritionGradeInfo(grade?: string): { color: string; label: string } {
    switch (grade?.toLowerCase()) {
      case "a":
        return { color: "#1E8F4E", label: "Sehr gut" }
      case "b":
        return { color: "#7AC547", label: "Gut" }
      case "c":
        return { color: "#FFC734", label: "Mittelmäßig" }
      case "d":
        return { color: "#FF7D24", label: "Schlecht" }
      case "e":
        return { color: "#FF421A", label: "Sehr schlecht" }
      default:
        return { color: "#CCCCCC", label: "Keine Bewertung" }
    }
  },

  // Eco-Score interpretieren
  getEcoScoreInfo(score?: string): { color: string; label: string } {
    switch (score?.toLowerCase()) {
      case "a":
        return { color: "#1E8F4E", label: "Sehr geringe Umweltauswirkungen" }
      case "b":
        return { color: "#7AC547", label: "Geringe Umweltauswirkungen" }
      case "c":
        return { color: "#FFC734", label: "Mittlere Umweltauswirkungen" }
      case "d":
        return { color: "#FF7D24", label: "Hohe Umweltauswirkungen" }
      case "e":
        return { color: "#FF421A", label: "Sehr hohe Umweltauswirkungen" }
      default:
        return { color: "#CCCCCC", label: "Keine Bewertung" }
    }
  },

  // NOVA-Gruppe interpretieren
  getNovaGroupInfo(group?: number): { color: string; label: string } {
    switch (group) {
      case 1:
        return { color: "#1E8F4E", label: "Unverarbeitete Lebensmittel" }
      case 2:
        return { color: "#7AC547", label: "Leicht verarbeitete Lebensmittel" }
      case 3:
        return { color: "#FF7D24", label: "Verarbeitete Lebensmittel" }
      case 4:
        return { color: "#FF421A", label: "Hochverarbeitete Lebensmittel" }
      default:
        return { color: "#CCCCCC", label: "Keine Bewertung" }
    }
  },
}
