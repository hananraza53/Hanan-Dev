// ==========================================
// CINEMATIC PRELOADER ENGINE
// Multi-phase loading experience with
// matrix rain, particle assembly, shockwave
// ==========================================
(function initPreloader() {
    // Lock body scroll during preload
    document.body.classList.add('preloading');

    const preloader = document.getElementById('preloader');
    if (!preloader) return;

    // === DOM refs ===
    const matrixCanvas = document.getElementById('matrixCanvas');
    const particleBgCanvas = document.getElementById('preloaderParticles');
    const glitchWrap = document.getElementById('preloaderGlitch');
    const brandWrap = document.getElementById('preloaderBrand');
    const brandCipher = document.getElementById('brandCipher');
    const devPill = document.getElementById('devPill');
    const shockwave = document.getElementById('shockwave');
    const fillBar = document.getElementById('preloaderFill');
    const pctText = document.getElementById('preloaderPct');
    const statusText = document.getElementById('preloaderStatus');
    const termStatus = document.getElementById('termStatus');
    const skipBtn = document.getElementById('preloaderSkip');

    let isFinished = false;
    let animFrameMatrix, animFrameDots, animFrameProgress;
    const totalDuration = 4200; // ms total duration
    const startTime = performance.now();

    // ─────────────────────────────────────
    // MATRIX CODE RAIN
    // ─────────────────────────────────────
    function initMatrix() {
        if (!matrixCanvas) return;
        const mCtx = matrixCanvas.getContext('2d');
        const resizeMatrix = () => {
            matrixCanvas.width = window.innerWidth;
            matrixCanvas.height = window.innerHeight;
        };
        resizeMatrix();

        const chars = '01ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz{}[]<>/\\|~`!@#$%^&*+=_-;';
        const fontSize = 14;
        const columns = Math.ceil(matrixCanvas.width / fontSize);
        const drops = new Array(columns).fill(0);

        // Randomize initial positions so the screen is immediately alive
        for (let i = 0; i < drops.length; i++) {
            drops[i] = Math.floor(Math.random() * (matrixCanvas.height / fontSize));
        }

        function drawMatrix() {
            if (isFinished) return;
            mCtx.fillStyle = 'rgba(4, 13, 20, 0.08)';
            mCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

            mCtx.font = `${fontSize}px 'Inter', monospace`;

            for (let i = 0; i < drops.length; i++) {
                const char = chars[Math.floor(Math.random() * chars.length)];
                const x = i * fontSize;
                const y = drops[i] * fontSize;

                const r = Math.random();
                if (r > 0.96) {
                    mCtx.fillStyle = '#ffffff';
                } else if (r > 0.8) {
                    mCtx.fillStyle = '#00e5cc';
                } else {
                    mCtx.fillStyle = 'rgba(0, 171, 240, 0.75)';
                }

                mCtx.fillText(char, x, y);

                if (y > matrixCanvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }

            animFrameMatrix = requestAnimationFrame(drawMatrix);
        }

        drawMatrix();
    }

    // ─────────────────────────────────────
    // FLOATING PARTICLES BACKGROUND
    // ─────────────────────────────────────
    function initPreloaderParticles() {
        if (!particleBgCanvas) return;
        const pCtx = particleBgCanvas.getContext('2d');
        particleBgCanvas.width = window.innerWidth;
        particleBgCanvas.height = window.innerHeight;

        const dots = [];
        const count = window.innerWidth < 768 ? 25 : 45;

        for (let i = 0; i < count; i++) {
            dots.push({
                x: Math.random() * particleBgCanvas.width,
                y: Math.random() * particleBgCanvas.height,
                vx: (Math.random() - 0.5) * 1.0,
                vy: (Math.random() - 0.5) * 1.0,
                r: Math.random() * 2 + 0.6,
                alpha: Math.random() * 0.45 + 0.15
            });
        }

        function animateDots() {
            if (isFinished) return;
            pCtx.clearRect(0, 0, particleBgCanvas.width, particleBgCanvas.height);

            for (let i = 0; i < dots.length; i++) {
                const d = dots[i];
                d.x += d.vx;
                d.y += d.vy;

                if (d.x < 0 || d.x > particleBgCanvas.width) d.vx *= -1;
                if (d.y < 0 || d.y > particleBgCanvas.height) d.vy *= -1;

                pCtx.beginPath();
                pCtx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
                pCtx.fillStyle = `rgba(0, 171, 240, ${d.alpha})`;
                pCtx.fill();

                // Proximity connection lines
                for (let j = i + 1; j < dots.length; j++) {
                    const dx = d.x - dots[j].x;
                    const dy = d.y - dots[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 110) {
                        pCtx.beginPath();
                        pCtx.moveTo(d.x, d.y);
                        pCtx.lineTo(dots[j].x, dots[j].y);
                        pCtx.strokeStyle = `rgba(0, 171, 240, ${(1 - dist / 110) * 0.2})`;
                        pCtx.lineWidth = 0.5;
                        pCtx.stroke();
                    }
                }
            }

            animFrameDots = requestAnimationFrame(animateDots);
        }

        animateDots();
    }

    // ─────────────────────────────────────
    // CYBER CIPHER DECRYPTION
    // Rapidly scrambles characters into "Hanan"
    // ─────────────────────────────────────
    function initCipherDecryption(callback) {
        if (!brandCipher) { if (callback) callback(); return; }
        const chars = brandCipher.querySelectorAll('.cipher-char');
        const glyphs = '01#@$%&*<>~/\\{}[]+=_!?XYZQ';
        const lockDelays = [200, 420, 640, 860, 1080]; // ms per character

        chars.forEach((charEl, idx) => {
            const target = charEl.getAttribute('data-char');
            const targetTime = performance.now() + lockDelays[idx];

            const scrambleInterval = setInterval(() => {
                if (isFinished) {
                    clearInterval(scrambleInterval);
                    charEl.textContent = target;
                    charEl.classList.add('locked');
                    return;
                }

                if (performance.now() >= targetTime) {
                    clearInterval(scrambleInterval);
                    charEl.textContent = target;
                    charEl.classList.add('locked');

                    if (idx === chars.length - 1) {
                        setTimeout(() => {
                            if (callback) callback();
                        }, 180);
                    }
                } else {
                    charEl.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
                }
            }, 35);
        });
    }

    // ─────────────────────────────────────
    // TELEMETRY & PROGRESS BAR
    // ─────────────────────────────────────
    function updateProgress() {
        if (isFinished) return;
        const now = performance.now();
        const elapsed = now - startTime;
        const pct = Math.min((elapsed / totalDuration) * 100, 100);

        if (fillBar) fillBar.style.width = `${pct}%`;
        if (pctText) pctText.textContent = `${Math.round(pct)}%`;

        if (pct < 35) {
            if (statusText) statusText.textContent = 'INITIALIZING SYSTEM...';
        } else if (pct < 70) {
            if (statusText) statusText.textContent = 'DECRYPTING IDENTITY...';
        } else if (pct < 90) {
            if (statusText) statusText.textContent = 'SYNCHRONIZING ASSETS...';
        } else {
            if (statusText) statusText.textContent = 'ACCESS GRANTED';
        }

        if (pct < 100) {
            animFrameProgress = requestAnimationFrame(updateProgress);
        }
    }

    // ─────────────────────────────────────
    // PHASE ORCHESTRATOR
    // ─────────────────────────────────────
    function runPreloader() {
        initMatrix();
        initPreloaderParticles();
        updateProgress();

        // Phase 1: Glitch text (0 - 1300ms)
        // Phase 2: Cipher decryption (1300ms - 2700ms)
        setTimeout(() => {
            if (isFinished) return;
            if (glitchWrap) glitchWrap.classList.add('hidden');

            setTimeout(() => {
                if (isFinished) return;
                if (brandWrap) brandWrap.classList.add('active');

                initCipherDecryption(() => {
                    if (isFinished) return;
                    // Phase 3: Badge pop + shockwave (2700ms - 3800ms)
                    if (devPill) devPill.classList.add('pop');
                    if (shockwave) {
                        shockwave.classList.add('blast');
                        shockwave.addEventListener('animationend', () => {
                            shockwave.style.display = 'none';
                        }, { once: true });
                    }

                    // Phase 4: Exit sequence — hold 1.5s to showcase final brand
                    setTimeout(() => {
                        exitPreloader();
                    }, 1500);
                });
            }, 250);
        }, 1300);
    }

    // ─────────────────────────────────────
    // EXIT SEQUENCE
    // ─────────────────────────────────────
    function exitPreloader() {
        if (isFinished) return;
        isFinished = true;

        if (fillBar) fillBar.style.width = '100%';
        if (pctText) pctText.textContent = '100%';
        if (statusText) statusText.textContent = 'SYSTEM ONLINE';

        setTimeout(() => {
            preloader.classList.add('fade-out');

            setTimeout(() => {
                preloader.style.display = 'none';
                document.body.classList.remove('preloading');

                cancelAnimationFrame(animFrameMatrix);
                cancelAnimationFrame(animFrameDots);
                cancelAnimationFrame(animFrameProgress);
            }, 1000);
        }, 200);
    }

    // ─────────────────────────────────────
    // SKIP PRELOADER (User Control)
    // ─────────────────────────────────────
    function skipPreloader() {
        if (isFinished) return;
        exitPreloader();
    }

    if (skipBtn) {
        skipBtn.addEventListener('click', skipPreloader);
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            skipPreloader();
        }
    });

    // ─────────────────────────────────────
    // LAUNCH
    // ─────────────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runPreloader);
    } else {
        runPreloader();
    }
})();

