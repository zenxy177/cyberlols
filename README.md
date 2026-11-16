# Kişisel Bio Sitesi

Türkçe arayüzlü, herkese açık tek kişilik bio profili ve sahibine özel yönetim paneli. Çok kullanıcılı kayıt veya herkese açık kullanıcı dizini yoktur. guns.lol yalnızca özellik referansıdır; site logosu, metinleri ve görselleri özgün tutulur.

## Gereksinimler

- Node.js 20.18 veya üzeri
- Ücretsiz Supabase projesi
- Yerel geliştirme için npm

## Yerel kurulum

1. Supabase'de yeni bir proje oluştur.
2. `supabase/schema.sql` içeriğini Supabase SQL Editor'da çalıştır. Daha önce bu projenin şemasını kurduysan dosyayı tekrar çalıştır; yeni video ve Discord sütunlarını mevcut tabloya ekleyen komutlar tekrar çalıştırılabilir.
3. Supabase Authentication > Users bölümünden kendin için bir kullanıcı oluştur. Uygulamada herkese açık kayıt formu bulunmaz.
4. Oluşturduğun kullanıcının UUID'sini kopyala ve SQL Editor'da şu sorguyu kendi UUID'nle çalıştır:

   ```sql
   insert into public.site_admins (user_id)
   values ('SUPABASE_AUTH_USER_UUID');
   ```

5. Supabase Authentication ayarlarında herkese açık kayıt olmayı kapalı tut. Yönetici hesabı yalnızca Supabase panelinden oluşturulmalıdır.
6. `.env.example` dosyasını `.env.local` adıyla kopyala. Supabase Project URL ve istemci için verilen publishable/anon anahtarı ekle:

   ```text
   NEXT_PUBLIC_SUPABASE_URL=https://proje-kimligi.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
   ANALYTICS_IP_SALT=uzun-rastgele-bir-metin
   DISCORD_CLIENT_ID=
   DISCORD_CLIENT_SECRET=
   DISCORD_REDIRECT_URI=http://localhost:3000/api/discord/callback
   PRESENCE_API_URL=http://localhost:3001
   PRESENCE_API_KEY=uzun-rastgele-bir-metin
   ```

   Service-role anahtarını bu değişkene veya tarayıcıya koyma. Kod, profil ve depolama değişikliklerini Supabase RLS politikalarıyla sınırlar. `ANALYTICS_IP_SALT` yalnızca sunucuda kullanılır; 24 saatlik tekil ziyaretçi sayımında IP adreslerini SHA-256 ile tuzlayarak saklar. Boş bırakılırsa tuzsuz hash kullanılır, bu yüzden canlıda rastgele ve uzun bir değer tanımla. `PRESENCE_API_URL` ve `PRESENCE_API_KEY` de yalnızca sunucu tarafında kullanılır; `NEXT_PUBLIC_` öneki vermeyin.

7. Discord hesabını bağlamak istiyorsan Discord Developer Portal'da bir uygulama oluştur. OAuth2 Redirects listesine `.env.local` içindeki `DISCORD_REDIRECT_URI` adresini eksiksiz ekle; istemci kimliği ve istemci sırrını ilgili değişkenlere yaz. Bu site OAuth ile yalnızca `identify` iznini ister; kullanıcı adı/avatarı profil bağlantısında gösterir. Canlı çevrimiçi durum ve Spotify kartı, `bot/` klasöründeki ayrı presence botundan gelir.

8. Proje klasöründe çalıştır:

   ```bash
   npm install
   npm run dev
   ```

   Profil için `http://localhost:3000`, yönetim paneli için `http://localhost:3000/admin/login` adresini aç. İlk kayıttan sonra adını, bio'nu, görsellerini ve bağlantılarını panelden ekle.

## Ücretsiz yayınlama

