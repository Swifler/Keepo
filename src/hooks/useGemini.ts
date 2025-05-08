"use client"

import { useCallback } from "react"
import { GoogleGenerativeAI } from "@google/generative-ai"
import type { DetectedItem, RecipeType } from "../types"
import { FOOD_CATEGORIES } from "../constants/foodCategories"

// Gemini API-Schlüssel aus den Umgebungsvariablen
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY

// Gemini-Modelle
const MODEL_PRO = "gemini-pro"
const MODEL_VISION = "gemini-pro-vision"

// Initialisiere die Gemini API
const genAI = new GoogleGenerativeAI(API_KEY || "")

export function useGemini() {
  // Bild analysieren und Lebensmittel erkennen
  const analyzeImage = useCallback(async (imageUri: string): Promise<DetectedItem[]> => {
    if (!API_KEY) {
      throw new Error("Gemini API-Schlüssel fehlt")
    }

    try {
      // Bild in Base64 konvertieren
      const imageResponse = await fetch(imageUri)
      const blob = await imageResponse.blob()
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          if (typeof reader.result === "string") {
            // Base64-Präfix entfernen
            const base64String = reader.result.split(",")[1]
            resolve(base64String)
          } else {
            reject(new Error("Konvertierung zu Base64 fehlgeschlagen"))
          }
        }
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })

      // Gemini Vision-Modell initialisieren
      const model = genAI.getGenerativeModel({ model: MODEL_VISION })

      // Prompt für die Bilderkennung
      const prompt = `
        Identifiziere alle Lebensmittel in diesem Bild. 
        Gib für jedes Lebensmittel den Namen und die Kategorie an.
        Verwende nur folgende Kategorien: ${FOOD_CATEGORIES.join(", ")}.
        Antworte im JSON-Format mit einem Array von Objekten, wobei jedes Objekt "name" und "kategorie" enthält.
        Beispiel: [{"name": "Apfel", "kategorie": "Obst"}, {"name": "Brot", "kategorie": "Backwaren"}]
      `

      // Bild an Gemini senden
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64,
          },
        },
      ])

      const geminiResponse = await result.response
      const text = geminiResponse.text()

      // JSON aus der Antwort extrahieren
      const jsonMatch = text.match(/\[.*\]/s)
      if (!jsonMatch) {
        throw new Error("Keine gültige JSON-Antwort erhalten")
      }

      // JSON parsen und Ergebnis zurückgeben
      const items: DetectedItem[] = JSON.parse(jsonMatch[0])

      // Standardwerte für Menge und Haltbarkeit hinzufügen
      return items.map((item) => ({
        ...item,
        menge: "1 Stk.",
        haltbarBis: getDefaultExpiryDate(item.kategorie),
      }))
    } catch (error) {
      console.error("Fehler bei der Bildanalyse:", error)
      throw error
    }
  }, [])

  // Rezepte basierend auf vorhandenen Zutaten generieren
  const generateRecipes = useCallback(async (ingredients: string[]): Promise<RecipeType[]> => {
    if (!API_KEY) {
      throw new Error("Gemini API-Schlüssel fehlt")
    }

    if (ingredients.length === 0) {
      throw new Error("Keine Zutaten angegeben")
    }

    try {
      // Gemini Pro-Modell initialisieren
      const model = genAI.getGenerativeModel({ model: MODEL_PRO })

      // Prompt für die Rezeptgenerierung
      const prompt = `
        Erstelle 3 Rezepte, die ausschließlich folgende Zutaten verwenden: ${ingredients.join(", ")}.
        Du darfst grundlegende Zutaten wie Salz, Pfeffer, Öl und Gewürze hinzufügen.
        
        Für jedes Rezept gib folgende Informationen aus:
        - Titel
        - Zubereitungszeit
        - Zutatenliste (mit Mengenangaben)
        - Schritt-für-Schritt-Anleitung
        
        Antworte auf Deutsch und im JSON-Format mit einem Array von Rezepten:
        [
          {
            "titel": "Rezeptname",
            "zubereitungszeit": "30 Minuten",
            "zutaten": ["200g Zutat 1", "3 Stück Zutat 2", ...],
            "anleitung": "Schritt 1: ...\nSchritt 2: ...\n..."
          },
          ...
        ]
      `

      // Anfrage an Gemini senden
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      // JSON aus der Antwort extrahieren
      const jsonMatch = text.match(/\[.*\]/s)
      if (!jsonMatch) {
        throw new Error("Keine gültige JSON-Antwort erhalten")
      }

      // JSON parsen
      const recipes = JSON.parse(jsonMatch[0])

      // IDs hinzufügen und Ergebnis zurückgeben
      return recipes.map((recipe: any) => ({
        ...recipe,
        id: "", // Wird später von Firestore gesetzt
      }))
    } catch (error) {
      console.error("Fehler bei der Rezeptgenerierung:", error)
      throw error
    }
  }, [])

  return {
    analyzeImage,
    generateRecipes,
  }
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
