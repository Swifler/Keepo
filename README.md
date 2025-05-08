# 🥦 Keepo – Deine smarte Haltbarkeits-App

**Keepo** hilft dir dabei, Lebensmittel rechtzeitig zu nutzen, Rezepte aus deinen Vorräten zu entdecken und Food Waste zu vermeiden – intuitiv, KI-gestützt und familienfreundlich.

---

## 🚀 Features

- 📷 Barcode-Scan oder KI-gestützte Bilderkennung von Lebensmitteln
- 🗓 Ablaufkalender mit farbiger Warnanzeige
- 🍳 Intelligente Rezeptvorschläge auf Basis bald ablaufender Zutaten
- 👨‍👩‍👧‍👦 Familienmodus mit synchronisiertem Inventar
- 📈 Statistiken zu Ersparnis, Nutzung & Lebensmittelretter-Fortschritt

---

## 🧠 Tech Stack

| Bereich     | Technologie            |
|-------------|------------------------|
| App-Framework | React Native (Expo) |
| Sprache     | TypeScript             |
| State Mgmt  | Context API / Hooks    |
| KI/Erkennung | MLKit / TensorFlow (extern geplant) |
| Styling     | Tailwind CSS via Nativewind |
| Storage     | AsyncStorage (lokal), Firebase (geplant) |

---

## 📦 Projektstruktur (Auszug)

```bash
keepo/
├── App.tsx
├── package.json
├── app.json
├── babel.config.js
├── tsconfig.json
└── src/
    └── components/
        ├── ExpiryCalendarView.tsx
        ├── RecipeCard.tsx
        ├── InventoryItem.tsx
        ├── RecognizedItemsList.tsx
        └── ...
    └── hooks/
        └── useRecipes.ts
