const endpoint = import.meta.env.DEV ? "/__admin" : "/api/admin";

export async function adminApi(action) {
  const response = await fetch(endpoint, {
    credentials: "same-origin",
    cache: "no-store",
    ...(action ? {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(action),
    } : {}),
  }).catch(() => { throw new Error("Could not connect. Check your signal and try again."); });
  const data = await response.json().catch(() => { throw new Error("Could not read the reply. Please try again."); });
  if (!response.ok) throw new Error(data.error || "Could not save. Please try again.");
  return data;
}

export async function uploadPhoto(photo) {
  if (typeof photo === "string") return photo;
  const data = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = () => reject(new Error("Could not read this photo. Choose it again."));
    reader.readAsDataURL(photo);
  });
  const { blobSha } = await adminApi({ type: "upload", data });
  return { blobSha };
}
