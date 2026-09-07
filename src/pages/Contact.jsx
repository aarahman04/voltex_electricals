import { useState } from "react";
import { Link } from "react-router-dom";
import { useShopNotice } from "../context/shopNotice.js";

export default function Contact() {
  const notify = useShopNotice();
  const [sent, setSent] = useState(false);

  const submit = (event) => {
    event.preventDefault();
    setSent(true);
    notify("Enquiries aren't wired up yet. Your message wasn't sent — this form is a preview.");
  };

  return (
    <div className="mx-auto max-w-[760px] px-5 py-14 sm:px-8 sm:py-20">
      <p className="spec mb-4 text-filament">Contact</p>
      <h1 className="nameplate text-4xl text-ivory sm:text-5xl">
        Ask for a price
      </h1>
      <p className="mt-6 max-w-md text-[15px] leading-relaxed text-ivory/80">
        Found what you need? Send the model and how many, and we'll come back
        with a quote and availability. Phone and address go here once the
        catalogue is public.
      </p>

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
            placeholder="Model names, quantities, anything else"
            className={`${inputClass} resize-y`}
          />
        </Field>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <button
            type="submit"
            className="rounded-[3px] bg-filament px-7 py-3 text-sm font-semibold text-ground-deep transition-colors hover:bg-filament/85"
          >
            Send enquiry
          </button>
          <span className="spec text-muted">
            {sent ? "Preview only — nothing was sent" : "Preview form"}
          </span>
        </div>
      </form>

      <p className="mt-12 spec text-muted">
        Or just{" "}
        <Link to="/category/Fans" className="border-b border-conduit pb-0.5 text-ivory hover:border-filament hover:text-filament">
          keep browsing →
        </Link>
      </p>
    </div>
  );
}

const inputClass =
  "w-full rounded-[3px] border border-conduit bg-ground-deep px-3.5 py-3 text-sm text-ivory placeholder:text-muted/60 focus:border-filament focus:outline-none";

function Field({ id, label, children }) {
  return (
    <div>
      <label htmlFor={id} className="spec mb-2 block text-muted">
        {label}
      </label>
      {children}
    </div>
  );
}
