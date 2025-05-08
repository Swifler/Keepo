"use client"

import { useCallback, useState, useEffect } from "react"
import auth, { type FirebaseAuthTypes } from "@react-native-firebase/auth"
import { authService, type UserProfile } from "../services/auth"

export function useAuth() {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [initializing, setInitializing] = useState(true)

  // Authentifizierungsstatus überwachen
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(async (authUser) => {
      setUser(authUser)

      if (authUser) {
        try {
          const profile = await authService.getUserProfile(authUser.uid)
          setUserProfile(profile)
        } catch (error) {
          console.error("Fehler beim Laden des Benutzerprofils:", error)
        }
      } else {
        setUserProfile(null)
      }

      if (initializing) {
        setInitializing(false)
      }

      setLoading(false)
    })

    return subscriber
  }, [initializing])

  // Anonyme Authentifizierung initialisieren
  const initializeAuth = useCallback(async () => {
    try {
      setLoading(true)

      // Überprüfen, ob bereits ein Benutzer angemeldet ist
      const currentUser = auth().currentUser

      if (currentUser) {
        setUser(currentUser)

        try {
          const profile = await authService.getUserProfile(currentUser.uid)
          setUserProfile(profile)
        } catch (error) {
          console.error("Fehler beim Laden des Benutzerprofils:", error)
        }
      } else {
        // Anonyme Anmeldung durchführen
        const { user: newUser } = await auth().signInAnonymously()
        setUser(newUser)
      }
    } catch (error) {
      console.error("Fehler bei der Authentifizierung:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Registrierung mit E-Mail und Passwort
  const register = useCallback(async (email: string, password: string, displayName: string) => {
    setLoading(true)
    try {
      const result = await authService.registerWithEmail(email, password, displayName)
      return result
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  // Anmeldung mit E-Mail und Passwort
  const login = useCallback(async (email: string, password: string) => {
    setLoading(true)
    try {
      const result = await authService.loginWithEmail(email, password)
      return result
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  // Abmelden
  const logout = useCallback(async () => {
    setLoading(true)
    try {
      await authService.logout()
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  // Passwort zurücksetzen
  const resetPassword = useCallback(async (email: string) => {
    try {
      await authService.resetPassword(email)
    } catch (error) {
      throw error
    }
  }, [])

  // Haushalt erstellen
  const createHousehold = useCallback(
    async (name: string) => {
      try {
        const householdId = await authService.createHousehold(name)

        // Benutzerprofil aktualisieren
        if (user) {
          const updatedProfile = await authService.getUserProfile(user.uid)
          setUserProfile(updatedProfile)
        }

        return householdId
      } catch (error) {
        throw error
      }
    },
    [user],
  )

  // Haushalt mit Einladungscode beitreten
  const joinHouseholdWithCode = useCallback(
    async (inviteCode: string) => {
      try {
        const success = await authService.joinHouseholdWithCode(inviteCode)

        if (success && user) {
          // Benutzerprofil aktualisieren
          const updatedProfile = await authService.getUserProfile(user.uid)
          setUserProfile(updatedProfile)
        }

        return success
      } catch (error) {
        throw error
      }
    },
    [user],
  )

  // Haushalt verlassen
  const leaveHousehold = useCallback(async () => {
    try {
      await authService.leaveHousehold()

      // Benutzerprofil aktualisieren
      if (user) {
        const updatedProfile = await authService.getUserProfile(user.uid)
        setUserProfile(updatedProfile)
      }
    } catch (error) {
      throw error
    }
  }, [user])

  return {
    user,
    userProfile,
    loading,
    initializing,
    initializeAuth,
    register,
    login,
    logout,
    resetPassword,
    createHousehold,
    joinHouseholdWithCode,
    leaveHousehold,
  }
}
