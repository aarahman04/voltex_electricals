import { useEffect, useState } from "react";

// Returns `value`, but only after it's stopped changing for `delay` ms.
// Used to keep an expensive recompute (e.g. re-filtering the whole product
// list) from running on every keystroke while the input itself stays
// perfectly responsive (it's bound to the un-debounced value).
export function useDebouncedValue(value, delay = 200) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
