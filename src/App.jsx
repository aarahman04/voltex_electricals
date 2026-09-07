import { useEffect } from "react";
import { MotionConfig } from "framer-motion";
import { Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import CategoryListing from "./pages/CategoryListing.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";

export default function App() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen overflow-x-clip bg-ground">
        <Navbar />
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/category/:categoryName" element={<CategoryListing />} />
          <Route path="/product/:id" element={<ProductDetail />} />
        </Routes>
      </div>
    </MotionConfig>
  );
}
