# Güvenli Web Yazılımı: 90 Günlük Asimetrik Anahtar Rotasyonu (Key Rotation) API

Bu proje, "Güvenli Web Yazılımı Geliştirme" dersi kapsamında, kriptografik anahtarların (Secret Keys/Passwords) yaşam döngülerini yönetmek amacıyla geliştirilmiş bir API uygulamasıdır. Proje, asimetrik şifreleme (RSA) ve JSON Web Token (JWT) teknolojilerini kullanarak **90 günde bir otomatik anahtar rotasyonu** (Key Rotation) gerçekleştirir.

## 📌 Projenin Amacı ve Kurumsal Dayanağı

*"Aynı anahtarı 5 yıl kullanırsan biri kopyasını mutlaka çıkarır."* prensibinden yola çıkılarak geliştirilen bu sistem, statik şifrelerin ve anahtarların oluşturduğu güvenlik açıklarını kapatmayı hedefler. 

Bu mimari, **ISO 27001 Bilgi Güvenliği Yönetim Sistemi** denetimlerinde kritik bir rol oynayan **Ek A (Kriptografi ve Anahtar Yönetimi)** standartlarına doğrudan uyumluluk sağlar. Kriptografik anahtarların belirli periyotlarla yenilenmesi, olası bir sızıntı durumunda geçmişte sızan verilerin ve gelecekteki iletişimlerin güvenliğini (Forward Secrecy) garanti altına alarak, kurumsal veri ihlali risklerini ve doğabilecek hukuki yükümlülükleri minimize eder.

---

## 📦 Kullanılan Teknolojiler ve Bağımlılıklar (Dependencies)

Projenin çalışması için `package.json` içerisinde tanımlı olan bağımlılıkların işlevleri aşağıda açıklanmıştır:

* **`express` (v4.18+):** Uygulamanın web sunucusu altyapısını ve HTTP API uç noktalarını (endpoints) oluşturmak için kullanılmıştır.
* **`jsonwebtoken` (v9.0+):** Kullanıcı doğrulama işlemlerinde endüstri standardı olan JWT (JSON Web Token) üretmek ve doğrulamak için kullanılmıştır. Bu projede simetrik (HMAC) yerine, çok daha güvenli olan **asimetrik (RS256)** algoritması tercih edilmiştir.
* **`node-cron` (v3.0+):** Anahtar rotasyon sürecinin her gün otomatik olarak denetlenmesini sağlayan zamanlanmış görev (Cron Job) yöneticisidir. Sistemin 90 günlük periyodu takip etmesini sağlar.
* **`crypto` (Node.js Dahili):** 2048-bit RSA Public/Private Key çiftlerinin güvenli bir şekilde üretilmesi için kullanılmış çekirdek modüldür. Ekstra bir yüklemeye gerek yoktur.

---

## 🚀 Kurulum ve Çalıştırma Adımları

Bu proje Windows işletim sisteminde çalışacak şekilde optimize edilmiştir. 

1. **Gereksinimler:** Bilgisayarınızda **Node.js** yüklü olmalıdır.
2. Proje dosyalarını bir klasöre çıkarın ve VS Code (veya tercih ettiğiniz bir editör) ile açın.
3. VS Code terminalini (`Terminal > New Terminal`) açın ve bağımlılıkları yüklemek için şu komutu çalıştırın:
   ```bash
   npm install

Kurulum tamamlandıktan sonra sunucuyu başlatın:
 ```bash
