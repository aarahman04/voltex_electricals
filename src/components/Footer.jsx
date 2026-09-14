import { Link } from "react-router-dom";
import { getBrands, products } from "../data/products.js";
import { PUBLISHED, categoryList, categoryPath } from "../data/taxonomy.js";
import Lockup from "./Lockup.jsx";

const brands = getBrands();

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-seam bg-surface">
      <div className="mx-auto max-w-[1400px] px-5 py-14 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Link to="/" aria-label="Voltex Electricals, home">
              <Lockup className="text-lg" />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-muted">
              A multi-brand catalogue of {categoryList()}. Browse the full
              range, build an enquiry list, and we quote it.
            </p>
            <Link
              to="/enquiry"
              className="switch-btn mt-6 text-sm"
            >
              Start an enquiry
            </Link>
          </div>

          <FooterColumn title="Products">
            {PUBLISHED.map((name) => (
              <FooterLink key={name} to={categoryPath(name)}>
                {name}
              </FooterLink>
            ))}
            <FooterLink to="/products">All products</FooterLink>
            <FooterLink to="/brands">All brands</FooterLink>
          </FooterColumn>

          <FooterColumn title={`Brands · ${brands.length}`}>
            {brands.map((brand) => (
              <FooterLink key={brand.slug} to={`/brand/${brand.slug}`}>
                {brand.name}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="Company">
            <FooterLink to="/about">About</FooterLink>
            <FooterLink to="/contact">Contact</FooterLink>
            <FooterLink to="/enquiry">Enquiry list</FooterLink>
          </FooterColumn>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-seam pt-6 sm:flex-row sm:items-center sm:justify-between">
          <span className="spec text-ink-muted">
            {products.length} models · prices on enquiry
          </span>
          <span className="spec text-ink-muted/60">
            © {new Date().getFullYear()} Voltex Electricals
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }) {
  return (
    <div>
      <h3 className="spec mb-4 text-ink-muted">{title}</h3>
      <div className="flex flex-col gap-2.5">{children}</div>
    </div>
  );
}

function FooterLink({ to, children }) {
  return (
    <Link
      to={to}
      className="w-fit text-sm text-ink-muted transition-colors hover:text-ink"
    >
      {children}
    </Link>
  );
}
