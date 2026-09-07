import { createContext, useContext } from "react";

// One channel for the whole shop to say "not yet". Cart and search are
// deliberately inert in this phase; every button that would act calls
// notify() instead, and the answer is always honest about what's missing.
export const ShopNoticeContext = createContext(() => {});

export function useShopNotice() {
  return useContext(ShopNoticeContext);
}
