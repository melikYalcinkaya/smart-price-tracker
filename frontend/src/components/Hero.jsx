export default function Hero() {
    return (
        <main className="flex-grow flex flex-col items-center justify-center px-4 md:px-0 mt-[-64px] md:mt-0 pt-20 pb-10">
            {/* Brand Logo */}
            <div className="mb-stack-lg text-center">
                <h1 className="font-display-lg text-display-lg text-primary tracking-tight">SmartPrice</h1>
                <p className="font-body-md text-body-md text-on-surface-variant mt-2">Find the true cost before you buy.</p>
            </div>

            {/* Search Container */}
            <div className="w-full max-w-[600px] mx-auto">
                <div className="relative flex items-center w-full h-14 rounded-full bg-surface-container-lowest border border-outline-variant focus-within:border-primary shadow-[0px_2px_5px_rgba(0,0,0,0.1)] focus-within:shadow-[0px_4px_10px_rgba(0,0,0,0.15)] transition-all duration-200 ease-in-out overflow-hidden px-4 hover:border-outline">
                    <span className="material-symbols-outlined text-outline ml-2 mr-3" data-icon="search">search</span>
                    <input
                        autoFocus
                        className="flex-grow h-full bg-transparent border-none focus:ring-0 font-body-lg text-body-lg text-on-surface placeholder-on-surface-variant focus:outline-none"
                        placeholder="Paste a product URL or search an item..."
                        type="text"
                    />
                    <button aria-label="Voice search" className="ml-2 text-outline hover:text-primary transition-colors p-2">
                        <span className="material-symbols-outlined" data-icon="mic">mic</span>
                    </button>
                    <button aria-label="Upload image" className="ml-1 text-outline hover:text-primary transition-colors p-2">
                        <span className="material-symbols-outlined" data-icon="image">image</span>
                    </button>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4 mt-stack-lg">
                    <button className="bg-surface-container text-on-surface font-label-sm text-label-sm px-6 py-2.5 rounded-DEFAULT hover:bg-surface-variant hover:text-on-surface transition-colors border border-transparent focus:border-outline focus:outline-none cursor-pointer">
                        Search Prices
                    </button>
                    <button className="bg-surface-container text-on-surface font-label-sm text-label-sm px-6 py-2.5 rounded-DEFAULT hover:bg-surface-variant hover:text-on-surface transition-colors border border-transparent focus:border-outline focus:outline-none cursor-pointer">
                        Compare Platforms
                    </button>
                </div>
            </div>

            {/* Trending/Suggestions */}
            <div className="mt-margin-desktop text-center">
                <p className="font-caption text-caption text-on-surface-variant mb-3">Trending searches</p>
                <div className="flex flex-wrap justify-center gap-2">
                    <span className="bg-surface text-on-surface-variant font-caption text-caption px-3 py-1.5 rounded-full border border-surface-variant cursor-pointer hover:bg-surface-container transition-colors">iPhone 15 Pro Max</span>
                    <span className="bg-surface text-on-surface-variant font-caption text-caption px-3 py-1.5 rounded-full border border-surface-variant cursor-pointer hover:bg-surface-container transition-colors">Sony WH-1000XM5</span>
                    <span className="bg-surface text-on-surface-variant font-caption text-caption px-3 py-1.5 rounded-full border border-surface-variant cursor-pointer hover:bg-surface-container transition-colors">Dyson V15 Detect</span>
                </div>
            </div>
        </main>
    );
}