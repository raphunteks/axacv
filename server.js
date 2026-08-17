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
    '/arsip': { title: 'Knowledge Base & Jurnal | drg. M. Aksa Arsyad, S.KG', desc: 'Kumpulan catatan preklinik, profesi dokter muda, dan materi kedokteran gigi (Knowledge Base). Berformat PDF Interaktif.', keywords: 'Arsip Kedokteran Gigi, Catatan Preklinik, Co-Ass, Jurnal Kedokteran Gigi PDF', ogImage: '/axalogo.png', type: 'website' }
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
// 4. SUPABASE ARSIP API CORE (FULL CRUD)
// ==========================================

// READ: Ambil seluruh direktori arsip
app.get('/api/arsip', async (req, res) => {
    try {
        if(!supabaseUrl || !supabaseKey) throw new Error("Database Configuration Missing!");
        
        const { data, error } = await supabase
            .from('arsip')
            .select('*')
            .order('date', { ascending: false });

        if (error) throw new Error(error.message);
        res.json({ status: 'success', data });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// CREATE: Unggah METADATA dokumen baru
app.post('/api/arsip', protectAdmin, async (req, res) => {
    try {
        const { id, title, category, desc, fileName, filePath, accessType } = req.body;
        
        const uniqueId = id || Date.now().toString();
        const rawSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const slug = `${rawSlug}-${Math.random().toString(36).substr(2, 4)}`;

        const newItem = {
            id: uniqueId,
            slug: slug,
            title: title,
            category: category,
            desc: desc,
            file_name: fileName,
            file_path: filePath, 
            access_type: accessType || 'Restricted',
            date: new Date().toISOString().split('T')[0]
        };

        const { data: dbData, error: dbError } = await supabase
            .from('arsip')
            .insert([newItem])
            .select();

        if (dbError) throw new Error(`DB Insert Error: ${dbError.message}`);

        res.json({ status: 'success', data: dbData[0] });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// UPDATE: Modifikasi METADATA dokumen yang ada (Edit Feature)
app.put('/api/arsip/:id', protectAdmin, async (req, res) => {
    try {
        const docId = req.params.id;
        const { title, category, desc, accessType } = req.body;

        const { data, error } = await supabase
            .from('arsip')
            .update({ 
                title: title, 
                category: category, 
                desc: desc, 
                access_type: accessType 
            })
            .eq('id', docId)
            .select();

        if (error) throw new Error(error.message);
        if (!data || data.length === 0) throw new Error("Dokumen tidak ditemukan untuk diupdate.");

        res.json({ status: 'success', data: data[0] });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// DELETE: Hapus dokumen secara permanen
app.delete('/api/arsip/:id', protectAdmin, async (req, res) => {
    try {
        const docId = req.params.id;
        const { data: item, error: fetchError } = await supabase.from('arsip').select('file_path').eq('id', docId).single();

        if (fetchError || !item) throw new Error("Dokumen tidak ditemukan.");

        // Delete from storage first
        if (item.file_path) {
            await supabase.storage.from('arsip_files').remove([item.file_path]);
        }

        // Then delete from DB
        const { error: dbError } = await supabase.from('arsip').delete().eq('id', docId);
        if (dbError) throw new Error(dbError.message);

        res.json({ status: 'success' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});


// ==========================================
// 5. SITEMAP & ROBOTS.TXT (DINAMIS 100%)
// ==========================================
app.get('/sitemap.xml', async (req, res) => {
    try {
        res.set('Content-Type', 'text/xml; charset=utf-8');
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
        
        for (const [path, meta] of Object.entries(routesMeta)) {
            const priority = path === '/' ? '1.0' : '0.8';
            const changefreq = path === '/' ? 'daily' : 'weekly';
            xml += `  <url>\n    <loc>${baseUrl}${path === '/' ? '' : path}</loc>\n    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>\n`;
        }

        try {
            const { data: arsipDB } = await supabase.from('arsip').select('slug, date, access_type');
            if (arsipDB) {
                arsipDB.forEach(doc => {
                    // SEO URL Viewer (Biasa)
                    xml += `  <url>\n    <loc>${baseUrl}/arsip/${doc.slug}</loc>\n    <lastmod>${doc.date || new Date().toISOString().split('T')[0]}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
                    // SEO URL Direct PDF (Khusus Open Access untuk Indexing PDF Google)
                    if(doc.access_type === 'Open Access') {
                        xml += `  <url>\n    <loc>${baseUrl}/arsip/file/${doc.slug}.pdf</loc>\n    <lastmod>${doc.date || new Date().toISOString().split('T')[0]}</lastmod>\n    <changefreq>yearly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
                    }
                });
            }
        } catch(e) {}
        
        xml += `</urlset>`;
        res.send(xml);
    } catch (e) {
        res.status(500).send("Error generating sitemap");
    }
});

app.get('/robots.txt', (req, res) => {
    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.send(`User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: ${baseUrl}/sitemap.xml\n`);
});

// ==========================================
// 6. FOLDER PUBLIC & ROUTING HALAMAN VIEWS
// ==========================================
app.use(express.static(path.join(process.cwd(), 'public')));

app.get('/admin/login', (req, res) => res.render('admin-login'));

app.get('/admin/dashboard', (req, res) => {
    // 🔐 INJEKSI VERCEL ENV KE FRONTEND DASHBOARD (Solusi Failsafe)
    res.render('admin-dashboard', {
        supabaseUrl: process.env.SUPABASE_URL || process.env.KVVSUPABASE_URL || '',
        supabaseAnonKey: process.env.KVVSUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || ''
    });
});

app.get('/arsip', async (req, res) => {
    try {
        const meta = routesMeta['/arsip'];
        meta.canonical = `${baseUrl}/arsip`;
        let arsipDB = [];
        try {
            const result = await supabase.from('arsip').select('*').order('date', { ascending: false });
            if(result.data) arsipDB = result.data;
        } catch(dbErr) {}
        
        res.render('arsip-list', { meta, baseUrl, arsipData: arsipDB });
    } catch (e) {
        res.status(500).send("Internal Server Error");
    }
});

// =========================================================================
// ENDPOINT SUPER BIG UPGRADE: NATIVE PDF STREAMING UNTUK SEO (GBR 3 & 4)
// URL berakhiran .pdf (contoh: /arsip/file/nama-jurnal.pdf)
// =========================================================================
app.get('/arsip/file/:slug.pdf', async (req, res) => {
    try {
        // req.params.slug akan berisi nama-jurnal (karena Express otomatis memisahkan ekstensi jika didefinisikan dengan route pattern di atas)
        const slugStr = req.params.slug; 

        const { data: arsip, error: dbErr } = await supabase.from('arsip').select('file_name, file_path, access_type').eq('slug', slugStr).single();
        if (dbErr || !arsip) return res.status(404).send('Dokumen PDF tidak ditemukan.');

        const { data: fileBlob, error: dlErr } = await supabase.storage.from('arsip_files').download(arsip.file_path);
        if (dlErr || !fileBlob) return res.status(500).send('Gagal menarik dokumen dari Storage Database.');

        const buffer = Buffer.from(await fileBlob.arrayBuffer());
        
        // Memaksa browser membaca ini sebagai dokumen PDF utuh (Native)
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${arsip.file_name}"`);
        res.setHeader('Content-Length', buffer.length);
        res.send(buffer);
    } catch (e) {
        res.status(500).send("Transmisi file PDF gagal.");
    }
});

// Halaman Viewer Arsip Satuan (Scribd-like Blur Mode)
app.get('/arsip/:slug', async (req, res) => {
    try {
        const { data: arsip, error } = await supabase.from('arsip').select('*').eq('slug', req.params.slug).single();
        if (error || !arsip) return res.status(404).send('Informasi Dokumen tidak ditemukan.');

        const meta = {
            title: `${arsip.title} | drg. M. Aksa Arsyad`,
            desc: arsip.desc,
            keywords: `${arsip.category}, Kedokteran Gigi, Jurnal Kedokteran Gigi PDF, Catatan Klinis, ${arsip.title}`,
            canonical: `${baseUrl}/arsip/${arsip.slug}`,
            ogImage: '/axalogo.png',
            type: 'article'
        };
        res.render('arsipfile', { meta, baseUrl, arsip });
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

        const query = `query { user(login: "${ghUser}") { repositories(first: 100, ownerAffiliations: OWNER, isFork: false) { nodes { stargazerCount languages(first: 10, orderBy: {field: SIZE, direction: DESC}) { edges { size node { name color } } } } } contributionsCollection { totalCommitContributions restrictedContributionsCount } pullRequests(first: 1) { totalCount } issues(first: 1) { totalCount } } }`;

        const response = await fetch('https://api.github.com/graphql', { method: 'POST', headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json', 'User-Agent': 'Axa-Portfolio-App' }, body: JSON.stringify({ query }) });
        const result = JSON.parse(await response.text());
        if (result.errors) return res.status(400).json({ status: 'error', message: result.errors[0].message });

        const data = result.data.user;
        let totalStars = 0, langMap = {}, totalSize = 0;

        data.repositories.nodes.forEach(repo => {
            totalStars += repo.stargazerCount;
            repo.languages.edges.forEach(edge => {
                const langName = edge.node.name;
                if (!langMap[langName]) langMap[langName] = { size: 0, color: edge.node.color || '#ccc' };
                langMap[langName].size += edge.size;
                totalSize += edge.size;
            });
        });

        const sortedLangs = Object.keys(langMap).map(k => ({ name: k, size: langMap[k].size, color: langMap[k].color, percent: ((langMap[k].size / totalSize) * 100).toFixed(2) })).sort((a, b) => b.size - a.size).slice(0, 5);
        res.status(200).json({ status: 'success', data: { stars: totalStars, commits: data.contributionsCollection.totalCommitContributions + data.contributionsCollection.restrictedContributionsCount, prs: data.pullRequests.totalCount, issues: data.issues.totalCount, topLangs: sortedLangs } });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

module.exports = app;
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
}
