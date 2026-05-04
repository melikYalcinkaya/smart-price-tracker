import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
    const { id, store, title, currentPrice, originalPrice, imageUrl, status, percentage } = product;

    return (
        // <article> yerine <Link> kullanıyoruz ve id'ye göre yönlendiriyoruz
        <Link to={`/product/${id}`} className="bg-surface-container-lowest border border-[#DADCE0] rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col group relative cursor-pointer block">

            {status === 'drop' && (
                <div className="absolute top-4 right-4 z-10 bg-[#e6f4ea] text-[#137333] px-3 py-1 rounded-full font-label-sm text-label-sm flex items-center gap-1 shadow-sm">
                    <span className="material-symbols-outlined text-[14px]">arrow_downward</span> {percentage}% Drop
                </div>
            )}
            {status === 'up' && (
                <div className="absolute top-4 right-4 z-10 bg-[#fce8e6] text-[#c5221f] px-3 py-1 rounded-full font-label-sm text-label-sm flex items-center gap-1 shadow-sm">
                    <span className="material-symbols-outlined text-[14px]">arrow_upward</span> {percentage}% Up
                </div>
            )}

            <div className="aspect-square bg-surface-container flex items-center justify-center p-6 relative">
                <img
                    alt={title}
                    className="object-contain w-full h-full mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                    src={imageUrl}
                />
            </div>

            <div className="p-6 flex flex-col flex-grow gap-4 border-t border-[#DADCE0]">
                <div className="flex flex-col gap-1">
                    <span className="font-caption text-caption text-outline uppercase tracking-wider">{store}</span>
                    <h3 className="font-body-lg text-body-lg text-on-surface font-semibold line-clamp-2">{title}</h3>
                </div>

                <div className="mt-auto flex items-end justify-between">
                    <div className="flex flex-col">
                        <span className="font-caption text-caption text-outline line-through h-4">
                            {originalPrice ? `$${originalPrice.toFixed(2)}` : ''}
                        </span>
                        <span className={`font-headline-md text-headline-md ${status === 'drop' ? 'text-primary' : 'text-on-surface'}`}>
                            ${currentPrice.toFixed(2)}
                        </span>
                    </div>

                    <button className={`px-4 py-2 rounded-lg font-label-sm text-label-sm flex items-center gap-2 transition-colors border ${status === 'drop'
                        ? 'bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container border-transparent'
                        : 'bg-surface-container text-on-surface hover:bg-outline-variant hover:text-on-background border-outline-variant'
                        }`}>
                        <span className="material-symbols-outlined text-[18px]">track_changes</span> Track
                    </button>
                </div>
            </div>
        </Link>
    );
}