import { createContext, useContext } from "react";

// The enquiry list stands in for a cart: no prices, no checkout, just the set
// of models a visitor wants a quote on. Persisted to localStorage so it
// survives a refresh; handed to the contact form at the end.
export const EnquiryContext = createContext({
  ids: [],
  items: [],
  count: 0,
  has: () => false,
  add: () => {},
  remove: () => {},
  toggle: () => {},
  clear: () => {},
});

export function useEnquiry() {
  return useContext(EnquiryContext);
}
