"""
email_notifier.py - SMTP e-posta bildirim sistemi

Bu modül, fiyat düşüşlerinde kullanıcıya SMTP üzerinden
e-posta bildirimi göndermek için oluşturulmuştur.
Sorumlulukları:
- .env dosyasından SMTP yapılandırmasını okumak
- HTML veya düz metin e-posta oluşturup göndermek

Kullanım:
    notifier = EmailNotifier()
    notifier.notify("Laptop Model X fiyatı düştü: 15.000 TL → 12.500 TL")
"""

import smtplib


class EmailNotifier:
    """SMTP ile e-posta bildirimi gönderen sınıf."""

    def notify(self, message: str) -> None:
        """
        Verilen mesajı e-posta olarak yapılandırılmış alıcıya gönderir.

        .env dosyasındaki SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD
        ve NOTIFICATION_EMAIL değerlerini kullanır.

        Args:
            message (str): Gönderilecek bildirim mesajı.
        """
        # TODO: os.environ veya config/settings.py'den SMTP bilgilerini oku
        # TODO: smtplib.SMTP ile bağlantı kur
        # TODO: MIMEText ile e-posta oluştur ve gönder
        pass