npm start
```
Konsolda [Güvenlik] Yeni RSA anahtar çifti başarıyla oluşturuldu. ve Sunucu 3000 portunda çalışıyor. mesajlarını gördüğünüzde sistem API isteklerini karşılamaya hazırdır.

## ⚠️ Sık Karşılaşılan Hatalar ve Çözümleri (Troubleshooting)

Windows işletim sistemlerinde projeyi ilk defa kurarken (3. Adımda) aşağıdaki PowerShell betik engelleme hatasıyla karşılaşabilirsiniz.

Karşılaşılan Hata:

npm : File ... cannot be loaded because running scripts is disabled on this system. ... CategoryInfo: SecurityError: (:) [], PSSecurityException

Hatanın Sebebi: Windows PowerShell, güvenlik politikaları gereği dışarıdan gelen scriptlerin (npm komutları dahil) çalışmasını zararlı yazılım koruması amacıyla varsayılan olarak engeller.

Çözüm 1: PowerShell İznini Düzenleme (Önerilen Kalıcı Çözüm)

Windows arama çubuğuna PowerShell yazın, sağ tıklayıp "Yönetici olarak çalıştır" (Run as Administrator) seçeneğini seçin.

Aşağıdaki komutu yapıştırıp Enter'a basın:

Set-ExecutionPolicy RemoteSigned

Gelen uyarıya Y (veya sistem dilinize göre E) yazarak onay verin. Ardından VS Code'u açıp npm install işlemini tekrar deneyin.

Çözüm 2: Komut İstemcisi (CMD) Kullanımı (Hızlı Çözüm)

VS Code terminal penceresinin sağ üst köşesindeki "Aşağı Ok" simgesine tıklayarak terminal türünü PowerShell (PS) yerine standart Command Prompt (CMD) olarak değiştirin ve npm install komutunu bu yeni terminalde çalıştırın. CMD bu kısıtlamaya tabi değildir.

## 🧪 Test Senaryoları (Eğitmen ve Denetçi İçin)

Projenin 90 günlük rotasyon mantığını anında test edebilmek için özel bir force-rotation (manuel tetikleme) endpoint'i eklenmiştir. Aşağıdaki adımları standart bir Windows Komut İstemcisinden (CMD) sırasıyla test edebilirsiniz.

1. Sisteme Giriş ve Token Alımı:
Aşağıdaki komut ile sisteme giriş yapılır ve asimetrik (RS256) şifrelenmiş bir JWT elde edilir.

curl.exe -X POST http://localhost:3000/api/login -H "Content-Type: application/json" -d "{\"username\": \"admin\", \"password\": \"securepassword\"}"

(Dönen JSON içerisindeki "token" değerini kopyalayın)

2. Güvenli Veriye Erişim Doğrulaması:
Aşağıdaki komutta <TOKEN> yazan yere kopyaladığınız değeri yapıştırarak yetki gerektiren veriye ulaşmayı deneyin.

curl.exe -X GET http://localhost:3000/api/secure-data -H "Authorization: Bearer <TOKEN>"
(Sonuç: HTTP 200 - Veriye başarıyla ulaşılmalıdır)

3. Rotasyonu Manuel Tetikleme (Zaman Atlaması Simülasyonu):
Sistemin 90 gün sonra yapacağı otomatik rotasyon işlemini simüle etmek için aşağıdaki isteği gönderin:

curl.exe -X POST http://localhost:3000/api/force-rotation
(Sunucu konsolunda eski anahtarın iptal edilip yeni RSA anahtar çiftinin üretildiğini göreceksiniz. Logları inceleyin.)

4. Rotasyon Sonrası Güvenlik Kanıtı (Erişim Reddi - Invalidation Test):

2. adımı aynı token ile tekrar çalıştırın.

Anahtar değiştiği için sistem eski token'ın imzasını tanıyamayacak ve HTTP 403 Forbidden (Token geçersiz veya anahtar süresi dolmuş) hatası fırlatacaktır. Bu sonuç, olası bir token veya private key sızıntısının rotasyon mekanizması ile başarıyla etkisiz hale getirildiğinin matematiksel kanıtıdır.

## 👤 Hazırlayan

- **Ad Soyad:** Raşit ÇANKAYA
- **Öğrenci No:** 2420191006
- **Üniversite:** İstinye Üniversitesi
- **Bölüm:** Bilişim Güvenliği Teknolojisi (İÖ)