// ==========================================
// HANAN DEV — PORTFOLIO JAVASCRIPT ENGINE
// Interactive Particles, Rolex Scroll HUD,
// 3D Tilt Effects, Dynamic Theme Engine
// ==========================================


// ------------------------------------------
// CLIENT-SIDE SECURITY ENGINE
// Console protection only.
// Right-click & Inspect are intentionally
// allowed for responsive / accessibility.
// ------------------------------------------
(function initSecurity() {

    // ── Console Security: banner + periodic clear ──
    const style = [
        'color: #00abf0',
        'font-size: 14px',
        'font-weight: bold',
        'background: #081b29',
        'padding: 8px 16px',
        'border-left: 4px solid #00abf0',
        'border-radius: 4px'
    ].join(';');

    const warn = () => {
        console.clear();
        console.log('%c⚠ HANAN DEV — SECURITY NOTICE', style);
        console.log('%cThis console is monitored. Do not paste unknown code here.', 'color:#e74c3c;font-size:12px;');
    };

    // Show immediately, then repeat every 4 s
    warn();
    setInterval(warn, 4000);

    // ── Block Ctrl+U (View Page Source) ──
    // Viewing page source in a new tab exposes raw HTML — block it.
    window.addEventListener('keydown', (e) => {
        const isModifier = e.ctrlKey || e.metaKey;
        if (isModifier && (e.key === 'u' || e.key === 'U')) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    }, true);

})();


