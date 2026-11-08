# PeerCord

**PeerCord**, P2P (Peer-to-Peer) tabanlı, sunucusuz Discord alternatifi uygulamasıdır. WebTorrent ve Trystero kullanarak doğrudan araçlar arasında iletişim sağlar, merkezi bir sunucu gerektirmez.

## 🌟 Özellikler

| Özellik | Açıklama |
|---------|----------|
| **Metin Kanalları** | Gerçek zamanlı metin sohbeti, mesaj geçmişi ve yanıtlama |
| **Sesli Kanal** | 2-li farklı eşler arasında sesli iletişim (WebRTC tabanlı) |
| **Ekran Paylaşımı** | Yüksek kaliteli ekran görüntüsü aktarımı (WebRTC Screen Share) |
| **Dosya Transferi** | P2P üzerinden dosya gönderme (max 200 MB) |
| **Uçtan Uca Şifreli Odalar** | Parolalı odalar, mesajlar AES-256 ile şifrelenir |
| **Yjs CRDT Senkronu** | Çakışmaz veri yapıları, geçmiş mesajlar ve oda durumu senkronizasyonu |
| **IndexedDB Kalıcılığı** | Tarayıcıda offline mesaj önbelleği, yenilemede bile geçerli kalır |
| **Tema Desteği** | Karartılmış, açık ve AMOLED temalı arayüz |

## 🚀 Kurulum

```bash
# Bağımlılıkları kur
pnpm install

# Geliştirme sunucusunu başlat (http://localhost:5180)
pnpm dev

# Üretim build'i oluştur
pnpm build
```

## 📋 Kullanım

PeerCord, sadece 3 adımda çalışır:

1. **Sunucu Oluştur**: Uygulama açıldığında ilk sayfada "Sunucu Oluştur" butonuna tıkla.
2. **Davet Linkini Paylaş**: Oluşturduğun odaya gönderdiğin linki arkadaşlarınla paylaş.
3. **Karşı Taraf Katıl**: Diğer taraf linki açtığında odaya otomatik olarak katılır.

```
┌─────────────┐         ┌─────────────┐
│    Tarayıcı A    │  <--->   │    Tarayıcı B    │
│  (Sunucu Oluştur) │         │   (Link Aç)      │
└─────────────┘         └─────────────┘
```

### Şifreli Oda (Encrypted Room)

- "Uçtan uca şifreli oda" seçeneğini işaretle
- Parola belirle (min 6 karakter)
- Davet linkiyle paylaştığın kişi parolayı girmeli

## 🏗️ Mimari

```
src/
├── lib/
│   ├── p2p/           # P2P iletişim katmanı (Trystero, WebRTC)
│   │   ├── transport.ts    # Taşıma mantiği (roomId, peerId)
│   │   ├── crypto.ts       # Şifreleme (AES-GCM, HKDF)
│   │   ├── identity.ts     # Kimlik yönetimi (ed25519)
│   │   └── transfer.ts     # Dosya aktarımı
│   ├── store/         # Zustand global state
│   │   ├── store.ts      # Ana mağaza ve eylemler
│   │   ├── yjs.ts        # Yjs CRDT yönetimi
│   │   ├── seed.ts       # Varsayılan veriler
│   │   └── contracts.ts  # Tip sözleşmeleri
│   └── ui/               # Bileşenler
│       ├── primitives/   # Radix UI bazlı temel bileşenler
│       ├── layout/       # Sidebar, ChannelHeader, AppShell
│       └── theme/        # Tema yönetimi
├── features/
│   ├── chat/           # Mesaj listesi, composer, tepkiler
│   ├── voice/          # Ses bağlantısı, ses çubuğu
│   ├── onboarding/     # WelcomeScreen, oda oluştur/katıl formları
│   ├── modals/         # GuildSettings, Invite, UserSettings
│   └── search/         # Mesaj arama
```

## ⚙️ Teknoloji Stek

| Katman | Teknoloji |
|--------|-----------|
| **Framework** | React 19 + TypeScript 7 |
| **Build** | Vite 8 |
| **Stil** | Tailwind CSS v4 + Radix UI |
| **P2P** | Trystero 0.26 (nostr relay üzerinden WebRTC) |
| **CRDT** | Yjs 13 + y-indexeddb |
| **State** | Zustand 5 |
| **Sıkıştırma** | pako (gzip) |
| **Kimlik** | @noble/curves (ed25519) |

## ⚠️ Bilinen Sınırlar

| Sınırlama | Açıklama |
|-----------|----------|
| **Mesh Ses** | Kalabalık odalarda (3+ eş) ses kalitesi düşebilir. Çoğu ölçeklendirme için SFU (Selective Forwarding Unit) gerekir. |
| **Sinyalleşme** | WebRTC handshake'i için genel nostr relay'lerine güvenir. Gizlilik için özel relay konfigürasyonu önerilir. |
| **Dosya Limiti** | Yüksek verimlilik için 200 MB dosya transferi limiti vardır. |
| **Browser Desteği** | Chrome, Edge, Firefox, Safari (desktop) desteklenir. Mobil destek sınırlıdır. |

## 🧪 QA Test Betikleri

`.qa/` klasörü, Playwright tabanlı uçtan uca test betiklerini içerir:

```bash
# Testleri çalıştır
node .qa/qa.mjs

# Sonuçları kontrol et
# - GEÇTİ / KALDI durumları
# - Hata raporları (dosya:satır formatında)
```

## 📦 Geliştirme

```bash
# Lint kontrolü
pnpm lint

# Build öncesi tipleri kontrol et
pnpm build

# Preview (production sunucusu)
pnpm preview
```

## 🤝 Katkı

Bu proje [MIT](LICENSE) lisansı altında geliştirilmektedir. Katkıda bulunmadan önce `git status` kontrolü yapın.