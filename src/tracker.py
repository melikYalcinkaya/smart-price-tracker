"""
tracker.py — products.csv'deki ürünlerin güncel fiyatını çeker,
price_history.csv'ye EKLER (silmez). Her gün çalıştırılır.
"""
import csv
import os
import re
import sys
from datetime import datetime
from playwright.sync_api import sync_playwright

# Windows konsolu UTF-8 sorunu
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

WATCHLIST     = "data/products.csv"
HISTORY       = "data/price_history.csv"
HISTORY_COLS  = [
    "platform", "category", "name", "brand",
    "seller", "seller_rating",
    "link", "base_price", "current_price", "checked_at",
]
TEST_LIMIT = None   # None yapinca tum urunleri calistirir


# ── Fiyat Temizleme (Zeki) ───────────────────────────────────────────────────

def parse_price(text: str) -> str:
    if not text or len(text) > 20: return ""
    # Sadece rakam, nokta ve virgül bırak
    clean = re.sub(r"[^\d.,]", "", text)
    if not clean: return ""
    
    # 1.234,56 -> 1234.56
    if "," in clean and "." in clean:
        clean = clean.replace(".", "").replace(",", ".")
    elif "," in clean:
        clean = clean.replace(",", ".")
    elif "." in clean:
        parts = clean.split(".")
        if len(parts[-1]) > 2: # Binlik ayraç ise noktayı sil
            clean = clean.replace(".", "")
    
    try:
        # Sayısal geçerlilik kontrolü
        val = float(clean)
        # 100 TL altı fiyatlar muhtemelen hatalıdır (reklam, stok adedi vs.)
        if val < 100: return "" 
        return str(val)
    except:
        return ""


# ── Ortak Akıllı Çekme Fonksiyonu ───────────────────────────────────────────

def smart_extract_price(page, selectors, base_price=None):
    found = []
    # 1. Selector'ları dene
    for sel in selectors:
        try:
            els = page.query_selector_all(sel)
            for el in els:
                txt = el.inner_text().strip()
                p = parse_price(txt)
                if p: found.append(p)
        except: continue
    
    # 2. Fallback: Sayfadaki metni tara
    if not found:
        try:
            text = page.inner_text("body")
            matches = re.findall(r"(?:₺|TL)\s*([\d.,]{3,15})|([\d.,]{3,15})\s*(?:₺|TL)", text, re.IGNORECASE)
            for m in matches:
                p = parse_price(m[0] or m[1])
                if p: found.append(p)
        except: pass
    
    if found:
        # Eğer bir baz fiyat verilmişse (karşılaştırma için)
        ref_price = parse_price(str(base_price)) if base_price else None
        
        if ref_price:
            try:
                base_val = float(ref_price)
                # Sayfada bulunan rakamlar içinde baz fiyata en yakın olanı seç
                return min(found, key=lambda x: abs(float(x) - base_val))
            except:
                return found[0]
        return found[0]
    return ""


# ── Platform Fonksiyonları ──────────────────────────────────────────────────

def get_trendyol_price(page, base_price=None):
    return smart_extract_price(page, [
        ".discounted", ".price-container .discounted", ".prc-dsc", 
        "[data-testid='price-container']"
    ], base_price)

def get_hepsiburada_price(page, base_price=None):
    return smart_extract_price(page, [
        "[data-test='price-current-price']", ".price-current-price",
        "a[class*='price']", "div[class*='price']"
    ], base_price)

def get_mediamarkt_price(page, base_price=None):
    return smart_extract_price(page, [
        "[data-test='product-detail-price']", 
        ".price.price--big",
        ".price"
    ], base_price)

PRICE_FNS = {
    "Trendyol"   : get_trendyol_price,
    "Hepsiburada": get_hepsiburada_price,
    "MediaMarkt" : get_mediamarkt_price,
}


# ── Ana Akış ─────────────────────────────────────────────────────────────────

def track():
    if not os.path.exists(WATCHLIST):
        print(f"[!] {WATCHLIST} bulunamadı!")
        return

    with open(WATCHLIST, encoding="utf-8") as f:
        products = list(csv.DictReader(f))

    # Test modunda her platformdan 10'ar tane seçmek istersen burayı açabilirsin
    # t_items = [p for p in products if p["platform"] == "Trendyol"][:10]
    # h_items = [p for p in products if p["platform"] == "Hepsiburada"][:10]
    # m_items = [p for p in products if p["platform"] == "MediaMarkt"][:10]
    # batch = t_items + h_items + m_items
    
    limit = TEST_LIMIT if TEST_LIMIT else len(products)
    batch = products[:limit]
    
    if not batch:
        print("[!] Batch oluşturulamadı!")
        return

    os.makedirs(os.path.dirname(HISTORY), exist_ok=True)
    write_header = not os.path.exists(HISTORY)
    checked_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    rows_added = 0

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page    = context.new_page()

        with open(HISTORY, "a", newline="", encoding="utf-8") as hist_f:
            writer = csv.DictWriter(hist_f, fieldnames=HISTORY_COLS, extrasaction="ignore")
            if write_header: writer.writeheader()

            for i, product in enumerate(batch):
                platform = product["platform"]
                link     = product["link"]
                name     = product["name"][:45]

                try:
                    print(f"[{i+1}/{len(batch)}] {platform} | {name}...")
                    page.goto(link, wait_until="domcontentloaded", timeout=30_000)
                    page.wait_for_timeout(2000)

                    fn = PRICE_FNS.get(platform)
                    current_price = fn(page, product.get("base_price"))

                    print(f"  → Fiyat: {current_price or 'Bulunamadi'}")

                    writer.writerow({
                        **product,
                        "current_price": current_price,
                        "checked_at"   : checked_at,
                    })
                    rows_added += 1
                    hist_f.flush()

                except Exception as e:
                    print(f"  [!] Hata: {e}")

        browser.close()

    print(f"\n[+] Bitti. {rows_added} ürün → {HISTORY}")


if __name__ == "__main__":
    track()