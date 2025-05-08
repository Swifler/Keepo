"use client"

import type React from "react"
import { StyleSheet } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useTheme } from "../contexts/ThemeContext"

interface GradientBackgroundProps {
  children: React.ReactNode
  style?: any
}

export default function GradientBackground({ children, style }: GradientBackgroundProps) {
  const { colors } = useTheme()

  return (
    <LinearGradient
      colors={colors.backgroundGradient}
      style={[styles.container, style]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      {children}
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
