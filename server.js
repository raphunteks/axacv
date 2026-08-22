const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { google } = require('googleapis');

const app = express();

// Konfigurasi Klien Supabase menggunakan Environment Variables
const supabaseUrl = process.env.SUPABASE_URL || process.env.KVVSUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.KVVSUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("CRITICAL ERROR: Kredensial Supabase tidak ditemukan di Environment Variables.");
}

// Gunakan Service Role Key agar Backend punya hak akses penuh (Admin API)
const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
});

// ==========================================
// 0. INISIALISASI ENTERPRISE SEO BOT (GOOGLE INDEXING API VIA VERCEL ENV)
// ==========================================
let jwtClient = null;
try {
    const rawJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    
    if (rawJson) {
        // Parse JSON utuh dari Environment Variables Vercel
        const key = JSON.parse(rawJson);
        
        // PENTING: Fix issue Vercel merubah karakter baris baru (\n) di private_key menjadi literal text '\\n'
        const privateKey = key.private_key.replace(/\\n/g, '\n');
        
        jwtClient = new google.auth.JWT(
            key.client_email,
            null,
            privateKey,
            ['https://www.googleapis.com/auth/indexing'],
            null
        );
        console.log("[SEO BOT] Kredensial Service Account termuat SECURE dari ENV Vercel. Engine Auto-Index GSC Aktif!");
    } else {
        console.warn("[SEO BOT] Peringatan: Variabel 'GOOGLE_SERVICE_ACCOUNT_JSON' tidak ditemukan di Vercel Env. Auto-Index GSC Nonaktif.");
    }
} catch (error) {
    console.error("[SEO BOT] Gagal memparsing Service Account JSON dari Vercel Env. Pastikan format JSON valid. Error:", error.message);
}

/**
 * Fungsi Inti untuk Push URL ke Google Indexing API
 */
