import { useState } from "react";
import ProductCard from "./ProductCard";
import { productsData } from "../data/products";

export default function SearchSection() {
    const [hasSearched, setHasSearched] = useState(false);
    const [inputValue, setInputValue] = useState("");

    const handleSearch = (e) => {
        if (e.key === "Enter" || e.type === "click") {
            if (inputValue.trim() !== "") {
                setHasSearched(true);
            }
        }
    };

    const handleClear = () => {
        setInputValue("");
        setHasSearched(false);
    };

    const handleTrendingClick = (term) => {
        setInputValue(term);
        setHasSearched(true);
    };

    return (
        // justify-center ve min-h-[80vh] kaldırıldı. Üstten sabit boşluk (pt-20) verildi.
        <main className="max-w-[1200px] mx-auto px-4 md:px-8 flex flex-col pt-16 md:pt-24 min-h-screen">

            {/* 1. HERO BAŞLIK (Artık hep sabit, zıplama yapmaz) */}
            <div className="mb-8 text-center z-10 relative">
                <h1 className="font-display-lg text-display-lg text-primary tracking-tight">SmartPrice</h1>
                <p className="font-body-md text-body-md text-on-surface-variant mt-2">Find the true cost before you buy.</p>
            </div>

            {/* 2. ARAMA ÇUBUĞU (Genişliği ve konumu hep sabit) */}
            <section className="w-full max-w-[600px] mx-auto flex flex-col gap-4 relative z-20">
                <div className="relative w-full">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
                    <input
                        className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface font-body-lg text-body-lg rounded-full py-4 pl-12 pr-12 shadow-[0px_2px_5px_rgba(0,0,0,0.1)] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder="Search for products to track..."
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleSearch}
                    />
                    {inputValue && (
                        <button
                            onClick={handleClear}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors cursor-pointer"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    )}
                </div>
            </section>

            {/* 3. İLK EKRAN: TRENDING VE BUTONLAR 
          (Arama yapılınca yumuşakça kapanır/gizlenir) */}
            <div
                className={`w-full max-w-[600px] mx-auto flex flex-col items-center overflow-hidden transition-all duration-500 ease-in-out ${hasSearched ? "max-h-0 opacity-0" : "max-h-[300px] opacity-100 mt-8"
                    }`}
            >
                <div className="flex justify-center gap-4 mb-8">
                    <button onClick={handleSearch} className="bg-surface-container text-on-surface font-label-sm text-label-sm px-6 py-2.5 rounded-DEFAULT hover:bg-surface-variant transition-colors cursor-pointer">
                        Search Prices
                    </button>
                </div>
                <div className="text-center">
                    <p className="font-caption text-caption text-on-surface-variant mb-3">Trending searches</p>
                    <div className="flex flex-wrap justify-center gap-2">
                        {["iPhone 15 Pro Max", "Sony WH-1000XM5", "Dyson V15 Detect"].map((item) => (
                            <span
                                key={item}
                                onClick={() => handleTrendingClick(item)}
                                className="bg-surface text-on-surface-variant font-caption text-caption px-3 py-1.5 rounded-full border border-surface-variant cursor-pointer hover:bg-surface-container transition-colors"
                            >
                                {item}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* 4. SONUÇ KARTLARI 
          (Arama yapılınca aşağıdan yukarı doğru yumuşakça (fade-in-up) açılır) */}
            <div
                className={`w-full transition-all duration-700 ease-in-out transform ${hasSearched
                    ? "opacity-100 translate-y-0 max-h-[5000px] mt-12 mb-24 visible"
                    : "opacity-0 translate-y-10 max-h-0 overflow-hidden mt-0 invisible"
                    }`}
            >
                {/* Filter & Result count header */}
                <div className="flex justify-between items-center px-2 mb-6">
                    <span className="font-body-md text-body-md text-on-surface-variant">
                        Showing {productsData.length} results for <span className="font-bold text-on-surface">"{inputValue}"</span>
                    </span>
                    <button className="flex items-center gap-2 text-primary font-label-sm text-label-sm hover:underline cursor-pointer">
                        <span className="material-symbols-outlined text-[18px]">filter_list</span> Filter
                    </button>
                </div>

                {/* Grid */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {productsData.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}

                    <div className="col-span-full flex justify-center mt-8">
                        <button className="bg-white border border-outline-variant text-on-surface hover:bg-surface-container px-8 py-3 rounded-full font-label-sm text-label-sm flex items-center gap-2 transition-colors shadow-sm cursor-pointer">
                            Load More Results <span className="material-symbols-outlined text-[18px]">expand_more</span>
                        </button>
                    </div>
                </section>
            </div>

        </main>
    );
}