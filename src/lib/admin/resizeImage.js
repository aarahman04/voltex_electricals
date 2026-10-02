export async function resizeImage(file) {
  const image = await createImageBitmap(file, { imageOrientation: "from-image" });
  try {
    const scale = Math.min(1, 1600 / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
    const photo = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", 0.82));
    if (!photo || photo.type !== "image/webp" || photo.size > 3 * 1024 * 1024) {
      throw new Error("Could not prepare this photo. Try a smaller image.");
    }
    return photo;
  } finally { image.close(); }
}
