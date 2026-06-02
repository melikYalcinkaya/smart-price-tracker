import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { fetchProductById, fetchProductPriceHistory, mapProduct } from "../services/api";

export default function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [priceHistory, setPriceHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);

        Promise.all([
            fetchProductById(id),
            fetchProductPriceHistory(id),
        ])
            .then(([productRes, historyRes]) => {
                if (productRes.success) {
                    setProduct(mapProduct(productRes.data));
                } else {
                    setError("Ürün bulunamadı");
                }
                if (historyRes.success) {
                    setPriceHistory(historyRes.data.history || []);
                }
            })
            .catch((err) => setError("API bağlantı hatası: " + err.message))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 md:px-12 py-8 pt-20 md:pt-24 min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            </main>
        );
    }

    if (error || !product) {
        return (
            <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 md:px-12 py-8 pt-20 md:pt-24 min-h-screen flex flex-col items-center justify-center gap-4">
                <span className="material-symbols-outlined text-[64px] text-outline">error_outline</span>
                <p className="font-body-lg text-on-surface-variant">{error || "Ürün bulunamadı"}</p>
                <button onClick={() => navigate("/")} className="text-primary hover:underline cursor-pointer">Ana sayfaya dön</button>
            </main>
        );
    }

    const basePrice = product.originalPrice || 0;
    const currentPrice = product.currentPrice || basePrice;
    const priceDiff = basePrice - currentPrice;
    const priceDiffPercent = basePrice ? Math.round((priceDiff / basePrice) * 100) : 0;
    const isDrop = priceDiff > 0;
    const isUp = priceDiff < 0;

    // Grafik için fiyat verileri
    const chartPrices = priceHistory.length > 0
        ? priceHistory.slice(0, 20).reverse()
        : [];

    const allPrices = chartPrices.map((h) => parseFloat(h.current_price) || 0);
    const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : currentPrice;
    const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : currentPrice;
    const priceRange = maxPrice - minPrice || 1;

    return (
        <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 md:px-12 py-8 pb-[100px] md:pb-8 pt-20 md:pt-24 min-h-screen">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-outline font-caption text-caption mb-4">
                <button
                    onClick={() => navigate("/")}
                    className="hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
                >
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    Back to Search
                </button>
                <span>/</span>
                <span className="capitalize">{product.category}</span>
                <span>/</span>
                <span className="text-on-background line-clamp-1">{product.title?.substring(0, 40)}</span>
            </div>

            {/* Product Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
                {/* Hero Panel */}
                <div className="md:col-span-7 bg-surface-container-lowest rounded-xl border border-outline-variant p-8 flex flex-col items-center justify-center min-h-[400px] relative">
                    <span className="material-symbols-outlined text-[120px] opacity-20 text-outline">
                        {product.category === "laptop" ? "laptop" :
                         product.category === "telefon" ? "smartphone" :
                         product.category === "tablet" ? "tablet" :
                         product.category === "kulaklık" ? "headphones" :
                         "shopping_bag"}
                    </span>
                    <span className="absolute top-4 left-4 bg-primary text-on-primary px-3 py-1 rounded-full font-label-sm text-label-sm">
                        {product.store}
                    </span>
                    <p className="font-body-lg text-center mt-4 text-on-surface-variant max-w-[400px] line-clamp-4">{product.title}</p>
                </div>

                {/* Product Info Panel */}
                <div className="md:col-span-5 flex flex-col gap-4">
                    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 flex flex-col h-full justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <span className="bg-secondary-fixed text-on-secondary-fixed-variant px-3 py-1 rounded-full font-label-sm text-label-sm">
                                    {product.brand}
                                </span>
                            </div>
                            <h1 className="font-headline-md text-headline-md text-on-background mb-2 line-clamp-3">{product.title}</h1>
                            <p className="font-body-md text-body-md text-on-surface-variant mb-4">
                                Seller: {product.seller} {product.sellerRating ? `(${product.sellerRating}/10)` : ""}
                            </p>
                            <div className="flex items-baseline gap-3 mb-2">
                                <span className="font-display-lg text-display-lg text-primary">
                                    ₺{currentPrice.toLocaleString("tr-TR")}
                                </span>
                                {basePrice !== currentPrice && (
                                    <span className="font-body-md text-body-md text-outline line-through">
                                        ₺{basePrice.toLocaleString("tr-TR")}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 mb-8">
                                {isDrop && (
                                    <span className="bg-[#e6f4ea] text-[#137333] px-2 py-0.5 rounded-full font-label-sm text-[12px] flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
                                        {priceDiffPercent}% Drop
                                    </span>
                                )}
                                {isUp && (
                                    <span className="bg-[#fce8e6] text-[#c5221f] px-2 py-0.5 rounded-full font-label-sm text-[12px] flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                                        {Math.abs(priceDiffPercent)}% Up
                                    </span>
                                )}
                                <span className="font-caption text-caption text-outline">
                                    {priceHistory.length} price records tracked
                                </span>
                            </div>
                        </div>

                        <div className="mt-auto pt-4 border-t border-surface-variant">
                            <a
                                href={product.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-primary text-on-primary py-3 px-4 rounded-lg font-label-sm text-label-sm flex items-center justify-center gap-2 hover:bg-surface-tint transition-colors shadow-sm cursor-pointer"
                            >
                                <span className="material-symbols-outlined">open_in_new</span>
                                View on {product.store}
                            </a>
                            <p className="text-center font-caption text-caption text-outline mt-2">
                                Added: {product.addedAt ? new Date(product.addedAt).toLocaleDateString("tr-TR") : "N/A"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Price History ve Detay */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Price History Chart */}
                <div className="md:col-span-8 bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-headline-md text-body-lg text-on-background font-semibold">Price History</h2>
                    </div>

                    {chartPrices.length > 0 ? (
                        <div className="relative h-[250px] w-full border-b border-l border-surface-variant pb-6 pl-8">
                            <div className="absolute left-0 bottom-6 font-caption text-caption text-outline flex flex-col justify-between h-full pr-2 text-right"
                                style={{ transform: "translateX(-100%)" }}>
                                <span>₺{Math.round(maxPrice).toLocaleString("tr-TR")}</span>
                                <span>₺{Math.round((maxPrice + minPrice) / 2).toLocaleString("tr-TR")}</span>
                                <span>₺{Math.round(minPrice).toLocaleString("tr-TR")}</span>
                            </div>
                            <div className="absolute inset-0 left-8 bottom-6 flex flex-col justify-between pointer-events-none">
                                <div className="w-full border-t border-surface-container-highest border-dashed"></div>
                                <div className="w-full border-t border-surface-container-highest border-dashed"></div>
                                <div className="w-full border-t border-surface-container-highest border-dashed"></div>
                            </div>
                            <div className="absolute inset-0 left-8 bottom-6 overflow-hidden px-2">
                                <svg className="w-full h-full stroke-primary fill-none" preserveAspectRatio="none"
                                    style={{ strokeWidth: "2px" }} viewBox="0 0 100 100">
                                    <path d={
                                        chartPrices.map((h, i) => {
                                            const price = parseFloat(h.current_price) || 0;
                                            const x = (i / Math.max(chartPrices.length - 1, 1)) * 100;
                                            const y = 100 - ((price - minPrice) / priceRange) * 90 - 5;
                                            return `${i === 0 ? "M" : "L"}${x},${y}`;
                                        }).join(" ")
                                    }></path>
                                </svg>
                            </div>
                            <div className="absolute bottom-0 left-8 right-0 flex justify-between font-caption text-caption text-outline pt-2 px-4">
                                {chartPrices.length > 0 && (
                                    <>
                                        <span>{new Date(chartPrices[0]?.checked_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}</span>
                                        <span>{new Date(chartPrices[Math.floor(chartPrices.length / 2)]?.checked_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}</span>
                                        <span>{new Date(chartPrices[chartPrices.length - 1]?.checked_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="h-[250px] flex items-center justify-center text-on-surface-variant">
                            <p>No price history available yet</p>
                        </div>
                    )}
                </div>

                {/* Product Details Card */}
                <div className="md:col-span-4 bg-surface-container-lowest rounded-xl border border-outline-variant p-6 flex flex-col">
                    <h2 className="font-headline-md text-body-lg text-on-background font-semibold mb-4">Product Details</h2>
                    <div className="flex flex-col gap-3 text-body-md">
                        <div className="flex justify-between">
                            <span className="text-outline">Category</span>
                            <span className="text-on-surface capitalize">{product.category}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-outline">Brand</span>
                            <span className="text-on-surface">{product.brand}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-outline">Platform</span>
                            <span className="text-on-surface">{product.store}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-outline">Seller</span>
                            <span className="text-on-surface">{product.seller}</span>
                        </div>
                        {product.sellerRating && (
                            <div className="flex justify-between">
                                <span className="text-outline">Seller Rating</span>
                                <span className="text-on-surface">{product.sellerRating}/10</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span className="text-outline">Base Price</span>
                            <span className="text-on-surface">₺{basePrice.toLocaleString("tr-TR")}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-outline">Current Price</span>
                            <span className={`font-semibold ${isDrop ? "text-primary" : isUp ? "text-error" : "text-on-surface"}`}>
                                ₺{currentPrice.toLocaleString("tr-TR")}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
