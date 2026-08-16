const express = require('express');
const path = require('path');
const app = express();

// ==========================================
// 1. SETUP MIDDLEWARE & CORS
// ==========================================
app.use(express.json({ limit: '10mb' })); // Limit ditingkatkan untuk antisipasi payload besar

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
    '/': {
        title: 'CV & Portofolio | drg. M. Aksa Arsyad, S.KG',
        desc: 'Curriculum Vitae dan Portofolio resmi drg. M. Aksa Arsyad, S.KG - Dokter Gigi Umum. Lihat pengalaman kerja, riwayat pendidikan, riwayat organisasi, publikasi ilmiah, dan hubungi langsung.',
        keywords: 'Riwayat Pendidikan drg. M. Aksa Arsyad, Pengalaman Kerja drg. M. Aksa Arsyad, Dokter Gigi Umum, Aksa Arsyad, S.KG, Makassar, UMI, Dokter Gigi Makassar, Kedokteran Gigi, Klinik Gigi, Publikasi Ilmiah',
        ogImage: '/axalogo.png',
        type: 'profile'
    },
    '/pendidikan': {
        title: 'Riwayat Pendidikan | drg. M. Aksa Arsyad, S.KG',
        desc: 'Latar belakang pendidikan, institusi, dan almamater Universitas Muslim Indonesia & Universitas Hasanuddin drg. M. Aksa Arsyad, S.KG.',
        keywords: 'Pendidikan drg. M. Aksa Arsyad, UMI Kedokteran Gigi, Universitas Hasanuddin, S.KG Makassar',
        ogImage: '/axalogo.png',
        type: 'website'
    },
    '/pengalaman': {
        title: 'Pengalaman Kerja | drg. M. Aksa Arsyad, S.KG',
        desc: 'Riwayat karir klinis, pekerjaan, dan pengalaman profesional drg. M. Aksa Arsyad di berbagai klinik serta rumah sakit.',
        keywords: 'Pengalaman Kerja Dokter Gigi, Karir drg. Aksa Arsyad, Klinik Gigi Makassar, Praktek Dokter Gigi',
        ogImage: '/axalogo.png',
        type: 'website'
    },
    '/organisasi': {
        title: 'Riwayat Organisasi | drg. M. Aksa Arsyad, S.KG',
        desc: 'Pengalaman keanggotaan dan aktivitas dalam organisasi profesi (PDGI) maupun kemahasiswaan drg. M. Aksa Arsyad.',
        keywords: 'Organisasi drg. Aksa Arsyad, Anggota PDGI, BEM FKG UMI',
        ogImage: '/axalogo.png',
        type: 'website'
    },
    '/publikasi': {
        title: 'Publikasi Ilmiah & Jurnal | drg. M. Aksa Arsyad, S.KG',
        desc: 'Kumpulan jurnal, penelitian, dan publikasi ilmiah di bidang kedokteran gigi oleh drg. M. Aksa Arsyad, S.KG.',
        keywords: 'Publikasi Ilmiah Kedokteran Gigi, Jurnal drg. Aksa Arsyad, Penelitian Gigi, Google Scholar Aksa Arsyad',
        ogImage: '/axalogo.png',
        type: 'article'
    },
    '/keahlian-tech': {
        title: 'Keahlian Klinis & Teknologi | drg. M. Aksa Arsyad, S.KG',
        desc: 'Daftar keahlian klinis medis, bahasa pemrograman, dan kemampuan teknologi (Web Development) drg. M. Aksa Arsyad.',
        keywords: 'Keahlian Dokter Gigi, Web Developer Makassar, Node.js, React, Keterampilan Klinis Gigi',
        ogImage: '/axalogo.png',
        type: 'website'
    },
    '/proyek': {
        title: 'Portofolio Proyek Web | drg. M. Aksa Arsyad, S.KG',
        desc: 'Portofolio pengembangan website, sistem, dan aplikasi yang dibangun oleh drg. M. Aksa Arsyad.',
        keywords: 'Proyek Web drg. Aksa Arsyad, Web Portofolio, Sistem Informasi Klinik, Web Developer Gigi',
        ogImage: '/axalogo.png',
        type: 'website'
    },
    '/sertifikasi': {
        title: 'Sertifikasi Medis & Tech | drg. M. Aksa Arsyad, S.KG',
        desc: 'Kumpulan sertifikasi kompetensi medis (PDGI) dan penghargaan pemrograman teknologi drg. M. Aksa Arsyad.',
        keywords: 'Sertifikasi PDGI, Sertifikat Web Developer, Penghargaan drg. Aksa Arsyad, Pelatihan Kedokteran Gigi',
        ogImage: '/axalogo.png',
        type: 'website'
    },
    // Meta Arsip ditambahkan untuk di-loop di sitemap, tapi di-handle secara khusus di route /arsip
    '/arsip': {
        title: 'Arsip Materi & Jurnal | drg. M. Aksa Arsyad, S.KG',
        desc: 'Kumpulan catatan preklinik, profesi dokter muda, dan materi kedokteran gigi (Knowledge Base).',
        keywords: 'Arsip Kedokteran Gigi, Catatan Preklinik, Co-Ass',
        ogImage: '/axalogo.png',
        type: 'website'
    }
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
// 4. ADMIN AUTHENTICATION API & CRUD
// ==========================================
const ADMIN_USER = process.env.ADMIN_USER || 'axaaxyz_01';
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

