import { Suspense, lazy, useEffect, useState } from "react";
import { motion, MotionConfig, useReducedMotion } from "framer-motion";
import { Route, Routes, useLocation } from "react-router-dom";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import { ShopNoticeProvider } from "./context/ShopNotice.jsx";
import { EnquiryProvider } from "./context/EnquiryProvider.jsx";
import Home from "./pages/Home.jsx";

const AllProducts = lazy(() => import("./pages/AllProducts.jsx"));
const CategoryHub = lazy(() => import("./pages/CategoryHub.jsx"));
const BrandListing = lazy(() => import("./pages/BrandListing.jsx"));
const ProductDetail = lazy(() => import("./pages/ProductDetail.jsx"));
const Brands = lazy(() => import("./pages/Brands.jsx"));
const BrandPage = lazy(() => import("./pages/BrandPage.jsx"));
const Search = lazy(() => import("./pages/Search.jsx"));
const Enquiry = lazy(() => import("./pages/Enquiry.jsx"));
const About = lazy(() => import("./pages/About.jsx"));
const Contact = lazy(() => import("./pages/Contact.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));
const AdminApp = lazy(() => import("./pages/admin/AdminApp.jsx"));

export default function App() {
  const location = useLocation();
  const [motionPaused, setMotionPaused] = useState(false);
  const reducedMotion = useReducedMotion();
  const motionEnabled = !motionPaused && !reducedMotion;
  const toggleMotion = () => setMotionPaused((paused) => !paused);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  if (location.pathname.replace(/\/$/, "") === "/admin") {
    return <Suspense fallback={<RouteLoading />}><Routes><Route path="/admin" element={<AdminApp />} /></Routes></Suspense>;
  }

  return (
    <ShopNoticeProvider>
      <EnquiryProvider>
        <MotionConfig reducedMotion={motionEnabled ? "user" : "always"}>
          <div className="voltex-site flex min-h-screen flex-col bg-paper" data-motion={motionEnabled}>
            <a href="#main-content" className="skip-link">Skip to content</a>
            <Header motionEnabled={motionEnabled} toggleMotion={toggleMotion} reducedMotion={reducedMotion} />
            <main id="main-content" tabIndex={-1} className="flex-1">
              {/* A blank div during a lazy chunk load reads as the page
                  stalling; this bar gives the wait a shape instead. */}
              <Suspense fallback={<RouteLoading />}>
                {/* Keyed on the path so each navigation is a fresh mount —
                    a quiet fade-up rather than the previous page's content
                    just snapping to the next. No exit animation: with
                    lazy-loaded pages, waiting for one to finish leaving
                    before the next can even start loading would make
                    navigation feel slower, the opposite of the point. */}
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Routes location={location}>
                    <Route path="/" element={<Home motionEnabled={motionEnabled} />} />
                    <Route path="/products" element={<AllProducts />} />
                    <Route path="/c/:category" element={<CategoryHub />} />
                    <Route
                      path="/c/:category/:brandSlug"
                      element={<BrandListing />}
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
                </motion.div>
              </Suspense>
            </main>
            <Footer />
          </div>
        </MotionConfig>
      </EnquiryProvider>
    </ShopNoticeProvider>
  );
}

// Only shows up once per lazy chunk's first visit — the rest are cached.
// A thin amber sweep at the top of the page, same amber as the LED accents
// elsewhere, rather than a full-page spinner that would compete with it.
function RouteLoading() {
  return (
    <div className="relative h-1 min-h-[60vh] overflow-hidden">
      <motion.div
        className="absolute inset-y-0 left-0 w-1/3 bg-amber"
        initial={{ x: "-100%" }}
        animate={{ x: "300%" }}
        transition={{ duration: 1, ease: "easeInOut", repeat: Infinity }}
      />
    </div>
  );
}
