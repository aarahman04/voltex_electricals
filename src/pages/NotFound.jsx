import { Link } from "react-router-dom";
import { PUBLISHED, categoryPath } from "../data/taxonomy.js";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[640px] px-5 py-28 sm:px-8 sm:py-36">
      <span className="led" />
      <h1 className="nameplate mt-5 text-4xl text-ink sm:text-5xl">
        Nothing wired here
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">
        That page isn’t part of the catalogue. Head back and browse by category
        or brand.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/" className="switch-btn text-sm">
          Home
        </Link>
        {PUBLISHED.map((name) => (
          <Link
            key={name}
            to={categoryPath(name)}
            className="switch-btn switch-btn--ghost text-sm"
          >
            {name}
          </Link>
        ))}
      </div>
    </div>
  );
}