1. Projeyi kendi GitHub hesabındaki bir depoya koy ve Vercel'de ücretsiz Hobby hesabıyla bu depoyu içe aktar.
2. Vercel proje ayarlarında `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` ve `ANALYTICS_IP_SALT` ortam değişkenlerini tanımla. Discord hesabı bağlantısını kullanacaksan ayrıca `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET` ve canlı sitenin `https://alan-adin/api/discord/callback` adresini gösteren `DISCORD_REDIRECT_URI` değerlerini ekle; aynı geri dönüş adresini Discord Developer Portal'a da yaz. Canlı durum kartı için `PRESENCE_API_URL` ve `PRESENCE_API_KEY` değerlerini de ekle.
3. Deploy et. Vercel ücretsiz bir `vercel.app` alt alan adı sağlar; özel alan adı bu plana dahil değildir ve ücret gerektirebilir.

Supabase Free şu an veritabanı, Auth ve Storage içeriyor, ancak bir hafta etkin olmayan ücretsiz projeleri duraklatabiliyor. Böyle bir durumda profil verisi servis dışı kalabilir; Supabase panelinden projeyi tekrar etkinleştirmek gerekir. Ücretsiz plan şartları ve kotaları sağlayıcılar tarafından değiştirilebilir.

## Presence botu (Wispbyte)

`bot/` klasörü Lanyard'ın yerini alan kendi botumuzu içerir. Bot, Discord gateway'inden hedef kullanıcının durumunu okur; HTTP (`/presence`, `/health`) ve WebSocket (`/ws`) olarak yayınlar. Site bu veriyi `/api/presence` ve `/api/presence/stream` üzerinden sunucu tarafında okur; bot anahtarı tarayıcıya sızmaz.

1. Discord Developer Portal'da botu oluştur, **Presence Intent** ve **Server Members Intent**'i aç.
2. Botu, hedef kullanıcının bulunduğu sunucuya ekle.
3. `bot/` klasörünü Wispbyte'a yükle, `npm install` çalıştır ve başlangıç komutunu `npm start` yap.
4. Panel ortam değişkenlerine `DISCORD_TOKEN`, `TARGET_USER_ID`, `PRESENCE_API_KEY`, isteğe bağlı `GUILD_ID` ekle.
5. Panelin verdiği public portu/URL'yi sitedeki `PRESENCE_API_URL` değerine yaz; `PRESENCE_API_KEY` iki tarafta aynı olsun.
6. `TARGET_USER_ID`, yönetim panelindeki Discord Kullanıcı ID ile aynı olmalı.

Ayrıntılı kurulum ve yerel `MOCK_PRESENCE` testi için `bot/README.md` dosyasına bak.

## Profil özellikleri

- Profil adı, başlık, bio ve isteğe bağlı konum
- Profil fotoğrafı ve arka plan görseli (en fazla 5 MB) yükleme
- İsteğe bağlı MP4/WebM hareketli arka plan videosu (en fazla 20 MB); sessiz, döngülü oynar ve cihazda hareket azaltma tercih edildiğinde durur
- Sahibin OAuth2 ile Discord hesabını bağlama; kullanıcı adı/avatarını açık profilinde gösterme
- Canlı Discord durumu kendi botumuz üzerinden: çevrimiçi durum, oynanan oyun kartı ve Spotify parçası (dalga çizgili ilerleme çubuğu)
- Discord rozetleri (otomatik bitmask algılama) ve oyun kataloğu
- Sahip tarafından düzenlenebilen sosyal ikon dock'u ve güvenli bağlantılar (HTTP/HTTPS ve e-posta)
- Vurgu/yüzey rengi, video ve kart opaklığı ayarları, 3D eğim efekti
- 24 saatlik tekil ziyaretçi sayacı ve sahibe özel analitik paneli (cihaz, yönlendiren, ülke, yoğun saat)
- Sahip girişi, profil yayına alma ve herkese açık sayfa önizlemesi

Şablon pazarı ilk sürüme dahil değildir.
