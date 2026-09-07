import { Suspense, lazy, useEffect } from "react";
import { MotionConfig } from "framer-motion";
import { Route, Routes, useLocation } from "react-router-dom";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import { ShopNoticeProvider } from "./context/ShopNotice.jsx";
import Home from "./pages/Home.jsx";

// Route-split so the homepage — cylinder hero included — isn't carrying the
// filter panel, gallery and brand pages in its initial payload.
const CategoryListing = lazy(() => import("./pages/CategoryListing.jsx"));
const ProductDetail = lazy(() => import("./pages/ProductDetail.jsx"));
const Brands = lazy(() => import("./pages/Brands.jsx"));
const BrandPage = lazy(() => import("./pages/BrandPage.jsx"));
const About = lazy(() => import("./pages/About.jsx"));
const Contact = lazy(() => import("./pages/Contact.jsx"));
const Cart = lazy(() => import("./pages/Cart.jsx"));

export default function App() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  return (
    <ShopNoticeProvider>
      <MotionConfig reducedMotion="user">
        <div className="flex min-h-screen flex-col overflow-x-clip bg-ground">
          <Header />
          <main className="flex-1">
            <Suspense fallback={<div className="min-h-[60vh]" />}>
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Home />} />
                <Route path="/category/:categoryName" element={<CategoryListing />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/brands" element={<Brands />} />
                <Route path="/brand/:brandSlug" element={<BrandPage />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/cart" element={<Cart />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </MotionConfig>
    </ShopNoticeProvider>
  );
}
