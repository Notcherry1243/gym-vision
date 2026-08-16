import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingOverlay } from "../components/LoadingOverlay";
import { PhotoThumbnailGrid } from "../components/PhotoThumbnailGrid";
import { StepHeader } from "../components/StepHeader";
import { useAnalyzePhotos } from "../hooks/useAnalyzePhotos";
import type { PhotoAsset } from "../services/apiClient";
import { useSessionStore } from "../state/sessionStore";
import { compressImage } from "../utils/compressImage";

export function PhotoCapturePage() {
  const navigate = useNavigate();
  const photos = useSessionStore((s) => s.photos);
  const setPhotos = useSessionStore((s) => s.setPhotos);
  const { runAnalysis, loading, error } = useAnalyzePhotos();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const libraryInputRef = useRef<HTMLInputElement>(null);
  const [processingPhotos, setProcessingPhotos] = useState(false);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setProcessingPhotos(true);
    try {
      const compressed = await Promise.all(Array.from(fileList).map(compressImage));
      const newPhotos: PhotoAsset[] = compressed.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      }));
      setPhotos([...photos, ...newPhotos]);
    } finally {
      setProcessingPhotos(false);
    }
  }

  async function handleContinue() {
    if (photos.length === 0) {
      alert("Take or pick at least one photo of your gym equipment first.");
      return;
    }
    const ok = await runAnalysis();
    if (ok) navigate("/goal");
  }

  if (loading) return <LoadingOverlay label="Scanning your gym for equipment..." />;
  if (processingPhotos) return <LoadingOverlay label="Processing photos..." />;

  return (
    <>
      <StepHeader step={1} total={5} label="Snap your gym" />
      <h1>Take photos of your gym</h1>
      <p className="subtitle">
        Snap whatever equipment is around today — we'll build a routine from what's actually there.
      </p>

      {error && <p className="error-text">{error}</p>}

      {photos.length === 0 ? <div className="photo-placeholder">📷</div> : <PhotoThumbnailGrid photos={photos} />}

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden-file-input"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <input
        ref={libraryInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden-file-input"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div className="btn-row">
        <button className="btn-secondary" onClick={() => cameraInputRef.current?.click()}>
          Take Photo
        </button>
        <button className="btn-secondary alt" onClick={() => libraryInputRef.current?.click()}>
          Choose from Library
        </button>
      </div>

      <button className="btn-primary bottom-cta" onClick={handleContinue}>
        Analyze {photos.length > 0 ? `(${photos.length} photo${photos.length > 1 ? "s" : ""})` : ""}
      </button>
    </>
  );
}
