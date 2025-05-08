import auth, { type FirebaseAuthTypes } from "@react-native-firebase/auth"
import firestore from "@react-native-firebase/firestore"
import { Alert } from "react-native"

// Benutzertypen
export type UserRole = "owner" | "member"

export interface UserProfile {
  uid: string
  email: string
  displayName: string | null
  householdId: string | null
  role: UserRole
  createdAt: Date
  isPremium: boolean
}

// Haushalt-Typ
export interface Household {
  id: string
  name: string
  ownerId: string
  members: string[] // UIDs der Mitglieder
  inviteCodes: string[]
  createdAt: Date
  isPremium: boolean
}

// Authentifizierungsfunktionen
export const authService = {
  // Registrierung mit E-Mail und Passwort
  async registerWithEmail(
    email: string,
    password: string,
    displayName: string,
  ): Promise<FirebaseAuthTypes.UserCredential> {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password)

      // Benutzerprofil in Firestore erstellen
      await firestore().collection("users").doc(userCredential.user.uid).set({
        uid: userCredential.user.uid,
        email,
        displayName,
        householdId: null,
        role: "owner",
        createdAt: new Date(),
        isPremium: false,
      })

      // Anzeigename setzen
      await userCredential.user.updateProfile({
        displayName,
      })

      return userCredential
    } catch (error: any) {
      console.error("Fehler bei der Registrierung:", error)
      throw error
    }
  },

  // Anmeldung mit E-Mail und Passwort
  async loginWithEmail(email: string, password: string): Promise<FirebaseAuthTypes.UserCredential> {
    try {
      return await auth().signInWithEmailAndPassword(email, password)
    } catch (error: any) {
      console.error("Fehler bei der Anmeldung:", error)
      throw error
    }
  },

  // Abmeldung
  async logout(): Promise<void> {
    try {
      await auth().signOut()
    } catch (error: any) {
      console.error("Fehler bei der Abmeldung:", error)
      throw error
    }
  },

  // Passwort zurücksetzen
  async resetPassword(email: string): Promise<void> {
    try {
      await auth().sendPasswordResetEmail(email)
    } catch (error: any) {
      console.error("Fehler beim Zurücksetzen des Passworts:", error)
      throw error
    }
  },

  // Aktuellen Benutzer abrufen
  getCurrentUser(): FirebaseAuthTypes.User | null {
    return auth().currentUser
  },

  // Benutzerprofil abrufen
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const doc = await firestore().collection("users").doc(uid).get()

      if (doc.exists) {
        return doc.data() as UserProfile
      }

      return null
    } catch (error: any) {
      console.error("Fehler beim Abrufen des Benutzerprofils:", error)
      throw error
    }
  },

  // Haushalt erstellen
  async createHousehold(name: string): Promise<string> {
    try {
      const user = this.getCurrentUser()

      if (!user) {
        throw new Error("Benutzer nicht angemeldet")
      }

      // Einladungscode generieren
      const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase()

      // Haushalt in Firestore erstellen
      const householdRef = await firestore()
        .collection("households")
        .add({
          name,
          ownerId: user.uid,
          members: [user.uid],
          inviteCodes: [inviteCode],
          createdAt: new Date(),
          isPremium: false,
        })

      // Benutzerprofil aktualisieren
      await firestore().collection("users").doc(user.uid).update({
        householdId: householdRef.id,
        role: "owner",
      })

      return householdRef.id
    } catch (error: any) {
      console.error("Fehler beim Erstellen des Haushalts:", error)
      throw error
    }
  },

  // Haushalt mit Einladungscode beitreten
  async joinHouseholdWithCode(inviteCode: string): Promise<boolean> {
    try {
      const user = this.getCurrentUser()

      if (!user) {
        throw new Error("Benutzer nicht angemeldet")
      }

      // Haushalt mit dem Einladungscode suchen
      const householdsSnapshot = await firestore()
        .collection("households")
        .where("inviteCodes", "array-contains", inviteCode)
        .limit(1)
        .get()

      if (householdsSnapshot.empty) {
        Alert.alert("Fehler", "Ungültiger Einladungscode")
        return false
      }

      const householdDoc = householdsSnapshot.docs[0]
      const household = householdDoc.data() as Household

      // Prüfen, ob der Benutzer bereits Mitglied ist
      if (household.members.includes(user.uid)) {
        Alert.alert("Information", "Du bist bereits Mitglied dieses Haushalts")
        return false
      }

      // Benutzer zum Haushalt hinzufügen
      await firestore()
        .collection("households")
        .doc(householdDoc.id)
        .update({
          members: [...household.members, user.uid],
        })

      // Benutzerprofil aktualisieren
      await firestore().collection("users").doc(user.uid).update({
        householdId: householdDoc.id,
        role: "member",
      })

      return true
    } catch (error: any) {
      console.error("Fehler beim Beitreten zum Haushalt:", error)
      throw error
    }
  },

  // Neuen Einladungscode generieren
  async generateNewInviteCode(householdId: string): Promise<string> {
    try {
      const user = this.getCurrentUser()

      if (!user) {
        throw new Error("Benutzer nicht angemeldet")
      }

      // Haushalt abrufen
      const householdDoc = await firestore().collection("households").doc(householdId).get()

      if (!householdDoc.exists) {
        throw new Error("Haushalt nicht gefunden")
      }

      const household = householdDoc.data() as Household

      // Prüfen, ob der Benutzer der Besitzer ist
      if (household.ownerId !== user.uid) {
        throw new Error("Nur der Besitzer kann neue Einladungscodes generieren")
      }

      // Neuen Einladungscode generieren
      const newInviteCode = Math.random().toString(36).substring(2, 10).toUpperCase()

      // Haushalt aktualisieren
      await firestore()
        .collection("households")
        .doc(householdId)
        .update({
          inviteCodes: [...household.inviteCodes, newInviteCode],
        })

      return newInviteCode
    } catch (error: any) {
      console.error("Fehler beim Generieren eines neuen Einladungscodes:", error)
      throw error
    }
  },

  // Haushalt verlassen
  async leaveHousehold(): Promise<void> {
    try {
      const user = this.getCurrentUser()

      if (!user) {
        throw new Error("Benutzer nicht angemeldet")
      }

      // Benutzerprofil abrufen
      const userProfile = await this.getUserProfile(user.uid)

      if (!userProfile || !userProfile.householdId) {
        throw new Error("Benutzer ist kein Mitglied eines Haushalts")
      }

      // Haushalt abrufen
      const householdDoc = await firestore().collection("households").doc(userProfile.householdId).get()

      if (!householdDoc.exists) {
        // Haushalt existiert nicht mehr, Benutzerprofil aktualisieren
        await firestore().collection("users").doc(user.uid).update({
          householdId: null,
          role: "owner",
        })
        return
      }

      const household = householdDoc.data() as Household

      // Prüfen, ob der Benutzer der Besitzer ist
      if (household.ownerId === user.uid) {
        // Wenn der Besitzer den Haushalt verlässt, wird der Haushalt gelöscht
        if (household.members.length > 1) {
          // Es gibt noch andere Mitglieder, einen neuen Besitzer bestimmen
          const newOwnerId = household.members.find((memberId) => memberId !== user.uid)!

          await firestore()
            .collection("households")
            .doc(userProfile.householdId)
            .update({
              ownerId: newOwnerId,
              members: household.members.filter((memberId) => memberId !== user.uid),
            })

          // Rolle des neuen Besitzers aktualisieren
          await firestore().collection("users").doc(newOwnerId).update({
            role: "owner",
          })
        } else {
          // Der Besitzer ist das einzige Mitglied, Haushalt löschen
          await firestore().collection("households").doc(userProfile.householdId).delete()
        }
      } else {
        // Benutzer ist ein normales Mitglied, aus der Mitgliederliste entfernen
        await firestore()
          .collection("households")
          .doc(userProfile.householdId)
          .update({
            members: household.members.filter((memberId) => memberId !== user.uid),
          })
      }

      // Benutzerprofil aktualisieren
      await firestore().collection("users").doc(user.uid).update({
        householdId: null,
        role: "owner",
      })
    } catch (error: any) {
      console.error("Fehler beim Verlassen des Haushalts:", error)
      throw error
    }
  },
}
