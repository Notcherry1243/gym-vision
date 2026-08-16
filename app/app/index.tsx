import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { PhotoThumbnailGrid } from "../src/components/PhotoThumbnailGrid";
import { LoadingOverlay } from "../src/components/LoadingOverlay";
import { useAnalyzePhotos } from "../src/hooks/useAnalyzePhotos";
import { useSessionStore } from "../src/state/sessionStore";
import type { PhotoAsset } from "../src/services/apiClient";

export default function PhotoCaptureScreen() {
  const router = useRouter();
  const photos = useSessionStore((s) => s.photos);
  const setPhotos = useSessionStore((s) => s.setPhotos);
  const { runAnalysis, loading, error } = useAnalyzePhotos();
  const [permissionError, setPermissionError] = useState<string | null>(null);

  async function takePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setPermissionError("Camera permission is required to photograph your gym.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 0.6 });
    if (!result.canceled && result.assets.length > 0) {
      appendPhotos(result.assets);
    }
  }

  async function pickFromLibrary() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setPermissionError("Photo library permission is required.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: 10,
      quality: 0.6,
    });
    if (!result.canceled && result.assets.length > 0) {
      appendPhotos(result.assets);
    }
  }

  function appendPhotos(assets: ImagePicker.ImagePickerAsset[]) {
    const newPhotos: PhotoAsset[] = assets.map((a) => ({
      uri: a.uri,
      fileName: a.fileName,
      mimeType: a.mimeType,
    }));
    setPhotos([...photos, ...newPhotos]);
  }

  async function handleContinue() {
    if (photos.length === 0) {
      Alert.alert("Add at least one photo", "Take or pick a photo of your gym equipment first.");
      return;
    }
    const ok = await runAnalysis();
    if (ok) router.push("/goal");
  }

  if (loading) return <LoadingOverlay label="Scanning your gym for equipment..." />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Take photos of your gym</Text>
      <Text style={styles.subtitle}>
        Snap whatever equipment is around today — we'll build a routine from what's actually there.
      </Text>

      {permissionError && <Text style={styles.error}>{permissionError}</Text>}
      {error && <Text style={styles.error}>{error}</Text>}

      <PhotoThumbnailGrid photos={photos} />

      <View style={styles.buttonRow}>
        <Pressable style={styles.button} onPress={takePhoto}>
          <Text style={styles.buttonText}>Take Photo</Text>
        </Pressable>
        <Pressable style={[styles.button, styles.buttonSecondary]} onPress={pickFromLibrary}>
          <Text style={styles.buttonText}>Choose from Library</Text>
        </Pressable>
      </View>

      <Pressable style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueButtonText}>
          Analyze {photos.length > 0 ? `(${photos.length} photo${photos.length > 1 ? "s" : ""})` : ""}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 16 },
  title: { fontSize: 22, fontWeight: "700" },
  subtitle: { color: "#6B7280" },
  error: { color: "#DC2626" },
  buttonRow: { flexDirection: "row", gap: 12 },
  button: { flex: 1, backgroundColor: "#111827", padding: 14, borderRadius: 10, alignItems: "center" },
  buttonSecondary: { backgroundColor: "#374151" },
  buttonText: { color: "#FFFFFF", fontWeight: "600" },
  continueButton: { backgroundColor: "#22C55E", padding: 16, borderRadius: 10, alignItems: "center", marginTop: 8 },
  continueButtonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 16 },
});
