from datetime import datetime
import re
from playwright.sync_api import sync_playwright

MAX_PRODUCTS = 50

SEARCH_MAP = {
    "laptop" : "https://www.trendyol.com/laptop-x-c103108",
    "telefon": "https://www.trendyol.com/cep-telefonu-x-c103498",
    "tablet" : "https://www.trendyol.com/tablet-x-c103665",
    "kulaklık": "https://www.trendyol.com/sr?q=kulaklık&qt=kulaklık&st=kulaklık&os=1",
    "akıllı saat": "https://www.trendyol.com/sr?wc=1240&os=1&sk=1",
}


def extract_price_from_text(text: str) -> str:
    """Metinden fiyat çıkart (₺ veya TL ile işaretlenmiş)"""
    if not text:
        return ""
    
    # Fiyat genelde "12.999 TL" veya "₺12.999" formatındadır.
    # Hem başta hem sonda olan sembolleri destekle
    match = re.search(r'([\d.,]+)\s*[₺TLtl]+|[₺TLtl]+\s*([\d.,]+)', text, re.IGNORECASE)
    if match:
        price_str = match.group(1) or match.group(2)
        # Format: Türkçe separatörleri kaldır ve normalize et
        price = (price_str
                 .replace(".", "").replace(",", ".")
                 .strip())
        return price
    
    # Eğer doğrudan sadece sayılar varsa ve .seller-store-default-price-value sınıfından gelmişse
    match_only_digits = re.search(r'([\d.,]+)', text)
    if match_only_digits:
        price_str = match_only_digits.group(1)
        return (price_str.replace(".", "").replace(",", ".").strip())

    return ""


def scrape_trendyol(page, category: str) -> list[dict]:
    url = SEARCH_MAP.get(category, SEARCH_MAP["laptop"])
    print(f"  Trendyol '{category}' açılıyor...")

    page.goto(url, wait_until="domcontentloaded", timeout=45_000)
    page.wait_for_timeout(3_000)

    # Javascript ile kademeli scroll
    for _ in range(15):
        page.evaluate("window.scrollBy(0, 800)")
        page.wait_for_timeout(800)

    results = []
    seen = set()

    try:
        # Tüm linkleri al - pattern matching ile ürün linklerini filtrele
        all_links = page.query_selector_all("a[href]")
        print(f"  [debug] {len(all_links)} link bulundu")
        
        product_links = []
        for link_el in all_links:
            try:
                href = link_el.get_attribute("href") or ""
                # Ürün link pattern: -p-\d+ (Trendyol ürün sayfalarının sonunda)
                if re.search(r'-p-\d+', href):
                    product_links.append(link_el)
            except:
                continue
        
        print(f"  [debug] {len(product_links)} ürün link bulundu")
        
        for link_el in product_links:
            if len(results) >= MAX_PRODUCTS:
                break

            try:
                href = link_el.get_attribute("href")
                if not href:
                    continue

                # Sayfa yapısına göre link hazırla
                if href.startswith("http"):
                    link = href
                elif href.startswith("/"):
                    link = f"https://www.trendyol.com{href}"
                else:
                    link = f"https://www.trendyol.com/{href}"

                # Çoktan eklenmiş mi kontrol et
                if link in seen:
                    continue

                # İsim ve Marka çıkart
                brand = ""
                try:
                    brand_el = link_el.query_selector(".product-brand")
                    if brand_el:
                        brand = brand_el.inner_text().strip()
                    
                    name_el = link_el.query_selector(".product-name")
                    if name_el:
                        name_text = name_el.inner_text().strip()
                        # Eğer Trendyol'da brand ve name aynıysa, isme dahil olur
                        if name_text:
                            name = name_text
                except:
                    pass

                # Eğer hala name yoksa veya çok kısaysa
                if not name or len(name) < 3:
                    name = link_el.get_attribute("title")
                    if not name:
                        name = link_el.inner_text().strip()

                if not name or len(name) < 3:
                    continue

                # Spam filter
                spam_words = ["kategoriler", "tüm", "mağazalar", "hakkında", "gizlilik", "koşul", "iletişim", "hesabım"]
                if any(spam in name.lower() for spam in spam_words):
                    continue

                # Fiyat çıkart
                price = ""
                try:
                    price_el = link_el.query_selector(
                        ".seller-store-default-price-value, .prc-box-dscntd, .prc-box-sllng, "
                        ".price-section, .sale-price, .discounted-price, "
                        ".seller-store-basket-promo-price-value"
                    )
                    if price_el:
                        price = extract_price_from_text(price_el.inner_text())
                except:
                    pass

                # Temizle
                name = name.strip()
                brand = brand.strip()

                seen.add(link)

                results.append({
                    "platform"  : "Trendyol",
                    "category"  : category,
                    "name"      : name if len(name) > 3 else "Bilinmeyen Ürün",
                    "brand"     : brand,
                    "link"      : link,
                    "base_price": price,
                    "added_at"  : datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                })

            except Exception as e:
                continue

    except Exception as e:
        print(f"  [!] Trendyol scraping hatası: {e}")

    print(f"  Trendyol '{category}': {len(results)} ürün")
    return results