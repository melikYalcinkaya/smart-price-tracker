"""
log_notifier.py - Log tabanlı bildirim sistemi

Bu modül, fiyat düşüşlerini Python'un logging modülü
aracılığıyla log dosyasına yazmak için oluşturulmuştur.
Sorumlulukları:
- Fiyat düşüş bildirimlerini log dosyasına kaydetmek
- Log formatını ve seviyesini yapılandırmak

Kullanım:
    notifier = LogNotifier()
    notifier.notify("Laptop Model X fiyatı düştü: 15.000 TL → 12.500 TL")
"""

import logging


class LogNotifier:
    """Log dosyasına bildirim yazan sınıf."""

    def notify(self, message: str) -> None:
        """
        Verilen mesajı log sistemi aracılığıyla kaydeder.

        Args:
            message (str): Kaydedilecek bildirim mesajı.
        """
        # TODO: logging.info veya logging.warning ile mesajı kaydet
        # TODO: Log dosyasının yolunu config/settings.py'den al
        pass
