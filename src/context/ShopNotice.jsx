import { useCallback, useEffect, useRef, useState } from "react";
import Toast from "../components/Toast.jsx";
import { ShopNoticeContext } from "./shopNotice.js";

export function ShopNoticeProvider({ children }) {
  const [notice, setNotice] = useState(null);
  const timer = useRef(null);

  const dismiss = useCallback(() => setNotice(null), []);

  const notify = useCallback((message) => {
    setNotice({ message, id: Date.now() });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setNotice(null), 4000);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <ShopNoticeContext.Provider value={notify}>
      {children}
      <Toast notice={notice} onDismiss={dismiss} />
    </ShopNoticeContext.Provider>
  );
}