async function requestGoogleIndexing(targetUrl, type = 'URL_UPDATED') {
    if (!jwtClient) return; // Skip jika JSON tidak ada di ENV
    try {
        const tokens = await jwtClient.authorize();
        const options = {
            url: 'https://indexing.googleapis.com/v3/urlNotifications:publish',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${tokens.access_token}`,
            },
            data: { url: targetUrl, type: type },
        };
        const response = await jwtClient.request(options);
        console.log(`[SEO PUSH SUKSES] GoogleBot merespon URL: ${targetUrl} | Status: ${response.status}`);
    } catch (error) {
        console.error(`[SEO PUSH GAGAL] Tidak dapat push URL ${targetUrl}:`, error.response?.data?.error?.message || error.message);
    }
}

// ==========================================
// 1. SETUP MIDDLEWARE & CORS
// ==========================================
app.use(express.json({ limit: '10mb' })); 

// ANTI-CACHE UNTUK API (REALTIME DASHBOARD FIX)
app.use('/api', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    next();
});

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'views'));

// ==========================================
// 2. DATA METADATA DINAMIS SEO (GOLD STANDARD)
// ==========================================
const baseUrl = 'https://www.maksaarsyad.xyz';

const routesMeta = {
    '/': { title: 'CV & Portofolio | drg. M. Aksa Arsyad, S.KG', desc: 'Curriculum Vitae dan Portofolio resmi drg. M. Aksa Arsyad, S.KG - Dokter Gigi Umum. Lihat pengalaman kerja, riwayat pendidikan, riwayat organisasi, publikasi ilmiah, dan hubungi langsung.', keywords: 'Riwayat Pendidikan drg. M. Aksa Arsyad, Pengalaman Kerja drg. M. Aksa Arsyad, Dokter Gigi Umum, Aksa Arsyad, S.KG, Makassar, UMI, Dokter Gigi Makassar, Kedokteran Gigi, Klinik Gigi, Publikasi Ilmiah', ogImage: '/axalogo.png', type: 'profile' },
    '/pendidikan': { title: 'Riwayat Pendidikan | drg. M. Aksa Arsyad, S.KG', desc: 'Latar belakang pendidikan, institusi, dan almamater Universitas Muslim Indonesia & Universitas Hasanuddin drg. M. Aksa Arsyad, S.KG.', keywords: 'Pendidikan drg. M. Aksa Arsyad, UMI Kedokteran Gigi, Universitas Hasanuddin, S.KG Makassar', ogImage: '/axalogo.png', type: 'website' },
    '/pengalaman': { title: 'Pengalaman Kerja | drg. M. Aksa Arsyad, S.KG', desc: 'Riwayat karir klinis, pekerjaan, dan pengalaman profesional drg. M. Aksa Arsyad di berbagai klinik serta rumah sakit.', keywords: 'Pengalaman Kerja Dokter Gigi, Karir drg. Aksa Arsyad, Klinik Gigi Makassar, Praktek Dokter Gigi', ogImage: '/axalogo.png', type: 'website' },
    '/organisasi': { title: 'Riwayat Organisasi | drg. M. Aksa Arsyad, S.KG', desc: 'Pengalaman keanggotaan dan aktivitas dalam organisasi profesi (PDGI) maupun kemahasiswaan drg. M. Aksa Arsyad.', keywords: 'Organisasi drg. Aksa Arsyad, Anggota PDGI, BEM FKG UMI', ogImage: '/axalogo.png', type: 'website' },
    '/publikasi': { title: 'Publikasi Ilmiah & Jurnal | drg. M. Aksa Arsyad, S.KG', desc: 'Kumpulan jurnal, penelitian, dan publikasi ilmiah di bidang kedokteran gigi oleh drg. M. Aksa Arsyad, S.KG.', keywords: 'Publikasi Ilmiah Kedokteran Gigi, Jurnal drg. Aksa Arsyad, Penelitian Gigi, Google Scholar Aksa Arsyad', ogImage: '/axalogo.png', type: 'article' },
    '/keahlian-tech': { title: 'Keahlian Klinis & Teknologi | drg. M. Aksa Arsyad, S.KG', desc: 'Daftar keahlian klinis medis, bahasa pemrograman, dan kemampuan teknologi (Web Development) drg. M. Aksa Arsyad.', keywords: 'Keahlian Dokter Gigi, Web Developer Makassar, Node.js, React, Keterampilan Klinis Gigi', ogImage: '/axalogo.png', type: 'website' },
    '/proyek': { title: 'Portofolio Proyek Web | drg. M. Aksa Arsyad, S.KG', desc: 'Portofolio pengembangan website, sistem, dan aplikasi yang dibangun oleh drg. M. Aksa Arsyad.', keywords: 'Proyek Web drg. Aksa Arsyad, Web Portofolio, Sistem Informasi Klinik, Web Developer Gigi', ogImage: '/axalogo.png', type: 'website' },
    '/sertifikasi': { title: 'Sertifikasi Medis & Tech | drg. M. Aksa Arsyad, S.KG', desc: 'Kumpulan sertifikasi kompetensi medis (PDGI) dan penghargaan pemrograman teknologi drg. M. Aksa Arsyad.', keywords: 'Sertifikasi PDGI, Sertifikat Web Developer, Penghargaan drg. Aksa Arsyad, Pelatihan Kedokteran Gigi', ogImage: '/axalogo.png', type: 'website' },
    '/arsip': { title: 'Arsip Materi & Jurnal | drg. M. Aksa Arsyad, S.KG', desc: 'Kumpulan catatan preklinik, profesi dokter muda, dan materi kedokteran gigi (Knowledge Base).', keywords: 'Arsip Kedokteran Gigi, Catatan Preklinik, Co-Ass', ogImage: '/axalogo.png', type: 'website' }
};

// ==========================================
// 3. ADMIN AUTHENTICATION API & MIDDLEWARE
// ==========================================
const ADMIN_USER = process.env.ADMIN_USER || 'axaaxyz_01';
const ADMIN_PASS = process.env.ADMIN_PASS || 'axaxyz999';
const SECRET_TOKEN = process.env.ADMIN_SECRET_TOKEN || 'axa-super-secure-token-2026';

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        res.json({ status: 'success', token: SECRET_TOKEN });
    } else {
        res.status(401).json({ status: 'error', message: 'Kredensial tidak valid!' });
    }
});

app.post('/api/auth/verify', (req, res) => {
    const { token } = req.body;
    if (token === SECRET_TOKEN) res.json({ status: 'success' });
    else res.status(401).json({ status: 'error' });
});

app.post('/api/auth/logout', (req, res) => {
    res.json({ status: 'success', message: 'Sesi berhasil dihentikan.' });
});

const protectAdmin = (req, res, next) => {
    const token = req.headers.authorization;
    if (token === SECRET_TOKEN) next();
    else res.status(403).json({ status: 'error', message: 'Akses Ditolak' });
};

// ==========================================
// HELPER URL SLUG GENERATOR, XML ESCAPER & WITA FORMATTER
// ==========================================
const createSlug = (text) => {
    if (!text) return '';
    return text.toString().toLowerCase().trim()
        .replace(/[^a-z0-9]+/g, '-')       
        .replace(/^-+|-+$/g, '');          
};

// PENTING: Untuk GSC Sitemap XML Escape
const escapeXml = (unsafe) => {
    if (!unsafe) return '';
    return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
};

const getDefaultCategories = () => ["Preklinik", "Jurnal & Riset", "Kedokteran Gigi Umum"];

// Helper Waktu Indonesia Tengah (WITA = UTC+8)
const getWitaTime = () => {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const wita = new Date(utc + (3600000 * 8));
    
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const dayName = days[wita.getDay()];
    const dd = String(wita.getDate()).padStart(2, '0');
    const mm = String(wita.getMonth() + 1).padStart(2, '0');
    const yyyy = wita.getFullYear();
    const HH = String(wita.getHours()).padStart(2, '0');
    const Min = String(wita.getMinutes()).padStart(2, '0');
    
    return `${dayName}, ${dd}-${mm}-${yyyy}, Jam ${HH}.${Min} WITA`;
};

const formatWitaTime = (isoString) => {
    if (!isoString) return '-';
    const date = new Date(isoString);
    const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
    const wita = new Date(utc + (3600000 * 8));
    
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const dayName = days[wita.getDay()];
    const dd = String(wita.getDate()).padStart(2, '0');
    const mm = String(wita.getMonth() + 1).padStart(2, '0');
    const yyyy = wita.getFullYear();
    const HH = String(wita.getHours()).padStart(2, '0');
    const Min = String(wita.getMinutes()).padStart(2, '0');
    
    return `${dayName}, ${dd}-${mm}-${yyyy}, Jam ${HH}.${Min} WITA`;
};

// =======================================================
// REALTIME FIX: Hapus In-Memory Cache. Selalu Fetch Storage!
// =======================================================
const defaultFormSettings = {
    requireForm: true,
    fields: [
        { id: 'nama_lengkap', label: 'Nama Lengkap (Sesuai KTP/Gelar)' },
        { id: 'institusi_asal', label: 'Asal Universitas / Instansi' }
    ]
};

async function getRequireFormSetting() {
    try {
        const { data, error } = await supabase.storage.from('arsip_files').download('settings.json');
        
        if (error) {
            console.warn("Storage Error/Not Found (Using Default):", error.message);
            return defaultFormSettings;
        }
        
        if (data) {
            const text = await data.text();
            const parsed = JSON.parse(text);
            
            // Konversi Cerdas jika format dari Database cuma boolean (versi lawas)
            if (typeof parsed.requireForm === 'boolean' && !parsed.fields) {
                return { requireForm: parsed.requireForm, fields: defaultFormSettings.fields };
            } 
            
            return parsed.requireForm || defaultFormSettings;
        }
    } catch (e) {
        console.error("Gagal parse Settings.json:", e);
    } 
    return defaultFormSettings;
}

// ==========================================
// 4. SUPABASE ARSIP API (POSTGRES & STORAGE)
// ==========================================

app.post('/api/track-download', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ status: 'error', message: 'Token otentikasi tidak ditemukan.' });

        const token = authHeader.replace('Bearer ', '');
        
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);
        if (userError || !user) throw new Error("Sesi Google tidak valid atau telah kadaluarsa.");

        const { fileTitle } = req.body;
        if (!fileTitle) return res.status(400).json({ status: 'error', message: 'Judul file wajib dikirim.' });

        const meta = user.user_metadata || {};
        let downloads = meta.downloaded_files || [];

        downloads = downloads.filter(d => {
            if (typeof d === 'string') return !d.startsWith(fileTitle + " ("); 
            if (typeof d === 'object' && d !== null) return d.title !== fileTitle; 
            return true;
        });

        downloads.push({ title: fileTitle, time: getWitaTime() });
            
        // Reset Flag Logout jika mendownload & perbarui waktu last online otomatis oleh Supabase
        const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
            user_metadata: { ...meta, downloaded_files: downloads, is_logged_out: false }
        });

        if (updateError) throw updateError;

        res.json({ status: 'success', downloaded_files: downloads });
    } catch (err) {
        console.error("Track Download Error:", err.message);
        res.status(500).json({ status: 'error', message: err.message });
    }
});

app.post('/api/users/:id/force-logout', protectAdmin, async (req, res) => {
    try {
        const userId = req.params.id;
        const { data, error: fetchErr } = await supabase.auth.admin.getUserById(userId);
        if (fetchErr || !data.user) throw new Error("User tidak ditemukan di sistem.");

        const meta = data.user.user_metadata || {};
        
        const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
            user_metadata: { ...meta, is_logged_out: true }
        });

        if (updateError) throw updateError;
        res.json({ status: 'success', message: 'User berhasil ditandai logout.' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

app.get('/api/users', protectAdmin, async (req, res) => {
    try {
        const { data, error } = await supabase.auth.admin.listUsers();
        if (error) throw error;
        
        const usersList = data.users.map(u => {
            const rawDownloads = u.user_metadata?.downloaded_files || [];
            const formattedDownloads = rawDownloads.map(d => {
                if (typeof d === 'object' && d !== null) return `${d.title} (${d.time})`;
                return d; 
            });

            const userStatus = u.user_metadata?.is_logged_out === true ? 'Logout' : 'Aktif';

            return {
                id: u.id,
                email: u.email,
                name: u.user_metadata?.nama_lengkap || u.user_metadata?.full_name || 'Belum Melengkapi',
                institution: u.user_metadata?.institusi_asal || 'Belum Melengkapi',
                downloaded_files: formattedDownloads, 
                raw_metadata: u.user_metadata || {}, 
                created_at: new Date(u.created_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'}),
                last_online: formatWitaTime(u.last_sign_in_at), 
                status: userStatus 
            };
        });
        
        res.json({ status: 'success', data: usersList });
    } catch (err) {
        console.error("Fetch Users Error:", err.message);
        res.status(500).json({ status: 'error', message: "Gagal menarik data user. Pastikan menggunakan SUPABASE_SERVICE_ROLE_KEY. Error: " + err.message });
    }
});

// GET Settings yang Realtime (No Cache)
app.get('/api/settings/form', protectAdmin, async (req, res) => {
    res.json({ status: 'success', requireForm: await getRequireFormSetting() });
});

// PUSH/UPDATE Settings (Menghapus variabel global yg memicu stale cache)
app.post('/api/settings/form', protectAdmin, async (req, res) => {
    try {
        const { requireForm } = req.body; 
        const buffer = Buffer.from(JSON.stringify({ requireForm }));
        
        const { error } = await supabase.storage.from('arsip_files').upload('settings.json', buffer, { upsert: true, contentType: 'application/json' });
        if (error) throw error;
        
        res.json({ status: 'success', requireForm });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

app.get('/api/arsip', async (req, res) => {
    try {
        if(!supabaseUrl || !supabaseKey) throw new Error("ENV Supabase Kosong!");
        
        const { data, error } = await supabase
            .from('arsip')
            .select('*')
            .order('id', { ascending: false }); 

        if (error) throw new Error(`Supabase DB Error: ${error.message}`);
        res.json({ status: 'success', data });
    } catch (err) {
        console.error("Fetch Arsip Error:", err);
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// INJEKSI PUSH GOOGLE API SAAT ARTIKEL BARU DITAMBAHKAN
app.post('/api/arsip', protectAdmin, async (req, res) => {
    try {
        const { id, title, category, desc, accessType, fileName, filePath } = req.body;
        
        const uniqueId = id || Date.now().toString();
        const slug = `${createSlug(title)}-${Math.random().toString(36).substr(2, 4)}`;

        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();
        const customDate = `${dd}-${mm}-${yyyy}`;

        const newItem = {
            id: uniqueId,
            slug: slug,
            title: title,
            category: category,
            desc: desc,
            access_type: accessType || 'Restricted',
            file_name: fileName,
            file_path: filePath, 
            date: customDate
        };

        const { data: dbData, error: dbError } = await supabase.from('arsip').insert([newItem]).select();
        if (dbError) throw new Error(`Supabase DB Insert Error: ${dbError.message}`);

        // TRIGGERS GOOGLE INDEXING API (Background Process)
        requestGoogleIndexing(`${baseUrl}/arsip/${slug}`, 'URL_UPDATED');

        res.json({ status: 'success', data: dbData[0] });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// INJEKSI PUSH GOOGLE API SAAT ARTIKEL DIEDIT (UPDATE)
app.put('/api/arsip/:id', protectAdmin, async (req, res) => {
    try {
        const docId = req.params.id;
        const { title, category, desc, accessType, slug, date } = req.body;

        const { data, error } = await supabase
            .from('arsip')
            .update({ title, category, desc, access_type: accessType, slug, date })
            .eq('id', docId)
            .select();

        if (error) throw new Error(error.message);
        if (!data || data.length === 0) throw new Error("Dokumen tidak ditemukan untuk diupdate.");

        // TRIGGERS GOOGLE INDEXING API (Background Process)
        requestGoogleIndexing(`${baseUrl}/arsip/${slug}`, 'URL_UPDATED');

        res.json({ status: 'success', data: data[0] });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// INJEKSI PUSH GOOGLE API SAAT ARTIKEL DIHAPUS
app.delete('/api/arsip/:id', protectAdmin, async (req, res) => {
    try {
        const docId = req.params.id;
        // Modifikasi query agar menarik "slug" selain file_path
        const { data: item, error: fetchError } = await supabase.from('arsip').select('file_path, slug').eq('id', docId).single();

        if (fetchError || !item) throw new Error(`Fetch Error: ${fetchError?.message || "Dokumen tidak ditemukan."}`);
        if (item.file_path) {
            const { error: storageError } = await supabase.storage.from('arsip_files').remove([item.file_path]);
            if (storageError) console.warn("Peringatan: Gagal menghapus file dari Storage:", storageError.message);
        }

        const { error: dbError } = await supabase.from('arsip').delete().eq('id', docId);
        if (dbError) throw new Error(`Delete DB Error: ${dbError.message}`);

        // TRIGGERS GOOGLE INDEXING API UNTUK DELETION (Beri tahu Google link sudah mati)
        if (item.slug) {
            requestGoogleIndexing(`${baseUrl}/arsip/${item.slug}`, 'URL_DELETED');
        }

        res.json({ status: 'success' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// ==========================================
// 4.5 NEW SEO FEATURE: BULK AUTO-INDEX SELURUH WEB
// ==========================================
// Panggil API ini via Postman/Fetch di browser admin Anda jika ingin memaksa indeks semua.
app.post('/api/seo/index-all', protectAdmin, async (req, res) => {
    if (!jwtClient) {
        return res.status(500).json({ status: 'error', message: 'Kredensial Service Account JSON tidak dikonfigurasi di server ENV.' });
    }
    
    try {
        let urlsToPush = [`${baseUrl}/`];
        
        // 1. Kumpulkan semua halaman Statis
        for (const pathKey of Object.keys(routesMeta)) {
            if (pathKey !== '/' && pathKey !== '/arsip') {
                urlsToPush.push(`${baseUrl}${pathKey}`);
            }
        }
        urlsToPush.push(`${baseUrl}/arsip`);
        
        // 2. Kumpulkan semua halaman Dinamis (Arsip, Kategori, PDF)
        const { data: arsipDB, error } = await supabase.from('arsip').select('slug, category, access_type');
        
        if (!error && arsipDB) {
            // Kategori
            const dbCats = arsipDB.map(item => item.category).filter(Boolean);
            const uniqueCategories = [...new Set([...getDefaultCategories(), ...dbCats])];
            uniqueCategories.forEach(cat => {
                urlsToPush.push(`${baseUrl}/arsip/kategori/${createSlug(cat)}`);
            });
            
            // Artikel & PDF (Jika Open Access)
            arsipDB.forEach(doc => {
                urlsToPush.push(`${baseUrl}/arsip/${doc.slug}`);
                if (doc.access_type === 'Open Access') {
                    urlsToPush.push(`${baseUrl}/arsip/file/${doc.slug}.pdf`);
                }
            });
        }
        
        // Berikan respons instan agar Vercel/Server tidak Timeout
        res.json({ 
            status: 'success', 
            message: `Memulai push massal untuk ${urlsToPush.length} URL ke Server Google di latar belakang. Proses ini butuh waktu beberapa menit.` 
        });
        
        // EKSEKUSI DI BACKGROUND (Dengan jeda 500ms agar aman dari Rate Limit Google)
        (async () => {
            console.log(`[SEO BOT] Memulai Bulk Indexing untuk ${urlsToPush.length} URL...`);
            for (const url of urlsToPush) {
                await requestGoogleIndexing(url, 'URL_UPDATED');
                // Jeda 500 mili-detik per tembakan API
                await new Promise(resolve => setTimeout(resolve, 500)); 
            }
            console.log(`[SEO BOT] SELESAI! Bulk Indexing untuk ${urlsToPush.length} URL telah dituntaskan.`);
        })();
        
    } catch (error) {
        console.error("Bulk Index Error:", error);
    }
});


// ==========================================
// 5. GSC SITEMAP.XML FIX (DINAMIS 100%) & APP-ADS.TXT
// ==========================================

// PENTING UNTUK GOOGLE ADSENSE: Explicit Routing agar Googlebot dapat menemukan Ads.txt
app.get('/ads.txt', (req, res) => {
    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send('google.com, pub-3213968627395082, DIRECT, f08c47fec0942fa0');
});

app.get('/app-ads.txt', (req, res) => {
    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send('google.com, pub-3213968627395082, DIRECT, f08c47fec0942fa0');
});

app.get('/sitemap.xml', async (req, res) => {
    try {
        res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=43200');
        // PENTING: GSC butuh header application/xml murni
        res.header('Content-Type', 'application/xml');
        
        const formatSitemapDate = (dateStr) => {
            try {
                const fallback = new Date().toISOString().split('T')[0];
                if (!dateStr) return fallback;
                
                if (dateStr.match(/^\d{2}-\d{2}-\d{4}$/)) {
                    const parts = dateStr.split('-');
                    return `${parts[2]}-${parts[1]}-${parts[0]}`; 
                }
                
                const parsed = new Date(dateStr);
                return isNaN(parsed) ? fallback : parsed.toISOString().split('T')[0];
            } catch (e) { return new Date().toISOString().split('T')[0]; }
        };

        const today = formatSitemapDate();

        let xmlUrls = `
    <url>
        <loc>${baseUrl}/</loc>
        <lastmod>${today}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
        <image:image>
            <image:loc>${baseUrl}/axalogo.png</image:loc>
            <image:title>CV &amp; Portofolio drg. M. Aksa Arsyad, S.KG</image:title>
            <image:caption>Curriculum Vitae dan Portofolio resmi drg. M. Aksa Arsyad, S.KG - Dokter Gigi Umum.</image:caption>
        </image:image>
    </url>`;

        for (const [path, meta] of Object.entries(routesMeta)) {
            if (path === '/' || path === '/arsip') continue;
            xmlUrls += `
    <url>
        <loc>${baseUrl}${path}</loc>
        <lastmod>${today}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>`;
        }

        xmlUrls += `
    <url>
        <loc>${baseUrl}/arsip</loc>
        <lastmod>${today}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
    </url>`;

        try {
            // Tarik data Supabase dengan Timeout untuk mencegah Vercel Crash
            const fetchPromise = supabase.from('arsip').select('slug, date, access_type, title, category');
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Sitemap Timeout Triggered')), 8000));
            
            const { data: arsipDB, error } = await Promise.race([fetchPromise, timeoutPromise]);

            if (arsipDB && !error) {
                // 1. Injeksi Kategori
                const dbCats = arsipDB.map(item => item.category).filter(Boolean);
                const uniqueCategories = [...new Set([...getDefaultCategories(), ...dbCats])];
                
                uniqueCategories.forEach(cat => {
                    const catSlug = createSlug(cat);
                    xmlUrls += `
    <url>
        <loc>${baseUrl}/arsip/kategori/${escapeXml(catSlug)}</loc>
        <lastmod>${today}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>`;
                });

                // 2. Injeksi Artikel & File PDF Open Access
                arsipDB.forEach(doc => {
                    const validSitemapDate = formatSitemapDate(doc.date);
                    const safeTitle = escapeXml(doc.title);
                    const safeCat = escapeXml(doc.category);
                    const safeSlug = escapeXml(doc.slug);

                    xmlUrls += `
    <url>
        <loc>${baseUrl}/arsip/${safeSlug}</loc>
        <lastmod>${validSitemapDate}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
        <image:image>
            <image:loc>${baseUrl}/axalogo.png</image:loc>
            <image:title>${safeTitle}</image:title>
            <image:caption>Kategori: ${safeCat}</image:caption>
        </image:image>
    </url>`;

                    if(doc.access_type === 'Open Access') {
                        xmlUrls += `
    <url>
        <loc>${baseUrl}/arsip/file/${safeSlug}.pdf</loc>
        <lastmod>${validSitemapDate}</lastmod>
        <changefreq>yearly</changefreq>
        <priority>0.9</priority>
    </url>`;
                    }
                });
            }
        } catch(e) {
            console.warn("⚠️ Peringatan: Supabase Timeout saat merender Artikel di Sitemap. Tetap mengirim sitemap halaman statis.");
        }
        
        // PENTING: Format XML tanpa spasi di awal menggunakan .trim()
        const sitemapXML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${xmlUrls}
</urlset>`;

        res.send(sitemapXML.trim());
    } catch (error) {
        console.error("Sitemap Gen Error:", error);
        res.status(500).send("Internal Server Error generating Sitemap");
    }
});

