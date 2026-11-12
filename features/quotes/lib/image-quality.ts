/**
 * Client-side photo preparation for the quote uploader (Step 3). Runs entirely in
 * the browser: validates type/size, rejects very dark or blurry shots with a clear
 * retake message, then compresses to keep uploads small. HEIC/HEIF can't be decoded
 * to a canvas in most browsers, so we skip analysis for those and upload as-is
 * (Cloudinary transcodes them server-side).
 *
 * The brightness/blur checks are deliberately lenient heuristics — their job is to
 * catch obviously unusable photos, not to second-guess the AI grader (Step 4).
 */

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB
export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/heic", "image/heif"];
const MAX_DIMENSION = 1600;
const DARK_LUMA_THRESHOLD = 35; // mean luminance 0-255 below this = too dark
const BLUR_VARIANCE_THRESHOLD = 7; // Laplacian variance below this = too blurry

export type PreparedPhoto =
  | { ok: true; blob: Blob; width: number; height: number }
  | { ok: false; reason: string };

function isHeic(file: File): boolean {
  return /heic|heif/i.test(file.type) || /\.(heic|heif)$/i.test(file.name);
}

/** Mean luminance + a simple Laplacian-variance sharpness score on a 64px thumbnail. */
function analyze(bitmap: ImageBitmap): { luma: number; variance: number } | null {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(bitmap, 0, 0, size, size);
  const { data } = ctx.getImageData(0, 0, size, size);

  const gray = new Float64Array(size * size);
  let sum = 0;
  for (let i = 0; i < size * size; i++) {
    const r = data[i * 4] ?? 0;
    const g = data[i * 4 + 1] ?? 0;
    const b = data[i * 4 + 2] ?? 0;
    const y = 0.299 * r + 0.587 * g + 0.114 * b;
    gray[i] = y;
    sum += y;
  }
  const luma = sum / (size * size);

  // Laplacian (4-neighbour) variance — higher means sharper edges.
  let lapSum = 0;
  let lapSqSum = 0;
  let count = 0;
  for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) {
      const i = y * size + x;
      const lap =
        4 * (gray[i] ?? 0) -
        (gray[i - 1] ?? 0) -
        (gray[i + 1] ?? 0) -
        (gray[i - size] ?? 0) -
        (gray[i + size] ?? 0);
      lapSum += lap;
      lapSqSum += lap * lap;
      count++;
    }
  }
  const mean = lapSum / count;
  const variance = lapSqSum / count - mean * mean;
  return { luma, variance };
}

async function compress(bitmap: ImageBitmap): Promise<{ blob: Blob; width: number; height: number }> {
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(bitmap, 0, 0, width, height);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.82),
  );
  if (!blob) throw new Error("Could not compress image");
  return { blob, width, height };
}

export async function prepareQuotePhoto(file: File): Promise<PreparedPhoto> {
  if (!ACCEPTED_TYPES.includes(file.type) && !isHeic(file)) {
    return { ok: false, reason: "Use a JPG, PNG or HEIC image." };
  }

  // HEIC/HEIF: can't analyse or compress in-browser — enforce size and upload raw.
  if (isHeic(file)) {
    if (file.size > MAX_UPLOAD_BYTES) {
      return { ok: false, reason: "This photo is over 8 MB — please use a smaller one." };
    }
    return { ok: true, blob: file, width: 0, height: 0 };
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return { ok: false, reason: "We couldn't read that image. Please try another photo." };
  }

  try {
    const stats = analyze(bitmap);
    if (stats) {
      if (stats.luma < DARK_LUMA_THRESHOLD) {
        return {
          ok: false,
          reason: "This photo is too dark. Retake it in good light so the phone is clearly visible.",
        };
      }
      if (stats.variance < BLUR_VARIANCE_THRESHOLD) {
        return {
          ok: false,
          reason: "This photo looks blurry. Hold steady, tap to focus and retake it.",
        };
      }
    }

    const compressed = await compress(bitmap);
    if (compressed.blob.size > MAX_UPLOAD_BYTES) {
      return { ok: false, reason: "This photo is over 8 MB even after compression." };
    }
    return { ok: true, ...compressed };
  } finally {
    bitmap.close();
  }
}
