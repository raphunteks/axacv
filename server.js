const express = require('express');
const path = require('path');
const app = express();

// ==========================================
// 1. SETUP MIDDLEWARE & CORS
// ==========================================
app.use(express.json());

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
    '/': { title: 'CV & Portofolio | drg. M. Aksa Arsyad, S.KG', desc: 'Curriculum Vitae dan Portofolio resmi drg. M. Aksa Arsyad, S.KG - Dokter Gigi Umum.', keywords: 'Dokter Gigi, Makassar', type: 'profile' },
    '/pendidikan': { title: 'Riwayat Pendidikan | drg. M. Aksa Arsyad', desc: 'Latar belakang pendidikan drg. M. Aksa Arsyad.', keywords: 'Pendidikan', type: 'website' },
    '/pengalaman': { title: 'Pengalaman Kerja | drg. M. Aksa Arsyad', desc: 'Riwayat karir klinis dan profesional.', keywords: 'Klinik', type: 'website' },
    '/organisasi': { title: 'Riwayat Organisasi | drg. M. Aksa Arsyad', desc: 'Pengalaman organisasi profesi.', keywords: 'PDGI', type: 'website' },
    '/publikasi': { title: 'Publikasi Ilmiah | drg. M. Aksa Arsyad', desc: 'Publikasi dan penelitian kedokteran gigi.', keywords: 'Jurnal', type: 'article' },
    '/keahlian-tech': { title: 'Keahlian & Teknologi | drg. M. Aksa Arsyad', desc: 'Daftar keahlian klinis dan IT.', keywords: 'Tech', type: 'website' },
    '/proyek': { title: 'Portofolio Proyek | drg. M. Aksa Arsyad', desc: 'Proyek web dan aplikasi.', keywords: 'Proyek', type: 'website' },
    '/sertifikasi': { title: 'Sertifikasi | drg. M. Aksa Arsyad', desc: 'Sertifikasi medis dan IT.', keywords: 'Sertifikat', type: 'website' },
    '/arsip': { title: 'Arsip Materi & Jurnal | drg. M. Aksa Arsyad', desc: 'Kumpulan catatan preklinik, profesi dokter muda, dan materi kedokteran gigi (Knowledge Base).', keywords: 'Arsip Kedokteran Gigi, Catatan Preklinik, Co-Ass', type: 'website' }
};

// ==========================================
// 3. DATABASE IN-MEMORY UNTUK ARSIP (VERCEL COMPATIBLE)
// ==========================================
let arsipDB = [
    { 
        id: '1', 
        slug: 'catatan-lengkap-anatomi-gigi-preklinik', 
        title: 'Catatan Lengkap Anatomi Gigi (Preklinik)', 
        category: 'Preklinik', 
        desc: 'Dokumen ringkasan lengkap mengenai morfologi, anatomi, dan histologi gigi geligi untuk persiapan ujian blok preklinik.', 
        fileUrl: 'https://drive.google.com/file/d/1Uv_ContohIDDriveSaja_XYZ/view', 
        date: '2024-05-12' 
    }
];

// ==========================================
// 4. ADMIN AUTHENTICATION API
// ==========================================
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'axaxyz999';
const SECRET_TOKEN = 'axa-super-secure-token-2026';

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

// Middleware Proteksi
const protectAdmin = (req, res, next) => {
    const token = req.headers.authorization;
    if (token === SECRET_TOKEN) next();
    else res.status(403).json({ status: 'error', message: 'Akses Ditolak' });
};

// API Arsip (Admin CRUD)
app.get('/api/arsip', (req, res) => res.json({ status: 'success', data: arsipDB }));
app.post('/api/arsip', protectAdmin, (req, res) => {
    const newItem = { id: Date.now().toString(), date: new Date().toISOString().split('T')[0], ...req.body };
    // Auto-generate slug
    newItem.slug = newItem.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    arsipDB.push(newItem);
    res.json({ status: 'success', data: newItem });
});
app.delete('/api/arsip/:id', protectAdmin, (req, res) => {
    arsipDB = arsipDB.filter(item => item.id !== req.params.id);
    res.json({ status: 'success' });
});

