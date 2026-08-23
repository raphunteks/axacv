// FILE: protect-devtools.js

(function() {
    'use strict';

    // =====================================================================
    // 1. UI/UX SECURITY NOTIFICATION ENGINE
    // =====================================================================
    
    function showSecurityToast(title, message) {
        // Hapus toast sebelumnya jika masih ada agar tidak menumpuk
        const existingToast = document.getElementById('axa-security-toast');
        if (existingToast) {
            existingToast.remove();
        }

        // Buat elemen notifikasi baru
        const toast = document.createElement('div');
        toast.id = 'axa-security-toast';
        
        // Inline CSS (Aman dari bentrokan Tailwind/Tema)
        toast.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            background-color: #030712;
            color: #f9fafb;
            padding: 16px 20px;
            border-radius: 12px;
            border-left: 6px solid #ef4444; /* Aksen merah bahaya */
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 15px rgba(239, 68, 68, 0.3);
            font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
            z-index: 2147483647; /* Layer absolut tertinggi */
            display: flex;
            align-items: center;
            gap: 16px;
            opacity: 0;
            transform: translateX(50px);
            transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            pointer-events: none;
            max-width: 350px;
        `;

        // Ikon Peringatan (SVG) & Teks
        toast.innerHTML = `
            <svg style="width: 28px; height: 28px; color: #ef4444; flex-shrink: 0;" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
            <div>
                <span style="display: block; font-size: 11px; color: #ef4444; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">
                    ${title}
                </span>
                <span style="display: block; font-size: 13px; font-weight: 500; line-height: 1.4;">
                    ${message}
                </span>
            </div>
        `;

        document.body.appendChild(toast);

        // Animasi masuk (Slide In)
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        });

        // Animasi keluar (Slide Out) setelah 3.5 detik
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(50px)';
            setTimeout(() => {
                if (toast.parentNode) toast.remove();
            }, 400);
        }, 3500);
    }


    // =====================================================================
    // 2. SECURITY EVENT LISTENERS (PROTECT DEVTOOLS)
    // =====================================================================
    
    // Blokir klik kanan (context menu)
    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        showSecurityToast("Tindakan Dibatalkan", "Menu konteks (Klik Kanan) dinonaktifkan pada halaman ini.");
    }, { capture: true, passive: false });

    // Cegah tindakan penyalinan (Copy Event) via Menu Browser
    document.addEventListener('copy', function(e) {
        e.preventDefault();
        showSecurityToast("Akses Papan Klip Ditolak", "Menyalin konten tidak diizinkan untuk melindungi kekayaan intelektual.");
        return false;
    });

    // Cegah berbagai shortcut DevTools, View Source, Save, Copy, & Select All
    document.addEventListener('keydown', function (e) {
        
        // Blokir F12
        if (e.key === 'F12' || e.keyCode === 123) {
            e.preventDefault();
            e.stopPropagation();
            showSecurityToast("Sistem Keamanan Aktif", "Akses ke fitur Developer Tools diblokir.");
            return false;
        }

        // Blokir Ctrl+Shift+I / J / C (Windows/Linux) ATAU Cmd+Option+I / J / C (Mac OS)
        if ((e.ctrlKey && e.shiftKey) || (e.metaKey && e.altKey)) {
            var k = e.key.toUpperCase();
            var code = e.keyCode; 
            if (k === 'I' || k === 'J' || k === 'C' || code === 73 || code === 74 || code === 67) {
                e.preventDefault();
                e.stopPropagation();
                showSecurityToast("Sistem Keamanan Aktif", "Akses Inspeksi Elemen diblokir oleh administrator.");
                return false;
            }
        }

        // Blokir Ctrl+U ATAU Cmd+U (View Source)
        if ((e.ctrlKey || e.metaKey) && (e.key.toUpperCase() === 'U' || e.keyCode === 85)) {
            e.preventDefault();
            e.stopPropagation();
            showSecurityToast("Sistem Keamanan Aktif", "Melihat kode sumber (View Source) tidak diizinkan.");
            return false;
        }

        // Blokir Ctrl+S ATAU Cmd+S (Save Page)
        if ((e.ctrlKey || e.metaKey) && (e.key.toUpperCase() === 'S' || e.keyCode === 83)) {
            e.preventDefault();
            e.stopPropagation();
            showSecurityToast("Tindakan Dibatalkan", "Menyimpan halaman web ini (Save) dinonaktifkan.");
            return false;
        }

        // Blokir Ctrl+P ATAU Cmd+P (Print Page / Save as PDF)
        if ((e.ctrlKey || e.metaKey) && (e.key.toUpperCase() === 'P' || e.keyCode === 80)) {
            e.preventDefault();
            e.stopPropagation();
            showSecurityToast("Tindakan Dibatalkan", "Fungsi pencetakan (Print) dokumen ini tidak diizinkan.");
            return false;
        }

        // 🌟 Blokir Ctrl+A ATAU Cmd+A (Select All)
        if ((e.ctrlKey || e.metaKey) && (e.key.toUpperCase() === 'A' || e.keyCode === 65)) {
            e.preventDefault();
            e.stopPropagation();
            showSecurityToast("Aksi Terlarang", "Fitur memilih semua teks (Select All) telah dinonaktifkan.");
            return false;
        }

        // 🌟 Blokir Ctrl+C ATAU Cmd+C (Copy)
        if ((e.ctrlKey || e.metaKey) && (e.key.toUpperCase() === 'C' || e.keyCode === 67)) {
            // Pastikan bukan kombinasi Ctrl+Shift+C (karena sudah ditangani di atas)
            if (!e.shiftKey) {
                e.preventDefault();
                e.stopPropagation();
                showSecurityToast("Akses Papan Klip Ditolak", "Menyalin teks atau aset (Copy) tidak diizinkan pada dokumen ini.");
                return false;
            }
        }

    }, { capture: true, passive: false });

})();
