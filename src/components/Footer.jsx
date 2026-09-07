import { Link } from "react-router-dom";
import {
  getBrands,
  getCategories,
  products,
} from "../data/products.js";

const categories = getCategories();
const brands = getBrands();
const stocked = brands.filter((b) => b.status === "stocked");

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-conduit">
      <div className="mx-auto max-w-[1400px] px-5 py-14 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link to="/" aria-label="Voltex Electricals, home">
              <span className="flex items-baseline gap-[0.4em]">
                <span className="nameplate text-lg text-ivory">Voltex</span>
                <span className="nameplate-sub text-lg text-muted">Electricals</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              A browsing catalogue of fans and lighting from the brands we
              carry. Prices are quoted on enquiry.
            </p>
          </div>

          <FooterColumn title="Catalogue">
            {categories.map((name) => (
              <FooterLink key={name} to={`/category/${name}`}>
                {name}
              </FooterLink>
            ))}
            <FooterLink to="/brands">All brands</FooterLink>
          </FooterColumn>

          <FooterColumn title={`Brands · ${brands.length}`}>
            {stocked.map((brand) => (
              <FooterLink key={brand.slug} to={`/brand/${brand.slug}`}>
                {brand.name}
              </FooterLink>
            ))}
            <span className="spec text-[10px] text-muted/60">
              {brands.length - stocked.length} more coming soon
            </span>
          </FooterColumn>

          <FooterColumn title="Company">
            <FooterLink to="/about">About</FooterLink>
            <FooterLink to="/contact">Contact</FooterLink>
            <FooterLink to="/cart">Cart</FooterLink>
          </FooterColumn>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-conduit pt-6 sm:flex-row sm:items-center sm:justify-between">
          <span className="spec text-muted">
            Catalogue prototype · {products.length} models · Prices on enquiry
          </span>
          <span className="spec text-muted/60">
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
      <h3 className="spec mb-4 text-muted">{title}</h3>
      <div className="flex flex-col gap-2.5">{children}</div>
    </div>
  );
}

function FooterLink({ to, children }) {
  return (
    <Link
      to={to}
      className="w-fit text-sm text-ivory/80 transition-colors hover:text-filament"
    >
      {children}
    </Link>
  );
}
