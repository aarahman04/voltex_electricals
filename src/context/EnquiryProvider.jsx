import { useCallback, useEffect, useMemo, useState } from "react";
import { getProductById } from "../data/products.js";
import { EnquiryContext } from "./enquiry.js";

const KEY = "voltex:enquiry";

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export function EnquiryProvider({ children }) {
  const [ids, setIds] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(ids));
    } catch {
      /* private mode — the list just won't persist */
    }
  }, [ids]);

  const has = useCallback((uid) => ids.includes(uid), [ids]);

  const add = useCallback(
    (uid) => setIds((prev) => (prev.includes(uid) ? prev : [...prev, uid])),
    [],
  );
  const remove = useCallback(
    (uid) => setIds((prev) => prev.filter((v) => v !== uid)),
    [],
  );
  const toggle = useCallback(
    (uid) =>
      setIds((prev) =>
        prev.includes(uid) ? prev.filter((v) => v !== uid) : [...prev, uid],
      ),
    [],
  );
  const clear = useCallback(() => setIds([]), []);

  const value = useMemo(() => {
    const items = ids.map(getProductById).filter(Boolean);
    return { ids, items, count: items.length, has, add, remove, toggle, clear };
  }, [ids, has, add, remove, toggle, clear]);

  return (
    <EnquiryContext.Provider value={value}>{children}</EnquiryContext.Provider>
  );
}
