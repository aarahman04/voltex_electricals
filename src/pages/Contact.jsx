import { useState } from "react";
import { Link } from "react-router-dom";
import { useShopNotice } from "../context/shopNotice.js";
import { useEnquiry } from "../context/enquiry.js";
import { displayTitle } from "../lib/specSummary.js";

export default function Contact() {
  const notify = useShopNotice();
  const { items } = useEnquiry();
  const [sent, setSent] = useState(false);

  const submit = (event) => {
    event.preventDefault();
    setSent(true);
    notify("This form is a preview — nothing was sent. Phone and email go here once the catalogue is public.");
  };

  return (
    <div className="mx-auto max-w-[760px] px-5 py-14 sm:px-8 sm:py-20">
      <p className="spec mb-4 text-amber">Contact</p>
      <h1 className="nameplate text-4xl text-ink sm:text-5xl">Ask for a price</h1>
      <p className="mt-6 max-w-md text-[15px] leading-relaxed text-ink-muted">
        Send the models you’re after and how many, and we’ll come back with a
        quote and availability.
      </p>

      {items.length > 0 && (
        <div className="mt-8 rounded-[12px] border border-seam bg-surface p-5">
          <p className="spec mb-3 text-ink-muted">
            Your enquiry list · {items.length}
          </p>
          <ul className="flex flex-col gap-1.5">
            {items.map((p) => (
              <li key={p.uid} className="flex justify-between gap-4 text-sm text-ink">
                <span className="truncate">{displayTitle(p)}</span>
                <span className="spec shrink-0 text-ink-muted">{p.brand}</span>
              </li>
            ))}
          </ul>
          <Link
            to="/enquiry"
            className="spec mt-3 inline-block text-ink-muted hover:text-amber"
          >
            Edit list →
          </Link>
        </div>
      )}

      <form onSubmit={submit} className="mt-12 flex flex-col gap-6">
        <Field id="name" label="Name">
          <input id="name" name="name" type="text" required className={inputClass} />
        </Field>
        <Field id="email" label="Email or phone">
          <input id="email" name="email" type="text" required className={inputClass} />
        </Field>
        <Field id="message" label="What are you after">
          <textarea
            id="message"
            name="message"
            rows={4}
            required
            defaultValue={
              items.length
                ? `Please quote:\n${items.map((p) => `- ${displayTitle(p)} (${p.brand})`).join("\n")}\n`
                : ""
            }
            placeholder="Model names, quantities, anything else"
            className={`${inputClass} resize-y`}
          />
        </Field>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <button type="submit" className="switch-btn">
            Send enquiry
          </button>
          <span className="spec text-ink-muted">
            {sent ? "Preview only — nothing was sent" : "Preview form"}
          </span>
        </div>
      </form>

      <p className="spec mt-12 text-ink-muted">
        Or just{" "}
        <Link
          to="/products"
          className="border-b border-seam pb-0.5 text-ink hover:border-amber hover:text-amber"
        >
          keep browsing →
        </Link>
      </p>
    </div>
  );
}

const inputClass =
  "w-full rounded-[8px] border border-seam bg-surface px-3.5 py-3 text-sm text-ink placeholder:text-ink-muted/60 focus:border-amber focus:outline-none";

function Field({ id, label, children }) {
  return (
    <div>
      <label htmlFor={id} className="spec mb-2 block text-ink-muted">
        {label}
      </label>
      {children}
    </div>
  );
}
