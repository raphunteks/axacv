const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// Konfigurasi Klien Supabase menggunakan Environment Variables
const supabaseUrl = process.env.SUPABASE_URL || process.env.KVVSUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.KVVSUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("CRITICAL ERROR: Kredensial Supabase tidak ditemukan di Environment Variables.");
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
});

// ==========================================
// 1. SETUP MIDDLEWARE & CORS
// ==========================================
app.use(express.json({ limit: '10mb' })); 

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

const protectAdmin = (req, res, next) => {
    const token = req.headers.authorization;
    if (token === SECRET_TOKEN) next();
    else res.status(403).json({ status: 'error', message: 'Akses Ditolak' });
};

// ==========================================
// HELPER URL SLUG GENERATOR
// ==========================================
const createSlug = (text) => {
    if (!text) return '';
    return text.toString().toLowerCase().trim()
        .replace(/[^a-z0-9]+/g, '-')       // Ubah semua non-alphanumeric jadi dash (-)
        .replace(/^-+|-+$/g, '');          // Trim dash dari awal dan akhir
};

// Kategori Default agar tidak pernah kosong di UI Menu Frontend
const getDefaultCategories = () => [
    "Preklinik", 
    "Jurnal & Riset", 
    "Kedokteran Gigi Umum"
];

// CACHING SETTINGS: Menyimpan status Wajib Form di memory agar loading web cepat
let cachedRequireForm = true;
let lastCacheTime = 0;

async function getRequireFormSetting() {
    if (Date.now() - lastCacheTime < 60000) return cachedRequireForm;
    try {
        const { data } = await supabase.storage.from('arsip_files').download('settings.json');
        if (data) {
            const text = await data.text();
            cachedRequireForm = JSON.parse(text).requireForm;
            lastCacheTime = Date.now();
        }
    } catch (e) { } 
    return cachedRequireForm;
}

// ==========================================
// 4. SUPABASE ARSIP API (POSTGRES & STORAGE)
// ==========================================

// --- API TARIK DATA USERS (NAMA DOWNLOADER) ---
app.get('/api/users', protectAdmin, async (req, res) => {
    try {
        const { data, error } = await supabase.auth.admin.listUsers();
        if (error) throw error;
        
        const usersList = data.users.map(u => ({
            email: u.email,
            name: u.user_metadata?.nama_lengkap || u.user_metadata?.full_name || 'Belum Melengkapi',
            institution: u.user_metadata?.institusi_asal || 'Belum Melengkapi',
            created_at: new Date(u.created_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})
        }));
        
        res.json({ status: 'success', data: usersList });
    } catch (err) {
        console.error("Fetch Users Error:", err.message);
        res.status(500).json({ status: 'error', message: "Gagal menarik data user. Pastikan menggunakan SUPABASE_SERVICE_ROLE_KEY di Vercel. Error: " + err.message });
    }
});

// --- API PENGATURAN FORM DOWNLOAD ---
app.get('/api/settings/form', protectAdmin, async (req, res) => {
    res.json({ status: 'success', requireForm: await getRequireFormSetting() });
});

