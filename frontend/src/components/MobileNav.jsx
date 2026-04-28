export default function MobileNav() {
    return (
        <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center bg-surface-container-lowest px-4 py-2 pb-safe border-t border-surface-variant z-50 font-label-sm text-[10px] shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
            <a className="flex flex-col items-center justify-center text-primary p-2 active:bg-surface-container scale-95 transition-transform duration-150 rounded-lg" href="#">
                <span className="material-symbols-outlined mb-1" data-icon="search" style={{ fontVariationSettings: "'FILL' 1" }}>search</span>
                <span>Search</span>
            </a>
            <a className="flex flex-col items-center justify-center text-on-surface-variant p-2 active:bg-surface-container scale-95 transition-transform duration-150 rounded-lg hover:text-primary" href="#">
                <span className="material-symbols-outlined mb-1" data-icon="visibility">visibility</span>
                <span>Watchlist</span>
            </a>
            <a className="flex flex-col items-center justify-center text-on-surface-variant p-2 active:bg-surface-container scale-95 transition-transform duration-150 rounded-lg hover:text-primary" href="#">
                <span className="material-symbols-outlined mb-1" data-icon="notifications_active">notifications_active</span>
                <span>Alerts</span>
            </a>
            <a className="flex flex-col items-center justify-center text-on-surface-variant p-2 active:bg-surface-container scale-95 transition-transform duration-150 rounded-lg hover:text-primary" href="#">
                <span className="material-symbols-outlined mb-1" data-icon="person">person</span>
                <span>Profile</span>
            </a>
        </nav>
    );
}
