![İstinye Üniversitesi Logosu](https://www.istinye.edu.tr/sites/default/files/2021-03/isu_logo_tr.png)

# Güvenli Web Yazılımı: 90 Günlük Asimetrik Anahtar Rotasyonu (Key Rotation) API

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)

**Öğrenci:** Raşit ÇANKAYA (2420191006)  
**Üniversite / Bölüm:** İstinye Üniversitesi - Bilişim Güvenliği Teknolojisi (İÖ)  
**Ders:** Güvenli Web Yazılımı Geliştirme  
**Danışman:** [Danışman Adını Buraya Yazın]  

---

## 📑 İçindekiler
1. [Projenin Amacı ve Kurumsal Dayanağı](#-projenin-amacı-ve-kurumsal-dayanağı)
2. [Kullanılan Teknolojiler ve Bağımlılıklar](#-kullanılan-teknolojiler-ve-bağımlılıklar-dependencies)
3. [Proje Dosya Yapısı](#-proje-dosya-yapısı)
4. [Kurulum ve Çalıştırma Adımları](#-kurulum-ve-çalıştırma-adımları)
5. [Sık Karşılaşılan Hatalar ve Çözümleri](#️-sık-karşılaşılan-hatalar-ve-çözümleri-troubleshooting)
6. [Test Senaryoları](#-test-senaryoları-eğitmen-ve-denetçi-için)
7. [Ekran Görüntüleri ile Adım Adım Çalışma Kanıtı](#-ekran-görüntüleri-ile-adım-adım-çalışma-kanıtı)
8. [Lisans](#-lisans)

---

## 📌 Projenin Amacı ve Kurumsal Dayanağı

*"Aynı anahtarı 5 yıl kullanırsan biri kopyasını mutlaka çıkarır."* prensibinden yola çıkılarak geliştirilen bu sistem, statik şifrelerin ve anahtarların oluşturduğu güvenlik açıklarını kapatmayı hedefler. 

Bu mimari, **ISO 27001 Bilgi Güvenliği Yönetim Sistemi** denetimlerinde kritik bir rol oynayan **Ek A (Kriptografi ve Anahtar Yönetimi)** standartlarına doğrudan uyumluluk sağlar. Kriptografik anahtarların belirli periyotlarla yenilenmesi, olası bir sızıntı durumunda geçmişte sızan verilerin ve gelecekteki iletişimlerin güvenliğini (Forward Secrecy) garanti altına alarak, kurumsal veri ihlali risklerini ve doğabilecek hukuki yükümlülükleri minimize eder.

💡 *Daha fazla mimari ve teknik detay için [docs/architecture.md](./docs/architecture.md) dosyasına göz atabilirsiniz.*

---

## 📦 Kullanılan Teknolojiler ve Bağımlılıklar (Dependencies)

* **`express` (v4.18+):** Uygulamanın web sunucusu altyapısı ve HTTP API uç noktaları.
* **`jsonwebtoken` (v9.0+):** Asimetrik (RS256) algoritması ile JWT üretimi ve doğrulaması.
* **`node-cron` (v3.0+):** Anahtar rotasyon sürecini her gün denetleyen zamanlanmış görev yöneticisi.
* **`crypto` (Node.js Dahili):** 2048-bit RSA Public/Private Key çiftlerinin güvenli üretimi.

---

## 📂 Proje Dosya Yapısı
```text
key-rotation-api/
├── package.json
├── docs/
│   └── architecture.md  (Sistem mimarisi dokümantasyonu)
├── src/
│   ├── keyManager.js    (Anahtar üretim ve rotasyon mantığı)
│   └── server.js        (API sunucusu ve Cron Job)
└── README.md            (Ana Dokümantasyon)
```
## 🚀 Kurulum ve Çalıştırma Adımları

Gereksinimler: 

Bilgisayarınızda Node.js yüklü olmalıdır.

Proje dosyalarını bir klasöre çıkarın ve VS Code ile açın.

VS Code terminalini (Terminal > New Terminal) açın ve bağımlılıkları yükleyin:

```bash
npm install
```

Sunucuyu başlatın:

```bash
npm start
```
