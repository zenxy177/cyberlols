# Warxy Presence Bot

Bio sitesine kendi Discord durumunu (çevrimiçi durum, oynanan oyun, Spotify) sunan küçük bir bot + HTTP/WebSocket servisi. Lanyard bağımlılığı yoktur.

## Gereksinimler

- Node.js 18+
- Discord Developer Portal'da bir bot uygulaması
- Botun, hedef kullanıcıyla **aynı sunucuda** olması
- Developer Portal > Bot sekmesinde şu intent'lerin açık olması:
  - **Presence Intent** (zorunlu)
  - **Server Members Intent** (üye bilgisi için önerilir)

## Ortam değişkenleri

| Değişken | Zorunlu | Açıklama |
| --- | --- | --- |
| `DISCORD_TOKEN` | Evet (mock hariç) | Bot token'ı. Asla istemciye/siteye koymayın. |
| `TARGET_USER_ID` | Evet (mock hariç) | Durumu gösterilecek Discord kullanıcı ID'si. |
| `PRESENCE_API_KEY` | Evet | Site ile bot arasındaki ortak anahtar. Uzun ve rastgele olmalı. |
| `GUILD_ID` | Hayır | Presence'ın aranacağı sunucu. Boşsa botun bulunduğu tüm sunucular taranır. |
| `PORT` / `SERVER_PORT` | Hayır | Varsayılan `3001`. Wispbyte genelde otomatik atar. |
| `MOCK_PRESENCE` | Hayır | `1` ise Discord'a bağlanmadan örnek veri döner (yerel test). |

## Wispbyte kurulumu

1. Bu `bot/` klasörünü sunucuya yükleyin (veya Git ile çekin).
2. Panelde `npm install` çalıştırın.
3. Başlangıç komutu: `npm start` (alternatif: `node index.js`).
4. Ortam değişkenlerini panelin Environment/Startup bölümüne girin.
5. Panelde ayrılmış public port varsa not edin. URL genelde `http://SUNUCU_IP:PORT` biçimindedir.
6. Public port yoksa Cloudflare Tunnel / playit.gg gibi bir tünelle HTTPS adresi üretin.

Wispbyte panelinde dosya yükleme/ Git deploy seçeneklerinden biriyle `bot/` içeriğini koyun; kök dizinde `package.json` görünmelidir.

## Uç noktalar

- `GET /health` — anahtarsız durum kontrolü.
- `GET /presence` — `x-api-key` başlığı (veya `?key=`) ile Lanyard uyumlu JSON.
- `GET /debug` — `x-api-key` başlığı (veya `?key=`) ile teşhis: botun sunucuları, hedefin üyeliği ve presence durumu.
- `GET /ws` — WebSocket; bağlantıda ve her değişiklikte aynı JSON paketini gönderir. Anahtar `?key=` ile verilir.

```bash
curl -H "x-api-key: $PRESENCE_API_KEY" http://localhost:3001/presence
curl -H "x-api-key: $PRESENCE_API_KEY" http://localhost:3001/debug
curl http://localhost:3001/health
```

Yerel test:

```bash
MOCK_PRESENCE=1 PRESENCE_API_KEY=test node index.js
```

## Site tarafı

Sitede `.env.local` (veya Vercel ortam değişkenleri) içine ekleyin:

```bash
PRESENCE_API_URL=http://SUNUCU_IP:PORT
PRESENCE_API_KEY=bot_ile_ayni_anahtar
```

Bu değerler yalnızca sunucu tarafında kullanılır; tarayıcıya sızmaz. Site veriyi `/api/presence` (REST) ve `/api/presence/stream` (SSE, botun WebSocket'ine köprü) üzerinden okur.
