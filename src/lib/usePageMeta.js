import { useEffect } from "react";

const SITE = "Voltex Electricals";

// Sets the document title and meta description for a page, and puts the
// previous values back when the page unmounts. index.html carries the defaults.
export function usePageMeta(title, description) {
  useEffect(() => {
    const meta = document.querySelector('meta[name="description"]');
    const previous = { title: document.title, description: meta?.getAttribute("content") };
    if (title) document.title = `${title} | ${SITE}`;
    if (description && meta) meta.setAttribute("content", description);
    return () => {
      document.title = previous.title;
      if (meta && previous.description != null) meta.setAttribute("content", previous.description);
    };
  }, [title, description]);
}
