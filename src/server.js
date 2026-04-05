const express = require('express');
const jwt = require('jsonwebtoken');
const cron = require('node-cron');
const keyManager = require('./keyManager');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const ROTATION_DAYS = 90;

// --- 1. OTOMATİK ROTASYON GÖREVİ (CRON JOB) ---
// Bu görev her gece yarısı (00:00) çalışarak anahtarın yaşını kontrol eder.
cron.schedule('0 0 * * *', () => {
    const keys = keyManager.getCurrentKeys();
    const now = new Date();
    const ageInMs = now - keys.createdAt;
    const ageInDays = ageInMs / (1000 * 60 * 60 * 24);

    console.log(`[Sistem] Günlük güvenlik kontrolü. Mevcut anahtarın yaşı: ${Math.round(ageInDays)} gün.`);

    if (ageInDays >= ROTATION_DAYS) {
        console.log(`[Uyarı] Anahtar yaşı ${ROTATION_DAYS} günü geçti! Rotasyon tetikleniyor...`);
        keyManager.rotateKeys();
    }
});

// --- 2. API UÇ NOKTALARI ---

// Kullanıcı girişi simülasyonu ve JWT üretimi
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    // Basit doğrulama simülasyonu
    if (username === 'admin' && password === 'securepassword') {
        const keys = keyManager.getCurrentKeys();
        
        // Asimetrik şifreleme (RS256) ile JWT oluşturulması
        const token = jwt.sign(
            { user: username, role: 'admin' },
            keys.privateKey,
            { algorithm: 'RS256', expiresIn: '1h', keyid: keys.keyId.toString() }
        );

        return res.json({ message: 'Giriş başarılı', token });
    }

    return res.status(401).json({ error: 'Geçersiz kimlik bilgileri' });
});

// Güvenli veriye erişim (Rotasyon kanıtı için)
app.get('/api/secure-data', (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Token bulunamadı' });
    }

    const token = authHeader.split(' ')[1];
    const keys = keyManager.getCurrentKeys();

    try {
        // Gelen token'ı mevcut Public Key ile doğrula
        const decoded = jwt.verify(token, keys.publicKey, { algorithms: ['RS256'] });
        res.json({ 
            message: 'Erişim onaylandı. Veriler güvende.', 
            data: 'Çok gizli proje verileri',
            decodedToken: decoded,
            activeKeyId: keys.keyId
        });
    } catch (err) {
        // Eğer anahtar rotasyona uğradıysa, eski tokenlar "invalid signature" hatası verir.
        // Bu durum rotasyonun başarılı bir şekilde eski erişimleri kestiğinin kanıtıdır.
        res.status(403).json({ 
            error: 'Token geçersiz veya anahtar süresi dolmuş (Rotasyon gerçekleşmiş olabilir). Lütfen yeniden giriş yapın.',
            details: err.message
        });
    }
});

// Manuel rotasyon tetikleyici (Hocanızın test etmesi için)
app.post('/api/force-rotation', (req, res) => {
    keyManager.rotateKeys();
    res.json({ message: 'Anahtar rotasyonu manuel olarak tetiklendi.' });
});

app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor.`);
    console.log(`İlk anahtar ID'si: ${keyManager.getCurrentKeys().keyId}`);
});