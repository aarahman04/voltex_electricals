import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import "./design-refresh.css";
import "./shoppable-hero.css";
import App from "./App.jsx";
import { catalog } from "./data/catalog.js";

async function start() {
  try {
    const response = await fetch(import.meta.env.DEV ? "/__curate?ids" : "/api/curation?ids", { cache: "no-store" });
    if (!response.ok) throw new Error(`Curation request failed: ${response.status}`);
    const { removed } = await response.json();
    const hidden = new Set((removed ?? []).map((item) => item.uid));
    catalog.splice(0, catalog.length, ...catalog.filter((product) => !hidden.has(product.uid)));
  } catch (error) {
    console.error("Could not load live curation", error);
  }

  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>,
  );
}

start();