app.get('/robots.txt', (req, res) => {
    res.set('Content-Type', 'text/plain; charset=utf-8');
    let txt = `User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: ${baseUrl}/sitemap.xml\n`;
    res.send(txt);
});


// ==========================================
// 6. FOLDER PUBLIC & ROUTING HALAMAN VIEWS
// ==========================================
app.use(express.static(path.join(process.cwd(), 'public')));

app.get('/admin/login', (req, res) => res.render('admin-login'));
app.get('/admin/dashboard', (req, res) => {
    res.render('admin-dashboard', {
        supabaseUrl: process.env.SUPABASE_URL || process.env.KVVSUPABASE_URL || '',
        supabaseAnonKey: process.env.KVVSUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || ''
    });
});

app.get('/arsip', async (req, res) => {
    try {
        const meta = { ...routesMeta['/arsip'] };
        meta.canonical = `${baseUrl}/arsip`;
        
        let arsipDB = [];
        try {
            const result = await supabase.from('arsip').select('*').order('id', { ascending: false });
            if(result.data) arsipDB = result.data;
        } catch(dbErr) { console.error("Database fetch failed on /arsip", dbErr.message); }
        
        const dbCategories = arsipDB.map(item => item.category).filter(Boolean);
        const categories = [...new Set([...getDefaultCategories(), ...dbCategories])];

        res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
        res.render('arsip-list', { 
            meta, 
            baseUrl, 
            arsipData: arsipDB, 
            currentPath: '/arsip',
            categories: categories, 
            activeCategory: 'semua', 
            createSlug: createSlug
        });
    } catch (e) {
        res.status(500).send("Internal Server Error");
    }
});