app.post('/api/settings/form', protectAdmin, async (req, res) => {
    try {
        const { requireForm } = req.body;
        const buffer = Buffer.from(JSON.stringify({ requireForm }));
        
        const { error } = await supabase.storage.from('arsip_files').upload('settings.json', buffer, { upsert: true, contentType: 'application/json' });
        if (error) throw error;
        
        cachedRequireForm = requireForm;
        lastCacheTime = Date.now();
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

        res.json({ status: 'success', data: dbData[0] });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

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

        res.json({ status: 'success', data: data[0] });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

app.delete('/api/arsip/:id', protectAdmin, async (req, res) => {
    try {
        const docId = req.params.id;
        const { data: item, error: fetchError } = await supabase.from('arsip').select('file_path').eq('id', docId).single();

        if (fetchError || !item) throw new Error(`Fetch Error: ${fetchError?.message || "Dokumen tidak ditemukan."}`);
        if (item.file_path) {
            const { error: storageError } = await supabase.storage.from('arsip_files').remove([item.file_path]);
            if (storageError) console.warn("Peringatan: Gagal menghapus file dari Storage:", storageError.message);
        }

        const { error: dbError } = await supabase.from('arsip').delete().eq('id', docId);
        if (dbError) throw new Error(`Delete DB Error: ${dbError.message}`);

        res.json({ status: 'success' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});


// ==========================================
// 5. SITEMAP & ROBOTS.TXT (DINAMIS 100% + SCHEMA EXTENDED)
// ==========================================
app.get('/sitemap.xml', async (req, res) => {
    try {
        res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=43200');
        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
        
        const escapeXML = (str) => {
            if (!str) return '';
            return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
        };

        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n`;
        
        const parseSitemapDate = (dateStr) => {
            if (!dateStr) return new Date().toISOString().split('T')[0];
            if (dateStr.match(/^\d{2}-\d{2}-\d{4}$/)) {
                const parts = dateStr.split('-');
                return `${parts[2]}-${parts[1]}-${parts[0]}`; 
            }
            return dateStr; 
        };

        const currentDate = new Date().toISOString().split('T')[0];

        // Core Routes
        xml += `<url><loc>${baseUrl}/</loc><lastmod>${currentDate}</lastmod><changefreq>daily</changefreq><priority>1.0</priority><image:image><image:loc>${baseUrl}/axalogo.png</image:loc><image:title>CV &amp; Portofolio drg. M. Aksa Arsyad, S.KG</image:title><image:caption>Curriculum Vitae dan Portofolio resmi drg. M. Aksa Arsyad, S.KG - Dokter Gigi Umum.</image:caption></image:image></url>\n`;

        for (const [path, meta] of Object.entries(routesMeta)) {
            if (path === '/' || path === '/arsip') continue;
            xml += `<url><loc>${baseUrl}${path}</loc><lastmod>${currentDate}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
        }

        xml += `<url><loc>${baseUrl}/arsip</loc><lastmod>${currentDate}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>\n`;

        try {
            const fetchPromise = supabase.from('arsip').select('slug, date, access_type, title, category');
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Sitemap DB Timeout Protector Triggered')), 8500));
            
            const { data: arsipDB, error } = await Promise.race([fetchPromise, timeoutPromise]);

            if (arsipDB && !error) {
                const dbCats = arsipDB.map(item => item.category).filter(Boolean);
                const uniqueCategories = [...new Set([...getDefaultCategories(), ...dbCats])];
                
                uniqueCategories.forEach(cat => {
                    const catSlug = createSlug(cat);
                    xml += `<url><loc>${baseUrl}/arsip/kategori/${catSlug}</loc><lastmod>${currentDate}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
                });

                arsipDB.forEach(doc => {
                    const validSitemapDate = parseSitemapDate(doc.date);
                    const safeTitle = escapeXML(doc.title);
                    const safeCat = escapeXML(doc.category);

                    xml += `<url><loc>${baseUrl}/arsip/${doc.slug}</loc><lastmod>${validSitemapDate}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority><image:image><image:loc>${baseUrl}/axalogo.png</image:loc><image:title>${safeTitle}</image:title><image:caption>Kategori: ${safeCat}</image:caption></image:image></url>\n`;

                    if(doc.access_type === 'Open Access') {
                        xml += `<url><loc>${baseUrl}/arsip/file/${doc.slug}.pdf</loc><lastmod>${validSitemapDate}</lastmod><changefreq>yearly</changefreq><priority>0.9</priority></url>\n`;
                    }
                });
            }
        } catch(e) {
            console.warn("Peringatan: Supabase Timeout saat Sitemap Generation. XML Statis tetap dikirim.");
        }
        
        xml += `</urlset>`;
        res.send(xml);
    } catch (e) {
        res.status(500).send("Error generating sitemap");
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

// ---------------------------------------------------------
// ROUTE: HALAMAN UTAMA ARSIP (Daftar Seluruh Arsip & Kategori)
// ---------------------------------------------------------
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

// ---------------------------------------------------------
// ROUTE BARU: HALAMAN FILTER KATEGORI (Dynamic Routing)
// ---------------------------------------------------------
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

// Endpoint Native Streaming File PDF
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

// Page Viewer (ARSIP FILE EJS) -> PENAMBAHAN KUNCI SUPABASE & REQUIRE FORM
app.get('/arsip/:slug', async (req, res) => {
    try {
        const fetchPromise = supabase.from('arsip').select('*').eq('slug', req.params.slug).single();
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('DB Timeout')), 8500));

        const { data: arsip, error } = await Promise.race([fetchPromise, timeoutPromise]);
        
        if (error || !arsip) return res.status(404).render('admin-404');

        const meta = {
            title: `${arsip.title} | drg. M. Aksa Arsyad`,
            desc: arsip.desc,
            keywords: `Arsip, ${arsip.category}, Kedokteran Gigi, Jurnal, ${arsip.title}`,
            canonical: `${baseUrl}/arsip/${arsip.slug}`,
            ogImage: '/axalogo.png',
            type: 'article'
        };
        
        res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=43200');
        
        // Ambil status requireForm terbaru dari database/storage cache
        const reqForm = await getRequireFormSetting();

        res.render('arsipfile', { 
            meta, 
            baseUrl, 
            arsip, 
            currentPath: `/arsip/${arsip.slug}`,
            supabaseUrl: process.env.SUPABASE_URL || process.env.KVVSUPABASE_URL || '',
            supabaseAnonKey: process.env.KVVSUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || '',
            requireForm: reqForm // Injeksi status form ke frontend
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
