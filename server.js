const express = require('express');
const path = require('path');
const { Pool } = require('pg'); // Wajib: npm install pg
const app = express();

// ==========================================
// 1. SETUP MIDDLEWARE & CORS
// ==========================================
// LIMIT DIPERBESAR KE 50MB UNTUK MENERIMA UPLOAD FILE PDF BASE64
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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
// 2. AWS POSTGRESQL DATABASE CONFIGURATION
// ==========================================
// Menggunakan ENV Variables PGHOST, PGUSER, PGPASSWORD, PGDATABASE, PGPORT
const pool = new Pool({
    ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : false
});

// Auto-Create Table Jika Belum Ada
pool.query(`
    CREATE TABLE IF NOT EXISTS arsip_docs (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(255) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        description TEXT,
        file_name VARCHAR(255),
        file_data TEXT, -- Menyimpan Base64 PDF
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`).then(() => console.log("AWS PostgreSQL: Table Ready")).catch(err => console.error("DB Init Error:", err));

// ==========================================
// 3. DATA METADATA DINAMIS SEO UTAMA
// ==========================================
const baseUrl = 'https://www.maksaarsyad.xyz';
const routesMeta = {
    '/': { title: 'CV & Portofolio | drg. M. Aksa Arsyad, S.KG', desc: 'Curriculum Vitae dan Portofolio resmi drg. M. Aksa Arsyad, S.KG.', ogImage: '/axalogo.png', type: 'profile' },
    '/pendidikan': { title: 'Riwayat Pendidikan | drg. M. Aksa Arsyad, S.KG', desc: 'Latar belakang pendidikan Universitas Muslim Indonesia & Universitas Hasanuddin.', ogImage: '/axalogo.png', type: 'website' },
    '/pengalaman': { title: 'Pengalaman Kerja | drg. M. Aksa Arsyad, S.KG', desc: 'Riwayat karir klinis, pekerjaan, dan pengalaman profesional drg. M. Aksa Arsyad.', ogImage: '/axalogo.png', type: 'website' },
    '/organisasi': { title: 'Riwayat Organisasi | drg. M. Aksa Arsyad, S.KG', desc: 'Pengalaman keanggotaan dalam organisasi profesi maupun kemahasiswaan.', ogImage: '/axalogo.png', type: 'website' },
    '/publikasi': { title: 'Publikasi Ilmiah & Jurnal | drg. M. Aksa Arsyad, S.KG', desc: 'Kumpulan jurnal dan publikasi ilmiah di bidang kedokteran gigi.', ogImage: '/axalogo.png', type: 'article' },
    '/keahlian-tech': { title: 'Keahlian Klinis & Teknologi | drg. M. Aksa Arsyad, S.KG', desc: 'Daftar keahlian klinis medis dan Web Development drg. M. Aksa Arsyad.', ogImage: '/axalogo.png', type: 'website' },
    '/proyek': { title: 'Portofolio Proyek Web | drg. M. Aksa Arsyad, S.KG', desc: 'Portofolio pengembangan website, sistem, dan aplikasi.', ogImage: '/axalogo.png', type: 'website' },
    '/sertifikasi': { title: 'Sertifikasi Medis & Tech | drg. M. Aksa Arsyad, S.KG', desc: 'Kumpulan sertifikasi kompetensi medis dan penghargaan teknologi.', ogImage: '/axalogo.png', type: 'website' },
    '/arsip': { title: 'Arsip Materi & Jurnal | drg. M. Aksa Arsyad, S.KG', desc: 'Kumpulan catatan preklinik, profesi dokter muda, dan materi kedokteran gigi.', ogImage: '/axalogo.png', type: 'website' }
};

// ==========================================
// 4. ADMIN AUTHENTICATION API & CRUD ARSIP (AWS POSTGRES)
// ==========================================
const ADMIN_USER = process.env.ADMIN_USER || 'axaaxyz_01';
const ADMIN_PASS = process.env.ADMIN_PASS || 'axaxyz999';
const SECRET_TOKEN = 'axa-super-secure-token-2026';

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USER && password === ADMIN_PASS) res.json({ status: 'success', token: SECRET_TOKEN });
    else res.status(401).json({ status: 'error', message: 'Kredensial tidak valid!' });
});

app.post('/api/auth/verify', (req, res) => {
    if (req.body.token === SECRET_TOKEN) res.json({ status: 'success' });
    else res.status(401).json({ status: 'error' });
});

