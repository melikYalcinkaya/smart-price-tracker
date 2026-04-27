<!-- 
README.md - Bu dosya smart-price-tracker projesinin ana dokümantasyonu için oluşturulmuştur.
Projeyi klonlayan herkese kurulum, kullanım ve katkı bilgilerini sağlar.
-->

# smart-price-tracker

Türkiye'deki e-ticaret sitelerinden elektronik ürün fiyatlarını periyodik olarak takip eden veri madenciliği projesi.

## Amaç

Bu proje, bir veri madenciliği dönem projesi kapsamında geliştirilmektedir. Hepsiburada, Trendyol ve MediaMarkt sitelerinden elektronik ürünlerin fiyat bilgilerini periyodik olarak çekerek CSV dosyalarında saklar ve fiyat düşüşlerinde kullanıcıyı bilgilendirir.

## Hedeflenen Siteler

| Site         | Takip Edilecek Alan  |
|--------------|----------------------|
| Hepsiburada  | Elektronik ürünler   |
| Trendyol     | Elektronik ürünler   |
| MediaMarkt   | Elektronik ürünler   |

## Kurulum

```bash
# 1. Repoyu klonla
git clone https://github.com/kullanici/smart-price-tracker.git
cd smart-price-tracker

# 2. Sanal ortam olustur ve aktifleştir
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

# 3. Bagımlılıkları yukle
pip install -r requirements.txt

# 4. Ortam degiskenlerini ayarla
cp .env.example .env
# .env dosyasını duzenleyerek kendi bilgilerini gir

# 5. Uygulamayı calistir
python -m src.main
```

## Klasör Yapısı

```
smart-price-tracker/
├── config/          # Yapılandırma dosyaları
├── data/            # Veri dosyaları
│   ├── products.csv # Takip edilen ürün listesi (ortak, commit edilir)
│   ├── raw/         # Ham scraping çıktıları (kişisel, gitignored)
│   └── processed/   # İşlenmiş veriler (kişisel, gitignored)
├── notebooks/       # Jupyter analiz defterleri
├── src/             # Kaynak kod
│   ├── scrapers/    # Site bazlı scraper'lar
│   ├── storage/     # CSV yönetimi
│   ├── notifier/    # Bildirim sistemi
│   └── analyzer/    # Fiyat analizi
├── visuals/         # Üretilen grafikler
├── reports/         # Proje raporları
├── docs/            # Proje dokümantasyonu
└── tests/           # Testler
```

## Veri Saklama Stratejisi

- **`data/products.csv`** — Takip edilen ürün listesi. Git'te commit edilir, tüm ekip ortak kullanır.
- **`data/raw/`** — Her scraping çalışmasının ham çıktısı. Gitignored — her geliştiricinin kendi makinesinde birikir.
- **`data/processed/`** — Birleştirilmiş ve temizlenmiş analiz verileri. Gitignored — yerel olarak üretilir.

## Ekip Üyeleri

- Üye 1
- Üye 2
- Üye 3

## Kullanılan AI Araçları

<!-- Bu bölümü proje sürecinde kullanılan AI araçlarıyla doldurun -->
- ...

## Lisans

MIT License
