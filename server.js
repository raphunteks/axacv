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
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

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
    }
};

// ==========================================
// 3. SITEMAP & ROBOTS.TXT (DINAMIS 100%)
// ==========================================
app.get('/sitemap.xml', (req, res) => {
    res.set('Content-Type', 'text/xml; charset=utf-8');
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    
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
    
    xml += `</urlset>`;
    res.send(xml);
});

app.get('/robots.txt', (req, res) => {
    res.set('Content-Type', 'text/plain; charset=utf-8');
    let txt = `User-agent: *\n`;
    txt += `Allow: /\n\n`;
    txt += `Sitemap: ${baseUrl}/sitemap.xml\n`;
    res.send(txt);
});

// ==========================================
// 4. FOLDER PUBLIC
// ==========================================
app.use(express.static(path.join(process.cwd(), 'public')));

// ==========================================
// 5. ROUTING DINAMIS (SEO PATHS)
// ==========================================
const routeKeys = Object.keys(routesMeta);
app.get(routeKeys, (req, res) => {
    try {
        const currentPath = req.path;
        const meta = routesMeta[currentPath];
        meta.canonical = `${baseUrl}${currentPath === '/' ? '' : currentPath}`;
        
        // Merender view dengan menyuntikkan data Meta
        res.render('index', { meta, currentPath, baseUrl });
    } catch (error) {
        console.error("Gagal merender index.ejs:", error);
        res.status(500).send("Internal Server Error: Gagal memuat file EJS.");
    }
});

// ==========================================
// ROUTE API GITHUB STATS (SCRIPT PROXY)
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
