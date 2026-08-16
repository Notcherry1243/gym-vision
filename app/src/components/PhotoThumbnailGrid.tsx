import { Image, StyleSheet, View } from "react-native";
import type { PhotoAsset } from "../services/apiClient";

export function PhotoThumbnailGrid({ photos }: { photos: PhotoAsset[] }) {
  if (photos.length === 0) return null;

  return (
    <View style={styles.grid}>
      {photos.map((photo, index) => (
        <Image key={photo.uri + index} source={{ uri: photo.uri }} style={styles.thumb} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  thumb: { width: 90, height: 90, borderRadius: 8, backgroundColor: "#E5E7EB" },
});