const protectAdmin = (req, res, next) => {
    if (req.headers.authorization === SECRET_TOKEN) next();
    else res.status(403).json({ status: 'error', message: 'Akses Ditolak' });
};

// API Fetch Arsip List (Tanpa File Data agar ringan)
app.get('/api/arsip', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT id, slug, title, category, description, file_name, created_at as date FROM arsip_docs ORDER BY id DESC');
        // Format tanggal
        rows.forEach(r => r.date = new Date(r.date).toISOString().split('T')[0]);
        res.json({ status: 'success', data: rows });
    } catch (e) {
        res.status(500).json({ status: 'error', message: e.message });
    }
});

// API Upload Arsip Baru
app.post('/api/arsip', protectAdmin, async (req, res) => {
    try {
        const { title, category, desc, fileName, fileData } = req.body;
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);
        
        await pool.query(
            'INSERT INTO arsip_docs (slug, title, category, description, file_name, file_data) VALUES ($1, $2, $3, $4, $5, $6)',
            [slug, title, category, desc, fileName, fileData]
        );
        res.json({ status: 'success' });
    } catch (e) {
        res.status(500).json({ status: 'error', message: e.message });
    }
});

// API Delete Arsip
app.delete('/api/arsip/:id', protectAdmin, async (req, res) => {
    try {
        await pool.query('DELETE FROM arsip_docs WHERE id = $1', [req.params.id]);
        res.json({ status: 'success' });
    } catch (e) {
        res.status(500).json({ status: 'error', message: e.message });
    }
});

// ==========================================
// 5. NATIVE PDF STREAMING ENDPOINT (PENGGANTI GOOGLE DRIVE)
// ==========================================
app.get('/arsip/stream/:slug', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT file_name, file_data FROM arsip_docs WHERE slug = $1', [req.params.slug]);
        if(rows.length === 0) return res.status(404).send("Dokumen tidak ditemukan.");
        
        // Convert Base64 back to Binary PDF Buffer
        const buffer = Buffer.from(rows[0].file_data, 'base64');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${rows[0].file_name}"`);
        res.send(buffer);
    } catch (e) {
        res.status(500).send("Error streaming document.");
    }
});

