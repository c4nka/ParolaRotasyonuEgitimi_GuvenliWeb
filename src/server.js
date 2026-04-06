/**
 * @fileoverview Uygulamanın ana API sunucusu.
 * Express.js üzerinden HTTP rotalarını yönetir ve Cron Job ile
 * otomatik anahtar rotasyonu görevini zamanlar.
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const cron = require('node-cron');
const keyManager = require('./keyManager');

const app = express();
app.use(express.json());

// Çevresel değişkenlerden (ENV) portu al, yoksa 3000 kullan
const PORT = process.env.PORT || 3000;
// Anahtarların rotasyona gireceği gün sınırı
const ROTATION_DAYS = 90;

/**
 * ------------------------------------------------------------------
 * CONTROLLER FONKSİYONLARI (Modülerlik ve okunabilirlik için ayrıldı)
 * ------------------------------------------------------------------
 */

/**
 * Kullanıcı girişini simüle eder ve başarılıysa JWT token üretir.
 * Simetrik şifre yerine Asimetrik (RSA) kullanılarak güvenlik artırılmıştır.
 * * @param {Object} req - Express request nesnesi
 * @param {Object} res - Express response nesnesi
 */
const loginController = (req, res) => {
    const { username, password } = req.body;

    // Basit bir kimlik doğrulama simülasyonu (Veritabanı kontrolü yerine geçer)
    if (username === 'admin' && password === 'securepassword') {
        const keys = keyManager.getCurrentKeys();
        
        // Private key kullanılarak RS256 algoritması ile token imzalanır
        const token = jwt.sign(
            { user: username, role: 'admin' },
            keys.privateKey,
            { algorithm: 'RS256', expiresIn: '1h', keyid: keys.keyId.toString() }
        );

        return res.json({ message: 'Giriş başarılı', token });
    }

    return res.status(401).json({ error: 'Geçersiz kimlik bilgileri' });
};

/**
 * Gelen JWT token'ını mevcut Public Key ile doğrular.
 * Eğer anahtar rotasyona uğramışsa, eski token'lar otomatik olarak reddedilir.
 * * @param {Object} req - Express request nesnesi
 * @param {Object} res - Express response nesnesi
 */
const secureDataController = (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Token bulunamadı' });
    }

    const token = authHeader.split(' ')[1]; // "Bearer <token>" formatından token'ı ayıkla
    const keys = keyManager.getCurrentKeys();

    try {
        // Gelen token'ın mevcut public key ile kriptografik olarak doğrulanması
        const decoded = jwt.verify(token, keys.publicKey, { algorithms: ['RS256'] });
        res.json({ 
            message: 'Erişim onaylandı. Veriler güvende.', 
            data: 'Çok gizli proje verileri',
            decodedToken: decoded,
            activeKeyId: keys.keyId
        });
    } catch (err) {
        // Anahtar rotasyona girmişse (veya token süresi dolmuşsa) erişimi engelle
        res.status(403).json({ 
            error: 'Token geçersiz veya anahtar süresi dolmuş (Rotasyon gerçekleşmiş olabilir). Lütfen yeniden giriş yapın.',
            details: err.message
        });
    }
};

/**
 * Sistemin 90 günlük bekleme süresini atlayıp anında rotasyon yapmasını sağlar.
 * Bu endpoint yalnızca eğitim, denetim ve test senaryoları için eklenmiştir.
 * * @param {Object} req - Express request nesnesi
 * @param {Object} res - Express response nesnesi
 */
const forceRotationController = (req, res) => {
    keyManager.rotateKeys();
    res.json({ message: 'Anahtar rotasyonu manuel olarak tetiklendi.' });
};

/**
 * Otomatik rotasyon denetimini yapan zamanlanmış görev (Cron Job).
 * Her gece yarısı çalışarak anahtarın yaşını hesaplar, 90 günü geçerse yeniler.
 */
const checkAndRotateKeys = () => {
    const keys = keyManager.getCurrentKeys();
    const now = new Date();
    
    // Milisaniye cinsinden yaş farkını güne çevir
    const ageInMs = now - keys.createdAt;
    const ageInDays = ageInMs / (1000 * 60 * 60 * 24);

    console.log(`[Sistem] Günlük güvenlik kontrolü. Mevcut anahtarın yaşı: ${Math.round(ageInDays)} gün.`);

    // Yaş sınırı aşıldıysa rotasyonu tetikle
    if (ageInDays >= ROTATION_DAYS) {
        console.log(`[Uyarı] Anahtar yaşı ${ROTATION_DAYS} günü geçti! Rotasyon tetikleniyor...`);
        keyManager.rotateKeys();
    }
};


/**
 * ------------------------------------------------------------------
 * ROTA VE SUNUCU TANIMLAMALARI
 * ------------------------------------------------------------------
 */

// Cron Job: Her gece saat 00:00'da çalışır
cron.schedule('0 0 * * *', checkAndRotateKeys);

// API Rotaları (Endpoints)
app.post('/api/login', loginController);
app.get('/api/secure-data', secureDataController);
app.post('/api/force-rotation', forceRotationController);

// Sunucuyu belirtilen portta dinlemeye başla
app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor.`);
    console.log(`İlk anahtar ID'si: ${keyManager.getCurrentKeys().keyId}`);
});
