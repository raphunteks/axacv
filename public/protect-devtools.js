// FILE: protect-devtools.js

(function() {
    'use strict';

    // ================= SECURITY ENGINE (PROTECT DEVTOOLS) =================
    
    // 1. Blokir klik kanan (context menu)
    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
    }, { capture: true, passive: false });

    // 2. Blokir event penyalinan (Copy) secara native dari sistem/menu browser
    document.addEventListener('copy', function(e) {
        e.preventDefault();
        return false;
    }, { capture: true, passive: false });

    // 3. Cegah berbagai shortcut DevTools, View Source, Save, Copy, & Select All
    document.addEventListener('keydown', function (e) {
        
        // Blokir F12
        if (e.key === 'F12' || e.keyCode === 123) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }

        // Blokir Ctrl+Shift+I / J / C (Windows/Linux) ATAU Cmd+Option+I / J / C (Mac OS)
        if ((e.ctrlKey && e.shiftKey) || (e.metaKey && e.altKey)) {
            var k = e.key.toUpperCase();
            var code = e.keyCode; // Fallback untuk browser tertentu
            if (k === 'I' || k === 'J' || k === 'C' || code === 73 || code === 74 || code === 67) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        }

        // Blokir Ctrl+U ATAU Cmd+U (View Source)
        if ((e.ctrlKey || e.metaKey) && (e.key.toUpperCase() === 'U' || e.keyCode === 85)) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }

        // Blokir Ctrl+S ATAU Cmd+S (Save Page)
        if ((e.ctrlKey || e.metaKey) && (e.key.toUpperCase() === 'S' || e.keyCode === 83)) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }

        // Blokir Ctrl+P ATAU Cmd+P (Print Page / Save as PDF)
        if ((e.ctrlKey || e.metaKey) && (e.key.toUpperCase() === 'P' || e.keyCode === 80)) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }

        // Blokir Ctrl+A ATAU Cmd+A (Select All)
        if ((e.ctrlKey || e.metaKey) && (e.key.toUpperCase() === 'A' || e.keyCode === 65)) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }

        // Blokir Ctrl+C ATAU Cmd+C (Copy via Keyboard)
        if ((e.ctrlKey || e.metaKey) && (e.key.toUpperCase() === 'C' || e.keyCode === 67)) {
            // Pastikan bukan kombinasi Ctrl+Shift+C (karena sudah diblokir di logic DevTools)
            if (!e.shiftKey) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        }
        
    }, { capture: true, passive: false });

})();
