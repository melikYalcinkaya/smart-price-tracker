import { BrowserRouter, Routes, Route } from "react-router-dom";
import SearchSection from "./components/SearchSection";
import ProductDetails from "./pages/ProductDetails";
import MobileNav from "./components/MobileNav";

function App() {
  return (
    <BrowserRouter>
      <div className="bg-surface text-on-background min-h-screen pb-20 md:pb-0 font-body-md selection:bg-primary-container selection:text-on-primary-container">

        {/* Router (Sayfa Geçişleri) */}
        <Routes>
          {/* Ana Sayfa (Arama Ekranı) */}
          <Route path="/" element={<SearchSection />} />

          {/* Ürün Detay Sayfası (:id parametresi ile) */}
          <Route path="/product/:id" element={<ProductDetails />} />
        </Routes>

        {/* Mobile Navigation (Her sayfada sabit kalır) */}
        <MobileNav />
      </div>
    </BrowserRouter>
  );
}

export default App;