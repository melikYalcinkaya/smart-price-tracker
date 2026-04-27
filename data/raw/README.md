<!-- 
raw/README.md - Bu dosya ham scraping çıktılarının saklandığı klasörü açıklar.
-->

# Ham Veri (raw/)

Bu klasör her scraping çalışmasının ham çıktılarını içerir.

- Dosyalar gitignored olduğundan sadece kendi lokalindeki veriler burada görünür.
- `csv_manager.merge_raw_files()` ile `processed/` klasörüne aktarılır.
- Dosya adı formatı: `YYYY-MM-DD_HH-MM-SS.csv`