// Middleware Proteksi Endpoints
const protectAdmin = (req, res, next) => {
    const token = req.headers.authorization;
    if (token === SECRET_TOKEN) next();
    else res.status(403).json({ status: 'error', message: 'Akses Ditolak' });
};

// API Arsip (Admin CRUD)
app.get('/api/arsip', (req, res) => res.json({ status: 'success', data: arsipDB }));

app.post('/api/arsip', protectAdmin, (req, res) => {
    const newItem = { id: Date.now().toString(), date: new Date().toISOString().split('T')[0], ...req.body };
    // Auto-generate slug dari judul
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
    
    // Inject Static & Navigation Routes
    for (const [path, meta] of Object.entries(routesMeta)) {
        const priority = path === '/' ? '1.0' : '0.8';
        const changefreq = path === '/' ? 'daily' : 'weekly';
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}${path === '/' ? '' : path}</loc>\n`;
        xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
        xml += `    <changefreq>${changefreq}</changefreq>\n`;
        xml += `    <priority>${priority}</priority>\n`;
        xml += `  </url>\n`;
    }

    // Inject Dynamic Arsip Documents Routes
    arsipDB.forEach(doc => {
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/arsip/${doc.slug}</loc>\n`;
        xml += `    <lastmod>${doc.date.split('T')[0] || new Date().toISOString().split('T')[0]}</lastmod>\n`;
        xml += `    <changefreq>monthly</changefreq>\n`;
        xml += `    <priority>0.7</priority>\n`;
        xml += `  </url>\n`;
    });
    
    xml += `</urlset>`;
    res.send(xml);
});

app.get('/robots.txt', (req, res) => {
    res.set('Content-Type', 'text/plain; charset=utf-8');
    let txt = `User-agent: *\n`;
    txt += `Allow: /\n`;
    txt += `Disallow: /admin/\n\n`; // Melarang Google meng-crawl Dashboard Admin
    txt += `Sitemap: ${baseUrl}/sitemap.xml\n`;
    res.send(txt);
});


// ==========================================
// 6. FOLDER PUBLIC & ROUTING HALAMAN VIEWS
// ==========================================
app.use(express.static(path.join(process.cwd(), 'public')));

// Panel Admin Halaman (CMS)
app.get('/admin/login', (req, res) => res.render('admin-login'));
app.get('/admin/dashboard', (req, res) => res.render('admin-dashboard'));

