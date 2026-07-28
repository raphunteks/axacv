// Menggunakan module.exports agar kompatibel dengan Vercel Node.js standar (CommonJS)
module.exports = async function handler(req, res) {
    // 1. Setup Header CORS agar aman dan bisa dipanggil dari frontend
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        // 2. Menerima request body dari Frontend
        const { username, token } = req.body || {};
        
        // 3. Fallback ke Environment Variables (process.env)
        // Token AMAN dan dirahasiakan di server Vercel.
        const authToken = token || process.env.GITHUB_TOKEN;
        const ghUser = username || process.env.GITHUB_USERNAME || "raphunteks"; 

        if (!authToken) {
             return res.status(401).json({ status: 'error', message: 'Token GitHub tidak ditemukan. Harap isi GITHUB_TOKEN di Environment Variables Vercel.' });
        }

        // 4. GraphQL Query ke GitHub API
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

        // 5. Eksekusi Request HTTP dari Server Node.js ke GitHub
        const response = await fetch('https://api.github.com/graphql', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
                'User-Agent': 'Axa-Portfolio-App' // SANGAT KRITIKAL: GitHub API akan menolak request tanpa User-Agent
            },
            body: JSON.stringify({ query })
        });

        // Parse Text terlebih dahulu untuk menangkap error non-JSON dari GitHub
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

        // 6. Pengolahan Data Statistik & Kalkulasi Persentase Bahasa
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

        // Ambil Top 5 Bahasa Pemrograman
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

        // 7. Kembalikan Response Sukses ke Frontend
        res.status(200).json({ status: 'success', data: stats });

    } catch (error) {
        console.error("Vercel Serverless Error:", error);
        res.status(500).json({ status: 'error', message: error.message || 'Internal Server Error' });
    }
}
