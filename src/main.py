"""
main.py - Uygulama giriş noktası

Bu modül smart-price-tracker uygulamasının ana çalışma akışını
yönetmek ve bileşenleri bir araya getirmek için oluşturulmuştur.
Sorumlulukları:
- Bileşenleri başlatmak ve orchestrate etmek
- Periyodik scraping döngüsünü yönetmek

Ana akış:
    1. config/settings.py'den yapılandırmayı yükle
    2. data/products.csv'den ürün listesini al       → csv_manager.load_products()
    3. Her ürün için ilgili scraper'ı çalıştır        → HepsiburadaScraper / TrendyolScraper / MediaMarktScraper
    4. Fiyat kayıtlarını data/raw/'a yaz              → csv_manager.append_price_record()
    5. Fiyat düşüşlerini analiz et                    → price_analyzer.detect_price_drops()
    6. Bildirim gönder                                → LogNotifier / EmailNotifier

Kullanım: python -m src.main
"""


def main():
    # TODO: Yukarıdaki akışı uygula
    pass


if __name__ == "__main__":
    main()
