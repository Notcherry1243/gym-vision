// Downscales/re-encodes a photo client-side before upload. Vercel serverless
// functions hard-cap request bodies at 4.5MB, and full-resolution phone
// photos (often 3-8MB each) blow past that when multiple are uploaded
// together. The detection model also resizes everything to 640x640 anyway,
// so there's no accuracy loss from shrinking client-side first.
//
// Uses createImageBitmap with imageOrientation: "from-image" so EXIF
// rotation (phones store portrait photos as landscape pixels + a rotation
// tag) is actually applied to the pixels we draw — otherwise a canvas draw
// can silently produce a sideways/upside-down image that a detector can't
// recognize, even though it displays correctly in a normal <img> tag.
const MAX_DIMENSION = 1280;
const JPEG_QUALITY = 0.75;

async function drawToCanvas(source: CanvasImageSource, width: number, height: number): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(source, 0, 0, width, height);
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY));
}

function scaledDimensions(width: number, height: number): { width: number; height: number } {
  if (width <= MAX_DIMENSION && height <= MAX_DIMENSION) return { width, height };
  if (width > height) {
    return { width: MAX_DIMENSION, height: Math.round((height / width) * MAX_DIMENSION) };
  }
  return { width: Math.round((width / height) * MAX_DIMENSION), height: MAX_DIMENSION };
}

async function compressViaImageBitmap(file: File): Promise<File | null> {
  if (typeof createImageBitmap !== "function") return null;
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const { width, height } = scaledDimensions(bitmap.width, bitmap.height);
    const blob = await drawToCanvas(bitmap, width, height);
    bitmap.close();
    if (!blob) return null;
    return new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" });
  } catch {
    return null;
  }
}

function compressViaImageElement(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = async () => {
      URL.revokeObjectURL(objectUrl);
      const { width, height } = scaledDimensions(img.naturalWidth, img.naturalHeight);
      const blob = await drawToCanvas(img, width, height);
      if (!blob) {
        resolve(file);
        return;
      }
      resolve(new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" }));
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not load image for compression"));
    };

    img.src = objectUrl;
  });
}

export async function compressImage(file: File): Promise<File> {
  const viaBitmap = await compressViaImageBitmap(file);
  if (viaBitmap) return viaBitmap;
  // Fallback for browsers without createImageBitmap orientation support.
  return compressViaImageElement(file);
}
