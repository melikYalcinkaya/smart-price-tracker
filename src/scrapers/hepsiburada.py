"""
hepsiburada.py - Hepsiburada e-ticaret sitesi scraper'ı

Bu modül, Hepsiburada.com üzerindeki elektronik ürünlerin
fiyat ve bilgilerini çekmek için oluşturulmuştur.
Sorumlulukları:
- Hepsiburada ürün sayfalarından HTML içeriğini almak
- HTML içeriğini ayrıştırarak fiyat, ürün adı ve diğer bilgileri çıkarmak

Beklenen URL formatı:
    https://www.hepsiburada.com/urun-adi-pm-XXXXXXXXXX

Kullanım:
    scraper = HepsiburadaScraper()
    html = scraper.fetch_product("https://www.hepsiburada.com/...")
    data = scraper.parse_product(html)
"""

from src.scrapers.base_scraper import BaseScraper


class HepsiburadaScraper(BaseScraper):
    """Hepsiburada.com için ürün scraper sınıfı."""

    def fetch_product(self, url: str) -> str:
        """
        Hepsiburada ürün sayfasının HTML içeriğini çeker.

        Args:
            url (str): Hepsiburada ürün sayfası URL'si.

        Returns:
            str: Ham HTML içeriği.
        """
        # TODO: requests ile HTTP isteği gönder, bot koruması için header ekle
        # TODO: Gerekirse Selenium ile dinamik içerik yükle
        pass

    def parse_product(self, html: str) -> dict:
        """
        Hepsiburada HTML içeriğinden ürün bilgilerini ayrıştırır.

        Args:
            html (str): Hepsiburada ürün sayfasının HTML içeriği.

        Returns:
            dict: name, price, currency, timestamp içeren sözlük.
        """
        # TODO: BeautifulSoup ile HTML parse et
        # TODO: Fiyat ve ürün adı için CSS selektörlerini belirle
        pass
