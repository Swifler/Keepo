"use client"

import { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native"
import { Camera } from "expo-camera"
import { manipulateAsync, SaveFormat } from "expo-image-manipulator"
import { BarCodeScanner } from "expo-barcode-scanner"
import BottomSheet from "@gorhom/bottom-sheet"
import { useTranslation } from "react-i18next"
import { useTheme } from "../contexts/ThemeContext"
import { useGemini } from "../hooks/useGemini"
import { useInventory } from "../hooks/useInventory"
import { barcodeService } from "../services/barcode"
import RecognizedItemsList from "../components/RecognizedItemsList"
import ManualItemEntry from "../components/ManualItemEntry"
import { Camera as CameraIcon, Barcode, Edit, X } from "lucide-react-native"
import type { DetectedItem } from "../types"

enum CameraMode {
  PHOTO = "photo",
  BARCODE = "barcode",
  MANUAL = "manual",
}

export default function CameraScreen() {
  const { t } = useTranslation()
  const { colors } = useTheme()
  const { analyzeImage } = useGemini()
  const { addItems, addItem } = useInventory()

  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [recognizedItems, setRecognizedItems] = useState<DetectedItem[]>([])
  const [cameraMode, setCameraMode] = useState<CameraMode>(CameraMode.PHOTO)
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null)
  const [isBarcodeProcessing, setIsBarcodeProcessing] = useState(false)
  const [manualEntryVisible, setManualEntryVisible] = useState(false)

  const cameraRef = useRef<Camera>(null)
  const bottomSheetRef = useRef<BottomSheet>(null)

  // Kamera- und Barcode-Scanner-Berechtigungen anfordern
  useEffect(() => {
    ;(async () => {
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync()
      const { status: barcodeStatus } = await BarCodeScanner.requestPermissionsAsync()
      setHasPermission(cameraStatus === "granted" && barcodeStatus === "granted")
    })()
  }, [])

  // Barcode-Scan-Handler
  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (isBarcodeProcessing || !data) return

    setIsBarcodeProcessing(true)
    setScannedBarcode(data)

    try {
      // Barcode validieren
      if (!barcodeService.validateBarcode(data)) {
        alert(t("camera.invalidBarcode"))
        setScannedBarcode(null)
        setIsBarcodeProcessing(false)
        return
      }

      // Produkt in der Datenbank suchen
      const product = await barcodeService.lookupBarcode(data)

      if (product) {
        // Produkt gefunden, zur Bestätigung anzeigen
        setRecognizedItems([product])
        bottomSheetRef.current?.expand()
      } else {
        // Produkt nicht gefunden, manuelle Eingabe anzeigen
        setManualEntryVisible(true)
      }
    } catch (error) {
      console.error("Fehler beim Verarbeiten des Barcodes:", error)
      alert(t("camera.barcodeError"))
    } finally {
      setIsBarcodeProcessing(false)
    }
  }

  // Foto aufnehmen
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync()

        // Bild komprimieren für schnellere Übertragung
        const manipulatedImage = await manipulateAsync(photo.uri, [{ resize: { width: 800 } }], {
          compress: 0.7,
          format: SaveFormat.JPEG,
        })

        setCapturedImage(manipulatedImage.uri)
        analyzeImageWithGemini(manipulatedImage.uri)
      } catch (error) {
        console.error("Fehler beim Aufnehmen des Fotos:", error)
      }
    }
  }

  // Bild mit Gemini Vision analysieren
  const analyzeImageWithGemini = async (imageUri: string) => {
    setIsAnalyzing(true)
    try {
      const items = await analyzeImage(imageUri)
      setRecognizedItems(items)
      bottomSheetRef.current?.expand()
    } catch (error) {
      console.error("Fehler bei der Bildanalyse:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Erkannte Elemente in Firestore speichern
  const saveItemsToInventory = async () => {
    try {
      await addItems(recognizedItems)
      // Zurücksetzen und BottomSheet schließen
      setCapturedImage(null)
      setRecognizedItems([])
      bottomSheetRef.current?.close()
      setScannedBarcode(null)
    } catch (error) {
      console.error("Fehler beim Speichern der Elemente:", error)
    }
  }

  // Manuell eingegebenes Element speichern
  const saveManualItem = async (item: DetectedItem) => {
    try {
      await addItem(item)
      setManualEntryVisible(false)
      setScannedBarcode(null)
    } catch (error) {
      console.error("Fehler beim Speichern des Elements:", error)
    }
  }

  // Neues Foto aufnehmen
  const retakePicture = () => {
    setCapturedImage(null)
    setRecognizedItems([])
  }

  // Kamera-Modus wechseln
  const switchCameraMode = (mode: CameraMode) => {
    setCameraMode(mode)
    if (mode === CameraMode.MANUAL) {
      setManualEntryVisible(true)
    } else {
      setManualEntryVisible(false)
    }
  }

  if (hasPermission === null) {
    return <View style={styles.container} />
  }

  if (hasPermission === false) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.text, { color: colors.text }]}>{t("camera.noAccess")}</Text>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {capturedImage ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedImage }} style={styles.preview} />

          {isAnalyzing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.text }]}>{t("camera.analyzing")}</Text>
            </View>
          ) : (
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={[styles.button, { backgroundColor: colors.error }]} onPress={retakePicture}>
                <Text style={styles.buttonText}>{t("camera.retake")}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.cameraContainer}>
          {cameraMode === CameraMode.PHOTO && (
            <Camera style={styles.camera} ref={cameraRef}>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.captureButton, { backgroundColor: colors.primary }]}
                  onPress={takePicture}
                />
              </View>
            </Camera>
          )}

          {cameraMode === CameraMode.BARCODE && (
            <BarCodeScanner onBarCodeScanned={scannedBarcode ? undefined : handleBarCodeScanned} style={styles.camera}>
              <View style={styles.barcodeOverlay}>
                <View style={styles.barcodeTargetContainer}>
                  <View style={[styles.barcodeTarget, { borderColor: colors.primary }]} />
                  {scannedBarcode && (
                    <View style={[styles.scannedBarcodeContainer, { backgroundColor: colors.cardBackground }]}>
                      <Text style={[styles.scannedBarcodeText, { color: colors.text }]}>{scannedBarcode}</Text>
                      {isBarcodeProcessing && <ActivityIndicator size="small" color={colors.primary} />}
                    </View>
                  )}
                </View>
              </View>
            </BarCodeScanner>
          )}

          <View style={styles.cameraModeContainer}>
            <TouchableOpacity
              style={[
                styles.cameraModeButton,
                cameraMode === CameraMode.PHOTO && { backgroundColor: colors.primary },
                cameraMode !== CameraMode.PHOTO && { backgroundColor: colors.cardBackground },
              ]}
              onPress={() => switchCameraMode(CameraMode.PHOTO)}
            >
              <CameraIcon size={24} color={cameraMode === CameraMode.PHOTO ? "white" : colors.text} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.cameraModeButton,
                cameraMode === CameraMode.BARCODE && { backgroundColor: colors.primary },
                cameraMode !== CameraMode.BARCODE && { backgroundColor: colors.cardBackground },
              ]}
              onPress={() => switchCameraMode(CameraMode.BARCODE)}
            >
              <Barcode size={24} color={cameraMode === CameraMode.BARCODE ? "white" : colors.text} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.cameraModeButton,
                cameraMode === CameraMode.MANUAL && { backgroundColor: colors.primary },
                cameraMode !== CameraMode.MANUAL && { backgroundColor: colors.cardBackground },
              ]}
              onPress={() => switchCameraMode(CameraMode.MANUAL)}
            >
              <Edit size={24} color={cameraMode === CameraMode.MANUAL ? "white" : colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={["70%"]}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: colors.cardBackground }}
      >
        <View style={styles.bottomSheetContent}>
          <Text style={[styles.bottomSheetTitle, { color: colors.text }]}>{t("camera.recognizedItems")}</Text>

          <RecognizedItemsList items={recognizedItems} onItemsChange={setRecognizedItems} />

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            onPress={saveItemsToInventory}
          >
            <Text style={styles.buttonText}>{t("actions.save")}</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      <Modal
        visible={manualEntryVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setManualEntryVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t("camera.manualEntry")}</Text>
              <TouchableOpacity onPress={() => setManualEntryVisible(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ManualItemEntry
              barcode={scannedBarcode}
              onSave={saveManualItem}
              onCancel={() => setManualEntryVisible(false)}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cameraContainer: {
    flex: 1,
    position: "relative",
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: "transparent",
    flexDirection: "row",
    justifyContent: "center",
    margin: 20,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 5,
    borderColor: "white",
  },
  text: {
    fontSize: 18,
    textAlign: "center",
    margin: 20,
  },
  previewContainer: {
    flex: 1,
    justifyContent: "center",
  },
  preview: {
    flex: 1,
  },
  button: {
    padding: 15,
    borderRadius: 16,
    margin: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "600",
  },
  bottomSheetContent: {
    flex: 1,
    padding: 16,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  saveButton: {
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 16,
  },
  cameraModeContainer: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  cameraModeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  barcodeOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  barcodeTargetContainer: {
    alignItems: "center",
  },
  barcodeTarget: {
    width: 250,
    height: 100,
    borderWidth: 2,
    borderRadius: 10,
    borderStyle: "dashed",
  },
  scannedBarcodeContainer: {
    marginTop: 20,
    padding: 10,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  scannedBarcodeText: {
    fontSize: 16,
    marginRight: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
})
