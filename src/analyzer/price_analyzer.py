"""
price_analyzer.py - Fiyat düşüşü tespit modülü

Bu modül, işlenmiş fiyat verilerini analiz ederek
önceki kayda göre düşüş yaşayan ürünleri tespit etmek için oluşturulmuştur.
Sorumlulukları:
- pandas DataFrame üzerinde fiyat değişimlerini hesaplamak
- Belirlenen eşiğin altında fiyat düşüşlerini filtrelemek
- Tespit edilen düşüşleri bildirim sistemine iletmek

Kullanım:
    from src.analyzer.price_analyzer import detect_price_drops
    drops = detect_price_drops(df)
"""

import pandas as pd


def detect_price_drops(df: pd.DataFrame, threshold: float = 0.0) -> pd.DataFrame:
    """
    Fiyat verisi içeren DataFrame üzerinde fiyat düşüşlerini tespit eder.

    Yöntem: pandas'ın shift() metodu ile her ürünün bir önceki fiyat kaydına
    göre yüzdelik değişim hesaplanır. threshold değerinin altındaki
    değişimler (negatif = düşüş) filtre edilerek döndürülür.

    Args:
        df (pd.DataFrame): product_id, price, scraped_at sütunlarını içeren fiyat verisi.
        threshold (float): Bildirim eşiği (yüzde olarak). Varsayılan 0.0 (her düşüş raporlanır).

    Returns:
        pd.DataFrame: Fiyat düşüşü yaşayan kayıtlar.
                      Ek sütunlar: previous_price, price_change_pct
    """
    # TODO: df.sort_values(['product_id', 'scraped_at']) ile sırala
    # TODO: df.groupby('product_id')['price'].shift(1) ile önceki fiyatı al
    # TODO: Yüzdelik değişim hesapla: (price - previous_price) / previous_price * 100
    # TODO: threshold altındakileri filtrele ve döndür
    pass
