import { Link } from "react-router-dom";

// Platforma göre renk/ikon eşlemesi
const platformColors = {
    Trendyol: { bg: "#fff0e6", text: "#e26b00" },
    Hepsiburada: { bg: "#e8f0fe", text: "#1a73e8" },
    MediaMarkt: { bg: "#fce4ec", text: "#c62828" },
};

const categoryIcons = {
    laptop: "laptop",
    telefon: "smartphone",
    tablet: "tablet",
    kulaklık: "headphones",
    "akıllı saat": "watch",
};

// Price status hesapla (price_history'dan current_price varsa)
function getPriceStatus(product) {
    const base = product.originalPrice || 0;
    const current = product.currentPrice || base;
    if (!base || !current || base === current) return "neutral";
    const diff = ((base - current) / base) * 100;
    if (diff >= 1) return "drop";
    if (diff <= -1) return "up";
    return "neutral";
}

function getPercentage(product) {
    const base = product.originalPrice || 0;
    const current = product.currentPrice || base;
    if (!base || base === current) return null;
    return Math.abs(Math.round(((base - current) / base) * 100));
}

export default function ProductCard({ product }) {
    const { id, store, title, currentPrice, originalPrice, brand } = product;
    const status = product.status || getPriceStatus(product);
    const percentage = product.percentage || getPercentage(product);
    const colors = platformColors[store] || { bg: "#f5f5f5", text: "#555" };
    const icon = categoryIcons[product.category] || "shopping_bag";

    return (
        <Link
            to={`/product/${id}`}
            className="bg-surface-container-lowest border border-[#DADCE0] rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col group relative cursor-pointer"
        >
            {/* Status badge */}
            {status === "drop" && (
                <div className="absolute top-4 right-4 z-10 bg-[#e6f4ea] text-[#137333] px-3 py-1 rounded-full font-label-sm text-label-sm flex items-center gap-1 shadow-sm">
                    <span className="material-symbols-outlined text-[14px]">arrow_downward</span> {percentage}% Drop
                </div>
            )}
            {status === "up" && (
                <div className="absolute top-4 right-4 z-10 bg-[#fce8e6] text-[#c5221f] px-3 py-1 rounded-full font-label-sm text-label-sm flex items-center gap-1 shadow-sm">
                    <span className="material-symbols-outlined text-[14px]">arrow_upward</span> {percentage}% Up
                </div>
            )}

            {/* Ürün görseli (placeholder) */}
            <div className="aspect-square bg-surface-container flex items-center justify-center p-6 relative">
                <span
                    className="material-symbols-outlined text-[80px]"
                    style={{ color: colors.text, opacity: 0.3 }}
                >
                    {icon}
                </span>
                <span
                    className="absolute top-4 left-4 px-2 py-0.5 rounded text-[11px] font-medium"
                    style={{ backgroundColor: colors.bg, color: colors.text }}
                >
                    {store}
                </span>
            </div>

            <div className="p-6 flex flex-col flex-grow gap-4 border-t border-[#DADCE0]">
                <div className="flex flex-col gap-1">
                    <span className="font-caption text-caption text-outline uppercase tracking-wider">{brand}</span>
                    <h3 className="font-body-lg text-body-lg text-on-surface font-semibold line-clamp-2">{title}</h3>
                </div>

                <div className="mt-auto flex items-end justify-between">
                    <div className="flex flex-col">
                        <span className="font-caption text-caption text-outline line-through h-4">
                            {originalPrice && originalPrice !== currentPrice
                                ? `₺${originalPrice.toLocaleString("tr-TR")}`
                                : ""}
                        </span>
                        <span
                            className={`font-headline-md text-headline-md ${
                                status === "drop" ? "text-primary" : "text-on-surface"
                            }`}
                        >
                            ₺{currentPrice.toLocaleString("tr-TR")}
                        </span>
                    </div>

                    <button
                        className={`px-4 py-2 rounded-lg font-label-sm text-label-sm flex items-center gap-2 transition-colors border ${
                            status === "drop"
                                ? "bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container border-transparent"
                                : "bg-surface-container text-on-surface hover:bg-outline-variant hover:text-on-background border-outline-variant"
                        }`}
                    >
                        <span className="material-symbols-outlined text-[18px]">track_changes</span> Track
                    </button>
                </div>
            </div>
        </Link>
    );
}
