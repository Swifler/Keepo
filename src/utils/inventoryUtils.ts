import type { InventoryItemType } from "../types"

// Elemente nach Kategorie gruppieren
export const groupByCategory = (items: InventoryItemType[]): Record<string, InventoryItemType[]> => {
  return items.reduce(
    (groups, item) => {
      const category = item.kategorie || "Sonstiges"

      if (!groups[category]) {
        groups[category] = []
      }

      groups[category].push(item)

      return groups
    },
    {} as Record<string, InventoryItemType[]>,
  )
}

// Elemente nach Ablaufdatum sortieren
export const sortByExpiryDate = (items: InventoryItemType[]): InventoryItemType[] => {
  return [...items].sort((a, b) => {
    const dateA = new Date(a.haltbarBis).getTime()
    const dateB = new Date(b.haltbarBis).getTime()
    return dateA - dateB
  })
}

// Elemente nach Name sortieren
export const sortByName = (items: InventoryItemType[]): InventoryItemType[] => {
  return [...items].sort((a, b) => a.name.localeCompare(b.name))
}

// Elemente nach Kategorie sortieren
export const sortByCategory = (items: InventoryItemType[]): InventoryItemType[] => {
  return [...items].sort((a, b) => a.kategorie.localeCompare(b.kategorie))
}
