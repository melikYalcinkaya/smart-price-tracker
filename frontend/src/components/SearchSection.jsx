import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { fetchProducts, mapProduct } from "../services/api";

export default function SearchSection() {
    const [hasSearched, setHasSearched] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);

    // İlk yüklemede tüm ürünleri getir
    useEffect(() => {
        setLoading(true);
        fetchProducts({ limit: 50 })
            .then((res) => {
                setProducts(res.data.map(mapProduct));
                setTotal(res.total);
            })
            .catch((err) => console.error("API hatası:", err))
            .finally(() => setLoading(false));
    }, []);

    const handleSearch = (e) => {
        if (e.key === "Enter" || e.type === "click") {
            if (inputValue.trim() !== "") {
                setHasSearched(true);
                setLoading(true);
                fetchProducts({ search: inputValue.trim(), limit: 50 })
                    .then((res) => {
                        setProducts(res.data.map(mapProduct));
                        setTotal(res.total);
                    })
                    .catch((err) => console.error("API hatası:", err))
                    .finally(() => setLoading(false));
            }
        }
    };

    const handleClear = () => {
        setInputValue("");
        setHasSearched(false);
        // Temizleyince tüm ürünleri tekrar yükle
        setLoading(true);
        fetchProducts({ limit: 50 })
            .then((res) => {
                setProducts(res.data.map(mapProduct));
                setTotal(res.total);
            })
            .catch((err) => console.error("API hatası:", err))
            .finally(() => setLoading(false));
    };

    const handleTrendingClick = (term) => {
        setInputValue(term);
        setHasSearched(true);
        setLoading(true);
        fetchProducts({ search: term, limit: 50 })
            .then((res) => {
                setProducts(res.data.map(mapProduct));
                setTotal(res.total);
            })
            .catch((err) => console.error("API hatası:", err))
            .finally(() => setLoading(false));
    };

    return (
        <main className="max-w-[1200px] mx-auto px-4 md:px-8 flex flex-col pt-16 md:pt-24 min-h-screen">

            {/* 1. HERO BAŞLIK */}
            <div className="mb-8 text-center z-10 relative">
                <h1 className="font-display-lg text-display-lg text-primary tracking-tight">SmartPrice</h1>
                <p className="font-body-md text-body-md text-on-surface-variant mt-2">Find the true cost before you buy.</p>
            </div>

            {/* 2. ARAMA ÇUBUĞU */}
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

            {/* 3. İLK EKRAN: TRENDING VE BUTONLAR */}
            <div
                className={`w-full max-w-[600px] mx-auto flex flex-col items-center overflow-hidden transition-all duration-500 ease-in-out ${
                    hasSearched ? "max-h-0 opacity-0" : "max-h-[300px] opacity-100 mt-8"
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
                        {["iPhone", "Samsung", "MacBook", "Lenovo"].map((item) => (
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

            {/* 4. SONUÇ KARTLARI */}
            <div
                className={`w-full transition-all duration-700 ease-in-out transform ${
                    hasSearched
                        ? "opacity-100 translate-y-0 max-h-[5000px] mt-12 mb-24 visible"
                        : "opacity-0 translate-y-10 max-h-0 overflow-hidden mt-0 invisible"
                }`}
            >
                <div className="flex justify-between items-center px-2 mb-6">
                    <span className="font-body-md text-body-md text-on-surface-variant">
                        {total > 0 ? (
                            <>Showing {products.length} of {total} results {inputValue && <><span className="text-on-surface">for </span><span className="font-bold text-on-surface">"{inputValue}"</span></>}</>
                        ) : (
                            "No results found"
                        )}
                    </span>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
                    </div>
                ) : (
                    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </section>
                )}
            </div>

            {/* 5. VARSAYILAN ÜRÜN LİSTESİ (arama yapılmamışken) */}
            <div className={`mt-12 mb-24 ${hasSearched ? "hidden" : ""}`}>
                <h2 className="font-headline-md text-headline-md text-on-surface mb-6 text-center">Latest Tracked Products</h2>
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
                    </div>
                ) : (
                    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </section>
                )}
            </div>

        </main>
    );
}
