"""
base_scraper.py - Tüm site scraper'ları için soyut temel sınıf

Bu modül, farklı e-ticaret sitelerine yönelik scraper sınıflarının
uyması gereken arayüzü (interface) tanımlamak için oluşturulmuştur.
Sorumlulukları:
- Ortak scraper davranışlarını abstract metodlar aracılığıyla tanımlamak
- İsteğe bağlı paylaşımlı yardımcı metodlar sağlamak
- Tip güvenliği ve tutarlılık için ABC kullanmak

Kullanım:
    from src.scrapers.base_scraper import BaseScraper

    class MyScraper(BaseScraper):
        def fetch_product(self, url: str) -> str: ...
        def parse_product(self, html: str) -> dict: ...
"""

from abc import ABC, abstractmethod


class BaseScraper(ABC):
    """
    Tüm site scraper'ları için soyut temel sınıf.

    Her site scraper'ı bu sınıftan türetilmeli ve
    fetch_product ile parse_product metodlarını uygulamalıdır.
    """

    @abstractmethod
    def fetch_product(self, url: str) -> str:
        """
        Verilen URL'den ürün sayfasının HTML içeriğini çeker.

        Args:
            url (str): Ürünün e-ticaret sitesindeki tam URL'si.

        Returns:
            str: Ham HTML içeriği.

        Raises:
            NotImplementedError: Alt sınıf bu metodu uygulamalıdır.
        """
        pass

    @abstractmethod
    def parse_product(self, html: str) -> dict:
        """
        Ham HTML içeriğinden ürün bilgilerini (fiyat, ad vb.) ayrıştırır.

        Args:
            html (str): fetch_product'tan dönen ham HTML.

        Returns:
            dict: Ayrıştırılmış ürün verisi.
                  Beklenen anahtarlar: name, price, currency, timestamp

        Raises:
            NotImplementedError: Alt sınıf bu metodu uygulamalıdır.
        """
        pass