// ==========================================
// 6. SITEMAP & ROBOTS.TXT (DINAMIS 100% INCL. DATABASE)
// ==========================================
app.get('/sitemap.xml', async (req, res) => {
    res.set('Content-Type', 'text/xml; charset=utf-8');
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    
    for (const [path, meta] of Object.entries(routesMeta)) {
        xml += `  <url>\n    <loc>${baseUrl}${path === '/' ? '' : path}</loc>\n    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n    <changefreq>${path === '/' ? 'daily' : 'weekly'}</changefreq>\n    <priority>${path === '/' ? '1.0' : '0.8'}</priority>\n  </url>\n`;
    }

    try {
        const { rows } = await pool.query('SELECT slug, created_at FROM arsip_docs');
        rows.forEach(doc => {
            const date = new Date(doc.created_at).toISOString().split('T')[0];
            xml += `  <url>\n    <loc>${baseUrl}/arsip/${doc.slug}</loc>\n    <lastmod>${date}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
        });
    } catch (e) { console.error("Sitemap DB Error", e); }
    
    xml += `</urlset>`;
    res.send(xml);
});

app.get('/robots.txt', (req, res) => {
    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.send(`User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: ${baseUrl}/sitemap.xml\n`);
});

// ==========================================
// 7. FOLDER PUBLIC & ROUTING HALAMAN VIEWS
// ==========================================
app.use(express.static(path.join(process.cwd(), 'public')));

const safeRender = (res, viewName, data = {}) => {
    res.render(viewName, data, (err, html) => {
        if (err) return res.status(500).send(`<div style="font-family: monospace; padding: 2rem; background: #050505; color: #ff4444; min-height: 100vh;"><h2>[AXA SYSTEM] FATAL ERROR 500</h2><p><b>File View Tidak Ditemukan:</b> Pastikan <code>views/${viewName}.ejs</code> telah di-upload ke Vercel.</p></div>`);
        res.send(html);
    });
};

app.get('/admin/login', (req, res) => safeRender(res, 'admin-login'));
app.get('/admin/dashboard', (req, res) => safeRender(res, 'admin-dashboard'));

// Halaman Publik Arsip Utama
app.get('/arsip', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT slug, title, category, description as desc, created_at as date FROM arsip_docs ORDER BY id DESC');
        rows.forEach(r => r.date = new Date(r.date).toISOString().split('T')[0]);
        const meta = { ...routesMeta['/arsip'], canonical: `${baseUrl}/arsip` };
        safeRender(res, 'arsip-list', { meta, baseUrl, arsipData: rows });
    } catch (error) {
        res.status(500).send(`Error DB: ${error.message}`);
    }
});

// Halaman Viewer Arsip Satuan (Scribd-like Blur)
app.get('/arsip/:slug', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT slug, title, category, description as desc, file_name, created_at as date FROM arsip_docs WHERE slug = $1', [req.params.slug]);
        if (rows.length === 0) return res.status(404).send('<h2 style="font-family:sans-serif;text-align:center;margin-top:20vh;color:#fff;background:#000;">Dokumen tidak ditemukan. (Error 404)</h2>');

        const arsip = rows[0];
        arsip.date = new Date(arsip.date).toISOString().split('T')[0];
        const meta = { title: `${arsip.title} | drg. M. Aksa Arsyad`, desc: arsip.desc, keywords: `Arsip, ${arsip.category}, Kedokteran Gigi`, canonical: `${baseUrl}/arsip/${arsip.slug}`, ogImage: '/axalogo.png', type: 'article' };
        
        safeRender(res, 'arsipfile', { meta, baseUrl, arsip });
    } catch (error) {
        res.status(500).send(`Error DB: ${error.message}`);
    }
});

// Halaman Portofolio Utama
const routeKeys = Object.keys(routesMeta).filter(k => k !== '/arsip');
app.get(routeKeys, (req, res) => {
    try {
        const currentPath = req.path;
        const meta = { ...routesMeta[currentPath], canonical: `${baseUrl}${currentPath === '/' ? '' : currentPath}` };
        safeRender(res, 'index', { meta, currentPath, baseUrl });
    } catch (error) {
        res.status(500).send(`Internal Server Error: ${error.message}`);
    }
});

// ==========================================
// 8. ROUTE API GITHUB STATS
// ==========================================
app.post('/api/github', async (req, res) => {
    // ... [Kode GitHub API Anda tetap UTUH persis seperti sebelumnya] ...
    try {
        const { username, token } = req.body || {};
        const authToken = token || process.env.GITHUB_TOKEN;
        const ghUser = username || process.env.GITHUB_USERNAME || "raphunteks"; 
        if (!authToken) return res.status(401).json({ status: 'error', message: 'Token GitHub tidak ditemukan.' });

        const query = `query { user(login: "${ghUser}") { repositories(first: 100, ownerAffiliations: OWNER, isFork: false) { nodes { stargazerCount languages(first: 10, orderBy: {field: SIZE, direction: DESC}) { edges { size node { name color } } } } } contributionsCollection { totalCommitContributions restrictedContributionsCount } pullRequests(first: 1) { totalCount } issues(first: 1) { totalCount } } }`;
        const response = await fetch('https://api.github.com/graphql', { method: 'POST', headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json', 'User-Agent': 'Axa-Portfolio-App' }, body: JSON.stringify({ query }) });
        const result = JSON.parse(await response.text());
        if (result.errors) return res.status(400).json({ status: 'error', message: result.errors[0].message });

        const data = result.data.user; let totalStars = 0; let langMap = {}; let totalSize = 0;
        data.repositories.nodes.forEach(repo => { totalStars += repo.stargazerCount; repo.languages.edges.forEach(edge => { const langName = edge.node.name; const langColor = edge.node.color || '#cccccc'; if (!langMap[langName]) langMap[langName] = { size: 0, color: langColor }; langMap[langName].size += edge.size; totalSize += edge.size; }); });
        const sortedLangs = Object.keys(langMap).map(k => ({ name: k, size: langMap[k].size, color: langMap[k].color, percent: ((langMap[k].size / totalSize) * 100).toFixed(2) })).sort((a, b) => b.size - a.size).slice(0, 5);
        
        res.status(200).json({ status: 'success', data: { stars: totalStars, commits: data.contributionsCollection.totalCommitContributions + data.contributionsCollection.restrictedContributionsCount, prs: data.pullRequests.totalCount, issues: data.issues.totalCount, topLangs: sortedLangs } });
    } catch (error) { res.status(500).json({ status: 'error', message: error.message || 'Internal Server Error' }); }
});

module.exports = app;
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
}
