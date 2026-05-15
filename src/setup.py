import csv
import os
from playwright.sync_api import sync_playwright

from .scrapers.trendyol import scrape_trendyol
from .scrapers.hepsiburada import scrape_hepsiburada
from .scrapers.mediamarkt import scrape_mediamarkt

CATEGORIES = ["laptop", "telefon", "tablet", "kulaklık", "akıllı saat"]
WATCHLIST  = "data/products.csv"


def run():
    all_products = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)

        for cat in CATEGORIES:
            print("\n==============================")
            print(f"[*] Kategori: {cat}")

            # ── Trendyol ──────────────────────────────
            page = browser.new_page()
            try:
                trendyol = scrape_trendyol(page, cat)
                print(f"TRENDYOL     : {len(trendyol)} ürün")
            except Exception as e:
                print(f"[!] TRENDYOL HATA: {e}")
                trendyol = []
            finally:
                page.close()

            # ── Hepsiburada ───────────────────────────
            page = browser.new_page()
            try:
                hepsiburada = scrape_hepsiburada(page, cat)
                print(f"HEPSIBURADA  : {len(hepsiburada)} ürün")
            except Exception as e:
                print(f"[!] HEPSIBURADA HATA: {e}")
                hepsiburada = []
            finally:
                page.close()

            # ── MediaMarkt ────────────────────────────
            page = browser.new_page()
            try:
                mediamarkt = scrape_mediamarkt(page, cat)
                print(f"MEDIAMARKT   : {len(mediamarkt)} ürün")
            except Exception as e:
                print(f"[!] MEDIAMARKT HATA: {e}")
                mediamarkt = []
            finally:
                page.close()

            # ── Listeye ekle ──────────────────────────
            all_products += trendyol[:50]
            all_products += hepsiburada[:50]
            all_products += mediamarkt[:50]

        browser.close()

    # ── CSV kaydet ────────────────────────────────────
    os.makedirs("data", exist_ok=True)

    if not all_products:
        print("[!] Hiç veri gelmedi, scraperları kontrol et!")
        return

    with open(WATCHLIST, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=[
            "platform", "category", "name", "brand",
            "link", "base_price", "added_at",
        ])
        writer.writeheader()
        writer.writerows(all_products)

    print("\n==============================")
    print(f"[+] TOPLAM {len(all_products)} ürün kaydedildi")
    print(f"[*] Dosya: {WATCHLIST}")


if __name__ == "__main__":
    run()