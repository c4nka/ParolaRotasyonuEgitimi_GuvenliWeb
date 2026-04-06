# Temel imaj olarak hafif bir Node.js sürümü kullan
FROM node:18-alpine

# Konteyner içindeki çalışma dizinini ayarla
WORKDIR /usr/src/app

# Bağımlılık dosyalarını kopyala
COPY package*.json ./

# Bağımlılıkları yükle (Sadece production için)
RUN npm install --only=production

# Proje dosyalarını (src vb.) kopyala
COPY . .

# Uygulamanın çalışacağı portu dışa aç
EXPOSE 3000

# Uygulamayı başlat
CMD ["npm", "start"]
