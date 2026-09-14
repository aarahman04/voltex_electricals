import { createPortal } from "react-dom";

// Renders into <body>, escaping every ancestor stacking and containing block.
//
// Both overlays live inside <header>, which carries backdrop-blur-md. A
// backdrop-filter makes that element the containing block for all of its
// position:fixed descendants — so `fixed inset-0` resolved against the 64px
// header box instead of the viewport, and the drawer opened as a clipped,
// see-through sliver. This is also why the overlays can now sit above Toast
// (z-[80]) without fighting the header's own z-40.
export default function Portal({ children }) {
  return createPortal(children, document.body);
}
