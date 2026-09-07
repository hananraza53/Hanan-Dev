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