app.get('/arsip/kategori/:kategoriSlug', async (req, res) => {
    try {
        const slug = req.params.kategoriSlug;
        
        let arsipDB = [];
        try {
            const result = await supabase.from('arsip').select('*').order('id', { ascending: false });
            if(result.data) arsipDB = result.data;
        } catch(dbErr) { console.error("Database fetch failed on /arsip/kategori", dbErr.message); }
        
        const dbCategories = arsipDB.map(item => item.category).filter(Boolean);
        const categories = [...new Set([...getDefaultCategories(), ...dbCategories])];
        
        const filteredArsip = arsipDB.filter(item => {
            return item.category && createSlug(item.category) === slug;
        });

        const categoryName = categories.find(c => createSlug(c) === slug) || "Kategori";

        const meta = {
            title: `Arsip ${categoryName} | drg. M. Aksa Arsyad, S.KG`,
            desc: `Kumpulan arsip, catatan klinis, dan jurnal kedokteran gigi untuk kategori ${categoryName}.`,
            keywords: `${categoryName}, Arsip Kedokteran Gigi, Knowledge Base FKG`,
            canonical: `${baseUrl}/arsip/kategori/${slug}`,
            ogImage: '/axalogo.png',
            type: 'website'
        };

        res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
        res.render('arsip-list', { 
            meta, 
            baseUrl, 
            arsipData: filteredArsip, 
            currentPath: `/arsip/kategori/${slug}`,
            categories: categories,
            activeCategory: slug,
            createSlug: createSlug
        });
    } catch (e) {
        res.status(500).send("Internal Server Error");
    }
});