document.addEventListener('DOMContentLoaded', () => {

    // ------------------------------------------
    // 1. NAVBAR & MOBILE TOGGLE
    // ------------------------------------------
    const menuIcon = document.querySelector('#menu-icon');
    const navbar = document.querySelector('.navbar');

    if (menuIcon && navbar) {
        menuIcon.onclick = () => {
            menuIcon.classList.toggle('bx-x');
            navbar.classList.toggle('active');
        };
    }

    // ------------------------------------------
    // 2. THEME ENGINE
    // ------------------------------------------
    const themeBtn = document.getElementById('theme-btn');
    const themeMenu = document.querySelector('.theme-menu');
    const themeOptions = document.querySelectorAll('.theme-option');

    if (themeBtn && themeMenu) {
        themeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            themeMenu.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!themeBtn.contains(e.target) && !themeMenu.contains(e.target)) {
                themeMenu.classList.remove('active');
            }
        });
    }

    const setTheme = (theme) => {
        if (theme === 'default') {
            document.body.removeAttribute('data-theme');
        } else {
            document.body.setAttribute('data-theme', theme);
        }
        localStorage.setItem('selected-theme', theme);

        // Notify particle system of theme color change
        setTimeout(updateParticleColor, 100);
    };

    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            const theme = option.getAttribute('data-set-theme');
            setTheme(theme);
            if (themeMenu) themeMenu.classList.remove('active');
        });
    });

    const savedTheme = localStorage.getItem('selected-theme');
    if (savedTheme) {
        setTheme(savedTheme);
    }

    // ------------------------------------------
    // 3. UNIFIED SMOOTH INERTIAL SCROLLING (LERP)
    // ------------------------------------------
    const scrollProgress = document.getElementById('scrollProgress');
    const scrollHud = document.getElementById('scrollHud');
    const hudCircle = document.getElementById('hudCircle');
    const hudPct = document.getElementById('hudPct');
    const hudSection = document.getElementById('hudSection');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('header nav a');
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');

    let currentScrollY = window.scrollY || window.pageYOffset;
    let targetScrollY = currentScrollY;
    let isLerping = false;
    const lerpFactor = 0.055; // Silky smooth deceleration (~0.05 - 0.06)

    function getMaxScroll() {
        return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    }

    function updateHUDAndEffects(top) {
        const totalHeight = getMaxScroll();
        const scrollPercent = totalHeight > 0 ? Math.min(100, Math.max(0, (top / totalHeight) * 100)) : 0;
        const roundedPct = Math.round(scrollPercent);

        // Update top progress bar
        if (scrollProgress) {
            scrollProgress.style.width = `${scrollPercent}%`;
        }

        // Update Rolex-style circular HUD
        if (hudCircle) {
            hudCircle.setAttribute('stroke-dasharray', `${scrollPercent}, 100`);
        }
        if (hudPct) {
            hudPct.textContent = `${roundedPct}%`;
        }

        // Active Section Detection
        let currentSectionId = 'home';
        sections.forEach(sec => {
            const offset = sec.offsetTop - 180;
            const height = sec.offsetHeight;
            const id = sec.getAttribute('id');

            if (top >= offset && top < offset + height) {
                currentSectionId = id;

                navLinks.forEach(link => link.classList.remove('active'));
                const activeLink = document.querySelector(`header nav a[href*="${id}"]`);
                if (activeLink) activeLink.classList.add('active');

                sec.classList.add('show-animate');
            } else {
                sec.classList.remove('show-animate');
            }
        });

        // Update HUD current section label
        if (hudSection) {
            hudSection.textContent = currentSectionId.toUpperCase();
        }

        // Sticky Header with Blur
        if (header) {
            header.classList.toggle('sticky', top > 80);
        }

        // Close mobile nav on scroll
        if (menuIcon && navbar && navbar.classList.contains('active')) {
            menuIcon.classList.remove('bx-x');
            navbar.classList.remove('active');
        }

        // Footer animate on scroll
        if (footer) {
            footer.classList.toggle('show-animate', window.innerHeight + top >= document.scrollingElement.scrollHeight - 50);
        }
    }

    function startLerpLoop() {
        if (!isLerping) {
            isLerping = true;
            requestAnimationFrame(lerpUpdate);
        }
    }

    function lerpUpdate() {
        const maxScroll = getMaxScroll();
        targetScrollY = Math.max(0, Math.min(targetScrollY, maxScroll));
        const diff = targetScrollY - currentScrollY;

        // If distance is negligible, snap and sleep RAF loop to save GPU/battery
        if (Math.abs(diff) < 0.25) {
            currentScrollY = targetScrollY;
            window.scrollTo(0, currentScrollY);
            updateHUDAndEffects(currentScrollY);
            isLerping = false;
            return;
        }

        // LERP: current += (target - current) * lerpFactor
        currentScrollY += diff * lerpFactor;
        window.scrollTo(0, currentScrollY);
        updateHUDAndEffects(currentScrollY);

        requestAnimationFrame(lerpUpdate);
    }

    // Intercept mouse wheel for unified inertial scrolling
    window.addEventListener('wheel', (e) => {
        if (e.ctrlKey) return; // Allow normal browser zoom

        e.preventDefault();

        let delta = e.deltaY;
        if (e.deltaMode === 1) {
            delta *= 35; // Line mode
        } else if (e.deltaMode === 2) {
            delta *= window.innerHeight; // Page mode
        }

        targetScrollY += delta * 1.15;
        targetScrollY = Math.max(0, Math.min(targetScrollY, getMaxScroll()));

        startLerpLoop();
    }, { passive: false });

    // Sync if user drags scrollbar directly or touches (RAF-throttled for 60/120fps mobile performance)
    let scrollRafTicking = false;
    window.addEventListener('scroll', () => {
        const actualY = window.scrollY || window.pageYOffset;
        if (!isLerping || Math.abs(actualY - currentScrollY) > 6) {
            currentScrollY = actualY;
            targetScrollY = actualY;
            if (!scrollRafTicking) {
                requestAnimationFrame(() => {
                    updateHUDAndEffects(currentScrollY);
                    scrollRafTicking = false;
                });
                scrollRafTicking = true;
            }
        }
    }, { passive: true });

    // Keyboard navigation support (ArrowDown, ArrowUp, PageDown, PageUp, Space, Home, End)
    window.addEventListener('keydown', (e) => {
        const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
        if (activeTag === 'input' || activeTag === 'textarea') return;

        let delta = 0;
        if (e.key === 'ArrowDown') delta = 90;
        else if (e.key === 'ArrowUp') delta = -90;
        else if (e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) delta = window.innerHeight * 0.85;
        else if (e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) delta = -window.innerHeight * 0.85;
        else if (e.key === 'Home') {
            e.preventDefault();
            targetScrollY = 0;
            startLerpLoop();
            return;
        } else if (e.key === 'End') {
            e.preventDefault();
            targetScrollY = getMaxScroll();
            startLerpLoop();
            return;
        }

        if (delta !== 0) {
            e.preventDefault();
            targetScrollY += delta;
            targetScrollY = Math.max(0, Math.min(targetScrollY, getMaxScroll()));
            startLerpLoop();
        }
    });

    // Smooth Anchor Navigation driven by LERP
    function smoothScrollTo(targetPosition) {
        targetScrollY = Math.max(0, Math.min(targetPosition, getMaxScroll()));
        startLerpLoop();
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href').substring(1);
            if (targetId) {
                e.preventDefault();
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    const headerOffset = 80;
                    const offsetPosition = targetElement.offsetTop - headerOffset;
                    smoothScrollTo(offsetPosition);
                }
            }
        });
    });

    // Scroll to top on Rolex HUD click
    if (scrollHud) {
        scrollHud.addEventListener('click', () => {
            smoothScrollTo(0);
        });
    }

    // Initial position sync
    updateHUDAndEffects(currentScrollY);

    // ------------------------------------------
    // 5. 3D TILT EFFECT ON PROJECT CARDS
    // ------------------------------------------
    const projectCards = document.querySelectorAll('.project-card');

    projectCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale3d(1, 1, 1)';
        });
    });

    // ------------------------------------------
    // 6. ANIMATED NUMBER COUNTERS (HERO STATS)
    // ------------------------------------------
    const statNumbers = document.querySelectorAll('.stat-num[data-count]');
    let hasCounted = false;

    const runCounters = () => {
        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-count'), 10);
            let current = 0;
            const stepTime = 120;
            const timer = setInterval(() => {
                current += 1;
                stat.textContent = `${current}+`;
                if (current >= target) {
                    clearInterval(timer);
                }
            }, stepTime);
        });
    };

    if ('IntersectionObserver' in window && statNumbers.length > 0) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !hasCounted) {
                    hasCounted = true;
                    runCounters();
                }
            });
        }, { threshold: 0.5 });

        const heroStats = document.querySelector('.hero-stats');
        if (heroStats) statsObserver.observe(heroStats);
    } else {
        runCounters();
    }

    // ------------------------------------------
    // 6b. SKILLS PROGRESS BARS COME/GO ANIMATION
    // ------------------------------------------
    const skillsSection = document.querySelector('#skills');
    const skillBars = document.querySelectorAll('.skills .bar span');

    // Ensure all skill bars have their target width saved in CSS variable and static width applied
    skillBars.forEach(bar => {
        let w = bar.style.getPropertyValue('--w') || bar.style.width;
        if (!w) {
            const pctSpan = bar.closest('.progress')?.querySelector('h3 span');
            if (pctSpan) w = pctSpan.textContent.trim();
        }
        if (w) {
            if (!w.endsWith('%') && !w.endsWith('px')) w += '%';
            bar.style.setProperty('--w', w);
            bar.dataset.width = w;
            bar.style.width = w;
        }
    });

    if (skillsSection && 'IntersectionObserver' in window) {
        const skillsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    skillsSection.classList.add('active-skills');
                } else {
                    skillsSection.classList.remove('active-skills');
                }
            });
        }, {
            threshold: 0.05,
            rootMargin: '0px 0px -20px 0px'
        });
        skillsObserver.observe(skillsSection);
    }

    // ------------------------------------------
    // 7. INTERACTIVE PARTICLE CONSTELLATION CANVAS
    // ------------------------------------------
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    let particles = [];
    let particleColor = '#00abf0';
    const particleCount = Math.min(65, Math.floor(window.innerWidth / 22));

    function getThemeColor() {
        const style = getComputedStyle(document.body);
        return style.getPropertyValue('--main-color').trim() || '#00abf0';
    }

    function updateParticleColor() {
        particleColor = getThemeColor();
    }

    updateParticleColor();

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.8;
            this.vy = (Math.random() - 0.5) * 0.8;
            this.radius = Math.random() * 2 + 1;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = particleColor;
            ctx.globalAlpha = 0.5;
            ctx.fill();
            ctx.globalAlpha = 1.0;
        }
    }

    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    // Mouse tracking for constellation interaction
    const mouse = { x: null, y: null, maxDist: 140 };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    let animationFrameId;

    function animateParticles() {
        if (document.body.classList.contains('preloading')) {
            animationFrameId = requestAnimationFrame(animateParticles);
            return;
        }

        ctx.clearRect(0, 0, width, height);

        // Update and draw particles
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();

            // Connect nearby particles
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 110) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = particleColor;
                    ctx.globalAlpha = (1 - dist / 110) * 0.22;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                    ctx.globalAlpha = 1.0;
                }
            }

            // Connect to mouse
            if (mouse.x !== null && mouse.y !== null) {
                const mdx = particles[i].x - mouse.x;
                const mdy = particles[i].y - mouse.y;
                const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

                if (mdist < mouse.maxDist) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.strokeStyle = particleColor;
                    ctx.globalAlpha = (1 - mdist / mouse.maxDist) * 0.45;
                    ctx.lineWidth = 1.2;
                    ctx.stroke();
                    ctx.globalAlpha = 1.0;
                }
            }
        }

        animationFrameId = requestAnimationFrame(animateParticles);
    }

    animateParticles();

    // Window resize handler
    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });
});