// ==========================================
// 5. SITEMAP & ROBOTS.TXT (DINAMIS 100%)
// ==========================================
app.get('/sitemap.xml', (req, res) => {
    res.set('Content-Type', 'text/xml; charset=utf-8');
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    
    // Static Routes
    for (const [path, meta] of Object.entries(routesMeta)) {
        xml += `  <url>\n    <loc>${baseUrl}${path === '/' ? '' : path}</loc>\n    <priority>${path === '/' ? '1.0' : '0.8'}</priority>\n  </url>\n`;
    }
    // Dynamic Arsip Routes
    arsipDB.forEach(doc => {
        xml += `  <url>\n    <loc>${baseUrl}/arsip/${doc.slug}</loc>\n    <lastmod>${doc.date}</lastmod>\n    <priority>0.7</priority>\n  </url>\n`;
    });
    
    xml += `</urlset>`;
    res.send(xml);
});

app.get('/robots.txt', (req, res) => {
    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.send(`User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: ${baseUrl}/sitemap.xml\n`);
});

// ==========================================
// 6. ROUTING HALAMAN
// ==========================================
app.use(express.static(path.join(process.cwd(), 'public')));

// Panel Admin Halaman
app.get('/admin/login', (req, res) => res.render('admin-login'));
app.get('/admin/dashboard', (req, res) => res.render('admin-dashboard'));

// Halaman Publik Arsip (List & Single Scribd View)
app.get('/arsip', (req, res) => {
    const meta = { ...routesMeta['/arsip'], canonical: `${baseUrl}/arsip`, ogImage: '/axalogo.png' };
    res.render('arsip-list', { meta, baseUrl, arsipData: arsipDB });
});

app.get('/arsip/:slug', (req, res) => {
    const arsip = arsipDB.find(d => d.slug === req.params.slug);
    if (!arsip) return res.status(404).send('Dokumen tidak ditemukan.');

    const meta = {
        title: `${arsip.title} | drg. M. Aksa Arsyad`,
        desc: arsip.desc,
        keywords: `Arsip, ${arsip.category}, Kedokteran Gigi`,
        canonical: `${baseUrl}/arsip/${arsip.slug}`,
        ogImage: '/axalogo.png',
        type: 'article'
    };
    res.render('arsipfile', { meta, baseUrl, arsip });
});

// Halaman Portofolio Utama
const routeKeys = Object.keys(routesMeta).filter(k => k !== '/arsip');
app.get(routeKeys, (req, res) => {
    try {
        const currentPath = req.path;
        const meta = routesMeta[currentPath];
        meta.canonical = `${baseUrl}${currentPath === '/' ? '' : currentPath}`;
        meta.ogImage = '/axalogo.png';
        res.render('index', { meta, currentPath, baseUrl });
    } catch (error) {
        res.status(500).send("Internal Server Error.");
    }
});

// ==========================================
// 7. ROUTE API GITHUB STATS (SCRIPT PROXY)
// ==========================================
app.post('/api/github', async (req, res) => {
    try {
        const authToken = req.body.token || process.env.GITHUB_TOKEN;
        const ghUser = req.body.username || process.env.GITHUB_USERNAME || "raphunteks"; 
        if (!authToken) return res.status(401).json({ status: 'error', message: 'Token GitHub tidak ditemukan.' });

        const query = `query { user(login: "${ghUser}") { repositories(first: 100, ownerAffiliations: OWNER, isFork: false) { nodes { stargazerCount languages(first: 10, orderBy: {field: SIZE, direction: DESC}) { edges { size node { name color } } } } } contributionsCollection { totalCommitContributions restrictedContributionsCount } pullRequests(first: 1) { totalCount } issues(first: 1) { totalCount } } }`;

        const response = await fetch('https://api.github.com/graphql', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json', 'User-Agent': 'Axa-App' },
            body: JSON.stringify({ query })
        });

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
