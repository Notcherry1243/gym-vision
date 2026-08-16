import type { PhotoAsset } from "../services/apiClient";

export function PhotoThumbnailGrid({ photos }: { photos: PhotoAsset[] }) {
  if (photos.length === 0) return null;

  return (
    <div className="photo-grid">
      {photos.map((photo, index) => (
        <img key={photo.previewUrl + index} src={photo.previewUrl} className="photo-thumb" alt={`Gym photo ${index + 1}`} />
      ))}
    </div>
  );
}
