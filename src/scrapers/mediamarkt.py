import re
from datetime import datetime
from playwright.sync_api import sync_playwright

MAX_PRODUCTS = 50

URL_MAP = {
    "laptop": "https://www.mediamarkt.com.tr/tr/category/laptop-504926.html",
    "telefon": "https://www.mediamarkt.com.tr/tr/category/telefon-465595.html",
    "tablet": "https://www.mediamarkt.com.tr/tr/category/tabletler-639520.html",
    "kulaklık": "https://www.mediamarkt.com.tr/tr/search.html?query=kulakl%C4%B1k&searchFeatures%5B0%5D%5Bname%5D=suggest&searchFeatures%5B0%5D%5Bvalue%5D=1",
    "akıllı saat": "https://www.mediamarkt.com.tr/tr/search.html?query=ak%C4%B1ll%C4%B1%20saat&searchFeatures%5B0%5D%5Bname%5D=suggest&searchFeatures%5B0%5D%5Bvalue%5D=1",
}

def parse_mediamarkt_price(text: str) -> str:
    if not text: return ""
    # "(10 gün)" ibaresini ve diğer kalabalıkları temizle
    text = re.sub(r"\(10\s*gün\)", "", text, flags=re.IGNORECASE)
    
    # Regex ile tüm sayı adaylarını bul (Örn: 43.999 veya 2.500,00)
    matches = re.findall(r"([\d.,]{4,15})", text)
    if not matches: return ""
    
    vals = []
    for m in matches:
        clean = m.replace(".", "").replace(",", ".").strip()
        # Sondaki noktayı temizle (Örn: 21589.)
        if clean.endswith("."): clean = clean[:-1]
        try:
            val = float(clean)
            if val >= 100: vals.append(val)
        except: continue
    
    if not vals: return ""
    return str(max(vals))

def scrape_mediamarkt(page, category: str) -> list[dict]:
    url = URL_MAP.get(category, URL_MAP["laptop"])
    print(f"  MediaMarkt '{category}' açılıyor...")

    page.goto(url, wait_until="domcontentloaded", timeout=60000)
    page.wait_for_timeout(5000)

    # Cookie popup
    try:
        page.click("#pwa-consent-layer-accept-all-button", timeout=3000)
        page.wait_for_timeout(1000)
    except: pass

    # Daha fazla ürün yükle
    for i in range(8):
        try:
            count_before = page.locator('[data-test="product-title"]').count()
            if count_before >= MAX_PRODUCTS: break
            
            page.keyboard.press("End")
            page.wait_for_timeout(1500)
            
            btn = page.locator('[data-test="mms-search-srp-loadmore"]').first
            if btn.is_visible(timeout=2000):
                btn.click()
                page.wait_for_timeout(3000)
            else: break
        except: break

    results = []
    seen = set()
    products = page.query_selector_all("article")

    for product in products:
        if len(results) >= MAX_PRODUCTS: break
        try:
            title_el = product.query_selector('[data-test="product-title"]')
            if not title_el: continue
            name = title_el.inner_text().strip()
            
            link_el = product.query_selector("a")
            if not link_el: continue
            href = link_el.get_attribute("href")
            link = "https://www.mediamarkt.com.tr" + href if href.startswith("/") else href
            
            if link in seen: continue
            seen.add(link)

            brand = name.split(" ")[0]

            # Fiyat Çekme (YENİ SİSTEM)
            price = ""
            price_container = product.query_selector('[data-test="mms-price"]')
            if price_container:
                price = parse_mediamarkt_price(price_container.inner_text())

            results.append({
                "platform": "MediaMarkt",
                "category": category,
                "name": name,
                "brand": brand,
                "link": link,
                "base_price": price,
                "added_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            })
        except: continue

    print(f"  MediaMarkt '{category}': {len(results)} ürün çekildi.")
    return results