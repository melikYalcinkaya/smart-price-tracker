"""
settings.py - Uygulama yapılandırma ayarları

Bu modül smart-price-tracker uygulamasının tüm yapılandırma parametrelerini
merkezi bir yerden yönetmek için oluşturulmuştur.
Sorumlulukları:
- Hedef site URL'lerini ve CSS selektörlerini tanımlamak
- Scraping parametrelerini (timeout, istek aralığı vb.) saklamak
- Bildirim ayarlarını (e-posta, log seviyesi) yapılandırmak

Kullanım: from config.settings import SITES, SCRAPING, NOTIFICATION
"""

import os
from dotenv import load_dotenv

load_dotenv()

# Takip edilecek siteler ve yapılandırmaları
# TODO: Her site için base_url, CSS selektörleri (fiyat, ürün adı vb.) eklenecek
SITES = {}

# Scraping parametreleri
# TODO: REQUEST_TIMEOUT, SCRAPING_INTERVAL_HOURS, USER_AGENT, RETRY_COUNT vb. eklenecek
SCRAPING = {}

# Bildirim ayarları
# TODO: SMTP bilgileri (.env'den okunacak), log dosyası yolu, fiyat düşüş eşiği eklenecek
NOTIFICATION = {}
