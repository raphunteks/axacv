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
// SANGAT PENTING: ROUTE KHUSUS SEO (XML & TXT)
// Wajib diletakkan DI ATAS express.static agar tidak di-override
// Menggunakan 'text/xml' agar browser merender sebagai Tree (Seperti GBR 2)
// ==========================================
app.get('/sitemap.xml', (req, res) => {
    res.set('Content-Type', 'text/xml; charset=utf-8');
    res.sendFile(path.join(process.cwd(), 'public', 'sitemap.xml'));
});

app.get('/robots.txt', (req, res) => {
    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.sendFile(path.join(process.cwd(), 'public', 'robots.txt'));
});

// ==========================================
// 2. FOLDER PUBLIC (Di bawah route SEO)
// ==========================================
app.use(express.static(path.join(process.cwd(), 'public')));

// ==========================================
// ROUTE 1: HALAMAN UTAMA (WEB PORTFOLIO EJS)
// ==========================================
app.get('/', (req, res) => {
    try {
        res.render('index');
    } catch (error) {
        console.error("Gagal merender index.ejs:", error);
        res.status(500).send("Internal Server Error: Gagal memuat file EJS.");
    }
});

// ==========================================
// ROUTE 2: API GITHUB STATS (SCRIPT PROXY)
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