app.get('/arsip/file/:slug.pdf', async (req, res) => {
    try {
        const slugStr = req.params.slug; 
        const fetchPromise = supabase.from('arsip').select('file_name, file_path').eq('slug', slugStr).single();
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('DB Timeout')), 8500));
        
        const { data: arsip, error: dbErr } = await Promise.race([fetchPromise, timeoutPromise]);
        
        if (dbErr || !arsip) return res.status(404).send('Dokumen tidak ditemukan dalam database.');

        const { data: fileBlob, error: dlErr } = await supabase.storage.from('arsip_files').download(arsip.file_path);
        if (dlErr || !fileBlob) return res.status(500).send('Gagal menarik dokumen dari Supabase Storage.');

        const buffer = Buffer.from(await fileBlob.arrayBuffer());
        
        res.setHeader('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, immutable');
        res.setHeader('X-Robots-Tag', 'index, follow, noarchive');
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${arsip.file_name}"`);
        res.setHeader('Content-Length', buffer.length);
        res.send(buffer);
    } catch (e) {
        console.error("Stream Error:", e);
        res.status(500).send("Terjadi kegagalan transmisi file atau Database Timeout.");
    }
});

// ==========================================
// MENGUPDATE ENDPOINT VIEWER ARSIP (REALTIME FORM FIX & SITELINKS)
// ==========================================
app.get('/arsip/:slug', async (req, res) => {
    try {
        const fetchSinglePromise = supabase.from('arsip').select('*').eq('slug', req.params.slug).single();
        const fetchAllPromise = supabase.from('arsip').select('title, slug, category').order('id', { ascending: false }).limit(20);
        
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('DB Timeout')), 8500));

        const [singleResult, allResult] = await Promise.race([
            Promise.all([fetchSinglePromise, fetchAllPromise]),
            timeoutPromise
        ]);
        
        const arsip = singleResult.data;
        const error = singleResult.error;

        if (error || !arsip) return res.status(404).render('admin-404');

        // Menyiapkan Data Kategoris dan Artikel Ekstra untuk SEO Sitelinks Dynamic
        const arsipData = allResult.data || [];
        const dbCategories = arsipData.map(item => item.category).filter(Boolean);
        const categories = [...new Set([...getDefaultCategories(), ...dbCategories])];

        const meta = {
            title: `${arsip.title} | drg. M. Aksa Arsyad`,
            desc: arsip.desc,
            keywords: `Arsip, ${arsip.category}, Kedokteran Gigi, Jurnal, ${arsip.title}`,
            canonical: `${baseUrl}/arsip/${arsip.slug}`,
            ogImage: '/axalogo.png',
            type: 'article'
        };
        
        res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=43200');
        
        // Panggil fungsi getRequireFormSetting yang SUDAH TANPA CACHE (Realtime Supabase Storage)
        const reqForm = await getRequireFormSetting();

        res.render('arsipfile', { 
            meta, 
            baseUrl, 
            arsip, 
            arsipData,      
            categories,     
            currentPath: `/arsip/${arsip.slug}`,
            supabaseUrl: process.env.SUPABASE_URL || process.env.KVVSUPABASE_URL || '',
            supabaseAnonKey: process.env.KVVSUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || '',
            requireForm: reqForm // Injeksi Realtime
        });
    } catch(e) {
        res.status(500).send("Internal Server Error");
    }
});

