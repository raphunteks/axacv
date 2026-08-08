const express = require('express');
const path = require('path');
const app = express();

// Konfigurasi EJS sebagai Template Engine
app.set('view engine', 'ejs');

// Set folder 'views' (KARENA FILE INI DI ROOT, kita hapus '../' nya)
app.set('views', path.join(__dirname, 'views'));

// Set folder 'public' untuk file statis (gambar, css, js, sitemap.xml, robots.txt)
app.use(express.static(path.join(__dirname, 'public')));

// Routing Halaman Utama (Merender views/index.ejs)
app.get('/', (req, res) => {
    // Di sinilah nanti Anda bisa passing data SEO dinamis (SSR)
    // contoh: res.render('index', { title: "drg. M. Aksa Arsyad - Portofolio" });
    res.render('index');
});

// Export aplikasi untuk Vercel Serverless Functions (WAJIB ADA)
module.exports = app;

// Listener untuk keperluan Development Lokal (node server.js)
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}
