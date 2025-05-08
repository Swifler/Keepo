"use client"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { View, StyleSheet, TouchableOpacity, Platform } from "react-native"
import { Pantry, PlusCircle, ChefHat, ShoppingCart, User } from "lucide-react-native"
import { BlurView } from "expo-blur"
import { useTheme } from "../contexts/ThemeContext"
import { useTranslation } from "react-i18next"

// Screens
import InventoryScreen from "../screens/InventoryScreen"
import CameraScreen from "../screens/CameraScreen"
import RecipesScreen from "../screens/RecipesScreen"
import ShoppingListScreen from "../screens/ShoppingListScreen"
import ProfileScreen from "../screens/ProfileScreen"

// Typen für die Navigation
import type { RootTabParamList } from "./types"

const Tab = createBottomTabNavigator<RootTabParamList>()

// Benutzerdefinierter Kamera-Button für die Tab-Bar
const CameraButton = ({ onPress }: { onPress: () => void }) => {
  const { colors } = useTheme()

  return (
    <TouchableOpacity style={[styles.cameraButton, { backgroundColor: colors.primary }]} onPress={onPress}>
      <PlusCircle size={28} color="white" />
    </TouchableOpacity>
  )
}

export default function Navigation() {
  const { colors, isDark } = useTheme()
  const { t } = useTranslation()

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          height: 80,
          paddingBottom: 16,
          paddingTop: 8,
          backgroundColor: Platform.OS === "ios" ? "transparent" : colors.cardBackground,
          position: "absolute",
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarBackground:
          Platform.OS === "ios"
            ? () => <BlurView tint={isDark ? "dark" : "light"} intensity={80} style={StyleSheet.absoluteFill} />
            : undefined,
        headerStyle: {
          backgroundColor: colors.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTitleStyle: {
          fontWeight: "600",
          color: colors.text,
        },
      }}
    >
      <Tab.Screen
        name="Inventory"
        component={InventoryScreen}
        options={{
          title: t("navigation.inventory"),
          tabBarLabel: t("navigation.inventory"),
          tabBarIcon: ({ color, size }) => <Pantry size={size} color={color} />,
        }}
      />

      <Tab.Screen
        name="Recipes"
        component={RecipesScreen}
        options={{
          title: t("navigation.recipes"),
          tabBarLabel: t("navigation.recipes"),
          tabBarIcon: ({ color, size }) => <ChefHat size={size} color={color} />,
        }}
      />

      <Tab.Screen
        name="Camera"
        component={CameraScreen}
        options={{
          title: t("navigation.camera"),
          tabBarLabel: "",
          tabBarIcon: ({ focused }) => (
            <View style={styles.cameraTabContainer}>
              <CameraButton onPress={() => {}} />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="ShoppingList"
        component={ShoppingListScreen}
        options={{
          title: t("navigation.shoppingList"),
          tabBarLabel: t("navigation.shoppingList"),
          tabBarIcon: ({ color, size }) => <ShoppingCart size={size} color={color} />,
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: t("navigation.profile"),
          tabBarLabel: t("navigation.profile"),
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  )
}

const styles = StyleSheet.create({
  cameraTabContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    height: 60,
  },
  cameraButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    bottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
})
