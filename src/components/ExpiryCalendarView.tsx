"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native"
import { useTranslation } from "react-i18next"
import { useTheme } from "../contexts/ThemeContext"
import { ChevronLeft, ChevronRight, AlertCircle } from "lucide-react-native"
import type { InventoryItemType } from "../types"
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from "date-fns"
import { de } from "date-fns/locale"

interface ExpiryCalendarViewProps {
  items: InventoryItemType[]
  onItemPress: (item: InventoryItemType) => void
}

export default function ExpiryCalendarView({ items, onItemPress }: ExpiryCalendarViewProps) {
  const { t } = useTranslation()
  const { colors } = useTheme()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [calendarDays, setCalendarDays] = useState<Date[]>([])
  const [itemsByDay, setItemsByDay] = useState<Record<string, InventoryItemType[]>>({})

  // Kalendertage für den aktuellen Monat generieren
  useEffect(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    const days = eachDayOfInterval({ start, end })
    setCalendarDays(days)
  }, [currentMonth])

  // Lebensmittel nach Ablaufdatum gruppieren
  useEffect(() => {
    const grouped: Record<string, InventoryItemType[]> = {}

    items.forEach((item) => {
      const expiryDate = item.haltbarBis
      if (!grouped[expiryDate]) {
        grouped[expiryDate] = []
      }
      grouped[expiryDate].push(item)
    })

    setItemsByDay(grouped)
  }, [items])

  // Zum nächsten Monat wechseln
  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  // Zum vorherigen Monat wechseln
  const goToPrevMonth = () => {
    setCurrentMonth(addMonths(currentMonth, -1))
  }

  // Prüfen, ob an einem bestimmten Tag Lebensmittel ablaufen
  const getItemsForDay = (day: Date): InventoryItemType[] => {
    const dateString = format(day, "yyyy-MM-dd")
    return itemsByDay[dateString] || []
  }

  // Anzahl der ablaufenden Lebensmittel für einen Tag abrufen
  const getExpiryCount = (day: Date): number => {
    return getItemsForDay(day).length
  }

  // Farbe für einen Tag basierend auf ablaufenden Lebensmitteln bestimmen
  const getDayColor = (day: Date): string => {
    const count = getExpiryCount(day)
    if (count === 0) return "transparent"
    return colors.expiryRed
  }

  // Wochentage-Header rendern
  const renderWeekdays = () => {
    const weekdays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]

    return (
      <View style={styles.weekdaysContainer}>
        {weekdays.map((day, index) => (
          <Text key={index} style={[styles.weekdayText, { color: colors.textSecondary }]}>
            {day}
          </Text>
        ))}
      </View>
    )
  }

  // Kalendertage rendern
  const renderCalendarDays = () => {
    // Berechne den Wochentag des ersten Tags (0 = Sonntag, 1 = Montag, ..., 6 = Samstag)
    const firstDayOfMonth = startOfMonth(currentMonth).getDay()
    // Anpassen für Montag als ersten Tag der Woche (0 = Montag, ..., 6 = Sonntag)
    const offset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

    const days = []

    // Leere Zellen für Tage vor dem ersten Tag des Monats
    for (let i = 0; i < offset; i++) {
      days.push(<View key={`empty-${i}`} style={styles.dayCell} />)
    }

    // Tage des Monats
    calendarDays.forEach((day) => {
      const dayItems = getItemsForDay(day)
      const hasItems = dayItems.length > 0
      const isCurrentDay = isToday(day)

      days.push(
        <TouchableOpacity
          key={day.toISOString()}
          style={[
            styles.dayCell,
            hasItems && { borderColor: getDayColor(day), borderWidth: 1 },
            isCurrentDay && { backgroundColor: `${colors.primary}20` },
          ]}
          onPress={() => hasItems && showItemsForDay(day)}
          disabled={!hasItems}
        >
          <Text style={[styles.dayNumber, { color: colors.text }, isCurrentDay && { fontWeight: "700" }]}>
            {format(day, "d")}
          </Text>

          {hasItems && (
            <View style={[styles.expiryIndicator, { backgroundColor: getDayColor(day) }]}>
              <Text style={styles.expiryCount}>{dayItems.length}</Text>
            </View>
          )}
        </TouchableOpacity>,
      )
    })

    return <View style={styles.calendarGrid}>{days}</View>
  }

  // Lebensmittel für einen bestimmten Tag anzeigen
  const showItemsForDay = (day: Date) => {
    const items = getItemsForDay(day)
    if (items.length === 0) return

    // Hier könnten wir ein Modal oder eine andere Ansicht öffnen,
    // aber für jetzt zeigen wir einfach die Elemente direkt an
  }

  // Ablaufende Lebensmittel für den aktuellen Monat anzeigen
  const renderExpiringItems = () => {
    const expiringItems: InventoryItemType[] = []

    calendarDays.forEach((day) => {
      const items = getItemsForDay(day)
      expiringItems.push(...items)
    })

    if (expiringItems.length === 0) {
      return (
        <View style={styles.noItemsContainer}>
          <Text style={[styles.noItemsText, { color: colors.textSecondary }]}>{t("inventory.noExpiringItems")}</Text>
        </View>
      )
    }

    // Sortiere nach Ablaufdatum
    expiringItems.sort((a, b) => {
      return new Date(a.haltbarBis).getTime() - new Date(b.haltbarBis).getTime()
    })

    // Gruppiere nach Ablaufdatum
    const groupedByDate: Record<string, InventoryItemType[]> = {}

    expiringItems.forEach((item) => {
      const dateString = item.haltbarBis
      if (!groupedByDate[dateString]) {
        groupedByDate[dateString] = []
      }
      groupedByDate[dateString].push(item)
    })

    return (
      <View style={styles.expiringItemsContainer}>
        <Text style={[styles.expiringItemsTitle, { color: colors.text }]}>{t("inventory.expiringThisMonth")}</Text>

        {Object.entries(groupedByDate).map(([dateString, items]) => {
          const date = new Date(dateString)
          const isExpired = date < new Date()

          return (
            <View key={dateString} style={styles.dateGroup}>
              <View style={[styles.dateHeader, { backgroundColor: isExpired ? colors.expiryRed : colors.primary }]}>
                <Text style={styles.dateHeaderText}>{format(date, "dd. MMMM", { locale: de })}</Text>
                {isExpired && <AlertCircle size={16} color="white" style={styles.alertIcon} />}
              </View>

              {items.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.expiryItem, { backgroundColor: colors.cardBackground }]}
                  onPress={() => onItemPress(item)}
                >
                  <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={[styles.itemCategory, { color: colors.textSecondary }]}>{item.kategorie}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )
        })}
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.calendarContainer}>
        {/* Monatsnavigation */}
        <View style={styles.monthNavigation}>
          <TouchableOpacity onPress={goToPrevMonth}>
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>

          <Text style={[styles.monthTitle, { color: colors.text }]}>
            {format(currentMonth, "MMMM yyyy", { locale: de })}
          </Text>

          <TouchableOpacity onPress={goToNextMonth}>
            <ChevronRight size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Wochentage */}
        {renderWeekdays()}

        {/* Kalendertage */}
        {renderCalendarDays()}
      </View>

      {/* Liste der ablaufenden Lebensmittel */}
      {renderExpiringItems()}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  calendarContainer: {
    marginBottom: 20,
  },
  monthNavigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    marginBottom: 10,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  weekdaysContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  weekdayText: {
    fontSize: 14,
    fontWeight: "500",
    width: 40,
    textAlign: "center",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: "14.28%", // 7 Tage pro Woche
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    position: "relative",
    marginVertical: 2,
  },
  dayNumber: {
    fontSize: 16,
  },
  expiryIndicator: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  expiryCount: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
  },
  expiringItemsContainer: {
    paddingHorizontal: 16,
  },
  expiringItemsTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  dateGroup: {
    marginBottom: 16,
  },
  dateHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  dateHeaderText: {
    color: "white",
    fontWeight: "600",
  },
  alertIcon: {
    marginLeft: 8,
  },
  expiryItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 14,
  },
  noItemsContainer: {
    padding: 20,
    alignItems: "center",
  },
  noItemsText: {
    fontSize: 16,
    textAlign: "center",
  },
})
