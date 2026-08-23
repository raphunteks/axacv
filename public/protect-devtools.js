// FILE: protect-devtools.js

(function() {
    'use strict';

    // =====================================================================
    // 1. SECURITY ENGINE (PROTECT DEVTOOLS)
    // =====================================================================
    
    // Blokir klik kanan (context menu)
    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
    }, { capture: true });

    // Cegah shortcut DevTools dasar
    document.addEventListener('keydown', function (e) {
        // F12
        if (e.key === 'F12') {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }

        // Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C
        if (e.ctrlKey && e.shiftKey) {
            var k = e.key.toUpperCase();
            if (k === 'I' || k === 'J' || k === 'C') {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        }

        // Ctrl+U (View Source)
        if (e.ctrlKey && e.key.toUpperCase() === 'U') {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    }, { capture: true });


    // =====================================================================
    // 2. CHIEF MASTER ENTERPRISE UI/UX: SPLIT MAGNETIC HUD CURSOR ENGINE
    // =====================================================================
    
    // Jalankan hanya jika perangkat menggunakan Mouse/Desktop Pointer (Bukan Mobile/Touch)
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        
        // Helper untuk memastikan DOM siap (Mengatasi Race Condition pada script defer)
        function onDOMReady(fn) {
            if (document.readyState === 'interactive' || document.readyState === 'complete') {
                fn();
            } else {
                document.addEventListener('DOMContentLoaded', fn);
            }
        }

        onDOMReady(() => {
            // Cegah duplikasi inject jika script terpanggil lebih dari sekali
            if (document.getElementById('hud-wrapper')) return;

            // --- A. AUTO-INJECT UNIVERSAL CSS (DARK & LIGHT / NEUBRUTALISM COMPATIBLE) ---
            const cursorStyles = document.createElement('style');
            cursorStyles.id = 'hud-cursor-styles';
            cursorStyles.innerHTML = `
                @media (hover: hover) and (pointer: fine) {
                    body, a, button, input, textarea, select, label, svg, img, 
                    .link-hover, .btn-pulse, .social-lift, .admin-tab, .bg-swatch, 
                    .color-swatch, .theme-btn, .brutal-btn, .brutal-input { 
                        cursor: none !important; 
                    }
                    body * { cursor: none !important; }
                }

                #hud-wrapper, #hud-dot {
                    position: fixed; 
                    top: 0; 
                    left: 0; 
                    pointer-events: none; 
                    z-index: 2147483647; 
                    opacity: 0; 
                    transition: opacity 0.3s ease;
                    will-change: transform, width, height, opacity;
                }

                #hud-dot {
                    width: 8px; 
                    height: 8px;
                    background-color: var(--color-primary, #00E5FF);
                    border-radius: 50%;
                    margin: -4px 0 0 -4px;
                    box-shadow: 0 0 10px var(--color-primary, #00E5FF), 0 0 20px var(--color-primary, #00E5FF);
                }

                #hud-wrapper {
                    width: 0; 
                    height: 0;
                }

                #hud-brackets {
                    position: absolute; 
                    top: 0; 
                    left: 0;
                    will-change: transform, width, height;
                }

                .hud-bracket {
                    position: absolute; 
                    width: 20px; 
                    height: 20px;
                    border-color: var(--color-primary, #00E5FF);
                    border-style: solid; 
                    opacity: 0.85;
                    filter: drop-shadow(0 0 5px var(--color-primary, #00E5FF));
                    transition: border-width 0.25s ease, border-color 0.25s ease, filter 0.25s ease, opacity 0.25s ease;
                }
                
                /* Corner Brackets Normal State (Idle) */
                .hud-tl { top: 0; left: 0; border-width: 2px 0 0 2px; }
                .hud-tr { top: 0; right: 0; border-width: 2px 2px 0 0; }
                .hud-bl { bottom: 0; left: 0; border-width: 0 0 2px 2px; }
                .hud-br { bottom: 0; right: 0; border-width: 0 2px 2px 0; }

                /* Corner Brackets Magnetic Locked State (Penebalan Garis Siku saat Kunci Box) */
                .magnetic-active .hud-bracket {
                    border-color: var(--color-primary, #00E5FF); 
                    opacity: 1;
                    filter: drop-shadow(0 0 8px var(--color-primary, #00E5FF));
                }
                .magnetic-active .hud-tl { border-width: 4px 0 0 4px; }
                .magnetic-active .hud-tr { border-width: 4px 4px 0 0; }
                .magnetic-active .hud-bl { border-width: 0 0 4px 4px; }
                .magnetic-active .hud-br { border-width: 0 4px 4px 0; }
            `;
            document.head.appendChild(cursorStyles);

            // --- B. AUTO-INJECT HUD HTML ---
            const hudWrapper = document.createElement('div');
            hudWrapper.id = 'hud-wrapper';
            hudWrapper.innerHTML = `
                <div id="hud-brackets">
                    <div class="hud-bracket hud-tl"></div>
                    <div class="hud-bracket hud-tr"></div>
                    <div class="hud-bracket hud-bl"></div>
                    <div class="hud-bracket hud-br"></div>
                </div>
            `;

            const hudDot = document.createElement('div');
            hudDot.id = 'hud-dot';

            document.body.appendChild(hudWrapper);
            document.body.appendChild(hudDot);

            const hudBrackets = document.getElementById('hud-brackets');

            // --- C. COMPREHENSIVE TARGET SELECTOR (Mendukung index.ejs & arsipfile.ejs) ---
            const magneticSelector = [
                '.premium-card', 
                '.admin-item-card', 
                '.stat-breathe', 
                '.doc-wrapper', 
                '.brutal-btn', 
                '.brutal-input', 
                '.brutal-shadow',
                '.brutal-shadow-lg',
                'a', 
                'button', 
                'input', 
                'textarea', 
                'select', 
                'label', 
                'svg', 
                'img', 
                '.link-hover', 
                '.btn-pulse', 
                '.social-lift', 
                '.theme-btn', 
                '.color-swatch', 
                '.bg-swatch', 
                '.admin-tab'
            ].join(', ');

            let mouseX = window.innerWidth / 2;
            let mouseY = window.innerHeight / 2;
            let dotX = mouseX, dotY = mouseY;
            let bx = mouseX, by = mouseY;
            let bw = 40, bh = 40; 
            let rot = 0;
            let scale = 1;
            
            let isHovering = false;
            let hoveredEl = null;
            let hasMoved = false;

            // Tracking Mouse Movement
            window.addEventListener('mousemove', (e) => {
                mouseX = e.clientX;
                mouseY = e.clientY;
                if (!hasMoved) {
                    hasMoved = true;
                    hudWrapper.style.opacity = '1';
                    hudDot.style.opacity = '1';
                    dotX = mouseX; dotY = mouseY;
                    bx = mouseX; by = mouseY;
                }
            }, { passive: true });

            // Mechanical Click Feedback
            window.addEventListener('mousedown', () => { if(hasMoved) scale = 0.85; }, { passive: true });
            window.addEventListener('mouseup', () => { if(hasMoved) scale = 1; }, { passive: true });

            // Sembunyikan jika cursor keluar viewport window
            document.addEventListener('mouseleave', () => {
                hudWrapper.style.opacity = '0';
                hudDot.style.opacity = '0';
            });
            document.addEventListener('mouseenter', () => {
                if (hasMoved) {
                    hudWrapper.style.opacity = '1';
                    hudDot.style.opacity = '1';
                }
            });

            // Event Delegation untuk deteksi elemen statis & dinamis (Async/API)
            document.addEventListener('mouseover', (e) => {
                const target = e.target.closest(magneticSelector);
                if (target) {
                    isHovering = true;
                    hoveredEl = target;
                }
            }, { passive: true });

            document.addEventListener('mouseout', (e) => {
                const target = e.target.closest(magneticSelector);
                if (target) {
                    const relatedTarget = e.relatedTarget ? e.relatedTarget.closest(magneticSelector) : null;
                    if (relatedTarget) {
                        hoveredEl = relatedTarget;
                        isHovering = true;
                    } else {
                        isHovering = false;
                        hoveredEl = null;
                    }
                }
            }, { passive: true });

            // --- D. GPU-ACCELERATED ANIMATION LOOP ---
            const renderHUD = () => {
                if (hasMoved) {
                    // 1. Free-Tracking Inner Dot (Mengikuti mouse secara instan)
                    dotX += (mouseX - dotX) * 0.35;
                    dotY += (mouseY - dotY) * 0.35;
                    hudDot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0)`;

                    let targetBx = mouseX;
                    let targetBy = mouseY;
                    let targetBw = 40;
                    let targetBh = 40;
                    let isMagnetic = false;

                    if (isHovering && hoveredEl && hoveredEl.isConnected) {
                        // 2. Bounding-Box Magnetic Snap
                        const rect = hoveredEl.getBoundingClientRect();
                        targetBx = rect.left + rect.width / 2;
                        targetBy = rect.top + rect.height / 2;
                        targetBw = rect.width + 12;  // Padding offset kotak
                        targetBh = rect.height + 12;
                        
                        // 3. Lock Rotasi ke 0 derajat
                        rot = rot % 360;
                        if (rot > 180) rot -= 360;
                        if (rot < -180) rot += 360;
                        rot += (0 - rot) * 0.2; 
                        
                        hudWrapper.classList.add('magnetic-active');
                        isMagnetic = true;
                    } else {
                        // 4. Rotating Idle State
                        rot += 1.5; 
                        hudWrapper.classList.remove('magnetic-active');
                    }

                    if (isMagnetic) {
                        scale += (1 - scale) * 0.2; 
                    }

                    // 5. Interpolasi (Lerp) Frame
                    const lerpFactor = isMagnetic ? 0.3 : 0.15;
                    bx += (targetBx - bx) * lerpFactor;
                    by += (targetBy - by) * lerpFactor;
                    bw += (targetBw - bw) * lerpFactor;
                    bh += (targetBh - bh) * lerpFactor;

                    hudWrapper.style.transform = `translate3d(${bx}px, ${by}px, 0)`;
                    hudBrackets.style.width = `${bw}px`;
                    hudBrackets.style.height = `${bh}px`;
                    hudBrackets.style.transform = `translate(-50%, -50%) rotate(${rot}deg) scale(${scale})`;
                }
                requestAnimationFrame(renderHUD);
            };
            requestAnimationFrame(renderHUD);
        });
    }

})();
