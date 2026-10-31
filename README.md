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
   DISCORD_CLIENT_ID=
   DISCORD_CLIENT_SECRET=
   DISCORD_REDIRECT_URI=http://localhost:3000/api/discord/callback
   ```

   Service-role anahtarını bu değişkene veya tarayıcıya koyma. Kod, profil ve depolama değişikliklerini Supabase RLS politikalarıyla sınırlar.

7. Discord hesabını bağlamak istiyorsan Discord Developer Portal'da bir uygulama oluştur. OAuth2 Redirects listesine `.env.local` içindeki `DISCORD_REDIRECT_URI` adresini eksiksiz ekle; istemci kimliği ve istemci sırrını ilgili değişkenlere yaz. Bu site yalnızca `identify` iznini ister: bot, sunucu erişimi veya çevrimiçi durumu kullanılmaz. Discord bağlantısı, herkese açık profilde Discord kullanıcı adı/avatarlı profil bağlantısı gösterir. Yalnızca videolu profil için bu adımı atlayabilirsin.

8. Proje klasöründe çalıştır:

   ```bash
   npm install
   npm run dev
   ```

   Profil için `http://localhost:3000`, yönetim paneli için `http://localhost:3000/admin/login` adresini aç. İlk kayıttan sonra adını, bio'nu, görsellerini ve bağlantılarını panelden ekle.

## Ücretsiz yayınlama

1. Projeyi kendi GitHub hesabındaki bir depoya koy ve Vercel'de ücretsiz Hobby hesabıyla bu depoyu içe aktar.
2. Vercel proje ayarlarında `NEXT_PUBLIC_SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_ANON_KEY` ortam değişkenlerini tanımla. Discord hesabı bağlantısını kullanacaksan ayrıca `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET` ve canlı sitenin `https://alan-adin/api/discord/callback` adresini gösteren `DISCORD_REDIRECT_URI` değerlerini ekle; aynı geri dönüş adresini Discord Developer Portal'a da yaz.
3. Deploy et. Vercel ücretsiz bir `vercel.app` alt alan adı sağlar; özel alan adı bu plana dahil değildir ve ücret gerektirebilir.

Supabase Free şu an veritabanı, Auth ve Storage içeriyor, ancak bir hafta etkin olmayan ücretsiz projeleri duraklatabiliyor. Böyle bir durumda profil verisi servis dışı kalabilir; Supabase panelinden projeyi tekrar etkinleştirmek gerekir. Ücretsiz plan şartları ve kotaları sağlayıcılar tarafından değiştirilebilir.

## Profil özellikleri

- Profil adı, başlık, bio ve isteğe bağlı konum
- Profil fotoğrafı ve arka plan görseli (en fazla 5 MB) yükleme
- İsteğe bağlı MP4/WebM hareketli arka plan videosu (en fazla 20 MB); sessiz, döngülü oynar ve cihazda hareket azaltma tercih edildiğinde durur
- Sahibin OAuth2 ile Discord hesabını bağlama; kullanıcı adı/avatarını açık profilinde gösterme
- Vurgu/yüzey rengi seçimi
- En fazla 12 güvenli HTTP(S) bağlantısı
- Sahip girişi, profil yayına alma ve herkese açık sayfa önizlemesi

Discord çevrimiçi durumu, müzik, analitik, şablon pazarı, rozetler ve gelişmiş animasyonlar ilk sürüme dahil değildir. Arka plan videosu Discord'dan bağımsızdır.
