// iOS Safari ignores body{overflow:hidden} while a modal is open — the page
// behind it still scrolls/pans. Pinning the body with position:fixed at the
// current offset is the technique that actually holds; on unlock we restore
// the scroll position we pinned at.
import { useEffect } from "react";

export function useScrollLock(locked) {
  useEffect(() => {
    if (!locked) return undefined;
    const scrollY = window.scrollY;
    const { body } = document;
    const prev = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
    };
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    return () => {
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.left = prev.left;
      body.style.right = prev.right;
      body.style.width = prev.width;
      window.scrollTo(0, scrollY);
    };
  }, [locked]);
}
