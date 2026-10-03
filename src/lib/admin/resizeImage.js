import Compressor from "compressorjs";

// Tuning knobs. Change these and nothing else.
export const MAX_EDGE = 2000;                          // long edge in px
export const QUALITY_STEPS = [0.80, 0.74, 0.68, 0.60]; // tried in order until the photo fits
export const FALLBACK_EDGES = [1600, 1280, 1000];      // last resort, at the lowest quality
// api/admin.js rejects photos over 3,000,000 bytes (MAX_UPLOAD_BYTES) and bodies over 4.2 MB;
// base64 adds ~33%, so a 3,000,000 byte photo is ~4.0 MB on the wire. Keep these in step.
export const MAX_BYTES = 3_000_000;

const OPEN_ERROR = "This photo could not be opened. Take it again, or choose a JPEG or PNG photo.";
const TOO_BIG_ERROR = "This photo is too large to upload even after shrinking. Try a smaller photo.";
const NOT_WEBP_ERROR = "This browser can't prepare photos for upload. Update the browser or use Chrome, then try again.";
const GENERIC_ERROR = "Could not prepare this photo. Try a smaller image.";

function compress(file, options) {
  return new Promise((resolve, reject) => {
    new Compressor(file, {
      ...options,
      mimeType: "image/webp",
      checkOrientation: true, // respect EXIF rotation
      retainExif: false,      // strip camera metadata and GPS
      // strict hands back the untouched original when re-encoding would be bigger; that is only
      // safe when the type changes, otherwise the original (with EXIF and GPS) would go online.
      strict: file.type !== "image/webp",
      success: resolve,
      error: (err) => reject(new Error(/load|image|File or Blob/i.test(err?.message ?? "") ? OPEN_ERROR : GENERIC_ERROR)),
    });
  });
}

// RIFF....WEBP. Safari has historically answered a WebP request with a PNG, and the server
// rejects anything else, so check the bytes instead of trusting blob.type.
export async function isWebp(blob) {
  const b = new Uint8Array(await blob.slice(0, 12).arrayBuffer());
  return b.length === 12 && String.fromCharCode(...b.subarray(0, 4)) === "RIFF" && String.fromCharCode(...b.subarray(8, 12)) === "WEBP";
}

// Tries (max edge, quality) pairs from best to smallest and returns the first
// result that fits under maxBytes. `encode` is injected so this is testable.
export async function fitUnderCeiling(encode, { maxEdge = MAX_EDGE, qualities = QUALITY_STEPS, edges = FALLBACK_EDGES, maxBytes = MAX_BYTES } = {}) {
  const lowest = qualities[qualities.length - 1];
  const attempts = [...qualities.map((quality) => [maxEdge, quality]), ...edges.map((edge) => [edge, lowest])];
  for (const [edge, quality] of attempts) {
    const blob = await encode(edge, quality);
    if (blob.size <= maxBytes) return blob;
  }
  throw new Error(TOO_BIG_ERROR);
}

export function prepare(file, compressFn = compress) {
  return fitUnderCeiling(async (edge, quality) => {
    const out = await compressFn(file, { maxWidth: edge, maxHeight: edge, quality });
    if (!(await isWebp(out))) throw new Error(NOT_WEBP_ERROR);
    return out.type === "image/webp" ? out : new Blob([out], { type: "image/webp" });
  });
}

export const resizeImage = (file) => prepare(file);
