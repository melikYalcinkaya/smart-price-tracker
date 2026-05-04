import { useNavigate } from "react-router-dom";

export default function ProductDetails() {
    const navigate = useNavigate();

    return (
        <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 md:px-12 py-8 pb-[100px] md:pb-8 pt-20 md:pt-24 min-h-screen">
            {/* Breadcrumb & Back */}
            <div className="flex items-center gap-2 text-outline font-caption text-caption mb-4">
                <button
                    onClick={() => navigate("/")}
                    className="hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
                >
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    Back to Search
                </button>
                <span>/</span>
                <span>Electronics</span>
                <span>/</span>
                <span className="text-on-background">Sony WH-1000XM5</span>
            </div>

            {/* Product Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
                {/* Hero Image Panel */}
                <div className="md:col-span-7 bg-surface-container-lowest rounded-xl border border-outline-variant p-8 flex items-center justify-center min-h-[400px]">
                    <img
                        alt="Sony WH-1000XM5 Headphones"
                        className="w-full max-w-[400px] h-auto object-contain"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAHWn9T12Rb4SNlL9dGrfZUFjJPjEh-pKeNqlsmjWhW3QnOj10rx4pRKOF372k4lQeyM18pv1qWd51jQyM88tmFa0I2FerHZofhsF9XXTZZojm15HxNmMpdlqh7z4GtnKYi6WT3KJRRBMwz2jfdmU4e7Rruqh3QihGwnHWVCE41gxnQ52vR3k0nMaItho0vgmjr8DowVUxoFVXCOl8q7uNo7BHz836NDDyIRQ35G7QtqXWBn5Ok1rDV5jrUSH-kr-lQUNZ5qu_5A9w"
                    />
                </div>

                {/* Product Info Panel */}
                <div className="md:col-span-5 flex flex-col gap-4">
                    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 flex flex-col h-full justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <span className="bg-secondary-fixed text-on-secondary-fixed-variant px-3 py-1 rounded-full font-label-sm text-label-sm">Top Rated</span>
                                <button className="text-primary hover:bg-surface-container p-2 rounded-full transition-colors flex items-center justify-center cursor-pointer">
                                    <span className="material-symbols-outlined">share</span>
                                </button>
                            </div>
                            <h1 className="font-headline-md text-headline-md text-on-background mb-2">Sony WH-1000XM5 Wireless Noise Canceling Headphones</h1>
                            <p className="font-body-md text-body-md text-on-surface-variant mb-4">Industry-leading noise cancellation, 30-hour battery life, and premium sound quality in a lightweight design.</p>
                            <div className="flex items-baseline gap-3 mb-2">
                                <span className="font-display-lg text-display-lg text-primary">$328.00</span>
                                <span className="font-body-md text-body-md text-outline line-through">$398.00</span>
                            </div>
                            <div className="flex items-center gap-2 mb-8">
                                <span className="bg-[#e6f4ea] text-[#137333] px-2 py-0.5 rounded-full font-label-sm text-[12px] flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
                                    17% Drop
                                </span>
                                <span className="font-caption text-caption text-outline">Best price across 5 stores</span>
                            </div>
                        </div>

                        {/* Watchlist Toggle */}
                        <div className="mt-auto pt-4 border-t border-surface-variant">
                            <button className="w-full bg-primary text-on-primary py-3 px-4 rounded-lg font-label-sm text-label-sm flex items-center justify-center gap-2 hover:bg-surface-tint transition-colors shadow-sm cursor-pointer">
                                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>bookmark_add</span>
                                Add to Watchlist
                            </button>
                            <p className="text-center font-caption text-caption text-outline mt-2">Get notified instantly when the price drops below $300.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Price History Chart */}
                <div className="md:col-span-8 bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-headline-md text-body-lg text-on-background font-semibold">Price History (3 Months)</h2>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 bg-surface-container text-on-surface font-label-sm text-caption rounded-md cursor-pointer">1M</button>
                            <button className="px-3 py-1 bg-primary-fixed text-on-primary-fixed font-label-sm text-caption rounded-md cursor-pointer">3M</button>
                            <button className="px-3 py-1 bg-surface-container text-on-surface font-label-sm text-caption rounded-md cursor-pointer">6M</button>
                        </div>
                    </div>

                    {/* Chart Visualization (CSS drawn) */}
                    <div className="relative h-[250px] w-full border-b border-l border-surface-variant pb-6 pl-8">
                        <div className="absolute left-0 bottom-6 font-caption text-caption text-outline flex flex-col justify-between h-full -translate-x-full pr-2 text-right">
                            <span>$400</span><span>$375</span><span>$350</span><span>$325</span><span>$300</span>
                        </div>
                        <div className="absolute bottom-0 left-8 right-0 flex justify-between font-caption text-caption text-outline pt-2 px-4">
                            <span>Aug</span><span>Sep</span><span>Oct</span>
                        </div>
                        <div className="absolute inset-0 left-8 bottom-6 flex flex-col justify-between pointer-events-none">
                            <div className="w-full border-t border-surface-container-highest border-dashed"></div>
                            <div className="w-full border-t border-surface-container-highest border-dashed"></div>
                            <div className="w-full border-t border-surface-container-highest border-dashed"></div>
                            <div className="w-full border-t border-surface-container-highest border-dashed"></div>
                            <div className="w-full"></div>
                        </div>
                        <div className="absolute inset-0 left-8 bottom-6 overflow-hidden flex items-end px-2">
                            <svg className="w-full h-full stroke-primary fill-none" preserveAspectRatio="none" style={{ strokeWidth: "2px" }} viewBox="0 0 100 100">
                                <path d="M0,10 L20,10 L30,30 L50,30 L60,15 L80,15 L90,80 L100,80"></path>
                            </svg>
                            <div className="absolute right-0 bottom-[20%] w-3 h-3 bg-white border-2 border-primary rounded-full translate-x-1/2 translate-y-1/2 shadow-sm"></div>
                        </div>
                    </div>
                </div>

                {/* Retailers List */}
                <div className="md:col-span-4 bg-surface-container-lowest rounded-xl border border-outline-variant p-6 flex flex-col">
                    <h2 className="font-headline-md text-body-lg text-on-background font-semibold mb-4">Available Retailers</h2>
                    <div className="flex flex-col gap-2 flex-1 overflow-y-auto">

                        {/* Retailer 1 */}
                        <div className="flex items-center justify-between p-3 rounded-lg bg-surface-bright border border-surface-variant hover:border-outline-variant transition-colors group cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded flex items-center justify-center border border-surface-variant p-1">
                                    <span className="font-headline-md text-[10px] font-bold text-on-background">AMZN</span>
                                </div>
                                <div>
                                    <span className="block font-label-sm text-label-sm text-on-background">Amazon</span>
                                    <span className="block font-caption text-caption text-[#137333] flex items-center gap-1">In Stock <span className="material-symbols-outlined text-[12px]">check_circle</span></span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="block font-label-sm text-body-md font-semibold text-on-background">$328.00</span>
                                <span className="block font-caption text-caption text-outline">Free Shipping</span>
                            </div>
                        </div>

                        {/* Retailer 2 */}
                        <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-surface-variant hover:border-outline-variant transition-colors group cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#0046be] rounded flex items-center justify-center p-1 text-white">
                                    <span className="font-headline-md text-[10px] font-bold">BB</span>
                                </div>
                                <div>
                                    <span className="block font-label-sm text-label-sm text-on-background">Best Buy</span>
                                    <span className="block font-caption text-caption text-outline">In Stock</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="block font-label-sm text-body-md font-semibold text-on-background">$329.99</span>
                                <span className="block font-caption text-caption text-outline">Store Pickup</span>
                            </div>
                        </div>

                        {/* Retailer 3 */}
                        <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-surface-variant hover:border-outline-variant transition-colors group cursor-pointer opacity-75">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#e51c23] rounded flex items-center justify-center p-1 text-white">
                                    <span className="font-headline-md text-[10px] font-bold">TGT</span>
                                </div>
                                <div>
                                    <span className="block font-label-sm text-label-sm text-on-background">Target</span>
                                    <span className="block font-caption text-caption text-error">Out of Stock</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="block font-label-sm text-body-md font-semibold text-on-surface-variant">$348.00</span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </main>
    );
}