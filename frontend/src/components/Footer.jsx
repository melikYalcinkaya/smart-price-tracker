export default function Footer() {
    return (
        <footer className="w-full bg-surface-container-low border-t border-surface-variant py-4 px-6 md:px-margin-desktop hidden md:block">
            <div className="flex flex-col md:flex-row justify-between items-center max-w-[1200px] mx-auto font-caption text-caption text-on-surface-variant">
                <div className="flex gap-6 mb-4 md:mb-0">
                    <a className="hover:underline" href="#">About</a>
                    <a className="hover:underline" href="#">How it works</a>
                    <a className="hover:underline" href="#">Browser Extension</a>
                </div>
                <div className="flex gap-6">
                    <a className="hover:underline" href="#">Privacy Policy</a>
                    <a className="hover:underline" href="#">Terms of Service</a>
                    <a className="hover:underline" href="#">Contact</a>
                </div>
            </div>
        </footer>
    );
}