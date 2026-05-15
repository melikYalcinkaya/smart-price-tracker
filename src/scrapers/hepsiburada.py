from datetime import datetime
from playwright.sync_api import sync_playwright

MAX_PRODUCTS = 50

URL_MAP = {
    "laptop" : "https://www.hepsiburada.com/laptop-notebook-dizustu-bilgisayarlar-c-98",
    "telefon": "https://www.hepsiburada.com/cep-telefonlari-c-371965",
    "tablet" : "https://www.hepsiburada.com/tablet-c-3008012",
    "kulaklık": "https://www.hepsiburada.com/ara?q=kulakl%C4%B1k",
    "akıllı saat": "https://www.hepsiburada.com/ara?q=ak%C4%B1ll%C4%B1+saat",
}


def scrape_hepsiburada(page, category: str) -> list[dict]:
    url = URL_MAP.get(category, URL_MAP["laptop"])
    print(f"  Hepsiburada '{category}' açılıyor...")

    results = []
    seen    = set()
    page_num = 1

    while len(results) < MAX_PRODUCTS and page_num <= 3:
        sep = "&" if "?" in url else "?"
        paginated_url = f"{url}{sep}sayfa={page_num}"
        try:
            page.goto(paginated_url, wait_until="domcontentloaded", timeout=45_000)
        except Exception as e:
            print(f"  [!] Hepsiburada sayfa {page_num}: goto hatası: {e}")
            break

        page.wait_for_timeout(3_000)

        # Captcha / güvenlik sayfası kontrolü
        title = page.title()
        if "güvenlik" in title.lower() or "captcha" in title.lower() or "blocked" in title.lower():
            print(f"  [!] Hepsiburada güvenlik sayfası algılandı! Lütfen tarayıcıda doğrulamayı geçin...")
            try:
                page.wait_for_selector(
                    "li[class*='productListContent'] article[class*='productCard']",
                    timeout=60_000  # Kullanıcı geçmesi için 60sn bekle
                )
            except Exception:
                print(f"  [!] Hepsiburada: 60sn içinde geçilemedi, atlanıyor.")
                break

        # Kademeli scroll
        for _ in range(7):
            try:
                page.evaluate("window.scrollBy(0, 800)")
            except Exception:
                pass
            page.wait_for_timeout(600)

        try:
            page.wait_for_selector(
                "li[class*='productListContent'] article[class*='productCard']",
                timeout=12_000
            )
        except Exception:
            print(f"  [!] Hepsiburada sayfa {page_num}: ürün kartları bulunamadı.")
            break

        cards = page.query_selector_all(
            "li[class*='productListContent'] article[class*='productCard']"
        )

        if not cards:
            break

        for card in cards:
            if len(results) >= MAX_PRODUCTS:
                break
            try:
                name_el  = card.query_selector("a[class*='titleText']")
                price_el = card.query_selector("[data-test-id*='final-price']")
                link_el  = card.query_selector("a[class*='productCardLink']")

                name = name_el.inner_text().strip() if name_el else ""
                brand = name.split()[0] if name else ""

                price_raw = price_el.inner_text().strip() if price_el else ""
                price = (price_raw
                         .replace("TL", "").replace("\xa0", "")
                         .replace(".", "").replace(",", ".")
                         .strip())

                href = link_el.get_attribute("href") if link_el else ""
                if not href or href in seen:
                    continue

                link = (f"https://www.hepsiburada.com{href}"
                        if href.startswith("/") else href)
                seen.add(href)

                if not name:
                    continue

                results.append({
                    "platform"  : "Hepsiburada",
                    "category"  : category,
                    "name"      : name,
                    "brand"     : brand,
                    "link"      : link,
                    "base_price": price,
                    "added_at"  : datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                })

            except Exception:
                continue

        print(f"  Hepsiburada sayfa {page_num}: {len(results)} ürün toplandı")
        page_num += 1

    print(f"  Hepsiburada '{category}': toplam {len(results)} ürün")
    return results