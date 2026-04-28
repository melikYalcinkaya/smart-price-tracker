import Hero from "./components/Hero";
import Footer from "./components/Footer";
import MobileNav from "./components/MobileNav";

function App() {
  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-screen flex flex-col font-body-md text-body-md selection:bg-primary-container selection:text-on-primary-container">
      {/* İsteğine göre Header (üst navbar) çıkarıldı */}

      <Hero />
      <Footer />
      <MobileNav />
    </div>
  );
}

export default App;