/**
 * @fileoverview Kriptografik anahtar yönetimi ve rotasyon işlemleri.
 * Bu modül, uygulamanın asimetrik (RSA) anahtarlarını üretir, bellekte tutar
 * ve belirlenen periyotlarda güvenli bir şekilde yenilenmesini sağlar.
 */

const crypto = require('crypto');

/**
 * KeyManager sınıfı, sistemin anahtar yaşam döngüsünü (lifecycle) yönetir.
 * Singleton deseni kullanılarak tüm uygulamanın aynı anahtar örneğine erişmesi sağlanır.
 */
class KeyManager {
    /**
     * Sınıf başlatıldığında mevcut anahtar değerlerini null olarak atar
     * ve sistemin kullanacağı ilk anahtar çiftini anında üretir.
     */
    constructor() {
        this.publicKey = null;
        this.privateKey = null;
        this.createdAt = null;
        this.keyId = 0;
        
        // Sistem ayağa kalktığında ilk anahtarı otomatik oluştur (ID: 1)
        this.rotateKeys();
    }

    /**
     * Yeni bir RSA-2048 anahtar çifti üretir ve mevcut anahtarların üzerine yazar.
     * Bu işlem (Rotation), eski anahtarların sızma ihtimaline karşı sistemi korur.
     * @returns {void}
     */
    rotateKeys() {
        console.log(`[Güvenlik] Anahtar rotasyonu başlatıldı... Eski anahtar ID: ${this.keyId}`);
        
        // crypto modülü ile asimetrik şifreleme için RSA anahtar çifti üretimi
        // 2048 bit uzunluk, modern standartlar (ISO 27001 vs.) için önerilen minimum güvenli değerdir.
        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: 'spki', // Standart public key formatı
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs8', // Standart private key formatı
                format: 'pem'
            }
        });

        // Üretilen yeni anahtarları ve zaman damgasını sınıf özelliklerine kaydet
        this.publicKey = publicKey;
        this.privateKey = privateKey;
        this.createdAt = new Date();
        this.keyId += 1; // Her rotasyonda anahtar kimliğini (ID) artır

        console.log(`[Güvenlik] Yeni RSA anahtar çifti başarıyla oluşturuldu. Yeni Anahtar ID: ${this.keyId}`);
        console.log(`[Güvenlik] Oluşturulma Tarihi: ${this.createdAt}`);
    }

    /**
     * Uygulamanın diğer bölümlerinin (örneğin JWT üretim/doğrulama aşamaları)
     * aktif olan anahtarlara erişmesini sağlayan kapsülleme (getter) metodudur.
     * @returns {Object} Mevcut public key, private key, ID ve oluşturulma tarihi.
     */
    getCurrentKeys() {
        return {
            publicKey: this.publicKey,
            privateKey: this.privateKey,
            keyId: this.keyId,
            createdAt: this.createdAt
        };
    }
}

// Tüm projenin aynı örneği (instance) kullanması için singleton olarak dışa aktar
module.exports = new KeyManager();