// Halaman Publik Arsip Utama
app.get('/arsip', (req, res) => {
    const meta = routesMeta['/arsip'];
    meta.canonical = `${baseUrl}/arsip`;
    res.render('arsip-list', { meta, baseUrl, arsipData: arsipDB });
});

// Halaman Viewer Arsip Satuan (Scribd-like Blur)
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

// Halaman Portofolio Utama (Filter '/arsip' karena sudah di-handle di atas)
const routeKeys = Object.keys(routesMeta).filter(k => k !== '/arsip');
app.get(routeKeys, (req, res) => {
    try {
        const currentPath = req.path;
        const meta = routesMeta[currentPath];
        meta.canonical = `${baseUrl}${currentPath === '/' ? '' : currentPath}`;
        
        // Merender view dengan menyuntikkan data Meta Dynamic
        res.render('index', { meta, currentPath, baseUrl });
    } catch (error) {
        console.error("Gagal merender index.ejs:", error);
        res.status(500).send("Internal Server Error: Gagal memuat file EJS.");
    }
});

// ==========================================
// 7. ROUTE API GITHUB STATS (SCRIPT PROXY)
// ==========================================
app.post('/api/github', async (req, res) => {
    try {
        const { username, token } = req.body || {};
        const authToken = token || process.env.GITHUB_TOKEN;
        const ghUser = username || process.env.GITHUB_USERNAME || "raphunteks"; 

        if (!authToken) {
             return res.status(401).json({ status: 'error', message: 'Token GitHub tidak ditemukan.' });
        }

        const query = `
        query {
          user(login: "${ghUser}") {
            repositories(first: 100, ownerAffiliations: OWNER, isFork: false) {
              nodes {
                stargazerCount
                languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
                  edges { size node { name color } }
                }
              }
            }
            contributionsCollection {
              totalCommitContributions
              restrictedContributionsCount
            }
            pullRequests(first: 1) { totalCount }
            issues(first: 1) { totalCount }
          }
        }`;

        const response = await fetch('https://api.github.com/graphql', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
                'User-Agent': 'Axa-Portfolio-App'
            },
            body: JSON.stringify({ query })
        });

        const responseText = await response.text();

        let result;
        try {
            result = JSON.parse(responseText);
        } catch(e) {
            return res.status(500).json({ status: 'error', message: 'GitHub API tidak mengembalikan format JSON yang valid.' });
        }

        if (result.errors) {
            return res.status(400).json({ status: 'error', message: result.errors[0].message });
        }

        const data = result.data.user;
        let totalStars = 0;
        let langMap = {};
        let totalSize = 0;

        data.repositories.nodes.forEach(repo => {
            totalStars += repo.stargazerCount;
            repo.languages.edges.forEach(edge => {
                const langName = edge.node.name;
                const langColor = edge.node.color || '#cccccc';
                if (!langMap[langName]) langMap[langName] = { size: 0, color: langColor };
                langMap[langName].size += edge.size;
                totalSize += edge.size;
            });
        });

        const sortedLangs = Object.keys(langMap)
            .map(k => ({ name: k, size: langMap[k].size, color: langMap[k].color, percent: ((langMap[k].size / totalSize) * 100).toFixed(2) }))
            .sort((a, b) => b.size - a.size)
            .slice(0, 5);

        const stats = {
            stars: totalStars,
            commits: data.contributionsCollection.totalCommitContributions + data.contributionsCollection.restrictedContributionsCount,
            prs: data.pullRequests.totalCount,
            issues: data.issues.totalCount,
            topLangs: sortedLangs
        };

        res.status(200).json({ status: 'success', data: stats });

    } catch (error) {
        console.error("Vercel Serverless Error:", error);
        res.status(500).json({ status: 'error', message: error.message || 'Internal Server Error' });
    }
});

module.exports = app;

if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}
