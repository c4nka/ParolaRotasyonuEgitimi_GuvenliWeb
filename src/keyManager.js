const crypto = require('crypto');

class KeyManager {
    constructor() {
        this.publicKey = null;
        this.privateKey = null;
        this.createdAt = null;
        this.keyId = 0;
        
        // Başlangıçta ilk anahtarları üret
        this.rotateKeys();
    }

    // Asimetrik (RSA) anahtar çifti üreten fonksiyon
    rotateKeys() {
        console.log(`[Güvenlik] Anahtar rotasyonu başlatıldı... Eski anahtar ID: ${this.keyId}`);
        
        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem'
            }
        });

        this.publicKey = publicKey;
        this.privateKey = privateKey;
        this.createdAt = new Date();
        this.keyId += 1;

        console.log(`[Güvenlik] Yeni RSA anahtar çifti başarıyla oluşturuldu. Yeni Anahtar ID: ${this.keyId}`);
        console.log(`[Güvenlik] Oluşturulma Tarihi: ${this.createdAt}`);
    }

    // Geçerli anahtarları dışarı aktaran yardımcı fonksiyon
    getCurrentKeys() {
        return {
            publicKey: this.publicKey,
            privateKey: this.privateKey,
            keyId: this.keyId,
            createdAt: this.createdAt
        };
    }
}

// Singleton deseni ile tek bir instance dışa aktarılıyor
module.exports = new KeyManager();