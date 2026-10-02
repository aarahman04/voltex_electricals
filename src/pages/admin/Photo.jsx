import { useEffect, useState } from "react";
import { cdnImage } from "../../lib/image.js";

export default function Photo({ photo, alt = "" }) {
  const [source, setSource] = useState("");
  useEffect(() => {
    const url = photo instanceof Blob ? URL.createObjectURL(photo) : cdnImage(photo, 240);
    // This effect owns the browser URL; recreate it after StrictMode cleanup.
    // oxlint-disable-next-line react/set-state-in-effect
    setSource(url);
    return () => { if (photo instanceof Blob) URL.revokeObjectURL(url); };
  }, [photo]);
  return <PhotoImage key={source} source={source} alt={alt} />;
}

function PhotoImage({ source, alt }) {
  const [failed, setFailed] = useState(false);
  return source && !failed ? <img src={source} alt={alt} loading="lazy" onError={() => setFailed(true)} /> : <span className="admin-photo-empty">Photo unavailable</span>;
}
