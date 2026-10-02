import { useState } from "react";
import Sheet from "./Sheet.jsx";

export function useConfirm() {
  const [pending, setPending] = useState(null);
  function finish(answer) {
    pending.resolve(answer);
    setPending(null);
  }
  return {
    confirm: (message) => new Promise((resolve) => setPending({ message, resolve })),
    confirmation: pending && <Sheet title="Please confirm" onClose={() => finish(false)} footer={<><button className="admin-button" onClick={() => finish(false)}>Cancel</button><button className="switch-btn" onClick={() => finish(true)}>Confirm</button></>}><p>{pending.message}</p></Sheet>,
  };
}
