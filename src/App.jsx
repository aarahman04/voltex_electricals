import { Suspense, lazy, useEffect } from "react";
import { MotionConfig } from "framer-motion";
import { Route, Routes, useLocation } from "react-router-dom";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import { ShopNoticeProvider } from "./context/ShopNotice.jsx";
import { EnquiryProvider } from "./context/EnquiryProvider.jsx";
import Home from "./pages/Home.jsx";

const AllProducts = lazy(() => import("./pages/AllProducts.jsx"));
const CategoryHub = lazy(() => import("./pages/CategoryHub.jsx"));
const CategoryListing = lazy(() => import("./pages/CategoryListing.jsx"));
const ProductDetail = lazy(() => import("./pages/ProductDetail.jsx"));
const Brands = lazy(() => import("./pages/Brands.jsx"));
const BrandPage = lazy(() => import("./pages/BrandPage.jsx"));
const Search = lazy(() => import("./pages/Search.jsx"));
const Enquiry = lazy(() => import("./pages/Enquiry.jsx"));
const About = lazy(() => import("./pages/About.jsx"));
const Contact = lazy(() => import("./pages/Contact.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

export default function App() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  return (
    <ShopNoticeProvider>
      <EnquiryProvider>
        <MotionConfig reducedMotion="user">
          <div className="flex min-h-screen flex-col bg-paper">
            <Header />
            <main className="flex-1">
              <Suspense fallback={<div className="min-h-[60vh]" />}>
                <Routes location={location}>
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<AllProducts />} />
                  <Route path="/c/:category" element={<CategoryHub />} />
                  <Route
                    path="/c/:category/:subcategory"
                    element={<CategoryListing />}
                  />
                  <Route path="/product/:uid" element={<ProductDetail />} />
                  <Route path="/brands" element={<Brands />} />
                  <Route path="/brand/:brandSlug" element={<BrandPage />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/enquiry" element={<Enquiry />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
          </div>
        </MotionConfig>
      </EnquiryProvider>
    </ShopNoticeProvider>
  );
}
