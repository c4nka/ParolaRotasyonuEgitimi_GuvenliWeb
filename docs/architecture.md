# Sistem Mimarisi ve Güvenlik Dokümantasyonu

Bu doküman, Parola Rotasyonu (Key Rotation) projesinin teknik altyapısını, güvenlik tercihlerinin gerekçelerini ve sistemin çalışma mantığını detaylandırmaktadır. Bu mimari, bilgi güvenliği standartları (örneğin ISO 27001) göz önünde bulundurularak tasarlanmıştır.

## 1. Mimari Tercihlerin Gerekçeleri

Proje geliştirilirken geleneksel şifreleme yöntemleri yerine modern ve güvenli bir yaklaşım seçilmesinin temel nedenleri aşağıdadır:

* **Neden Asimetrik Şifreleme (RS256) Seçildi?**
  Geleneksel HMAC (HS256) algoritmalarında aynı gizli anahtar (secret key) hem token oluşturmak hem de doğrulamak için kullanılır. Bu durum, doğrulama yapan her servisin anahtara sahip olmasını gerektirir ve anahtarın sızma riskini artırır. Bu projede kullanılan **RSA (Asimetrik)** mimarisinde ise:
  * **Private Key:** Sadece kimlik doğrulama sunucusunda kalır ve token imzalamak için kullanılır. Dışarıya kesinlikle kapalıdır.
  * **Public Key:** Herkesle veya diğer mikroservislerle paylaşılabilir ve sadece doğrulamada kullanılır. Bu izolasyon, yetkiyi sınırlandırarak anahtar yönetimini çok daha güvenli kılar.

* **Neden Otomatik Rotasyon Tercih Edildi?**
  Sabit ve yıllarca değişmeyen anahtarlar, zamanla kaba kuvvet (brute-force) veya sistem sızıntıları yoluyla ele geçirilme riskine sahiptir. Sisteme entegre edilen 90 günlük otomatik rotasyon periyodu, bir anahtar sızsa bile saldırganın bu anahtarı kullanabileceği süreyi kısıtlar.

## 2. Temel Bileşenler ve Görevleri

Sistem üç ana modül üzerinden birbirine entegre şekilde çalışmaktadır:

1. **KeyManager (Çekirdek Kriptografi):** Şifreleme işlemlerini soyutlar. 2048-bit RSA anahtar çiftlerinin üretiminden, bellekte (RAM) güvenli tutulmasından ve anahtar kimliklerinin (Key ID) yönetiminden sorumludur.
2. **API Sunucusu (Express.js):** Dışarıdan gelen HTTP isteklerini karşılar. Kullanıcı girişlerinde (Login) Private Key ile token üretir, korumalı rotalarda (Secure Data) Public Key ile yetki kontrolü yapar.
3. **Zamanlanmış Görev (Cron Job):** Sistemin otomatik denetim mekanizmasıdır. `node-cron` kullanılarak her gece saat 00:00'da tetiklenir, anahtarın yaşını denetler ve 90 günü dolan anahtarların rotasyon sürecini başlatır.

## 3. Güvenlik Mekanizmalarının Sonuçları

Uygulanan bu rotasyon mimarisinin sistem güvenliği üzerindeki doğrudan sonuçları şunlardır:

* **Anlık Erişim Kesintisi (Invalidation):** Yeni bir anahtar üretildiği anda, eski anahtarla imzalanmış olan tüm JWT'ler matematiksel olarak geçersiz (invalid signature) hale gelir. Bu durum, veritabanında bir "Kara Liste" (Blacklist) tutmaya gerek kalmadan sızan oturumları anında sonlandırmayı sağlar.
* **İleriye Dönük Gizlilik (Forward Secrecy):** Bir Private Key ele geçirilirse, saldırgan sadece o anahtarın geçerli olduğu 90 günlük dönemdeki verilere odaklanabilir. Rotasyon sayesinde eski ve yeni iletişimlerin güvenliği tamamen korunmuş olur.

## 4. Sistem Akış Şeması (Workflow)

Sistemin operasyonel akışı şu sırayla gerçekleşir:

1. **Başlatma:** Sunucu (Node.js) ayağa kalkar, `KeyManager` ilk RSA çiftini üretir ve belleğe alır.
2. **Kimlik Doğrulama:** Kullanıcı başarılı bir giriş yapar. Sistem aktif `Private Key` ile token imzalar ve header kısmına aktif `kid` (Key ID) değerini ekler.
3. **Yetki Doğrulama:** Kullanıcı token ile korumalı bir veriye erişmek ister. Sunucu, kendi elindeki `Public Key` ile imzanın geçerliliğini doğrular.
4. **Rotasyon (Tazelenme):** Sayaç 90 günü vurduğunda (veya manuel olarak `/api/force-rotation` tetiklendiğinde) eski anahtarlar imha edilir, anında yeni bir çift üretilir. Eski tokenlar artık doğrulanamaz hale gelir ve sistem 403 HTTP kodu döner.

## 5. Üretim (Production) Ortamı İçin Genişletme Önerileri

Bu proje, konsepti ispatlamak (Proof of Concept) amacıyla geliştirilmiş bir eğitim prototipidir. Gerçek bir üretim ortamında (Production) şu iyileştirmelerle genişletilmesi öngörülmektedir:

* **Donanımsal Güvenlik (HSM/KMS):** Anahtarların sunucu belleği (RAM) yerine AWS KMS, Azure Key Vault veya donanımsal güvenlik modüllerinde (HSM) saklanması.
* **Veritabanı Kalıcılığı (Persistence):** Anahtar ID'lerinin ve oluşturulma tarihlerinin Redis veya PostgreSQL gibi bir veritabanında saklanarak sunucu yeniden başlatılsa (Restart) bile 90 günlük rotasyon takibinin sıfırlanmadan devam etmesinin sağlanması.
* **JWKS (JSON Web Key Set) Desteği:** Public Key'lerin `/well-known/jwks.json` gibi standart bir endpoint üzerinden yayınlanarak diğer API'lerin veya mikroservislerin merkezi olmayan (decentralized) şekilde token doğrulamasına izin verilmesi.