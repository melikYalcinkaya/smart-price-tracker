<!-- 
data/README.md - Bu dosya veri klasörünün yapısını ve kullanım kurallarını açıklar.
Takım üyelerinin hangi dosyaların paylaşıldığını, hangilerinin kişisel olduğunu anlamasını sağlar.
-->

# Veri Klasörü

Bu klasör projenin tüm veri dosyalarını içerir.

## Veri Akışı

```
Scraper → data/raw/<tarih>.csv → csv_manager.merge_raw_files() → data/processed/merged_<tarih>.csv
```

## Dosya ve Klasörler

### `products.csv` (Git'te takip edilir)
Takip edilecek ürünlerin listesi. Tüm ekip bu dosyayı ortak kullanır.
- Yeni ürün eklemek istersen bu dosyayı düzenleyip commit et.
- Format: `product_id, source, product_url, name, category, added_at`

### `raw/` (Gitignored — kişisel)
Her scraping çalışmasının ham çıktısı buraya yazılır.
- Dosya adı formatı: `YYYY-MM-DD_HH-MM-SS.csv`
- Bu klasör gitignored olduğundan her geliştiricinin kendi makinesinde birikir.
- Paylaşmak istersen dışarıya export et veya ortak bir depolama alanına yükle.

### `processed/` (Gitignored — kişisel)
`csv_manager.merge_raw_files()` çalıştırıldığında tüm raw dosyalar birleştirilip
temizlenerek buraya yazılır.
- Bu klasör de gitignored: analiz öncesi lokal olarak üretilir.

## Neden raw/ ve processed/ Gitignored?
- Scraping verileri büyük olabilir ve sık değişir → repo şişer.
- Her geliştirici kendi scraping verisiyle çalışır.
- `products.csv` ortak kaynak olarak yeterlidir.
