import { useEffect, useId, useRef } from "react";
import Portal from "../../components/Portal.jsx";
import { useScrollLock } from "../../lib/useScrollLock.js";

export default function Sheet({ title, children, footer, onClose, busy = false }) {
  const ref = useRef(null);
  const headingId = useId();
  useScrollLock(true);
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement;
    dialog.showModal();
    return () => { dialog.close(); previous?.focus(); };
  }, []);
  return <Portal><dialog className="admin-sheet" ref={ref} aria-labelledby={headingId} onCancel={(e) => { e.preventDefault(); if (!busy) onClose(); }}>
    <header><div><p className="spec">Voltex admin</p><h2 id={headingId} className="nameplate">{title}</h2></div><button type="button" className="admin-button" aria-label="Close" disabled={busy} onClick={onClose}>×</button></header>
    <div className="admin-sheet-body">{children}</div>
    {footer && <footer>{footer}</footer>}
  </dialog></Portal>;
}