const routeKeys = Object.keys(routesMeta).filter(k => k !== '/arsip');
app.get(routeKeys, (req, res) => {
    try {
        const currentPath = req.path;
        const meta = routesMeta[currentPath];
        meta.canonical = `${baseUrl}${currentPath === '/' ? '' : currentPath}`;
        res.render('index', { meta, currentPath, baseUrl });
    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
});

// ==========================================
// 7. ROUTE API GITHUB STATS
// ==========================================
app.post('/api/github', async (req, res) => {
    try {
        const { username, token } = req.body || {};
        const authToken = token || process.env.GITHUB_TOKEN;
        const ghUser = username || process.env.GITHUB_USERNAME || "raphunteks"; 

        if (!authToken) return res.status(401).json({ status: 'error', message: 'Token GitHub tidak ditemukan.' });

        const query = `
        query {
          user(login: "${ghUser}") {
            repositories(first: 100, ownerAffiliations: OWNER, isFork: false) {
              nodes { stargazerCount languages(first: 10, orderBy: {field: SIZE, direction: DESC}) { edges { size node { name color } } } }
            }
            contributionsCollection { totalCommitContributions restrictedContributionsCount }
            pullRequests(first: 1) { totalCount }
            issues(first: 1) { totalCount }
          }
        }`;

        const response = await fetch('https://api.github.com/graphql', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json', 'User-Agent': 'Axa-Portfolio-App' },
            body: JSON.stringify({ query })
        });

        const result = JSON.parse(await response.text());
        if (result.errors) return res.status(400).json({ status: 'error', message: result.errors[0].message });

        const data = result.data.user;
        let totalStars = 0, totalSize = 0, langMap = {};

        data.repositories.nodes.forEach(repo => {
            totalStars += repo.stargazerCount;
            repo.languages.edges.forEach(edge => {
                const langName = edge.node.name, langColor = edge.node.color || '#cccccc';
                if (!langMap[langName]) langMap[langName] = { size: 0, color: langColor };
                langMap[langName].size += edge.size;
                totalSize += edge.size;
            });
        });

        const sortedLangs = Object.keys(langMap)
            .map(k => ({ name: k, size: langMap[k].size, color: langMap[k].color, percent: ((langMap[k].size / totalSize) * 100).toFixed(2) }))
            .sort((a, b) => b.size - a.size).slice(0, 5);

        const stats = { stars: totalStars, commits: data.contributionsCollection.totalCommitContributions + data.contributionsCollection.restrictedContributionsCount, prs: data.pullRequests.totalCount, issues: data.issues.totalCount, topLangs: sortedLangs };

        res.status(200).json({ status: 'success', data: stats });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message || 'Internal Server Error' });
    }
});

// ==========================================
// 8. 404 ERROR HANDLER
// ==========================================
app.use((req, res) => { res.status(404).render('admin-404'); });

module.exports = app;
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => { console.log(`Server is running on http://localhost:${PORT}`); });
}
