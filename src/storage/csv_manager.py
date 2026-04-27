"""
csv_manager.py - CSV okuma, yazma ve birleştirme yardımcıları

Bu modül, proje genelinde kullanılan CSV dosyalarının
okunması, yazılması ve birleştirilmesi işlemlerini yönetmek için oluşturulmuştur.
Sorumlulukları:
- data/products.csv dosyasını okumak
- Yeni fiyat kayıtlarını data/raw/ altına tarihli CSV'ye eklemek
- Tüm raw CSV dosyalarını birleştirerek data/processed/ altına yazmak

Kullanım:
    from src.storage.csv_manager import load_products, append_price_record, merge_raw_files
"""

import pandas as pd


def load_products() -> pd.DataFrame:
    """
    data/products.csv dosyasını okuyarak DataFrame olarak döner.

    Returns:
        pd.DataFrame: Takip edilen ürünlerin listesi.
                      Sütunlar: product_id, source, product_url, name, category, added_at
    """
    # TODO: pd.read_csv ile data/products.csv oku ve döndür
    pass


def append_price_record(record: dict) -> None:
    """
    Tek bir fiyat kaydını data/raw/ altındaki bugüne ait CSV dosyasına ekler.

    Dosya adı formatı: data/raw/YYYY-MM-DD_HH-MM-SS.csv
    Dosya yoksa başlık satırıyla birlikte oluşturulur.

    Args:
        record (dict): Eklenecek fiyat kaydı.
                       Beklenen anahtarlar: product_id, source, name, price, currency, scraped_at
    """
    # TODO: Tarih formatında dosya adı oluştur
    # TODO: Dosya varsa append modunda, yoksa write modunda aç
    # TODO: pandas ile satırı CSV'ye yaz
    pass


def merge_raw_files() -> None:
    """
    data/raw/ klasöründeki tüm CSV dosyalarını birleştirerek
    data/processed/ klasörüne yazar.

    Birleştirme sırasında:
    - Duplicate kayıtlar temizlenir
    - scraped_at sütununa göre sıralanır
    - data/processed/merged_YYYY-MM-DD.csv olarak kaydedilir
    """
    # TODO: glob ile data/raw/*.csv dosyalarını listele
    # TODO: pd.concat ile tüm DataFrame'leri birleştir
    # TODO: Duplicate temizle, sırala ve processed/ a yaz
    pass
