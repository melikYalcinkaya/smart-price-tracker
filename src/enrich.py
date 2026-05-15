"""
enrich.py — products.csv'deki her ürünün sayfasına girerek
satıcı adı ve satıcı puanını çeker, products.csv'ye ekler.
Bir kez çalıştırılır. Daha önce doldurulanları atlar.

TEST_LIMIT = None → tümünü çalıştır
TEST_LIMIT = 10   → sadece ilk 10 ürünü işle (test için)
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

WATCHLIST  = "data/products.csv"
TEST_LIMIT = None  # None yapınca tüm 750 ürünü çalıştırır


# ── Platform bazlı satıcı çekme ──────────────────────────────────────────────

def get_trendyol_seller(page):
    seller, rating = "", ""
    try:
        el = page.query_selector(".merchant-name")
        if el:
            seller = el.inner_text().strip()

        el = page.query_selector(".score-badge")
        if el:
            rating = el.inner_text().strip()
    except:
        pass
    return seller, rating


def get_hepsiburada_seller(page):
    seller, rating = "", ""
    try:
        # Satıcı adı: /magaza/ linkindeki anchor tag
        el = page.query_selector('a[href*="/magaza/"]')
        if el:
            seller = el.inner_text().strip()

        # Satıcı puanı: "Satıcı:" span'ının yakınındaki puan elementi
        el = page.query_selector('[data-test="merchant-score"], [class*="merchantScore"]')
        if el:
            rating = el.inner_text().strip()
        
        # Eğer Hepsiburada ise ve puan yoksa
        if seller.lower() == "hepsiburada" and not rating:
            rating = "Resmi Satici"
    except:
        pass
    return seller, rating


def get_mediamarkt_seller(page):
    # MediaMarkt tüm ürünleri kendisi satar
    return "MediaMarkt", ""


SELLER_FNS = {
    "Trendyol"   : get_trendyol_seller,
    "Hepsiburada": get_hepsiburada_seller,
    "MediaMarkt" : get_mediamarkt_seller,
}


# ── Ana akış ─────────────────────────────────────────────────────────────────

def enrich():
    with open(WATCHLIST, encoding="utf-8") as f:
        products = list(csv.DictReader(f))

    # Sütun yoksa ekle
    for p in products:
        p.setdefault("seller", "")
        p.setdefault("seller_rating", "")

    limit    = TEST_LIMIT if TEST_LIMIT else len(products)
    total    = min(limit, len(products))
    changed  = 0

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page    = browser.new_page()

        for i, product in enumerate(products[:total]):
            # Atlama mantığı: Satıcı varsa VE (Puan varsa veya MediaMarkt ise) atla
            if product["seller"].strip():
                if product["seller_rating"].strip() or product["platform"] == "MediaMarkt":
                    print(f"[{i+1}/{total}] Atlandi: {product['name'][:45]}")
                    continue

            platform = product["platform"]
            link     = product["link"]
            name     = product["name"][:45]

            try:
                print(f"[{i+1}/{total}] {platform} | {name}...")
                page.goto(link, wait_until="domcontentloaded", timeout=30_000)
                page.wait_for_timeout(2_000)

                fn           = SELLER_FNS.get(platform, lambda pg: ("", ""))
                seller, rating = fn(page)

                product["seller"]        = seller
                product["seller_rating"] = rating
                changed += 1
                print(f"  → Satıcı: '{seller}' | Puan: '{rating}'")

            except Exception as e:
                print(f"  [!] Hata: {e}")
                product["seller"]        = ""
                product["seller_rating"] = ""

        browser.close()

    # Kaydet
    fieldnames = ["platform", "category", "name", "brand",
                  "seller", "seller_rating",
                  "link", "base_price", "added_at"]
    with open(WATCHLIST, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(products)

    print(f"\n[+] Tamamlandi. {changed}/{total} urun guncellendi -> {WATCHLIST}")


if __name__ == "__main__":
    enrich()
